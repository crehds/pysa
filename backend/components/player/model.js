const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MySchema = new Schema({
  name: {
    firstName: String,
    lastName: String,
  },
  nickname: String,
  medail: String,
  mmr: Number,
  estado: Boolean,
});

const MySchema2 = new Schema({
  name: {
    firstName: String,
    lastName: String,
  },
  nickname: String,
  medail: {
    type: Schema.ObjectId,
    ref: 'medails',
  },
  mmr: Number,
  estado: Boolean,
});

const model = mongoose.model('playerWithOutMedail', MySchema, 'players');
const model2 = mongoose.model('playerWithMedail', MySchema2, 'players');

module.exports = { model, model2 };
