const express = require('express');
const router = express.Router();
const response = require('../../response/index');
const controller = require('./controller');

router.get('/onePlayer/:playerId', async function (req, res, next) {
  const { playerId } = req.params;
  try {
    const getOnePlayer = await controller.getOnePlayer(playerId);
    response.success(req, res, getOnePlayer, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
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
