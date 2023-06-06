const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Game',
  },
  rating: Number,
  comment: String,
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;