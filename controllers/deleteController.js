const fs = require('fs');
const Papa = require('papaparse');

const deleteGame = (req, res) => {
  const gameId = req.params.id;
  const gamesCSV = fs.readFileSync('games.csv', 'utf8');
  const gamesData = Papa.parse(gamesCSV, { header: true }).data;

  const updatedGamesData = gamesData.filter((game) => game.Id !== gameId);

  const updatedCSV = Papa.unparse(updatedGamesData, { header: true });
  fs.writeFileSync('games.csv', updatedCSV, 'utf8');

  res.redirect('/raw-data');
};

module.exports = {
  deleteGame,
};