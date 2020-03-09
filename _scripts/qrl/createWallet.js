const config = require('../../_config/config.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
// some helpful commands...
// const { stdout, stderr } = await exec('curl -XPOST http://127.0.0.1:5359/api/AddNewAddressWithSlaves');
// const { stdout, stderr } = await exec(`curl -XPOST http://127.0.0.1:5359/api/AddNewAddressWithSlaves -d'{  "height": ${config.wallet.height}, "number_of_slaves": ${config.wallet.num_slaves}, "hash_function": "${config.wallet.hash_function}"}'`);
// set an async function to call the stare from the node
async function qrlWallet(args) {
  console.log('createWallet file called\n');
  if (args !== null) {
    // console.log('no args passed.Create default Wallet');
    const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/AddNewAddressWithSlaves -d'{  "height": ${config.wallet.height}, "number_of_slaves": ${config.wallet.num_slaves}, "hash_function": "${config.wallet.hash_function}"}'`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    // console.log(`qrlWallet: ${stdout}`);
    const state = stdout;
    return state;
  }
  // no args passed, get the defaults from the config and create a wallet
  else {
    // args equals 3, we probably have instructions to create a wallet... Do It!
    console.log('Args passed to createWallet, lets create the USER wallet)');
    const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/AddNewAddressWithSlaves -d'{  "height": ${args[0]}, "number_of_slaves": ${args[1]}, "hash_function": "${args[2]}"}'`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    // console.log(`qrlWallet: ${stdout}`);
    const state = stdout;
    return state;
  }
}

// export the functiion for use
module.exports = {
  qrlWallet : qrlWallet,
};
