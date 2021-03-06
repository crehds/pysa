const express = require('express');
const router = express.Router();
const controller = require('./controller');
const response = require('../../response');

router.get('/getScoreOfOnePlayer/:playerId', async function (req, res) {
  const { playerId } = req.params;
  try {
    const result = await controller.getOneScore(playerId);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.post('/getScoreOfPlayers', async function (req, res) {
  const { playersIds } = req.body;
  try {
    const results = await controller.getScoresOfPlayersById(playersIds);
    response.success(req, res, results, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.post('/setScoreOfOnePlayer/:playerId', async function (req, res) {
  const { playerId } = req.params;
  const { rolesScore } = req.body;
  try {
    const result = await controller.addOrUpdateScores(
      playerId,
      rolesScore,
      'add'
    );
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.put('/setScoreOfOnePlayer/:playerId', async function (req, res) {
  const { playerId } = req.params;
  const { rolesScore } = req.body;
  try {
    const result = await controller.addOrUpdateScores(
      playerId,
      rolesScore,
      'update'
    );
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.delete('/deleteOne/:playerId', async function name(req, res) {
  const { playerId } = req.params;
  try {
    const result = await controller.deleteOne(playerId);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.delete('/deleteAll', async function (req, res) {
  try {
    const result = await controller.deleteAllScore();
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});
module.exports = router;
