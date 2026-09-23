const store = require('./store');

class MedailNotFoundError extends Error {
  constructor(mmr) {
    super(`No medail found for mmr ${mmr}`);
    this.name = 'MedailNotFoundError';
  }
}

function getMedail(medailId) {
  return store.listOne(medailId);
}

async function getMedailByMMR(mmr) {
  const medails = await store.list();
  const medail = medails.find(
    (medail) => medail.minimo <= mmr && medail.maximo >= mmr
  );
  if (!medail) {
    throw new MedailNotFoundError(mmr);
  }
  return medail['_id'];
}

// async function getMedailByMMR2(mmr) {
//   const medails = await store.list();
//   return medails.find((medail) => medail.minimo <= mmr && medail.maximo >= mmr);
// }

async function getMedails() {
  return await store.list();
}

async function addMedails(medails) {
  if (!medails || medails.length === 0) {
    return Promise.reject('Invalid data');
  }

  return Promise.all(
    medails.map((medail) => {
      const newMedail = {
        name: medail.nombre,
        minimo: medail.minimo,
        maximo: medail.maximo,
      };
      return store.add(newMedail);
    })
  );
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
  MedailNotFoundError,
};
