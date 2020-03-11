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
    const faucetHelper = require('../../faucet/faucetDB_Helper');
    const config = require('../../../_config/config.json');
    const uuid = `${message.author}`;
    const service_id = uuid.slice(1, -1);
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const checkFaucetPayouts = faucetHelper.checkPayments;
    const userInfoArray = [];
    const faucetInfoArray = [];
    // const checkAgree = dbHelper.CheckAgree;
    // const info = JSON.parse(JSON.stringify({ service: 'discord', service_id: UUID }));
    // const found = GetAllUserInfo(info);

    async function checkUser(user) {
      return new Promise(resolve => {
        const check_info = { service: 'discord', service_id: user };
        const checkPromise = GetAllUserInfo(check_info);
        // fail from the start
        let checkUserPassed = false;
        checkPromise.then(function(results) {
          // console.log(JSON.stringify('results: ' + results));
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
                userInfoArray.push({ checkUserPassed: true });
                // return userInfoArray;
             }
             else {
              // not agreed to terms
               console.log('need to agree to terms');
               userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_agreed' });
               message.reply('You will need to agree to my `+terms` to use the bot. `+agree`');
               return;
             }
           }
           else{
             // user has opted out
             console.log('User Opted out');
             userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'opted_out' });
             message.reply('I see you have opted out. Please `+opt-in` to recieve faucet funds');
             return;
           }
          }
          else{
            // user not found
            console.log('user is not found');
            userInfoArray.push({ checkUserPassed: false, checkUserPassedError: 'not_found' });
            message.reply('User is not found, are you signed up?');
            return;
          }
          resolve(userInfoArray);
          return;
        });
      });
    }

    async function checkFaucet(user_id) {
      return new Promise(resolve => {
        const check_info = { service: 'discord', service_id: user_id };
        const checkFaucetPromise = checkFaucetPayouts(check_info);
        // fail from the start
        let checkUserPassed = false;
        checkFaucetPromise.then(function(results) {
          console.log('checkFaucetPromise results ' + JSON.stringify(results));
          faucetInfoArray.push(results);
          resolve(faucetInfoArray);
        });
      });
    }

    // async function usercheck() {
    // const UserChecks = checkUser(service_id);
    // await UserChecks;
    // console.log('async function userchecks: ' + UserChecks)
    // return UserChecks;
    // }

    checkUser(service_id).then(function(checkresults) {
      // console.log('UserChecks ' + JSON.stringify(checkresults));
      console.log('userInfoArray ' + JSON.stringify(userInfoArray));
      if (!userInfoArray[1].checkUserPassed) {
        const userCheckError = userInfoArray[1].checkUserPassedError;
        console.log('the user check failed with error:' + userCheckError);
        switch (userCheckError) {
          case 'not_found':
          console.log('user is not found, error given.' + userCheckError);
          message.reply('Sorry, looks like there is an error. error is `User ' + userCheckError + '`');
          break;
        case 'opted_out':
          console.log('user is opt_out, error given.' + userCheckError);
          message.reply('Sorry, looks like there is an error. error is `User ' + userCheckError + '`');
          break;
        case 'not_agreed':
          console.log('user is not agreed to terma, error given.' + userCheckError);
          message.reply('Sorry, looks like there is an error. error is `User ' + userCheckError + '`');
          break;
        default:
          console.log('Default called in error block. SOmething is wrong');
        }
      }
      checkFaucet(service_id).then(function(faucetCheck) {
        console.log('faucetCheck results' + JSON.stringify(faucetCheck));
        if (faucetCheck[0][1].drip_found == true) {
          console.log('user has been found recently, no drips');
          message.reply('You have received a tip recently :no_entry_sign: \nPlease come back in  ***' + config.faucet.payout_interval + '*** hours from ***' + faucetCheck[0][0][0].time_stamp + '*** to request more funds.');
          return;
        }
        else if (faucetCheck[0][1].drip_found == false) {
          // no drip found. Do things here.
          console.log('no drips found. Adding to db and sending a drip')
        }
      });
    });

    // usercheck().then(function(res) {
      // console.log('UserChecks ' + JSON.stringify(res));
      // console.log('userInfoArray ' + JSON.stringify(userInfoArray));
    // });
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