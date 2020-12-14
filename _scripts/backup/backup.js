// Script to backup all of the files needed to run the bot
// Run cron jobs to move these and tar things up plus send to another server.


const fs = require('fs');
// const crypto2 = require('crypto');
const config = require('../../_config/config.json');
const mysqldump = require('mysqldump');
const sha256Array = [];
// const date1 = Date.now();
const folderName = 'backup';

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
  // console.log('sqlDumpFile: ' + JSON.stringify(sqlDumpFile));
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