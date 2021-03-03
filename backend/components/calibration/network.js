const express = require('express');
const router = express.Router();
const response = require('../../response');
const controller = require('./controller');

router.post('/addCalibration', async function (req, res) {
  const { body: calibration } = req;
  try {
    const result = await controller.addCalibration(calibration);
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
