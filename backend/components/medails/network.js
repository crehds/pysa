const express = require('express');
const router = express.Router();
const controller = require('./controller');
const response = require('../../response');

router.get('/getMedail/:medailId', async function (req, res) {
  const { medailId } = req.params;
  try {
    const medails = await controller.getMedail(medailId);
    response.success(req, res, medails, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.get('/getMedailByMMR/:MMR', async function (req, res) {
  const { MMR } = req.params;
  try {
    const result = await controller.getMedailByMMR(MMR);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.get('/getMedails', async function (req, res) {
  try {
    const medails = await controller.getMedails();
    response.success(req, res, medails, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.post('/setMedails', async function (req, res) {
  const { medails } = req.body;
  try {
    const result = await controller.addMedails(medails);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.patch('/patchMedail/:medailId', async function (req, res) {
  const { medail } = req.body;
  const { medailId } = req.params;
  try {
    const result = await controller.patchMedail(medailId, medail);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

module.exports = router;
