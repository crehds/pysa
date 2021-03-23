const fs = require('fs/promises');

async function fileToBuffer(file) {
  console.log('Entrando al lector');
  const newImg = await fs.readFile(file.path, (err, data) => {
    if (err) throw err;
  });

  const encImg = newImg.toString('base64');
  const imgURL = Buffer.from(encImg, 'base64');

  return imgURL;
}

module.exports = { fileToBuffer };
