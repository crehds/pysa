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
  imgURL: String,
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
  imgURL: {
    data: Buffer,
    mimetype: String,
  },
});

//Modelo implementado para evitar que mis métodos
// de búsqueda retornen los datos de manera incorrecta
const MySchema3 = new Schema(
  {
    name: {
      firstName: String,
      lastName: String,
    },
    nickname: String,
    mmr: Number,
    estado: Boolean,
  },
  { strict: false }
);

const model = mongoose.model('playerWithOutMedail', MySchema, 'players');
const model2 = mongoose.model('playerWithMedail', MySchema2, 'players');
const model3 = mongoose.model('playerTest', MySchema3, 'players');

module.exports = { model, model2, model3 };
