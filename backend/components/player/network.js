const express = require('express');
const multer = require('multer');
const router = express.Router();
const response = require('../../response/index');
const controller = require('./controller');
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

router.post('/addNewPlayers', async function (req, res) {
  const { players } = req.body;
  try {
    const result = await controller.addNewPlayers(players);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

router.post('/playersWithAllData', async function name(req, res) {
  const { players } = req.body;
  try {
    const result = await controller.addPlayersWithAllData(players);
    console.log(result);
    response.success(req, res, result, 200);
  } catch (error) {
    response.error(req, res, 'Unexpected error', 500, error);
  }
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const { playerId } = req.params;
    const ext = file.mimetype.match(/[a-z]+/gi);
    const ImageURL = `${playerId}.${ext[1]}`;
    cb(null, ImageURL);
  },
});
var upload = multer({ storage: storage });

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
  upload.single('image'),
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

router.patch('/setNotCalibrated/:playerId', async function (req, res) {
  const { playerId } = req.params;
  try {
    const result = await controller.setNotCalibrated(playerId);
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

router.delete('/deleteAllDataOfPlayers', async function (req, res) {
  const { playersIds } = req.body;
  try {
    const result = await controller.deleteAllDataOfPlayers(playersIds);
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
