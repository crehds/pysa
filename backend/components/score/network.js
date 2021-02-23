const express = require('express');
const router = express.Router();
const controller = require('./controller');
const response = require('../../response');

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
