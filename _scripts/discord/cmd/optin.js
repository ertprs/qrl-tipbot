module.exports = {
  name: 'opt-in',
  description: 'Opt Into the QRL TipBot',
  args: false,
  guildOnly: false,
  aliases: ['oi'],
  cooldown: 0,
  usage: '\n## **opt-in**  __**oi**__ - Opt in to the tipbot.  ',
  execute(message) {
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    // get the user_found status
    // should return either { user_found: true, user_id: id } || { user_found: false }
    const checkuser = dbHelper.CheckUser;
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const info = JSON.parse(JSON.stringify({ service: 'discord', user_id: UUID }));
    const found = checkuser(info);
    found.then(function(result) {
      return result;
    }).then(function(foundRes) {
      // console.log('foundRes: ' + JSON.stringify(foundRes));
      const user_found = foundRes.user_found;
      if (user_found !== 'true') {
        // if the user is not found...
        message.channel.startTyping();
        setTimeout(function() {
          message.reply('\nYou\'re now opted out. If you change your mind, `+opt-in`\n:wave: ');
          message.channel.stopTyping(true);
        }, 1000);
        return foundRes;
      }
      else {
        console.log('MessageAuthorID: ' + UUID + ' config admin: ' + config.discord.bot_admin);
        // only allow the discord admin defined in teh config execute this
        if (message.mentions.users.size > 0 && UUID == config.discord.bot_admin) {
          const users_Service_ID = message.mentions.users.first().id;
          const service_ID = '@' + users_Service_ID;
          const GetAllUserInfoPromise = GetAllUserInfo({ service: 'discord', service_id: service_ID });
          GetAllUserInfoPromise.then(function(userInfo) {
            console.log('user_info: ' + JSON.stringify(userInfo));
            if (userInfo[0].user_found == 'false') {
              console.log('user not found');
              message.author.send('not found.');
              return;
            }
            if (userInfo[0].opt_out == 'true') {
              console.log('User already opted out' + userInfo);
              message.channel.stopTyping(true);
              message.author.send('opted out already?');
              return;
            }
            const users_ID = userInfo[0].user_id;
            const OptIn = dbHelper.OptIn({ service: 'discord', user_id: users_ID });
            OptIn.then(function(results) {
              message.author.send('User now opted in.');
              message.channel.stopTyping(true);
              return results;
            });
          });
        }
        
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
            message.channel.startTyping();
            setTimeout(function() {
              message.reply('You Opted back in! :thumbsup:');
              message.channel.stopTyping(true);
            }, 1000);
          }
          else {
            // user is found and not opted out, do nothing and return to user.
            message.channel.startTyping();
            setTimeout(function() {
              message.reply(':thumbsup: Still Opted In.\n`+help` for a list of my commands.');
              message.channel.stopTyping(true);
            }, 1000);
          }
        });
      }
    });
  },
};