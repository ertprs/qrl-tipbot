'use strict';
const mysql = require('mysql');
const config = require('../../_config/config.json');
const fs = require('fs');
let returnArray = [];
// this script will run and check all of the various things required to run the service.
// Add a new file in this directory for each service to check and refer to them here.
// call this periodicly and when the service starts


async function NodeCheck() {
  return new Promise(resolve => {
    // check for the qrl node
    // should return true if all tests passed
    // test for - run, sync, blockheight matches explorer,


    // returnArray.push({ results...})
  });
}


function WalletCheck() {
  // check the wallet and verify 3 addresses

}

function walletAPICheck() {
  // check the walletAPI is running and working

}

// ConfigCheck returns true if file is found
async function ConfigCheck() {
  return new Promise(resolve => {
    // check for the config file
    fs.access('_config/config.json', error => {
      if (error) {
        returnArray.push({ config_found: 'false' });
      }
      else {
        returnArray.push({ config_found: 'true' });
      }
    });
    console.log('returnArray: ' + JSON.stringify(returnArray));
    resolve(returnArray);
    return returnArray;
  });
}


// MysqlCheck returns true if database is connectable and found
async function MysqlCheck() {
  return new Promise(resolve => {
    // database connection info found in the config file
    const callmysql = mysql.createConnection({
      host: `${config.database.db_host}`,
      user: `${config.database.db_user}`,
      password: `${config.database.db_pass}`,
      database: `${config.database.db_name}`,
    });
    callmysql.connect(function(err) {
      if (err) {
        console.log('error: ' + err.message);
        console.log('error complete: ' + JSON.stringify(err));
        returnArray.push({ database_connected: 'false' });
        return;
      }
      // console.log('Connected to the MySQL server.');
    });
    callmysql.end(function(err) {
      if (err) {
        return console.log('error:' + err.message);
      }
      // console.log('Close the database connection.');
      returnArray.push({ database_connected: 'true' });
    });
    resolve(returnArray);
  });
}


/*
====================
+  SERVICE CHECKS  +
====================
These check verify connection to the service from the bot.
- check the connection works
- check

*/


function DiscordCheck() {
	// check that the bot can connect to discord and
}
function TrelloCheck() {
	// check that the bot can connect to Trello and
}
function KeybaseCheck() {
	// check that the bot can connect to Keybase and
}
function TwitterCheck() {
	// check that the bot can connect to Twitter and
}
function RedditCheck() {
	// check that the bot can connect to Reddit and
}
function GithubCheck() {
	// check that the bot can connect to Github and
}
function SlackCheck() {
	// check that the bot can connect to Slack and
}
function TelegramCheck() {
	// check that the bot can connect to Telegram and
}
function WhatsappCheck() {
	// check that the bot can connect to Whatsapp and
}


module.exports = {
NodeCheck : NodeCheck,
ConfigCheck : ConfigCheck,
MysqlCheck: MysqlCheck,

DiscordCheck : DiscordCheck,
TrelloCheck : TrelloCheck,
KeybaseCheck : KeybaseCheck,
TwitterCheck : TwitterCheck,
RedditCheck : RedditCheck,
GithubCheck : GithubCheck,
SlackCheck : SlackCheck,
TelegramCheck : TelegramCheck,
WhatsappCheck : WhatsappCheck,
WalletCheck: WalletCheck,
walletAPICheck: walletAPICheck,

};
