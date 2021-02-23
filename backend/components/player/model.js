const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MySchema = new Schema({
  name: {
    firstName: String,
    lastName: String,
  },
  nickname: String,
  estado: Boolean,
  mmr: Number,
});

const model = mongoose.model('players', MySchema);


module.exports = model;