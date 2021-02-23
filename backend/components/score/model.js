const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
  player: {
    type: Schema.ObjectId,
    ref: 'players',
  },
  rol: {
    type: Schema.ObjectId,
    ref: 'roles',
  },
  victories: Number,
  defeats: Number,
  kills: Number,
  deaths: Number,
  assists: Number,
});

const model = mongoose.model('score', mySchema);

module.exports = model;
