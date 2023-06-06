const fs = require('fs');
const csv = require('csv-parser');

// Function to retrieve game data from CSV based on game ID
const getGameById = (gameId) => {
  return new Promise((resolve, reject) => {
    const games = [];
    fs.createReadStream('games.csv')
      .pipe(csv())
      .on('data', (row) => {
        games.push(row);
      })
      .on('end', () => {
        const game = games.find((game) => game.ID === gameId);
        resolve(game);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Function to update game data in CSV
const updateGame = (gameId, updatedGame) => {
  return new Promise((resolve, reject) => {
    const games = [];
    fs.createReadStream('games.csv')
      .pipe(csv())
      .on('data', (row) => {
        games.push(row);
      })
      .on('end', () => {
        const gameToUpdate = games.find((game) => game.ID === gameId);
        if (!gameToUpdate) {
          return reject(new Error('Game not found'));
        }

        Object.assign(gameToUpdate, updatedGame);

        const writeStream = fs.createWriteStream('games.csv');
        csv.write(games, { headers: true }).pipe(writeStream);
        writeStream.on('finish', () => {
          resolve();
        });
        writeStream.on('error', (error) => {
          reject(error);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};

// Render the edit game form
const renderEditForm = (req, res) => {
  const gameId = req.params.id;

  getGameById(gameId)
    .then((game) => {
      res.render('edit-game', { game });
    })
    .catch((error) => {
      console.error('Error retrieving game data:', error);
      res.status(500).send('An error occurred while retrieving game data.');
    });
};

// Handle game update
const handleGameUpdate = (req, res) => {
  const gameId = req.params.id;
  const updatedGame = req.body;

  updateGame(gameId, updatedGame)
    .then(() => {
      console.log('Game updated successfully');
      res.redirect('/raw-data');
    })
    .catch((error) => {
      console.error('Error updating game:', error);
      res.status(500).send('An error occurred while updating the game');
    });
};

module.exports = {
  renderEditForm,
  handleGameUpdate,
};