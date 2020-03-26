module.exports = {
  name: 'opt-out',
  description: 'Opt Out of the TipBot',
  args: false,
  guildOnly: false,
  aliases: ['oo'],
  cooldown: 0,
  usage: '\n## opt-out | | oo - Opt out of the QRL TipBot.',

  // execute(message, args) {
  execute(message, args) {
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(25);
    const MessageAuthorID = message.author.id;
    const MessageAuthorUsername = message.author.username;
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    const transfer = wallet.sendQuanta;
    // get the user_found status
    // should return either { user_found: true, user_id: id } || { user_found: false }
    const checkuser = dbHelper.CheckUser;
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const info = JSON.parse(JSON.stringify({ service: 'discord', user_id: UUID }));
    const found = checkuser(info);
    found.then(function(result) {
      return result;
    }).then(function(foundRes) {
      const user_found = foundRes.user_found;
      if (user_found !== 'true') {
        message.channel.startTyping();
        // if the user is not found...
        // Create the user wallet
        const WalletPromise = wallet.CreateQRLWallet(config.wallet.height, config.wallet.num_slaves, config.wallet.hash_function);
        WalletPromise.then(function(address) {
          return JSON.parse(address);
        }).then(function(address) {
          message.channel.startTyping();
          // define user info
          const discord_id = '@' + MessageAuthorID;
          const wallet_pub = address.address;
          const userInfo = { service: 'discord',
            service_id: discord_id,
            user_name: MessageAuthorUsername,
            wallet_pub: wallet_pub,
            wallet_bal: 0,
            user_key: salt,
            user_auto_created: true,
            auto_create_date: new Date(),
            opt_out: true,
            optout_date: new Date(),
          };
          return userInfo;
        }).then(function(userInfo) {
          // add user to the database and create an account
          const AddUserPromise = dbHelper.AddUser(userInfo);
          AddUserPromise.then(function(addUserResp) {
            const response = JSON.parse(JSON.stringify(addUserResp));
            return response;
          }).then(function(AddusrResult) {
            // message user of status
            message.reply('\nYou\'re now opted out.\nIf you change your mind `+opt-in`\n:wave: ');
            message.channel.stopTyping(true);
            return AddusrResult;
          });
        });
      }
      else if (user_found == 'true') {
        message.channel.startTyping();
        // User is found, check if already opted out
        const user_id = foundRes.user_id;
        // get the users opt_out status
        // should return:
        // false { user_found: 'true', opt_out: 'false' } || \
        // true { user_found: 'true', opt_out: 'true', optout_date: optout_date }
        const check_opt_out = dbHelper.CheckUserOptOut;
        check_opt_out({ service: 'discord', user_id: user_id }).then(function(result) {
          return result;
        }).then(function(ooargs) {
          if (ooargs.opt_out == 'true') {
            // error, already opted out...
            message.reply(':thumbsup: Already opted out.\nIf you\'ve changed your mind `+opt-in`');
            message.channel.stopTyping(true);
          }
          else {
            message.channel.startTyping();
            // check balance
            // get the user_id's wallet_bal
            // should return { wallet_bal: wallet_bal }
            const walletBal = dbHelper.GetUserWalletBal;
            walletBal({ user_id: user_id }).then(function(result) {
              const wallet_bal = result.wallet_bal;
              if (wallet_bal > 0) {
                const walletPub = dbHelper.GetUserWalletPub;
                walletPub({ user_id: user_id }).then(function(userWallet) {
                  // should return { wallet_pub: wallet_pub }
                  const wallet_pub = userWallet.wallet_pub;
                  // ask what to do with funds
                  // need args sent to script for this to work.
                  // if no args, error with question on what to do with balance.
                  if (args[0] == null) {
                    // there are no args, ask for some
                    if(message.guild != null) {
                      message.reply('Check your DM!');
                    }
                    message.author.send(message.author + ' You have a balance of `' + wallet_bal + ' qrl` in your tip wallet.\nWhat would you like to do with the funds??\n\n:moneybag: __**QRL Balance Options**__ :moneybag:\n:small_orange_diamond: Donate your tips to the bot - `+optout donate`\n:small_orange_diamond: Transfer to an external QRL address - `+optout transfer {QRL address}`\n:small_orange_diamond: Tip all active users in this Discord Server - `+optout tip`');
                    message.channel.stopTyping(true);
                    return;
                  }

                  console.log('MessageAuthorID: ' + MessageAuthorID + ' config admin: ' + config.discord.bot_admin)
                  
                  if (message.mentions.users.size > 0 && MessageAuthorID == config.discord.bot_admin) {
                    const users_Service_ID = message.mentions.users.first().id;
                    const service_ID = '@' + users_Service_ID;
                    console.log('users serviceID mentioned: ' + service_ID);
                    const GetAllUserInfoPromise = GetAllUserInfo({ service: 'discord', service_id: service_ID });
                    GetAllUserInfoPromise.then(function(userInfo) {
                      console.log('userInfo: ' + JSON.stringify(userInfo));
                      if (userInfo[0].user_id == undefined) {
                        console.log('user not found: ' + userInfo[0].user_id);
                        return;
                      }
                      const users_ID = userInfo[0].user_id;
                      const OptOut = dbHelper.OptOut({ service: 'discord', user_id: users_ID });
                      OptOut.then(function(results) {
                        console.log('results: ' + JSON.stringify(results));
                        message.channel.stopTyping(true);
                        message.reply('\nUser now opted out.\n:wave: ');
                        return results;
                      });
                    });
                  }
                  // :::: TO-DO:::::
                  // - add write to withdrawls db
                  // :::::::::::::::
                  if (args[0] == 'transfer') {
                    // transfer the funds
                    if (!args[1]) {
                      message.author.send('Please enter an address to transfer to.\n`+optout transfer QRL_ADDRESS`');
                      message.channel.stopTyping(true);
                      return;
                    }
                    else {
                      // transfer tips to address given
                      const amount = (wallet_bal - config.wallet.tx_fee) * 1000000000;
                      const fee = config.wallet.tx_fee * 1000000000;
                      const address_to = args[1];
                      transfer({ address_to: address_to, amount: amount, fee: fee, address_from: wallet_pub })
                        .then(function(transferQrl) {
                          const transferOutput = JSON.stringify(transferQrl);
                          const OptOut = dbHelper.OptOut;
                          OptOut(user_id).then(function(dbWrite) {
                            message.author.send('QRL Transfered to the address given. Look for it in the [QRL Explorer](https://explorer.theqrl.org/a/' + transferQrl.tx + '\nYou are now opted out of the Tip Bot.');
                            message.channel.stopTyping(true);
                          });
                        });
                    }
                  }
                  // ::::  TO-DO ::::
                  // -create a donate db and write to it when this happens
                  // ::::::::::::::::
                  else if (args[0] == 'donate') {
                    // donate the funds to bot address
                    const amount = (wallet_bal - config.wallet.tx_fee) * 1000000000;
                    const fee = config.wallet.tx_fee * 1000000000;
                    const address_to = config.bot_details.bot_donationAddress;
                    // transfer to the bot donate address set in the config.bot_details.bot_donationAddress setting.
                    const transferInfo = { address_to: address_to, amount: amount, fee: fee, address_from: wallet_pub };
                    console.log('transferInfo: ' + JSON.stringify(transferInfo));
                    transfer(transferInfo)
                      .then(function(transferQrl) {
                        const transferOutput = JSON.stringify(transferQrl);
                        console.log('transferOutput: ' + transferOutput)
                        const OptOut = dbHelper.OptOut;
                        OptOut(user_id).then(function(dbWrite) {
                          message.author.send('QRLDonated to the TipBot! Thanks!\nYou are now opted out.');
                          message.channel.stopTyping(true);
                        });
                      });
                  }
                });
              }
              else {
                // user found, and no balance in account. Set opt_out and optput_date
                const OptOut = dbHelper.OptOut({ user_id: user_id });
                OptOut.then(function(results) {
                  // message user of status
                  message.reply('\nYou\'re now opted out.\n:wave: ');
                  message.channel.stopTyping(true);
                  return results;
                });
              }
            });
            return ('some value');
          }
        });
      }
    });
    message.channel.stopTyping(true);
  },
};