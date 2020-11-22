module.exports = {
  name: 'agree',
  description: 'Agree to the terms of the bot',
  args: false,
  guildOnly: false,
  cooldown: 0,
  usage: '\n## **agree** - Agree to the terms and conditions of the tipbot.  ',
  // execute(message, args) {
  execute(message) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    // const config = require('../../../_config/config.json');
    const username = `${message.author}`;
    const userID = username.slice(1, -1);

    // start the bot typing
    message.channel.startTyping();

    // default reply message format
    // ReplyMessage('**You\'ve sent a `' + toQuanta(givenTip) + ' QRL` tip to ' + tippedUserIDs + ',' + futureTippedUserIDs + ' each**. Thanks for using the tipbot!\n*All tips are on-chain, and will take some time to process.*');
    function ReplyMessage(content) {
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
    }

    // default error message format
    // errorMessage({ error: 'No User(s) Mentioned...', description: 'Who are you tipping? enter `+help tip` for instructions' });
    function errorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x000000)
          .setTitle(':warning: ' + content.error)
          .setDescription(content.description)
          .setFooter(footer);
        message.reply({ embed });
        message.channel.stopTyping(true);
      }, 1000);
    }

    // Get user info. Function expects { service: service, service_id: service_id } as usrInfo
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        console.log('getUserInfo(usrInfo) ' + JSON.stringify(usrInfo));
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }

/*
    async function tipbotInfo(ID) {
      // FIX ME HERE!!!
      return new Promise(resolve => {
        const userInfo = getUserInfo({ service: 'discord', service_id: ID });
        resolve(userInfo);
      });
    }
*/

/*
    // add user to agree db. Function expects { service: , user_id: } as usrAgree
    async function agreeDBWrite(usrAgree) {
      return new Promise(resolve => {
        console.log('agreeDBWrite(usrInfo) ' + JSON.stringify(tipInfo));
        const addToTipsDBinfo = { from_user_id: tipInfo.from_user_id, tip_amount: toQuanta(tipInfo.tip_amount), from_service: 'discord', time_stamp: new Date() };
        //  console.log('tipDBWrite addToTipsDBinfo: ' + JSON.stringify(addToTipsDBinfo));
        const addToTipsDBinfoWrite = dbHelper.addTip(addToTipsDBinfo);
        resolve(addToTipsDBinfoWrite);
      });
    }

*/
    // check if user exists

    async function main() {
      const userInfo = await getUserInfo({ service: 'discord', service_id: userID });
      console.log('userInfo: ' + JSON.stringify(userInfo));
      return userInfo;
    }

    main().then(function(infoReturned) {
      const userFound = infoReturned[0].user_found;
      if (userFound) {
        console.log('UserFound!');
        const userAgreeStatus = infoReturned[0].user_agree;
        if (userAgreeStatus) {
          console.log('User already agreed');
          errorMessage({ error: 'You\'ve already agreed to the terms!', description: 'No need to agre agian. enter `+help` for bot instructions' });

        }
        else {
          console.log('Not yet agreed, add to DB and reply');
          ReplyMessage('**You have agreed to the bots terms, you can now use the tipbot**. Thanks for using the tipbot!*');
        }
      }
      else {
        console.log('userNotFound');
        errorMessage({ error: 'No Account Found!', description: 'You must signup to use the tipbot. enter `+help` for bot instructions' });

      }
    });

    // delete the message after user sends agree request if not in a DM
    if(message.guild != null) {
      message.delete();
    }















/*

    const dbHelper = require('../../db/dbHelper');
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const info = JSON.parse(JSON.stringify({ service: 'discord', service_id: UUID }));
    const found = GetAllUserInfo(info);

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
        if (foundRes[0].user_agree == 'false') {
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
    */
  },
};