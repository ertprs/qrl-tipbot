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

    // successReplyMessage({ title: 'You\ve Agreed!!', description: , term_1: , term_2: , term_3: , term_4: , footer: 'You can now use the Bot!' });
    function successReplyMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x008A11)
          .setTitle(':white_check_mark: ' + content.title)
          .setDescription(content.description)
          .addField(content.term_1)
          .addField(content.term_2)
          .addField(content.term_3)
          .addField(content.term_4)
          .setFooter(content.footer || footer);
        message.reply({ embed });
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
          .setFooter(content.footer || footer);
        message.reply({ embed });
        message.channel.stopTyping(true);
      }, 1000);
    }

    // Get user info. Function expects { service: service, service_id: service_id } as usrInfo
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        // console.log('getUserInfo(usrInfo) ' + JSON.stringify(usrInfo));
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }

    // add user to agree db. Function expects { service: , user_id: } as usrAgree
    async function agreeDBWrite(botUserId) {
      return new Promise(resolve => {
      //  console.log('agreeDBWrite(usrAgree) ' + JSON.stringify(botUserId));

        const addToAgreeDBinfo = { service: 'discord', user_id: botUserId };
        //  console.log('tipDBWrite addToTipsDBinfo: ' + JSON.stringify(addToTipsDBinfo));
        const addToAgreeDBinfoWrite = dbHelper.agree(addToAgreeDBinfo);
        resolve(addToAgreeDBinfoWrite);
      });
    }

    // check if user exists
    async function main() {
      const userInfo = await getUserInfo({ service: 'discord', service_id: userID });
      // console.log('userInfo: ' + JSON.stringify(userInfo));
      return userInfo;
    }
    // Add agree flag to users_agree database
    async function userAgreeAdd(info) {
      const agreeAdd = await agreeDBWrite(info);
      return agreeAdd;
    }

    // check for user then if found check for already agreed, if not then set
    main().then(function(infoReturned) {
      const userFound = infoReturned[0].user_found;
      if (userFound) {
        // console.log('UserFound!');
        const userAgreeStatus = infoReturned[0].user_agree;
        if (userAgreeStatus == 'true') {
          // console.log('User already agreed');
          errorMessage({ error: 'You\'ve already agreed!', description: 'No need to agree again.', footer: 'Enter +help for bot instructions' });
        }
        else {
          // console.log('Not yet agreed, add to DB and reply');
          const botUserId = infoReturned[0].user_id;
          userAgreeAdd(botUserId).then(function() {
            // console.log('agreeReturn: ' + JSON.stringify(agreeReturn));
            ReplyMessage('You\'ve agreed! You can now use the tipbot :white_check_mark:');
            successReplyMessage({ title: 'You\ve Agreed!!', description: 'terms agreed to below:', term_1: 'Use at your own risk', term_1_description: 'You will not hold the tipbot accountable', term_2: 'You won\'t misuse the bot', term_2_description: 'be nice to the bot and others', term_3: 'You agree to share account information with the tipbot', term_3_description: '(usernames, tx details, wallet address)', term_4: 'You will not store large amounts on the tipbot.', term_4_description: 'Transfer all excess funds to an external wallet', footer: 'Thanks, You can now use the Bot!' });
          });
        }
      }
      else {
        // console.log('userNotFound');
        errorMessage({ error: 'No Account Found!', description: 'You must signup to use the tipbot. enter `+help` for bot instructions' });
      }
    });

  },
};