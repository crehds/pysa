const store = require('./store');

function addRoles(roles) {
  if (!roles || roles.length === 0) {
    return Promise.reject('Invalid data');
  }

  const result = roles.map(async (rol) => {
    let setRol = {
      name: rol.name,
    };
    return await store.add(setRol);
  });
  return Promise.all(result);
}

module.exports = { addRoles };
