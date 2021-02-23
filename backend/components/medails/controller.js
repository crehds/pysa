const store = require('./store');

async function getMedails() {
  return await store.list();
}

function addMedail(medails) {
  if (!medails || medails.length === 0) {
    return Promise.reject('Invalid data');
  }

  medails.map((medail) => {
    let newMedail = {
      name: medail.nombre,
      minimo: medail.minimo,
      maximo: medail.maximo,
    };
    store.add(newMedail);
  });
}

module.exports = {
  addMedail,
  getMedails,
};
