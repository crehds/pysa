const express = require('express');
const router = express.Router();
const response = require('../../response');
const controller = require('./controller');

router.get('/getCalibrationOfOnePlayer/:playerId', async function (req, res) {
  const { playerId } = req.params;
  try {
    const result = await controller.getCalibration(playerId);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.post('/addCalibration/:playerId', async function (req, res) {
  const { playerId } = req.params;
  const { body: calibration } = req;

  try {
    const result = await controller.addCalibration(playerId, calibration);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.patch('/patchCalibration/:playerId', async function (req, res) {
  const { playerId } = req.params;
  const { body } = req;
  try {
    const result = await controller.patchCalibration(playerId, body);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.delete('/deleteAll', async function (req, res) {
  try {
    const result = await controller.deleteAll();
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

module.exports = router;
