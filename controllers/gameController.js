const Game = require('../models/gameModel');

exports.index = async (req, res) => {
  try {
    const search = req.query.search || '';
    const games = await Game.find({ title: { $regex: search, $options: 'i' } });
    res.render('games/index', { games });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.redirect('/games');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.edit = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    res.render('games/edit', { game });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.update = async (req, res) => {
  try {
    await Game.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/games');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.delete = async (req, res) => {
  try {
    await Game.findByIdAndDelete(req.params.id);
    res.redirect('/games');
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.search = async (req, res) => {
  try {
    const query = req.query.query;
    const games = await Game.find({
      $or: [
        { Title: { $regex: query, $options: 'i' } },
        { 'Release Date': { $regex: query, $options: 'i' } },
        { Team: { $regex: query, $options: 'i' } },
        { Rating: { $regex: query, $options: 'i' } },
        { Genres: { $regex: query, $options: 'i' } },
        { Summary: { $regex: query, $options: 'i' } }
      ]
    });

    res.render('games/index', { games, query }); // Render the search results in the games/index view
  } catch (err) {
    res.status(500).send(err.message);
  }
};