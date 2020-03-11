module.exports = {
  name: 'drip',
  description: 'Collect some free qrl from the faucet, if there is any to have. Once a day at most please.',
  args: false,
  aliases: ['faucet', 'freeqrl', 'free'],
  guildOnly: false,
  usage: ' \n##',
  // cooldown: 86399,

  execute(message, args) {
    
    const dbHelper = require('../../db/dbHelper');
    // const faucetHelper = require('../../db/dbHelper');
    const uuid = `${message.author}`;
    const service_id = uuid.slice(1, -1);
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const userInfoArray = [];

    // const checkAgree = dbHelper.CheckAgree;
    // const info = JSON.parse(JSON.stringify({ service: 'discord', service_id: UUID }));
    // const found = GetAllUserInfo(info);

    async function checkUser(user) {
      const check_info = { service: 'discord', service_id: user };
      const checkPromise = GetAllUserInfo(check_info);
      // fail from the start
      let checkUserPassed = false;
      await checkPromise.then(function(results) {
      	console.log(JSON.stringify(results));
        userInfoArray.push(results);
        const user_found = results.user_found;
        const opt_out = results[0].opt_out;
        const agree = results[0].agree;

        // check if user found
        if (user_found) {
          console.log('user found: ' + user_found);
          // check if opt out
          if (!opt_out) {
            console.log('user is not opted out:  ' + opt_out);
            // check if agreed
             if (agree) {
              console.log('user has agreed ' + agree);
            // set checkUserPassed to true and return
              let checkUserPassed = true;
              userInfoArray.push({ CheckUserPassed: true });
              return userInfoArray;
           }
           else {
            // not agreed to terms
             console.log('need to agree to terms');
             message.reply('You will need to agree to my `+terms` to use the bot. `+agree`')
           }
         }
         else{
           // user has opted out
           console.log('User Opted out');
           message.reply('I see you have opted out. Please `+opt-in` to recieve faucet funds');
         }
        }
        else{
          // user not found
          console.log('user is not found');
          message.reply('User is not found, are you signed up?');
        }
        return userInfoArray;
      });
      return userInfoArray;
    }
    
    const UserChecks = checkUser(service_id);
    UserChecks;

    console.log('UserChecks ' + JSON.stringify(UserChecks));
/*

    if(message.guild != null) {
      message.delete();
    }
    // check for the message author. If not found fail
    found.then(function(foundRes) {
      const user_found = foundRes.user_found;
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
        const user_id = foundRes[0].user_id;


// used to test the function, remove before going live
        if (message.mentions.users.size > 0) {
          const users_Service_ID = message.mentions.users.first().id;
          const service_ID = '@' + users_Service_ID;
          const GetAllUserInfoPromise = GetAllUserInfo({ service: 'discord', service_id: service_ID });

          GetAllUserInfoPromise.then(function(userInfo) {
            const users_ID = userInfo[0].user_id;
            const agree = dbHelper.userAgree({ service: 'discord', user_id: users_ID });
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

*/

  },
};