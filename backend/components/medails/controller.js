const store = require('./store');

function getMedail(medailId) {
  return store.listOne(medailId);
}

async function getMedailByMMR(mmr) {
  const medails = await store.list();
  return medails.find((medail) => medail.minimo <= mmr && medail.maximo >= mmr)['_id'];
}
async function getMedails() {
  return await store.list();
}

function addMedails(medails) {
  if (!medails || medails.length === 0) {
    return Promise.reject('Invalid data');
  }

  medails.map((medail) => {
    const newMedail = {
      name: medail.nombre,
      minimo: medail.minimo,
      maximo: medail.maximo,
    };
    store.add(newMedail);
  });
}

function patchMedail(medailId, medail) {
  if (!medail || Object.keys(medail).length === 0) {
    return Promise.reject('Invalid data');
  }

  return store.patch(medailId, medail);
}

module.exports = {
  addMedails,
  getMedail,
  getMedails,
  patchMedail,
  getMedailByMMR,
};
