const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');

// Edit game details route
router.get('/edit/:id', gameController.edit);

// Update game details route
router.put('/:id', gameController.updateGameDetails);

module.exports = router;