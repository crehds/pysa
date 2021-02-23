const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const mySchema = new Schema({
  name: String,
  minimo: Number,
  maximo: Number,
});

const model = mongoose.model('medails', mySchema);

module.exports = model;
