module.exports = {
  name: 'add',
  description: 'Add a user to he QRL TipBot',
  args: false,
  aliases: ['join', 'signup', 'su'],
  guildOnly: false,
  usage: ' \n## Add you\'re user to the QRL TipBot, creates an address and allows tipping. *You must allow DM to use the bot.*',
  cooldown: 60,

  execute(message, args) {
    const Discord = require('discord.js');
    // const QRCode = require('qrcode')
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(25);
    const checkUser = dbHelper.CheckUser;
    const addUser = dbHelper.AddUser;
    const addTransaction = dbHelper.addTransaction;
    const MessageAuthorID = message.author.id;
    const MessageAuthorUsername = message.author.username;
    const username = `${message.author}`;
    const userName = username.slice(1, -1);
    const user_info = { service: 'discord', user_id: userName };
    const checkUserpromise = checkUser(user_info);

    // use to send a reply to user with delay and stop typing
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
    }

    // used for the new user signup. Add the new users address to the faucet and drip them some funds
    function dripAmount(min, max) {
      const minAmt = min * 1000000000;
      const maxAmt = max * 1000000000;
      // console.log('min: ' + minAmt + ' max: ' + maxAmt);
      const randomNumber = Math.floor(
        Math.random() * (maxAmt - minAmt) + minAmt
        );
      const num = randomNumber / 1000000000;
      // console.log('Random number ' + num);
      return num;
    }
    const dripamt = dripAmount(config.faucet.min_payout, config.faucet.max_payout);

    if (args[0] == undefined) {
      checkUserpromise.then(function(result) {
        const output = JSON.parse(JSON.stringify(result));
        // console.log('output: ' + output);
        const found = result.user_found;
        // console.log('user found: ' + found);
        // check for the user_found value returned from the promise
        if (found === 'true') {
          message.channel.startTyping();
          const getUserWalletPub = dbHelper.GetUserWalletPub;
          const walletPub = getUserWalletPub({ user_id: result.user_id });
          walletPub.then(function(address) {
            return address;
          }).then(function(balanceReq) {
            const userAddress = balanceReq.wallet_pub;
            // should return { wallet_bal: wallet_bal }
            const walletBal = dbHelper.GetUserWalletBal({ user_id: result.user_id });
            walletBal.then(function(balance) {
              const returnData = { wallet_pub: userAddress, wallet_bal: balance.wallet_bal };
              return returnData;
            }).then(function(reply) {

              //  embed a message to the user with account details
              const userBalance = reply.wallet_bal / 1000000000;
              // console.log('userBalance ' + userBalance);
              const embed = new Discord.MessageEmbed()
                .setColor(0x000000)
                .setTitle('**TipBot Account Exists**')
                .setDescription('Here is your existing TipBot account information.')
                .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`)
                .addField('Your QRL Wallet Public Address::', '[' + reply.wallet_pub + '](' + config.bot_details.explorer_url + '/a/' + walletPub.wallet_pub + ')')
                .addField('Your QRL Wallet Balance:\t', `\`${userBalance}\``)
                .addField('For all of my commands:\t', '`+help`');
              message.author.send({ embed })
                .then(() => {
                  if (message.channel.type === 'dm') return;
                  message.channel.stopTyping(true);
                  ReplyMessage('\nYou\'re signed up already. :thumbsup:\nTry `+help`');
                })
                .catch(error => {
                  console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                  message.channel.stopTyping(true);
                  message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                });
            });
          });
          message.channel.stopTyping(true);
          return output;
        }
        else if (found === 'false') {
          // user is not found in database. Do things here to add them
          // Create user wallet
          ReplyMessage('Adding your address to the system. This will take a bit.');
          const qrlWal = wallet.CreateQRLWallet;
          const WalletPromise = qrlWal();
          WalletPromise.then(function(address) {
            const QRLaddress = JSON.parse(address);
            const discord_id = '@' + MessageAuthorID;
            const wallet_pub = QRLaddress.address;
            const userInfo = { service: 'discord', service_id: discord_id, user_name: MessageAuthorUsername, wallet_pub: wallet_pub, wallet_bal: 0, user_key: salt, user_auto_created: false, auto_create_date: new Date(), opt_out: false, optout_date: new Date(), drip_amt: dripamt };
            // console.log('userInfo:' + JSON.stringify(userInfo));
            message.channel.stopTyping();
            return userInfo;
          }).then(function(userInfo) {
            // add user to the database and create an account
            const AddUserPromise = addUser(userInfo);
            AddUserPromise.then(function(addUserResp) {
              const response = JSON.stringify(addUserResp);
              message.channel.startTyping();
              if (addUserResp[3].future_tip_amount > 0) {
                const future_tip_amount = addUserResp[3].future_tip_amount;
                const tipToArray = [];
                // const tipToAddress = [];
                tipToArray.push(userInfo.wallet_pub);
                const fee = config.wallet.tx_fee * 1000000000;
                const future_tip = { amount: future_tip_amount, fee: fee, address_from: config.wallet.hold_address, address_to: tipToArray };
                const send_future_tip = wallet.sendQuanta;
                send_future_tip(future_tip).then(function(futureTip) {
                  const futureTipOut = JSON.parse(futureTip);
                  const tx_hash = futureTipOut.tx.transaction_hash;
                  // write to transactions db
                  const tip_id = 1337;
                  const txInfo = { tip_id: tip_id, tx_hash: tx_hash };
                  const addTransactionPromise = addTransaction(txInfo);
                  addTransactionPromise.then(function(txRes) {
                    return txRes;
                  });
                  const futureClear = { user_id: userInfo.service_id };
                  const clearFutureTips = dbHelper.clearFutureTips;
                  clearFutureTips(futureClear).then(function(clearRes) {
                    return clearRes;
                  });
                });
              }
              return response;
            }).then(function(userresponse) {
              const userAddress = userInfo.wallet_pub;
              const embed = new Discord.MessageEmbed()
                .setColor(0x000000)
                .setTitle('**TipBot Account Info**')
                .setDescription('Here is your TipBot account information.')
                .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`)
                .addField('Your QRL Wallet Public Address::', '[' + userAddress + '](' + config.bot_details.explorer_url + '/a/' + userAddress + ')')
                .addField('Your QRL Wallet Balance:\t', '0')
                .setImage(userInfo.wallet_qr)
                .addField('For all of my commands:\t', '`+help`');
              message.author.send({ embed })
                .then(() => {
                  if (message.channel.type === 'dm') return;
                    message.author.send(` 
            __**TipBot Terms and Conditions**__
Use of this TipBot and any function it may provide to you, as the user, is at your risk. By using this service you agree to hold Tipbot, it's operators and all parties involved at no financial responsibility for any loss or perceived loss you may incur by using this service. By using this service you agree to not hold liable, for any reasons the owner, operators or any affiliates of the QRL TipBot, qrl.tips or any other party associated with this service. By using this service, you agree to not abuse or misuse the service. Abuse of this service may result in a ban from the service and if warrented legal action may be taken. By using this service you as the user agree to share information about your social media aaccount that was used to sign up to the service. At no point will this information be sold or used for any purpose other than this TipBot service.

**You take all risk by using this service and agree to not hold liable the owners and operators for any reason**

                    `);
                    message.author.send(`
            :exclamation: __**RULES**__ :exclamation:
:small_orange_diamond: *This service is for tipping or giving small amounts of QRL to other users, You agree to not use this to trade currency or for any other reason*
:small_orange_diamond: *You will not store large amounts of QRL in this address*
:small_orange_diamond: *Any balance that is larger than you are willing to lose, you take responsibility for transfering out of the tipbot, using the \`+transfer\` function*
:small_orange_diamond: *You will not break any law, in any jurisdiction by using this bot in any way that is not intended or identified in these rules *
:small_orange_diamond: *Any tips sent to a user that has not signed up will be saved for that user for a length of time determined by the bot owner. Failure of the user to collect tips in this time may result in a loss of funds for that user.*
:small_orange_diamond: *Tips will never be refunded or returned to a user, for any reason. A tip is final once sent.*
:small_orange_diamond: *Any abuse of the service will result in a ban and if warranted legal action.*

__**IF YOU AGREE TO THESE TERMS**__ \`+agree\`
__**IF YOU DO NOT AGREE TO THESE TERMS**__ \`+opt-out\`
                    `);
                    message.channel.stopTyping(true);
                    ReplyMessage(':white_check_mark: Your signed up!\nFor a list of my commands type `+help`\nBonus! You\'ll receive* ***' + dripamt + ' Quanta*** from the faucet!. *Faucet payments can take up to 10 min to reflect in a users wallet.*');
                })
                .catch(error => {
                  console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                  message.channel.stopTyping(true);
                  ReplyMessage('it seems like I can\'t DM you! Enable DM and try `+add` again...');
                  // react to the users message for fun
                });
              message.react('🇶')
                .then(() => message.react('🇷'))
                .then(() => message.react('🇱'))
                .catch(() => console.error('One of the emojis failed to react.'));
              message.channel.stopTyping(true);
              return userresponse;
            });
          });
        }
      });
    }
  },
};