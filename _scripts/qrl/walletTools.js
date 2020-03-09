const config = require('../../_config/config.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function getWalletInfo() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/GetWalletInfo');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  const info = JSON.parse(stdout);
  // console.log(info);
  if (info.code === 1) {
    // console.log('Wallet is locked');
    const locked = true;
    return locked;
  }
  else {
    const locked = false;
    const version = info.version;
    const address_count = info.address_count;
    const encrypted = info.is_encrypted;
    // console.log('Wallet Version: ' + info.version + '\n' + 'Wallet info.address_count: ' + info.address_count + '\n' + 'Wallet info version: ' + info.is_encrypted);
    const WalInfo = `\`{"version":"${version}", "address_count": "${address_count}", "encrypted": "${encrypted}", "locked": "${locked}"}\``;
    return WalInfo;
  }
}

async function CreateQRLWallet(args) {
  // console.log('createWallet file called\n');
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
  else {
    // no args passed, get the defaults from the config and create a wallet
    // console.log('Args passed to createWallet, lets create the USER wallet)');
    const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/AddNewAddressWithSlaves -d'{  "height": ${args[0]}, "number_of_slaves": ${args[1]}, "hash_function": "${args[2]}"}'`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    // console.log(`qrlWallet: ${stdout}`);
    const state = stdout;
    return state;
  }
}

async function sendQuanta(args) {
  // console.log('\n\nsendQuanta fired for: ' + JSON.stringify(args));
  // function to send QRL to an array of addresses
  // expects { amount: amount, fee: fee, address_from: QRL_ADR_FROM, address_to: QRL_ADDRESSES_TO,  }
  if (args !== null) {
    // args are not null, do things!
    const amount = args.amount;
    const fee = args.fee ;
    const addresses_to = JSON.stringify(args.address_to);
    const master_address = args.address_from;
    // console.log('Info prior to send tx command\n Amount: ' + amount + ' Fee: ' + fee + ' Addresses_to: ' +  addresses_to + ' masterAddress: ' + master_address)
    // console.log('curl -s -XPOST http://127.0.0.1:5359/api/RelayTransferTxnBySlave -d\'{ "addresses_to": ' + addresses_to + ', "amounts": [' + amount + '],  "fee": ' + fee + ', "master_address": "' + master_address + '"}')
    const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/RelayTransferTxnBySlave -d'{ "addresses_to": ${addresses_to}, "amounts": [${amount}],  "fee": ${fee}, "master_address": "${master_address}"}'`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    // console.log(`sendQuanta stdout: ${stdout}`);
    // const sendStdout = JSON.parse(JSON.stringify(stdout));
    const sendStdout = stdout;
    return sendStdout;
  }
  else {
    // no args something is wrong
    // console.log('no args passed to sendQuanta... something is wrong. ');
    return ;
  }

}

// list all wallets
async function list() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/ListAddresses |jq .addresses[]');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`List of Wallets:\n\n${stdout}`);
  const addresses = stdout;
  return addresses;
}

// Give count of all addresses in the wallet
async function count() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/ListAddresses |jq .addresses[] |wc -l');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`qrlWallet: ${stdout}`);
  const walletCount = stdout;
  return walletCount;
}

async function totalBalance() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/GetTotalBalance |jq .balance ');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet Balance: ${stdout}`);
  const walletBal = stdout;
  return walletBal;
}

async function GetBalance(args) {
  // using the wallet API get this info and return to script
  if (args !== null) {
    const { stdout, stderr } = await exec('curl -s -XGET ' + config.bot_details.explorer_url + '/api/a/' + args + ' |jq .state.balance');
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    const output = stdout.slice(1, -2);
    const returnData = { balance: output };
    return returnData;
  }
  else {
  // no args passed
    console.log('no args passed... We need an address!');
    return;
  }
}

async function checkBalance(args) {
  if (args !== null) {
    const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/GetBalance -d '{  "address": "${args}" }'`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    // console.log(`Balance for:\t ${args} ${stdout}`);
    const balance = JSON.stringify(stdout);
    // console.log('balance: ' + JSON.stringify(balance.balance));
    return balance;
  }
  // no args passed, get the defaults from the config and create a wallet
  else {
    console.log('no args passed... We need an address!');
    return;
  }
}

async function encrypt() {
  const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/EncryptWallet -d '{ "passphrase": "${config.wallet.passphrase}" }'`);
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet encrypted!: ${stdout}`);
  const walletEncrypt = stdout;
  return walletEncrypt;
}

async function lock() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/LockWallet');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet Locked: ${stdout}`);
  const walletLock = stdout;
  return walletLock;
}

async function unlock() {
  const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/UnlockWallet -d '{ "passphrase": "${config.wallet.passphrase}"}'`);
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  // console.log(`Wallet Unlocked: ${stdout}`);
  const walletUnlock = stdout;
  return walletUnlock;
}

module.exports = {
  list : list,
  count : count,
  totalBalance : totalBalance,
  checkBalance : checkBalance,
  GetBalance : GetBalance,
  encrypt : encrypt,
  lock : lock,
  unlock : unlock,
  getWalletInfo : getWalletInfo,
  CreateQRLWallet : CreateQRLWallet,
  sendQuanta : sendQuanta,
};