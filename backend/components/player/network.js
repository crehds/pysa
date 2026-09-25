const express = require('express');
const multer = require('multer');
const response = require('../../response/index');
const controller = require('./controller');

const MAX_AVATAR_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB
const AVATAR_TOO_LARGE_MESSAGE = `Image is too large (max ${MAX_AVATAR_UPLOAD_BYTES / (1024 * 1024)}MB)`;

module.exports = function createPlayerRouter(requireAdmin) {
  const router = express.Router();
  console.log(__dirname);
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

  router.post('/newplayer', requireAdmin, async function (req, res) {
    const body = req.body;
    try {
      const result = controller.addPlayer(body);
      response.success(req, res, result, 201);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  router.post('/newPlayers', requireAdmin, async function (req, res) {
    const { players } = req.body;
    try {
      const result = await controller.addPlayers(players);
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  router.post('/addNewPlayers', requireAdmin, async function (req, res) {
    const { players } = req.body;
    try {
      const result = await controller.addNewPlayers(players);
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  router.post('/playersWithAllData', requireAdmin, async function name(req, res) {
    const { players } = req.body;
    try {
      const result = await controller.addPlayersWithAllData(players);
      console.log(result);
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  // Memory storage: the uploaded bytes only ever go into MongoDB (see
  // controller.updateImagePlayer), so there is no reason to write them to
  // disk first. The size limit bounds how much memory one upload can take.
  var upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_AVATAR_UPLOAD_BYTES },
  });

  //método implementado antes de enterarme que heroku borraba las imágenes en al versión gratuita
  // router.post(
  //   '/updateImage/:playerId',
  //   upload.single('image'),
  //   async function (req, res) {
  //     const { playerId } = req.params;
  //     const ext = req.file.mimetype.match(/[a-z]+/gi);
  //     const pathImageURL = `/static/${playerId}.${ext[1]}`;

  //     try {
  //       const result = await controller.updateImagePlayer(playerId, pathImageURL);
  //       response.success(req, res, result, 200);
  //     } catch (error) {
  //       response.error(req, res, 'Unexpected error', 500, error);
  //     }
  //   }
  // );

  router.post(
    '/updateImage/:playerId',
    requireAdmin,
    // Multer is invoked directly (rather than as declarative middleware) so
    // a MulterError -- e.g. LIMIT_FILE_SIZE from the limits above -- can be
    // answered as a clean 4xx through the app's own response helper instead
    // of falling through to Express's default error page (see multer's
    // README, "Error handling").
    function (req, res, next) {
      upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return response.error(req, res, AVATAR_TOO_LARGE_MESSAGE, 413, err);
          }
          // Any other MulterError (e.g. a file under a field other than
          // "image") is a malformed request, not a server fault.
          return response.error(req, res, `Invalid image upload: ${err.message}`, 400, err);
        }
        if (err) {
          return response.error(req, res, 'Unexpected error', 500, err);
        }
        next();
      });
    },
    async function (req, res) {
      const { playerId } = req.params;
      const { file: image } = req;
      try {
        const result = await controller.updateImagePlayer(playerId, image);
        //Para ver la imagen en postman
        // res.status(200).type('image/jpeg').send(result.imgURL);
        response.success(req, res, result, 200);
      } catch (error) {
        response.error(req, res, 'Unexpected error', 500, error);
      }
    }
  );

  router.patch('/setNotCalibrated/:playerId', requireAdmin, async function (req, res) {
    const { playerId } = req.params;
    try {
      const result = await controller.setNotCalibrated(playerId);
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  router.patch('/updateScore/:playerId', requireAdmin, async function (req, res) {
    const { playerId } = req.params;
    const { body } = req;
    try {
      const result = await controller.updatePlayer(playerId, body);
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  router.patch(
    '/patchPlayer/:playerId/updateMedail/:medailId',
    requireAdmin,
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

  router.delete('/deleteAllDataOfPlayers', requireAdmin, async function (req, res) {
    const { playersIds } = req.body;
    try {
      const result = await controller.deleteAllDataOfPlayers(playersIds);
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  router.delete('/deleteAll', requireAdmin, async function (req, res) {
    try {
      const result = await controller.deleteAll();
      response.success(req, res, result, 200);
    } catch (error) {
      response.error(req, res, 'Unexpected error', 500, error);
    }
  });

  return router;
};
