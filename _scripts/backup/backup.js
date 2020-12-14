// Script to backup all of the files needed to run the bot
// curently dumps all files into the directory detailed in the config file config.backup.location
// Run cron jobs to move these and tar things up plus send to another server.
// Run this every hour, on the hour  0 */1 * * * /usr/bin/nodejs /home/$USER/qrl-tipbot/_scripts/backup/backup.js && /home/$USER/qrl-tipbot/_scripts/backup/backup.sh


const fs = require('fs');
// const crypto2 = require('crypto');
const config = require('../../_config/config.json');
const mysqldump = require('mysqldump');
const sha256Array = [];
// const date1 = Date.now();
const folderName = 'backup';

/*
function decryptFile({ fileName, password }) {
  const input = fs.createReadStream(fileName + '.encrypted');
  const output = fs.createWriteStream(fileName + '.unencrypted');
  const initVect = crypto2.randomBytes(16);
  const pass_hash = getCipherKey(password);
  const CIPHER_KEY = new Buffer(pass_hash);
  const decipher = crypto2.createDecipheriv('aes-256-cbc', CIPHER_KEY, initVect);
  input.pipe(decipher).pipe(output).on('finish', () => {
    console.log('FILE DECRYPTED');
  }).on('error', error => {
    console.log(error);
  });
}
*/
/*

function encryptFile({ fileName, password }) {
  const initVect = crypto2.randomBytes(16);
  const pass_hash = getCipherKey(password);
  const CIPHER_KEY = new Buffer(pass_hash);
  const aes = crypto2.createCipheriv('aes-256-cbc', CIPHER_KEY, initVect);
  const input = fs.createReadStream(fileName);
  const output = fs.createWriteStream(fileName + '.encrypted');
  input
    .pipe(aes)
    .pipe(output)
    .on('finish', function() {
      console.log('done encrypting');
    });
}

*/

// backup database into a and save in the backup folder
async function sqlBackup() {
  return new Promise(function(resolve) {
    // dump the result straight to a compressed file
    const fileName = '/tipBotDatabase_Backup.sql';
    const dumpFilePath = config.backup.location + folderName + fileName;
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


async function main() {
  // check for and make if not exist backup dir
  try {
    if (!fs.existsSync(config.backup.location + folderName)) {
      fs.mkdirSync(config.backup.location + folderName);
    }
  } catch (err) {
    console.error(err);
  }

  // get the sql database into a dump file.
  const sqlDumpFile = await sqlBackup();
  console.log('sqlDumpFile: ' + JSON.stringify(sqlDumpFile));

  const SqlDumpFile = sqlDumpFile[0];
  console.log('SqlDumpFile: ' + JSON.stringify(SqlDumpFile));


  fs.copyFile(config.backup.walletFile, config.backup.location + folderName + '/walletd.json', (err) => {
    if (err) throw err;
  // console.log('walletd.json was copied to ' + config.backup.location + folderName + 'walletd.json');
  });
  fs.copyFile(config.backup.walletdLog, config.backup.location + folderName + '/walletd.log', (err) => {
    if (err) throw err;
  // console.log('walletd.log was copied to ' + config.backup.location + folderName + 'walletd.log');
  });
  fs.copyFile(config.backup.nodeConfig, config.backup.location + folderName + '/config.yml', (err) => {
    if (err) throw err;
  // console.log('nodeConfig was copied to ' + config.backup.location + 'config.yml');
  });
  fs.copyFile(config.backup.faucetLog, config.backup.location + folderName + '/faucet.log', (err) => {
    if (err) throw err;
  // console.log('faucetLog was copied to ' + config.backup.location + folderName + 'faucet.log');
  });
  // fs.copyFile(config.backup.botLogFile, config.backup.location + folderName + 'discord_bot.log', (err) => {
  // if (err) throw err;
  // console.log('botLogFile was copied to ' + config.backup.location + folderName + 'discord_bot.log');
  // });
  fs.copyFile(config.backup.botConfigFile, config.backup.location + folderName + '/config.json', (err) => {
    if (err) throw err;
  // console.log('botConfigFile was copied to ' + config.backup.location + folderName + 'config.json');
  });


  /*
  // get the SHA256sum of each file
  let fileArray = [];
  fileArray = [config.backup.location + folderName + '/tipBotDatabase_Backup.sql', config.backup.location + folderName + '/walletd.json', config.backup.location + folderName + '/walletd.log', config.backup.location + folderName + '/config.yml', config.backup.location + folderName + '/faucet.log', config.backup.location + folderName + '/config.json'];

  fileArray.forEach(function(file) {
    console.log('file:' + file);
    const sha256value = sha256sum(file);
    sha256value.then(function() {

      console.log('sha256value: ' + sha256value);

      sha256Array.push({
        key: file,
        value: sha256value,
      });
      console.log(config.backup.location + folderName + '/' + file);
    });
  });
  fs.readdirSync(config.backup.location + folderName).forEach(file => {
    // get sha for each file in config.backup.botConfigFile, config.backup.location + folderName dir
    console.log('file: ' + config.backup.location + folderName + '/' + file);
    const sha256value = sha256sum(config.backup.location + folderName + '/' + file);
    sha256value.then(function() {

      console.log('sha256value: ' + sha256value);

      sha256Array.push({
        key: config.backup.location + folderName + '/' + file,
        value: sha256value,
      });
      console.log(config.backup.location + folderName + '/' + file);
    });
  });
*/
  console.log('sha256Array: ' + JSON.stringify(sha256Array));

  // write the sha256 info to file
  fs.writeFile(config.backup.location + folderName + '/sha256sum.txt', JSON.stringify(sha256Array), function(err) {
    if (err) return console.log(err);
  // console.log('sha256sum file written');
  });

  // tar the files in the the backup location
  // const tarMe = await tarFiles(config.backup.location + folderName);
  console.log('Backup Files written to ' + config.backup.location);
}

main();