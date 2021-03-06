const express = require('express');
const player = require('../components/player/network');
const medails = require('../components/medails/network');
const score = require('../components/score/network');
const roles = require('../components/roles/network');
const calibration = require('../components/calibration/network');

const router = function (server) {
  server.use('/players', player);
  server.use('/scores', score);
  server.use('/medails', medails);
  server.use('/roles', roles);
  server.use('/calibrations', calibration);
};

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
