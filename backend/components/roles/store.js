const Model = require('./model');

function addRole(role) {
  const oneRole = new Model(role);
  return oneRole.save();
}

async function getRoles() {
  const models = await Model.find();
  return models;
}
module.exports = {
  add: addRole,
  list: getRoles
};
