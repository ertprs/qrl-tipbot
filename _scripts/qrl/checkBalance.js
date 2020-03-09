// const config = require('../../_config/config.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
// some helpful commands...
// const { stdout, stderr } = await exec('curl -XPOST http://127.0.0.1:5359/api/AddNewAddressWithSlaves');
// const { stdout, stderr } = await exec(`curl -XPOST http://127.0.0.1:5359/api/AddNewAddressWithSlaves -d'{  "height": ${config.wallet.height}, "number_of_slaves": ${config.wallet.num_slaves}, "hash_function": "${config.wallet.hash_function}"}'`);
// set an async function to call the stare from the node
async function checkBalance(args) {
  console.log('createWallet');
  if (args !== null) {
    console.log('Address is good, lets check the balance for:' + args);
    const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/GetBalance -d '{  "address": "${args}" }'`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    console.log(`qrl Wallet Balance: ${stdout}`);
    const balance = stdout;
    return balance;
  }
  // no args passed, get the defaults from the config and create a wallet
  else {
    console.log('no args passed... We need an address!');
    return;
  }
}

// export the functiion for use
module.exports = {
  checkBalance : checkBalance,
};
