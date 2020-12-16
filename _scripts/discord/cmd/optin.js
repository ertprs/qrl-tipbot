module.exports = {
  name: 'opt-in',
  description: 'Opt Into the QRL TipBot',
  args: false,
  guildOnly: false,
  aliases: ['oi'],
  cooldown: 0,
  usage: '\n## **opt-in**  __**oi**__ - Opt in to the tipbot.  ',
  execute(message) {
    // use to send a reply to user with delay and stop typing
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const uuid = `${message.author}`;
    // const UUID = uuid.slice(1, -1);
    const userID = uuid.slice(1, -1);

    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
    }

    // errorMessage({ error: 'Can\'t access faucet from DM!', description: 'Please try again from the main chat, this function will only work there.' });
    function errorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      message.channel.startTyping();
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x000000)
          .setTitle(':warning:  ERROR: ' + content.error)
          .setDescription(content.description)
          .setFooter(footer);
        message.reply({ embed });
        message.channel.stopTyping(true);
      }, 1000);
    }

    // Get user info.
    async function getUserInfo(userInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(userInfo);
        resolve(data);
      });
    }

    async function clearFuture(user_id) {
      return new Promise(resolve => {
        const futureClear = { user_id: user_id };
        const clearFutureTipsDB = dbHelper.clearFutureTips(futureClear);
        resolve(clearFutureTipsDB);
      });
    }

    async function optIn(user_id) {
      return new Promise(resolve => {
        const optinInfo = { user_id: user_id };
        const optBackIn = dbHelper.OptIn(optinInfo);
        resolve(optBackIn);
      });
    }

    async function sendFutureTips(tipInfo) {
      return new Promise(resolve => {
        console.log('tipInfo: ' + JSON.stringify(tipInfo));
        // const future_tip = { amount: tipInfo.future_tip_amount, fee: tipInfo.fee, address_from: config.wallet.hold_address, address_to: tipInfo.ToAddress };
        const send_future_tip = wallet.sendQuanta(tipInfo);
        resolve(send_future_tip);
      });
    }

    async function checkFutureTips() {
      return new Promise(resolve => {
        const data = { service_id: userID };
        const checkFuture = wallet.sendQuanta(data);
        resolve(checkFuture);
      });
    }

    async function main() {
      let found = false;
      let agree = false;
      let optout = false;
      let future_tip_amount = 0;
      const fee = config.wallet.tx_fee * 1000000000;

      const user_info = await getUserInfo({ service: 'discord', service_id: userID });
      console.log('user_info: ' + JSON.stringify(user_info));
      console.log('user_id: ' + user_info[0].user_id);

      if (user_info[0].user_found) {
        found = true;
      }
      else {
        console.log('user not found');
        errorMessage({ error: 'User Not Found', description: 'You need to sign up `+add`' });
        return;
      }

      const tippingUserUser_agree = JSON.stringify(user_info[0].user_agree);
      const tippingUserOpt_Out = JSON.stringify(user_info[0].opt_out);
      if (user_info[0].user_agree) {
        user_agree = true;
      }
      else {
        console.log('user not agreed');
        errorMessage({ error: 'User Has Not Agreed', description: 'You need to agree to my terms `+agree` or `+terms`' });
        return;
      }
      if (user_info[0].opt_out) {
        opt_out = true;
      }
      else {
        console.log('user not opted out');
        errorMessage({ error: 'User Still Opted In...', description: 'You have not opted out, `+help` for a list of my functions.' });
        return;
      }


        // user passed checks, opt them back in and check for future tips
        console.log('checks passed');
        const user_id = user_info[0].user_id;
        console.log('user_id: ' + user_id);
        const oi = await optIn(user_id);
        const checkFuture = await checkFutureTips();

        future_tip_amount = checkFuture[0].future_tip_amount;
        console.log('future_tip_amount: ' + future_tip_amount);
        if (future_tip_amount > 0) {
          const address_array = [user_info[0].wallet_pub];
          // send the user their saved tips
          const sendTips = await sendFutureTips({ amount: future_tip_amount, fee: fee, address_to: address_array, address_from: config.wallet.hold_address });

          // clear the saved tips in future_tips db, set to paid for user.
          const wipeSaved = await clearFuture(user_info[0].user_id);
          console.log('future tips sent and cleared!');
        }
    }

    main().then(function(response, err) {
      if (err) {
        console.log('main error: ', err);
        return;
      }
      ReplyMessage('You\'ve opted back in! :thumbsup:');


    });

    /*


    const checkuser = dbHelper.CheckUser;
    const checkFutureTips = dbHelper.checkFutureTips;
    const GetAllUserInfo = dbHelper.GetAllUserInfo;

    const info = JSON.parse(JSON.stringify({ service: 'discord', user_id: UUID }));
    const found = checkuser(info);


    if(message.guild != null) {
      message.delete();
    }

    found.then(function(result) {
      return result;
    }).then(function(foundRes) {
      // console.log('foundRes: ' + JSON.stringify(foundRes));
      const user_found = foundRes.user_found;
      if (user_found !== 'true') {
        // if the user is not found...
        errorMessage({ error: 'User Not Found', description: 'You need to sign up `+add`' });
        return;
      }
      else {
        // user found, check opt-out and act
        const user_id = foundRes.user_id;
        const check_opt_out = dbHelper.CheckUserOptOut;
        check_opt_out({ service: 'discord', user_id: user_id }).then(function(result) {
          return result;
        }).then(function(oiargs) {
          if (oiargs.opt_out == 'true') {
            // opted out, opt them back in
            const opt_in = dbHelper.OptIn;
            opt_in({ user_id: user_id }).then(function(args) {
              return args;
            });

            getUserInfo(userID).then(function(tipingUserInfo) {
              const tippingUserWallet_Pub = JSON.stringify(tipingUserInfo[0].wallet_pub);
              const tippingUserWalPub = tipingUserInfo[0].wallet_pub;
              const tippingUserUser_Id = JSON.stringify(tipingUserInfo[0].user_id);
              checkFutureTips({ service_id: tippingUserUser_Id });
            });
            setTimeout(function() {
              ReplyMessage('You\'ve opted back in! :thumbsup:');
            }, 1000);
          }
          else {
            // user is found and not opted out, do nothing and return to user.
            setTimeout(function() {
              errorMessage({ error: 'User Still Opted In...', description: 'You have not opted out, `+help` for a list of my functions.' });
            }, 1000);
          }
        });
      }
    });
    */
  },
};