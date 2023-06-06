const express = require('express');
const mongoose = require('mongoose');
const Papa = require('papaparse');
const fs = require('fs');
const methodOverride = require('method-override');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csv = require('csv-parser');
const editController = require('./controllers/editController');


const Game = require('./models/gameModel');
const gameController = require('./controllers/gameController');
const reviewController = require('./controllers/reviewController');
const deleteController = require('./controllers/deleteController');
const gameController2 = require('./controllers/gameController2');



mongoose.connect('mongodb+srv://admin:12345678qq@cluster0.pstays3.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000 // Increase the timeout to 30 seconds
});

const app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
  res.redirect('/games');
});

app.get('/games', gameController.index);
app.get('/games/add', (req, res) => {
  res.render('games/add');
});
app.post('/games', gameController.create);
app.get('/games/:id', async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    res.render('games/details', { game });
  } catch (err) {
    res.status(500).send(err.message);
  }
});
app.get('/games/:id/edit', gameController.edit);
app.put('/games/:id', gameController.update);
app.delete('/games/:id', gameController.delete);

app.get('/games/:gameId/reviews', reviewController.index);
app.get('/games/:gameId/reviews/add', (req, res) => {
  res.render('reviews/add', { gameId: req.params.gameId });
});
app.post('/games/:gameId/reviews', reviewController.create);

// Import data from games.csv and save it to the database
const gamesCSV = fs.readFileSync('games.csv', 'utf8');
const gamesData = Papa.parse(gamesCSV, { header: true }).data;
Game.create(gamesData)
  .then(() => console.log('🎮 Games imported successfully.'))
  .catch((err) => console.error(err));

app.use(methodOverride('_method'));
// Read the games.csv file and store the games data in the 'games' array
const games = Papa.parse(gamesCSV, { header: true }).data;

app.get('/search', (req, res) => {
  const query = req.query.query;

  if (query) {
    const gamesCSV = fs.readFileSync('games.csv', 'utf8');
    const gamesData = Papa.parse(gamesCSV, { header: true }).data;

    const filteredGames = gamesData.filter((game) => {
    const title = game && game.Title ? game.Title.toLowerCase() : '';
      return title.includes(query.toLowerCase());
    });

    res.render('games/index', { games: filteredGames });
  } else {
    res.render('games/index', { games: [] });
  }
});

app.get('/games/:id', (req, res) => {
  const gameId = req.params.id;
  const gamesCSV = fs.readFileSync('games.csv', 'utf8');
  const gamesData = Papa.parse(gamesCSV, { header: true }).data;
  const game = gamesData.find((game) => game.Id === gameId);

  if (game) {
    res.render('games/details', { game });
  } else {
    res.status(404).send('Game not found');
  }
});

app.post('/search', (req, res) => {
  const searchQuery = req.body.searchQuery.toLowerCase();
  console.log("Search Query:", searchQuery);

  const filteredGames = games.filter((game) => {
    if (game && game.Title) {
      console.log("Game:", game);
      console.log("Title:", game.Title);
      return game.Title.toLowerCase().includes(searchQuery);
    }
    return false;
  });

  console.log("Filtered Games:", filteredGames);

  return res.render('index', { games: filteredGames });
});

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Route to render the index page
app.get('/', (req, res) => {
  const gamesData = [];

  fs.createReadStream('games.csv')
    .pipe(csv())
    .on('data', (row) => {
      gamesData.push(row);
    })
    .on('end', () => {
      if (gamesData.length > 0) {
        res.render('index', { games: gamesData });
      } else {
        res.render('index', { games: null });
      }
    });
});

//new
app.set('view engine', 'ejs');

// Route to render the raw data page
app.get('/raw-data', (req, res) => {
  const gamesData = [];

  fs.createReadStream('games.csv')
    .pipe(csv())
    .on('data', (row) => {
      gamesData.push(row);
    })
    .on('end', () => {
      res.render('raw-data', { gamesData });
    });
});

//new2 
app.set('view engine', 'ejs');

// Parse JSON and URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Edit game form route
app.get('/raw-data/edit/:id', editController.renderEditForm);

// Update game route
app.put('/raw-data/:id', (req, res) => {
  const gameId = req.params.id;
  const updatedGame = req.body; // Assuming the updated game data is sent in the request body

  // Read the CSV file
  const games = [];
  fs.createReadStream('games.csv')
    .pipe(csv())
    .on('data', (row) => {
      games.push(row);
    })
    .on('end', () => {
      // Find the game to update
      const gameToUpdate = games.find((game) => game.Id === gameId);
      if (!gameToUpdate) {
        return res.status(404).send('Game not found');
      }

      // Update the game data
      Object.assign(gameToUpdate, updatedGame);

      // Write the updated games array back to the CSV file
      const updatedData = games.map((game) => {
        return {
          Id: game.Id,
          Title: game.Title,
          'Release Date': game['Release Date'],
          Team: game.Team,
          Rating: game.Rating,
          'Times Listed': game['Times Listed'],
          'Number of Reviews': game['Number of Reviews'],
          Genres: game.Genres,
          Summary: game.Summary,
          Reviews: game.Reviews,
          Plays: game.Plays,
          Playing: game.Playing,
          Backlogs: game.Backlogs,
          Wishlist: game.Wishlist,
        };
      });
      const writeStream = fs.createWriteStream('games.csv');
      csv.write(updatedData, { headers: true }).pipe(writeStream);
      writeStream.on('finish', () => {
        console.log('Game updated successfully');
        res.redirect('/raw-data'); // Redirect back to the raw data page
      });
      writeStream.on('error', (error) => {
        console.error('Error updating game:', error);
        res.status(500).send('An error occurred while updating the game');
      });
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).send('An error occurred while reading the CSV file');
    });
});

// Delete game route
app.delete('/raw-data/:id', (req, res) => {
  const gameId = req.params.id;

  // Read the CSV file
  const games = [];
  fs.createReadStream('games.csv')
    .pipe(csv())
    .on('data', (row) => {
      games.push(row);
    })
    .on('end', () => {
      // Find the game to delete
      const gameIndex = games.findIndex((game) => game.Id === gameId);
      if (gameIndex === -1) {
        return res.status(404).send('Game not found');
      }

      // Remove the game from the games array
      games.splice(gameIndex, 1);

      // Write the updated games array back to the CSV file
      const updatedData = games.map((game) => {
        return {
          Id: game.Id,
          Title: game.Title,
          'Release Date': game['Release Date'],
          Team: game.Team,
          Rating: game.Rating,
          'Times Listed': game['Times Listed'],
          'Number of Reviews': game['Number of Reviews'],
          Genres: game.Genres,
          Summary: game.Summary,
          Reviews: game.Reviews,
          Plays: game.Plays,
          Playing: game.Playing,
          Backlogs: game.Backlogs,
          Wishlist: game.Wishlist,
        };
      });
      const writeStream = fs.createWriteStream('games.csv');
      csv.write(updatedData, { headers: true }).pipe(writeStream);
      writeStream.on('finish', () => {
        console.log('Game deleted successfully');
        res.redirect('/raw-data'); // Redirect back to the raw data page
      });
      writeStream.on('error', (error) => {
        console.error('Error deleting game:', error);
        res.status(500).send('An error occurred while deleting the game');
      });
    })
    .on('error', (error) => {
      console.error('Error reading CSV file:', error);
      res.status(500).send('An error occurred while reading the CSV file');
    });
});

//new9pm
const CSV_FILE_PATH = 'games.csv';

// Update game details
app.post('/update-game', (req, res) => {
  const { id, name, genre } = req.body;

  // Read the CSV file
  const games = [];
  fs.createReadStream(CSV_FILE_PATH)
    .pipe(csv())
    .on('data', (data) => games.push(data))
    .on('end', () => {
      // Find the game by ID and update its details
      const updatedGames = games.map((game) => {
        if (game.id === id) {
          game.name = name;
          game.genre = genre;
        }
        return game;
      });

      // Write the updated games to the CSV file
      const csvData = convertToCSV(updatedGames);
      fs.writeFile(CSV_FILE_PATH, csvData, (err) => {
        if (err) {
          console.error(err);
          res.status(500).send('Failed to update the game.');
        } else {
          res.send('Game updated successfully.');
        }
      });
    });
});

// Helper function to convert array of objects to CSV format
function convertToCSV(data) {
  const header = Object.keys(data[0]).join(',');
  const rows = data.map((obj) => Object.values(obj).join(','));
  return `${header}\n${rows.join('\n')}`;
}


//new12pm
// Main page route
// Add game route
// Define routes
app.get('/games/databaseadd', gameController2.addGameForm);
app.post('/games/databaseadd', gameController2.addGame);
app.get('/games/databaseedit/:id', gameController2.editGameForm);
app.put('/games/databaseedit/:id', gameController2.editGame);
app.delete('/games/databasedelete/:id', gameController2.deleteGame);

mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});