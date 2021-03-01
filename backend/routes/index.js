const express = require('express');
const player = require('../components/player/network');
const medails = require('../components/medails/network');
const score = require('../components/score/network');
const roles = require('../components/roles/network');
const calibration = require('../components/calibration/network');

const router = function (server) {
  server.use('/player', player);
  server.use('/score', score);
  server.use('/medails', medails);
  server.use('/roles', roles);
  server.use('/calibration', calibration);
};

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
