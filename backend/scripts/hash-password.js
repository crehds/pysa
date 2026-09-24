#!/usr/bin/env node
'use strict';

// Prints the bcrypt hash (cost 12) of an admin password for
// ADMIN_PASSWORD_HASH, without ever putting the plaintext password in shell
// history, process listings, or a log: it is read from an interactive
// prompt with input echo disabled, never from argv, and falling back to
// stdin when not run in a TTY (e.g. `printf '%s' "$PASSWORD" | npm run
// hash-password` in a script or CI).
//
// Usage: npm run hash-password

const readline = require('node:readline');
const bcrypt = require('bcryptjs');

const BCRYPT_COST = 12;

function isInteractive() {
  return Boolean(process.stdin.isTTY) && Boolean(process.stdout.isTTY);
}

// Reads a line from a TTY without echoing it back: readline itself only
// handles line buffering/editing, but the terminal driver echoes typed
// characters at the OS level, so silencing readline's own writes is not
// enough. Raw mode hands us every keystroke instead, and we simply never
// write it anywhere.
function readPasswordFromTTY(promptText) {
  return new Promise((resolve, reject) => {
    process.stdout.write(promptText);
    const { stdin } = process;
    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let password = '';

    function cleanup() {
      stdin.removeListener('data', onData);
      stdin.setRawMode(wasRaw);
      stdin.pause();
    }

    function onData(chunk) {
      for (const char of chunk) {
        if (char === '\n' || char === '\r') {
          cleanup();
          process.stdout.write('\n');
          resolve(password);
          return;
        }
        if (char === '\u0003') {
          // Ctrl-C
          cleanup();
          process.stdout.write('\n');
          reject(new Error('Aborted'));
          return;
        }
        if (char === '\u007f' || char === '\b') {
          password = password.slice(0, -1);
          continue;
        }
        password += char;
      }
    }

    stdin.on('data', onData);
  });
}

function readPasswordFromStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data.replace(/\r?\n$/, ''));
    });
    process.stdin.on('error', reject);
  });
}

async function main() {
  if (process.argv.length > 2) {
    console.error(
      'Do not pass the password as a command-line argument: it would leak into ' +
        'shell history and process listings. Run `npm run hash-password` with no ' +
        'arguments and type the password when prompted.'
    );
    process.exitCode = 1;
    return;
  }

  const password = isInteractive()
    ? await readPasswordFromTTY('Admin password: ')
    : await readPasswordFromStdin();

  if (!password) {
    console.error('No password provided.');
    process.exitCode = 1;
    return;
  }

  const hash = await bcrypt.hash(password, BCRYPT_COST);
  console.log(hash);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
