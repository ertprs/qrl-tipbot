//  const { prefix } = require('../../../config.json');

module.exports = {
  name: 'info',
  description: 'Information about this bot.',
  aliases: ['commands'],
  usage: '[command name]',
  cooldown: 1,
  execute(message) {

  const Discord = require('discord.js');
  const dbHelper = require('../../db/dbHelper');
  const config = require('../../../_config/config.json');
  const wallet = require('../../qrl/walletTools');
  const explorer = require('../../qrl/explorerTools');
  const cgTools = require('../../coinGecko/cgTools');


  function ReplyMessage(content) {
    setTimeout(function() {
      message.reply(content);
      message.channel.stopTyping(true);
    }, 1000);
  }

// /////////////////////////////////////////////

  function getHeight() {
      return new Promise(resolve => {
      const height = wallet.GetHeight();
      resolve(height);
    });
  }

  function getCgData() {
    return new Promise(resolve => {
      const cgdata = cgTools.cgData();
      resolve(cgdata);
    });
  }

  function getPoolInfo() {
    return new Promise(resolve => {
      const poolData = explorer.poolData();
      resolve(poolData);
    });
  }

  function faucetWalletBalance() {
    return new Promise(resolve => {
      const walletBal = wallet.GetBalance;
      // console.log('faucet Address: ' + config.faucet.faucet_wallet_pub);
      resolve(walletBal(config.faucet.faucet_wallet_pub));
    });
  }

  function userWalletBalance(address) {
    return new Promise(resolve => {
      const walletBal = wallet.GetBalance;
      // console.log('faucet Address: ' + config.faucet.faucet_wallet_pub);
      resolve(walletBal(address));
    });
  }

  function getHashRate(hashrate) {
    if (!hashrate) hashrate = 0;
    let i = 0;
    const byteUnits = [' H', ' kH', ' MH', ' GH', ' TH', ' PH' ];
    if (hashrate > 0) {
      while (hashrate > 1000) {
        hashrate = hashrate / 1000;
        i++;
      }
    }
  return parseFloat(hashrate).toFixed(2) + byteUnits[i];
  }


  async function main() {
    // look in the database for the user
    const username = `${message.author}`;
    const userName = username.slice(1, -1);
    const userInfo = { service: 'discord', service_id: userName };
    const userData = await dbHelper.GetAllUserInfo(userInfo);
    console.log(JSON.stringify(userData));
    const found = userData[0].userData;
    const optOut = userData[0].opt_out;
    const agree = userData[0].user_agree;
    // run through checks and fail if, else serve info to user
    // is user found?
    if (found === 'false') {
      console.log('!found');
      // not found, give main message and end
      // ReplyMessage('Your not found in the System. Try `+add` or `+help`');
      return;
    }
    // check for opt_out status
    if (optOut === 1) {
      console.log('opt-out');
      // Opt Out, give main message and end
      // ReplyMessage('You have opted out of the tipbot. Please send `+opt-in` to opt back in!');
      return;
    }
    if (agree === 'false') {
      console.log('!agree');
      // not Agreed, give main message and end
      // ReplyMessage('You need to agree, please see the `+terms`');
      return;
    }
    else {
      // user found and all checks pass
      const userWalletPub = userData[0].wallet_pub;
      const FaucetWalletPub = config.faucet.faucet_wallet_pub;
      const faucetPayoutInterval = config.faucet.payout_interval;
      const faucetMinPayout = config.faucet.min_payout;
      const faucetMaxPayout = config.faucet.max_payout;
      const botFee = config.wallet.tx_fee;
      const botUrl = config.bot_details.bot_url;
      const explorerURL = config.wallet.explorer_url;
      // get updated bot wallet balance and faucet wallet balance
      const faucetBal = await faucetWalletBalance();
      const userBal = await userWalletBalance(userWalletPub);
      const cgData = await getCgData();
      const blockHeight = await getHeight();
      const poolData = await getPoolInfo();

      console.log(JSON.stringify(faucetBal));
      console.log(JSON.stringify(userBal));
      //console.log(JSON.stringify(cgData));
      console.log(blockHeight.height);
      //console.log(JSON.stringify(poolData));


    }
  }
  
  ReplyMessage('The QRL tipbot is available to all users of this channel. Use this bot to send and receive tips on the QRL network.\nIf you would like to support the bot\'s faucet, use the donation addresses below`\n**Faucet Donation Address:** `' + config.faucet.faucet_wallet_pub + '`');
  main();


/*
  async function getUserInfo() {
    // look in the database for the user
    const username = `${message.author}`;
    const userName = username.slice(1, -1);
    const userInfo = { service: 'discord', service_id: userName };
    const data = await dbHelper.GetAllUserInfo(userInfo);
    // will return array of user data or not found.
    return data;
  }

  async function cgData() {
    const data = await getCgData();
    const array = [];
    array.push({ cgData: data });
    return array;
  }

  async function Height() {
    const data = await getHeight();
    const array = [];
    array.push({ height: data });
    return array;
  }
  async function poolInfo() {
    const data = await getPoolInfo();
    const array = [];
    array.push({ poolInfo: data });
    return array;
  }
  async function faucetBal() {
    const data = await faucetWalletBalance();
    const array = [];
    array.push({ faucetBal: data });
    return array;
  }
// /////////////////////////////////////////////


  getUserInfo().then(function(userInfo) {
    // set variables from db search
    console.log(JSON.stringify(userInfo));
    const found = userInfo[0].user_found;
    const optOut = userInfo[0].opt_out;
    const agree = userInfo[0].user_agree;
    // run through checks and fail if, else serve info to user
    // is user found?
    if (!found) {
      // not found, give main message and end
      // ReplyMessage('Your not found in the System. Try `+add` or `+help`');
      return;
    }
    // check for opt_out status
    if (optOut) {
      // Opt Out, give main message and end
      // ReplyMessage('You have opted out of the tipbot. Please send `+opt-in` to opt back in!');
      return;
    }
    if (!agree) {
      // not Agreed, give main message and end
      // ReplyMessage('You need to agree, please see the `+terms`');
      return;
    }
    else {
      // user found and all checks pass
      const userWalletPub = userInfo[0].wallet_pub;      
      const FaucetWalletPub = config.faucet.faucet_wallet_pub;
      const faucetPayoutInterval = config.faucet.payout_interval;
      const faucetMinPayout = config.faucet.min_payout;
      const faucetMaxPayout = config.faucet.max_payout;
      const botFee = config.wallet.tx_fee;
      const botUrl = config.bot_details.bot_url;
      const explorerURL = config.wallet.explorer_url;
      // get updated bot wallet balance and faucet wallet balance


    }
  });
*/
  },
};