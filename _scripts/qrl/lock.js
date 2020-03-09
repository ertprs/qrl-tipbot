const config = require('../../_config/config.json');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function lock() {
  const { stdout, stderr } = await exec('curl -s -XGET http://127.0.0.1:5359/api/LockWallet');
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  console.log(`Wallet Locked: ${stdout}`);
  return;
}
async function unlock() {
  const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/UnlockWallet -d '{ "passphrase": "${config.wallet.passphrase}"}'`);
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  console.log(`Wallet Unlocked: ${stdout}`);
  return;
}

module.exports = {
  lock : lock,
  unlock : unlock,
};