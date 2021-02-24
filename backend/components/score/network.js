const express = require('express');
const router = express.Router();
const controller = require('./controller');
const response = require('../../response');

router.get('/getScoreOfOnePlayer', async function (req, res) {
  const player = req.body;
  try {
    const result = await controller.getOneScore(player);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.post('/setScoreOfOnePlayer', async function (req, res) {
  const score = req.body;
  try {
    const result = await controller.addScore(score);
    response.success(req, res, result, 201);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

module.exports = router;
