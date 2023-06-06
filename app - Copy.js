const express = require('express');
const mongoose = require('mongoose');
const Papa = require('papaparse');
const fs = require('fs');
const methodOverride = require('method-override');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const Game = require('./models/gameModel');
const gameController = require('./controllers/gameController');
const reviewController = require('./controllers/reviewController');

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

// Read the games.csv file and store the games data in the 'games' array
const games = Papa.parse(gamesCSV, { header: true }).data;

app.get('/search', (req, res) => {
  const query = req.query.query;

  if (query) {
    const gamesCSV = fs.readFileSync('games.csv', 'utf8');
    const gamesData = Papa.parse(gamesCSV, { header: true }).data;

    const filteredGames = gamesData.filter((game) => {
      const title = game.Title.toLowerCase();
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

app.set('view engine', 'ejs');

// Define a route to handle the "See All Games" hyperlink
app.get('/games', (req, res) => {
  // Read the games data from the CSV file
  const gamesData = [];
  fs.createReadStream('games.csv')
    .pipe(csv({ separator: '\t' })) // Specify the separator as a tab ('\t') character
    .on('data', (data) => gamesData.push(data))
    .on('end', () => {
      res.render('games/index', { games: gamesData });
    });
});

app.get('/', (req, res) => {
  res.render('index');
});


mongoose.connection.on('connected', () => {
  console.log('Connected to MongoDB');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});