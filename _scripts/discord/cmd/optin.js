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
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    const userID = username.slice(1, -1);
    // get the user_found status
    // should return either { user_found: true, user_id: id } || { user_found: false }
    const checkuser = dbHelper.CheckUser;
    const checkFutureTips = dbHelper.checkFutureTips;
    // ToDo clean up this script and use the GetAllUserInfo. KISS
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const info = JSON.parse(JSON.stringify({ service: 'discord', user_id: UUID }));
    const found = checkuser(info);

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
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }

    async function tipbotInfo(ID) {
      // FIX ME HERE!!!
      return new Promise(resolve => {
        const userInfo = getUserInfo({ service: 'discord', service_id: ID });
        resolve(userInfo);
      });
    }

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

            tipbotInfo(userID).then(function(tipingUserInfo) {
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
  },
};