module.exports = {
  name: 'tip2',
  description: 'Tips!',
  args: true,
  guildOnly: false,
  cooldown: 10,
  aliases: ['!$'],
  usage: '\n<tip amount> <user1> <user2> <user3> <etc.> \nEXAMPLE: `+tip2 1 @CoolUser`',
  execute(message, args) {
    message.channel.startTyping();
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');

    const username = `${message.author}`;
    const userID = username.slice(1, -1);

    function ReplyMessage(content) {
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
    }

    function deleteMessage() {
      // Delete the previous message
      if(message.guild != null) {
        message.channel.stopTyping(true);
        message.delete();
      }
    }

    function toShor(number) {
      const shor = 1000000000;
      return number * shor;
    }

    function isQRLValue(str) {
      // recieve amnount in shor, do accordingly
      // Fail immediately.
      let test = false;
      // Check if it's only numeric and periods (no spaces, etc)
      if(/^[0-9]{0,8}[.]?[0-9]{0,9}$/.test(str)) {
        // And check for a value between 0.000000001 and 105000000
        const min = 0.000000001;
        const max = 105000000;
        if(str >= toShor(min) && str <= toShor(max)) {
          test = true;
        }
      }
      return test;
    }

    // Get user info.
    function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }


    function tipAmount() {
      for (const arg of args) {
        // Log the type of arg
        // console.log(typeof (arg));
        const checkValue = isQRLValue(arg);
        // console.log('isQRLValue/CheckValue: ' + checkValue);
        if(checkValue) {
          const amount = arg;
          // console.log('tipAmount given: ' + arg);
          return amount;
        }
      }
    }

    async function tipbotInfo(ID) {
      // FIX ME HERE!!!
      const userInfo = await getUserInfo({ service: 'discord', service_id: ID });
      console.log(userInfo);
      return userInfo;
    }
    // sanity checks
    async function checks(amount) {
      /*
      checking for--
        - Calling @here/groups like @developers- this is not enabled yet
        - Check if mentioned any users, fail if not
        - Is tip valid amount?, must be above fee and more than 0...
        - Did you tip yourself?
        */
      const userInfo = await tipbotInfo(userID);
      // check if user has enough funds in their account and if it exists
      console.log('checks - userInfo: ' + JSON.stringify(userInfo));


      // check if mentioned group and fail if so
      if (args.includes('@here') || args.includes('@everyone') || args.includes('@developer') || args.includes('@founder')) {
        console.log('Can\'t send to a group');
        ReplyMessage('Can\'t send to a group. Please send to individual user(s), up to 100 in a tip.');
        return;
      }

      // check if user mentioned another user to tip
      if (!message.mentions.users.size) {
        console.log('No Users mentioned.');
        ReplyMessage('No Users mentioned. `+help tip` for help');
        return ;
      }

      // check if amount is NaN
      if (isNaN(amount)) {
        console.log('isNaN');
        console.log('enter a valid amount to tip');
        ReplyMessage('Please enter a valid amount to tip! +tip {AMOUNT} @USER(\'s)');
        return ;
      }
      const fee = toShor(config.wallet.tx_fee);
      // Check that tip amount is above fee
      console.log('fee: ' + fee + '\namount: ' + amount);
      if (amount < fee) {
        message.channel.stopTyping(true);
        console.log('tipAmount < tx_fee - fee:\nFee: ' + fee + ' - Tip: ' + amount);
        ReplyMessage('Please enter a valid amount to tip! Must be more than the fee `{' + config.wallet.tx_fee + '}` +tip {AMOUNT} @USER(\'s)');
        return ;
      }

      // Check that value is within the QRL limits
      const test = isQRLValue(amount);
      if (!test) {
        message.channel.stopTyping(true);
        console.log('Invalid amount given.');
        ReplyMessage('Invalid amount. Please try again.');
        return;
      }
      // Check if mentions user
      console.log('message.mentions.users:' + JSON.stringify(message.mentions.users));

      console.log('users:' + message.mentions.users.includes(message.author));




      if (message.mentions.users.first() == message.author) {
        console.log('can\'t tip yourself, message.mentions.users.first() == message.author');
        ReplyMessage('You can\'t tip yourself');
        message.channel.stopTyping(true);
        return;
      }


    }
    // set tip amount here. Pulls the args and checks untill it finds a good tip amount
    // also converts to shor here...
    const givenTip = toShor(tipAmount());
    console.log('tip contents ' + givenTip);

    // log the entire map of users into console
    // console.log('message.mentions.users:');
    // console.dir(message.mentions.users);

    // console.log('args' + args);
    // check through requirements and fail if not met.
    checks(givenTip);

    // All checks passed
    console.log('tipAmount: ' + givenTip);
    // We have users mentioned, get the tipList with out bots
    const tipList = message.mentions.users.map(user => {
      const userName = user.username;
      const output = '@' + JSON.parse(JSON.stringify(userName));
      const service_user_ID = user.id;
      const userid = '<@!' + user.id + '>';
      const bot = user.bot;
      const discriminator = user.discriminator;
      const lastMessageID = user.lastMessageID;
      const lastMessageChannelID = user.lastMessageChannelID;
      const avatar = user.avatar;
      const verified = user.verified;
      const mfaEnabled = user.mfaEnabled;
      // check if mentioned user is a bot
      if (bot) {
        // don't do anything for the bot.. silly bot
        // console.log('bot mentioned, doing nothing');
        return;
      }
      // check for user in the tipbot database and grab addresses etc. for them.
      // Not a bot, return details
      const details = { userName: output, service_user_ID: service_user_ID, userid: userid, bot: bot, discriminator: discriminator, avatar: avatar, lastMessageID: lastMessageID, lastMessageChannelID: lastMessageChannelID, verified: verified, mfaEnabled: mfaEnabled };
      return details;
    });
      
//    const userInfo = tipbotInfo('@' + service_user_ID);

    // remove any null or empty array contents
    const filteredTipList = tipList.filter(function(el) {
      return el != null;
    });
    console.log('filteredTipList: \n' + JSON.stringify(filteredTipList));

    // get the bots into array
    const botList = message.mentions.users.map(user => {
      const userName = user.username;
      const output = '@' + JSON.parse(JSON.stringify(userName));
      const userid = '<@!' + user.id + '>';
      const bot = user.bot;
      if (!bot) {
        // don't do anything for the bot.. silly bot
        // console.log('bot not mentioned, doing nothing');
        return;
      }
      const botListOutput = JSON.parse(JSON.stringify({ userName: output, userid: userid, bot: bot }));
      return botListOutput;
    });
    const filteredBotList = botList.filter(function(el) {
      return el != null;
    });
    console.log('filteredBotList: \n' + JSON.stringify(filteredBotList));


    const botListJSON = JSON.parse(JSON.stringify(filteredBotList));
    const tipListJSON = JSON.parse(JSON.stringify(filteredTipList));

    function Count(list) {
      // console.log('tipList: ' + JSON.stringify(tipList));
      const arrayCount = list.length;
      return arrayCount;
    }

    const tipUserCount = Count(tipListJSON);
    const botUserCount = Count(botListJSON);

    console.log('final tipUserCount: ' + tipUserCount);
    console.log('final botUserCount: ' + botUserCount);
    // console.log('final tipListJSON: ' + JSON.stringify(tipListJSON));
  },
};