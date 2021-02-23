const express = require('express');
const router = express.Router();
const response = require('../../response/index');
const controller = require('./controller');

router.get('/', function (req, res, next) {
  response.success(req, res, 'todo bien', 200);
});

router.post('/newplayer', async function (req, res) {
  const body = req.body;
  try {
    const result = controller.addPlayer(body);
    response.success(req, res, result, 201);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

module.exports = router;
