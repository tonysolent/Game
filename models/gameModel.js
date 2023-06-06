const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  title: String,
  releaseDate: Date,
  team: String,
  rating: Number,
  timesListed: Number,
  numberOfReviews: Number,
  genres: String,
  summary: String,
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }],
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;