module.exports = {
  name: 'agree',
  description: 'Agree to the terms of the bot',
  args: false,
  guildOnly: false,
  cooldown: 30,
  usage: '\n## **agree** - Agree to the terms and conditions of the tipbot.  ',
  // execute(message, args) {
  execute(message) {
    const dbHelper = require('../../db/dbHelper');
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const checkAgree = dbHelper.CheckAgree;
    const info = JSON.parse(JSON.stringify({ service: 'discord', service_id: UUID }));
    const found = GetAllUserInfo(info);
    const Discord = require('discord.js');
    const client = new Discord.Client();

    function checkUserAgree(user) {
      const check_info = { service: 'discord', user_id: user };
      const checkPromise = checkAgree(check_info);
      checkPromise.then(function(Agree) {
        return Agree;
      });
    }
    if(message.guild != null) {
      message.delete();
    }
    // check for the message author. If not found fail
    found.then(function(foundRes) {
      console.log('foundRes ' + JSON.stringify(foundRes));
      // check for user found
      const user_found = foundRes[0].user_found;
      if (user_found !== 'true') {
        // if the user is not found...
        message.channel.startTyping();
        setTimeout(function() {
          message.channel.stopTyping(true);
          message.reply('\nPlease sign up first, `+add`');
        }, 1000);
        return;
      }
      else {

        // set the user ID
        const user_id = foundRes[1].user_id;


// used to test the function, remove before going live
        if (message.mentions.users.size > 0 && !message.isMemberMentioned(client.user)) {
          const users_Service_ID = message.mentions.users.first().id;
          const service_ID = '@' + users_Service_ID;
          const GetAllUserInfoPromise = GetAllUserInfo({ service: 'discord', service_id: UUID });

          GetAllUserInfoPromise.then(function(userInfo) {
            console.log('\n\n\nuserInfo ' + JSON.stringify(userInfo) + '\n\n');

            const users_ID = userInfo[1].user_id;
            const agree = dbHelper.agree({ service: 'discord', user_id: users_ID });
            agree.then(function(results) {
            // message user of status
              message.channel.startTyping();
              setTimeout(function() {
                message.author.send('Thanks! you can start using the bot. ');
                message.channel.stopTyping(true);
              }, 500);
              return results;
            });
          });
        }
        else {
          // user found, check for alreeady set agree
          const check_info = { service: 'discord', user_id: user_id };
          const checkPromise = checkAgree(check_info);
          checkPromise.then(function(Agree) {
            console.log('Agree returns for us:' + JSON.stringify(Agree));
          // fail if not agreed
          if (Agree.agreed == 'false') {
            const agree = dbHelper.agree({ service: 'discord', user_id: user_id });
            agree.then(function(results) {
              // message user of status
              message.channel.startTyping();
              setTimeout(function() {
                message.author.send('Thanks for giving your consent to use this service!');
                message.channel.stopTyping(true);
              }, 500);
              return results;
            });
          }
          else {
            message.author.send('You have already agreed!');
            return;
          }
          return;
          });
        }
        return;
      }
    });
  },
};