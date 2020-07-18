/*
This will decrypt the encrypted database files, or any AES encrypted files. 

- Run the command like:

 `nodejs decrypt.js decrypt /FILE/PATH $PASSWORD`

- This will produce a decrypted file in the same location as the origional. 
- File will be saved with a .unenc ending. rename to origional and restore to he new bot
*/

const crypto = require('crypto');
const fs = require('fs');
const zlib = require('zlib');
function getCipherKey(password) {
  return crypto.createHash('sha256').update(password).digest();
}
function decrypt({ file, password }) {
  // First, get the initialization vector from the file.
  const readInitVect = fs.createReadStream(file, { end: 15 });

  let initVect;
  readInitVect.on('data', (chunk) => {
    initVect = chunk;
  });

  // Once we’ve got the initialization vector, we can decrypt the file.
  readInitVect.on('close', () => {
    const cipherKey = getCipherKey(password);
    const readStream = fs.createReadStream(file, { start: 16 });
    const decipher = crypto.createDecipheriv('aes256', cipherKey, initVect);
    const unzip = zlib.createUnzip();
    const writeStream = fs.createWriteStream(file + '.unenc');

    readStream
      .pipe(decipher)
      .pipe(unzip)
      .pipe(writeStream);
  });
}

// pull the mode, file and password from the command arguments.
const [ mode, file, password ] = process.argv.slice(2);

if (mode === 'decrypt') {
  decrypt({ file, password });
}