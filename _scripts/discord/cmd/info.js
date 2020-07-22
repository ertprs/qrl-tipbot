const config = require('../../../_config/config.json');


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
  const username = `${message.author}`;
  const userName = username.slice(1, -1);
  const user_info = { service: 'discord', service_id: userName };
  const GetUserInfoPromise = dbHelper.GetAllUserInfo(user_info);


  function ReplyMessage(content) {
    setTimeout(function() {
      message.reply(content);
      message.channel.stopTyping(true);
    }, 1000);
  }

///////////////////////////////////////////////

  // make these work below
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
///////////////////////////////////////////////

  ReplyMessage('The QRL tipbot is available to all users of this channel. Use this bot to send and receive tips on the QRL network.\nIf you would like to support the bot\'s faucet, use the donation addresses below`\n**Faucet Donation Address:** `' + config.faucet.faucet_wallet_pub + '`');

  GetUserInfoPromise.then(function(userInfo) {
    // set variables from db search
    //console.log(JSON.stringify(userInfo))
    const found = userInfo[0].user_found;
    const optOut = userInfo[0].opt_out;
    const agree = userInfo[0].user_agree;
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
      const userWalletPub = userInfo[0].wallet_pub;
      const FaucetWalletPub = config.faucet.faucet_wallet_pub;
      const faucetPayoutInterval = config.faucet.payout_interval;
      const faucetMinPayout = config.faucet.min_payout;
      const faucetMaxPayout = config.faucet.max_payout;
      const botFee = config.wallet.tx_fee;
      const botUrl = config.bot_details.bot_url;
      const explorerURL = config.wallet.explorer_url;
      // get updated bot wallet balance and faucet wallet balance


    };



  });

  },
};