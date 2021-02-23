const express = require('express');
const player = require('../components/player/network');
const medails = require('../components/medails/network');

const router = function (server) {
  server.use('/player', player);
  server.use('/medails', medails);
};

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });

module.exports = router;
