const db = require('mongoose');

async function connect(url) {
  await db
    .connect(url)
    .then(() => console.log('[db] Conectado con éxito '))
    .catch((error) => console.error('[db] ', error));
}

module.exports = connect;
