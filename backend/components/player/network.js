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

router.get('/getAllPlayers', async function (req, res) {
  try {
    const players = await controller.getAllPlayers();
    response.success(req, res, players, 200);
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

router.post('/newPlayers', async function (req, res) {
  const { players } = req.body;
  try {
    const result = await controller.addPlayers(players);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

// only if the structure of model, change
// router.put(
//   '/updatePlayer/:playerId/updateMedail/:medailId',
//   async function (req, res) {
//     const { medailId, playerId } = req.params;
//     const { body } = req;
//     try {
//       const result = await controller.updateMedail(medailId, playerId, body);
//       // const result = { medailId, playerId}
//       response.success(req, res, result, 200);
//     } catch (error) {
//       response.error(req, res, 'Unexpected error', 500, error);
//     }
//   }
// );

router.post('/playersWithAllData', async function name(req, res) {
  const { players } = req.body;
  try {
    const result = await controller.addPlayersWithAllData(players);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.patch('/updateScore/:playerId', async function (req, res) {
  const { playerId } = req.params;
  const { body } = req;
  try {
    const result = await controller.updatePlayer(playerId, body);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.patch('/setNotCalibrated/:playerId', async function (req, res) {
  const { playerId } = req.params;
  try {
    const result = await controller.setNotCalibrated(playerId);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});
router.patch(
  '/patchPlayer/:playerId/updateMedail/:medailId',
  async function (req, res) {
    const { playerId, medailId } = req.params;
    try {
      const result = await controller.patchPlayer(playerId, medailId);
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  }
);

router.delete('/deleteAll', async function (req, res) {
  try {
    const result = await controller.deleteAll();
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});
module.exports = router;
