const Game = require('../models/gameModel');
const Review = require('../models/reviewModel');

exports.index = async (req, res) => {
  try {
    const game = await Game.findById(req.params.gameId).populate('reviews');
    res.render('reviews/index', { game });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.create = async (req, res) => {
  try {
    const { gameId } = req.params;
    const game = await Game.findById(gameId);
    const review = new Review(req.body);
    game.reviews.push(review);
    await review.save();
    await game.save();
    res.redirect(`/games/${gameId}/reviews`);
  } catch (err) {
    res.status(500).send(err.message);
  }
};