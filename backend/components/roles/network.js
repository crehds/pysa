const express = require('express');
const router = express.Router();
const controller = require('./controller');
const response = require('../../response');

router.post('/setRoles', async function (req, res) {
  const { roles } = req.body;
  try {
    const result = await controller.addRoles(roles);
    response.success(req, res, result, 201);
  } catch (error) {
    response.error(req, res, 'Unpexted error', 500, error);
  }
});

module.exports = router;