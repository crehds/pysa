const Model = require('./model');

function addRole(role) {
  const oneRole = new Model(role);
  return oneRole.save();
}

module.exports = {
  add: addRole,
};
