const express = require('express');
const router = express.Router();
const controller = require('./controller');
const response = require('../../response');

router.post('/setMedails', async function (req, res) {
  const { medails } = req.body;
  try {
    const result = controller.addMedail(medails);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

module.exports = router;
