'use strict';
const assert = require('assert');
const config = require('../../_config/config.json');
const fs = require('fs');
// this script will run and check all of the various things required to run the service.
// Add a new file in this directory for each service to check and refer to them here.
// call this periodicly and when the service starts


function NodeCheck() {
	// check for the qrl node
	// should return true if all tests passed
	// test for - run, sync, blockheight matches explorer,
}


function WalletCheck() {
  // check the wallet and verify 3 addresses

}

function walletAPICheck() {
  // check the walletAPI is running and working

}


function ConfigCheck() {
	// check for the config file and make sure it is filled in correctly
	// check for the config file
  fs.access('_config/config.json', error => {
    if (!error) {
      // The check succeeded
      // console.log('Config Found!');
    }
    else {
    // The check failed
      console.log('Config NOT Found!');
      return;
    }
  });
    // check for database info, wallet info, at least one service info sections
    //
    // check for qrl address format
    assert.doesNotMatch('' + config.bot_details.bot_donationAddress + '', /^(Q|q)[0-9a-fA-f]{78}$/);
    assert.doesNotMatch('' + config.wallet.hold_address + '', /^(Q|q)[0-9a-fA-f]{78}$/);
    assert.doesNotMatch('' + config.faucet.faucet_wallet_pub + '', /^(Q|q)[0-9a-fA-f]{78}$/);
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
