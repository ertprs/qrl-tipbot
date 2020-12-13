// Script to backup all of the files needed to run the bot
// curently dumps all files into the directory detailed in the config file config.backup.location
// Run cron jobs to move these and tar things up plus send to another server.
// Run this every hour, on the hour  0 */1 * * * /usr/bin/nodejs /home/$USER/qrl-tipbot/_scripts/backup/backup.js && /home/$USER/qrl-tipbot/_scripts/backup/backup.sh


const fs = require('fs');
const crypto = require('crypto');
const config = require('../../_config/config.json');
const path = require('path');
const zlib = require('zlib');
const { Transform } = require('stream');
const mysqldump = require('mysqldump');
const date1 = Date.now();

// Cryptographic functions for encryption
function getCipherKey(password) {
  return crypto.createHash('sha256').update(password).digest();
}

class AppendInitVect extends Transform {
  constructor(initVect, opts) {
    super(opts);
    this.initVect = initVect;
    this.appended = false;
  }

  _transform(chunk, encoding, cb) {
    if (!this.appended) {
      this.push(this.initVect);
      this.appended = true;
    }
    this.push(chunk);
    cb();
  }
}

function encrypt({ file, password }) {
module.exports = AppendInitVect;
  // Generate a secure, pseudo random initialization vector.
  const initVect = crypto.randomBytes(16);

  // Generate a cipher key from the password.
  const CIPHER_KEY = getCipherKey(password);
  const readStream = fs.createReadStream(file);
  const gzip = zlib.createGzip();
  const cipher = crypto.createCipheriv('aes256', CIPHER_KEY, initVect);
  const appendInitVect = new AppendInitVect(initVect);
  // Create a write stream with a different file extension.
  const writeStream = fs.createWriteStream(path.join(file + '.enc'));
  readStream
    .pipe(gzip)
    .pipe(cipher)
    .pipe(appendInitVect)
    .pipe(writeStream);
}

// sha256sum file. Send the file location to sum
async function sha256sum(file) {
  return new Promise(function(resolve) {
	// change the algo to sha1, sha256 etc according to your requirements
	const algo = 'sha256';
	const shasum = crypto.createHash(algo);
	const s = fs.ReadStream(file);
	s.on('data', function(d) { shasum.update(d); });
	s.on('end', function() {
		const d = shasum.digest('hex');
		resolve(d);
	});
  });
}

// backup database into a tar.gz file and save in the backup folder
async function sqlBackup() {
  return new Promise(function(resolve) {
    // dump the result straight to a compressed file
    const fileName = date1 + '_tipBotDatabase_Backup.sql';
    const dumpFilePath = config.backup.location + fileName;
    mysqldump({
      connection: {
        host: config.database.db_host,
        user: config.database.db_user,
        password: config.database.db_pass,
        database: config.database.db_name,
      },
        dumpToFile: dumpFilePath,
        compressFile: false,
    });
    // console.log('SQL Backup File written');
    const results = [dumpFilePath, fileName];
    resolve(results);
  });
}

const sha256Array = [];
async function main() {
  // get the sql database into a dump file.
  const sqlDumpFile = await sqlBackup();
  encrypt({ file: sqlDumpFile[0], password: config.backup.encPass });
  const encSqlDumpFile = sqlDumpFile[0] + '.enc';
  // console.log('file_encrypted');
  // console.log(sqlDumpFile);
  const tarFileArray = [encSqlDumpFile, config.backup.walletFile, config.backup.walletdLog, config.backup.nodeConfig, config.backup.faucetLog, config.backup.botConfigFile];
  // sha256sum those files
  for (let i = 0; i < tarFileArray.length; i++) {
    let file = tarFileArray[i];
    file = file.split('/').pop();
    // console.log(file);
    const sha256value = await sha256sum(tarFileArray[i]);
    sha256Array.push({
      key: file,
      value: sha256value,
    });
  }
  // write the sha256 info to file
  fs.writeFile(config.backup.location + 'sha256sum.txt', JSON.stringify(sha256Array), function(err) {
    if (err) return console.log(err);
  // console.log('sha256sum file written');
  });
  // copy the remaining files over
  fs.copyFile(config.backup.walletFile, config.backup.location + 'walletd.json', (err) => {
    if (err) throw err;
  // console.log('walletd.json was copied to ' + config.backup.location + 'walletd.json');
  });
  fs.copyFile(config.backup.walletdLog, config.backup.location + 'walletd.log', (err) => {
    if (err) throw err;
  // console.log('walletd.log was copied to ' + config.backup.location + 'walletd.log');
  });
  fs.copyFile(config.backup.nodeConfig, config.backup.location + 'config.yml', (err) => {
    if (err) throw err;
  // console.log('nodeConfig was copied to ' + config.backup.location + 'config.yml');
  });
  fs.copyFile(config.backup.faucetLog, config.backup.location + 'faucet.log', (err) => {
    if (err) throw err;
  // console.log('faucetLog was copied to ' + config.backup.location + 'faucet.log');
  });
  fs.copyFile(config.backup.botLogFile, config.backup.location + 'discord_bot.log', (err) => {
    if (err) throw err;
  // console.log('botLogFile was copied to ' + config.backup.location + 'discord_bot.log');
  });
  fs.copyFile(config.backup.botConfigFile, config.backup.location + 'config.json', (err) => {
    if (err) throw err;
  // console.log('botConfigFile was copied to ' + config.backup.location + 'config.json');
  });
  console.log('Backup Files written to ' + config.backup.location)
}

main();