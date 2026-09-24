const express = require('express');
const player = require('../components/player/network');
const medails = require('../components/medails/network');
const score = require('../components/score/network');
const roles = require('../components/roles/network');
const calibration = require('../components/calibration/network');

// requireAdmin is the single instance app.js built from the startup admin
// config; every component factory takes it and decides per-route whether to
// apply it, so it is threaded through here rather than each component
// reading a shared singleton.
const router = function (server, requireAdmin) {
  server.use('/players', player(requireAdmin));
  server.use('/scores', score(requireAdmin));
  server.use('/medails', medails(requireAdmin));
  server.use('/roles', roles(requireAdmin));
  server.use('/calibrations', calibration(requireAdmin));
};

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
