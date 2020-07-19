module.exports = {
  name: 'agree',
  description: 'Agree to the terms of the bot',
  args: false,
  guildOnly: false,
  cooldown: 0,
  usage: '\n## **agree** - Agree to the terms and conditions of the tipbot.  ',
  // execute(message, args) {
  execute(message) {
    const dbHelper = require('../../db/dbHelper');
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const info = JSON.parse(JSON.stringify({ service: 'discord', service_id: UUID }));
    const found = GetAllUserInfo(info);

    if(message.guild != null) {
      message.delete();
    }
    // check for the message author. If not found fail
    found.then(function(foundRes) {
      // console.log('foundRes ' + JSON.stringify(foundRes));
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
        // user found, check for agree
        // set the user ID
        const user_id = foundRes[0].user_id;
        // console.log('user_id: ' + user_id);
      // user found, check for already set agree
        const check_info = { service: 'discord', user_id: user_id };
        // console.log('check_info: ' + JSON.stringify(check_info));
        if (foundRes[0].user_agree == false) {
          // user has not agreed...
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
      }
    });
  },
};