const Game = require('../models/gameModel');

// Display add game form
exports.addGameForm = (req, res) => {
  res.render('games/add', { title: 'Add Game' });
};

// Add a new game
exports.addGame = (req, res) => {
  const { title, releaseDate, rating, genres } = req.body;
  
  // Create a new game object
  const newGame = new Game({
    title,
    releaseDate,
    rating,
    genres
  });

  // Save the new game to the database
  newGame.save()
    .then(() => {
      res.redirect('/games');
    })
    .catch((err) => {
      console.error(err);
      res.redirect('/games');
    });
};

// Display edit game form
exports.editGameForm = (req, res) => {
  const gameId = req.params.id;

  Game.findById(gameId)
    .then((game) => {
      if (!game) {
        res.redirect('/games');
      } else {
        res.render('games/edit', { title: 'Edit Game', game });
      }
    })
    .catch((err) => {
      console.error(err);
      res.redirect('/games');
    });
};

// Edit an existing game
exports.editGame = (req, res) => {
  const gameId = req.params.id;
  const { title, releaseDate, rating, genres } = req.body;

  Game.findByIdAndUpdate(gameId, { title, releaseDate, rating, genres })
    .then(() => {
      res.redirect('/games');
    })
    .catch((err) => {
      console.error(err);
      res.redirect('/games');
    });
};

// Delete a game
exports.deleteGame = (req, res) => {
  const gameId = req.params.id;

  Game.findByIdAndDelete(gameId)
    .then(() => {
      res.redirect('/games');
    })
    .catch((err) => {
      console.error(err);
      res.redirect('/games');
    });
};