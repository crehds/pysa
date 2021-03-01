const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
  player: {
    type: Schema.ObjectId,
    ref: 'players',
  },
  estado: Boolean,
  remainingGames: Number,
  initialMMR: Number,
});

const model = mongoose.model('calibration', mySchema);
module.exports = model;
