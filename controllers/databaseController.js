const fs = require('fs');

// Function to add a game to the games.csv file
exports.addGame = (req, res) => {
  const { id, title, releaseDate, rating, genres } = req.body;
  const newGame = `${id},${title},${releaseDate},${rating},${genres}\n`;
  fs.appendFile('games.csv', newGame, (err) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      res.redirect('/games');
    }
  });
};

// Function to edit a game in the games.csv file
exports.editGame = (req, res) => {
  const { id, title, releaseDate, rating, genres } = req.body;
  const updatedGame = `${id},${title},${releaseDate},${rating},${genres}\n`;
  fs.readFile('games.csv', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      const games = data.split('\n');
      const updatedGames = games.map((game) => {
        const gameData = game.split(',');
        if (gameData[0] === id) {
          return updatedGame;
        }
        return game;
      });
      fs.writeFile('games.csv', updatedGames.join('\n'), (err) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else {
          res.redirect('/games');
        }
      });
    }
  });
};

// Function to delete a game from the games.csv file
exports.deleteGame = (req, res) => {
  const { id } = req.body;
  fs.readFile('games.csv', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      const games = data.split('\n');
      const updatedGames = games.filter((game) => {
        const gameData = game.split(',');
        return gameData[0] !== id;
      });
      fs.writeFile('games.csv', updatedGames.join('\n'), (err) => {
        if (err) {
          console.error(err);
          res.sendStatus(500);
        } else {
          res.redirect('/games');
        }
      });
    }
  });
};