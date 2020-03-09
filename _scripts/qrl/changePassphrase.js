const util = require('util');
const exec = util.promisify(require('child_process').exec);
const fileName = '../../_config/walletConfig.json';
const fs = require('fs');
const config = require(fileName);
async function changePass(args) {
  console.log(args + ' Passed to script...');
  // change the config file
  config.key = args;
  fs.writeFile(fileName, JSON.stringify(config), function(err) {
    if (err) return console.log(err);
    console.log(JSON.stringify(config));
    console.log('writing to ' + fileName);
  });

  const { stdout, stderr } = await exec(`curl -s -XPOST http://127.0.0.1:5359/api/ChangePassphrase -d '{ "oldPassphrase": "${config.wallet.passphrase}", "newPassphrase": "${args[0]}" }'`);
  if (stderr) {
    console.error(`error: ${stderr}`);
  }
  console.log('Wallet Passphrase Changed!');

  const response = stdout;
  return response;
}

module.exports = {
  changePass : changePass,
};

/*
// write a value to a file... use to rewrite the config.wallet.passphrase once changed.
var fs = require('fs');
var fileName = './file.json';
var file = require(fileName);

file.key = "new value";

fs.writeFile(fileName, JSON.stringify(file), function (err) {
  if (err) return console.log(err);
  console.log(JSON.stringify(file));
  console.log('writing to ' + fileName);
});
*/