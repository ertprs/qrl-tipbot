module.exports = {
  name: 'opt-out',
  description: 'Opt Out of the TipBot',
  args: false,
  guildOnly: false,
  aliases: ['oo'],
  cooldown: 0,
  usage: '\n## opt-out | | oo - Opt out of the QRL TipBot.',

  // execute(message, args) {
  execute(message) {
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const bcrypt = require('bcryptjs');
    const salt = bcrypt.genSaltSync(25);
    const MessageAuthorID = message.author.id;
    const MessageAuthorUsername = message.author.username;
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    // get the user_found status
    // should return either { user_found: true, user_id: id } || { user_found: false }
    const checkuser = dbHelper.CheckUser;
    // ToDo - Move to the GetAllUserInfo for clarity and simplicity
    // const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const info = JSON.parse(JSON.stringify({ service: 'discord', user_id: UUID }));
    const found = checkuser(info);
    found.then(function(result) {
      return result;
    }).then(function(foundRes) {
      const user_found = foundRes.user_found;
      if (user_found !== 'true') {
        // no user found
        message.channel.startTyping();
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
      // user found!
      else if (user_found == 'true') {
        message.channel.startTyping();
        // User is found, check if already opted out
        const user_id = foundRes.user_id;
        // get the users opt_out status
        const check_opt_out = dbHelper.CheckUserOptOut;
        check_opt_out({ service: 'discord', user_id: user_id }).then(function(result) {

          // improve this mess here please! TODO
          return result;
        }).then(function(ooargs) {
          if (ooargs.opt_out == 'true') {
            // error, already opted out...
            message.reply(':thumbsup: Already opted out.\nIf you\'ve changed your mind `+opt-in`');
            message.channel.stopTyping(true);
          }
          else {
            message.channel.startTyping();
            // check  users balance
            const walletBal = dbHelper.GetUserWalletBal;
            walletBal({ user_id: user_id }).then(function(result) {
              const wallet_bal = result.wallet_bal;
              if (wallet_bal > 0) {
                  const wallet_bal_quanta = wallet_bal / 1000000000;
                  message.author.send('You have a balance of `' + wallet_bal_quanta + ' qrl` in your tip wallet. Please `+withdraw` the funds before you opt-out. If you wish to donate your funds to the bot `+withdraw all' + config.bot_details.bot_donationAddress + '`');
                  message.channel.stopTyping(true);
                  return;
              }
              else {
                // user found, and no balance in account. Set opt_out and optput_date
                const OptOut = dbHelper.OptOut({ user_id: user_id });
                OptOut.then(function(results) {
                  // message user of status
                  message.channel.stopTyping(true);
                  message.reply('\nYou\'re now opted out.\n:wave: ');
                  return results;
                });
              }
            });
          }
        });
      }
    });
  },
};