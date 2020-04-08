const config = require('../../_config/config.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// this script will get the bot initilized and ready for use
// generate 3 addresses, bot donation, bot hold address, and the faucet address


// save these to a file, and print to console in pretty way


// using the bot_donation address, add a user to the database for the bot address. 
// this address is where users can tip the bot and where any donation address information will be pointed

