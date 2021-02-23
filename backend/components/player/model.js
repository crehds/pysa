const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MySchema = new Schema({
  name: {
    firstName: String,
    lastName: String,
  },
  nickname: String,
  medails: {
    type: Schema.ObjectId,
    ref: 'medails',
  },
  mmr: Number,
  estado: Boolean,
});

const model = mongoose.model('players', MySchema);

module.exports = model;
