const fs = require('fs/promises');

async function fileToBuffer(file) {
  console.log('Entrando al lector');
  console.log(file.path);
  console.log(__dirname);
  const newImg = await fs.readFile(`${file.path}`, (err, data) => {
    if (err) throw err;
    console.log(data);
  });

  const encImg = newImg.toString('base64');
  const imgURL = Buffer.from(encImg, 'base64');

  return imgURL;
}

module.exports = { fileToBuffer };
