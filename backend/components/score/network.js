const express = require('express');
const controller = require('./controller');
const response = require('../../response');

module.exports = function createScoreRouter(requireAdmin) {
  const router = express.Router();

  router.get('/getScoreOfOnePlayer/:playerId', async function (req, res) {
    const { playerId } = req.params;
    try {
      const result = await controller.getOneScore(playerId);
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  // Public on purpose: client/src/hooks/useGetData.js calls this from every
  // public page (it is a read even though it is a POST, since the id list
  // does not fit in a query string), so it must never require a session.
  router.post('/getScoreOfPlayers', async function (req, res) {
    const { playersIds } = req.body;
    try {
      const results = await controller.getScoresOfPlayersById(playersIds);
      response.success(req, res, results, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  router.post('/setScoreOfOnePlayer/:playerId', requireAdmin, async function (req, res) {
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

  router.put('/setScoreOfOnePlayer/:playerId', requireAdmin, async function (req, res) {
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

  router.delete('/deleteOne/:playerId', requireAdmin, async function name(req, res) {
    const { playerId } = req.params;
    try {
      const result = await controller.deleteOne(playerId);
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  router.delete('/deleteAll', requireAdmin, async function (req, res) {
    try {
      const result = await controller.deleteAllScore();
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  return router;
};
