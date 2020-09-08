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

    function isQRLValue(str) {
      // Fail immediately.
      let test = false;
      // Check if it's only numeric and periods (no spaces, etc)
      if(/^[0-9]{0,8}[.]?[0-9]{0,9}$/.test(str)) {
        // And check for a value between 0.000000001 and 105000000
        if(str >= 0.000000001 && str <= 105000000) {
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

  function toShor(number) {
    const shor = 1000000000;
    return number * shor;
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

      // check if mentioned group and fail if so
      if (args.includes('@here') || args.includes('@everyone') || args.includes('@developer') || args.includes('@founder')) {
        // console.log(chalk.red('cant send tip to these users. Call them by name'));
        ReplyMessage('Can\'t send to a group. Please send to individual user(s).');
        return;
      }

      // check if user mentioned another user to tip
      if (!message.mentions.users.size) {
        ReplyMessage('No Users mentioned. `+help tip` for help');
        return ;
      }

      // check if amount is NaN
      if (isNaN(amount)) {
        console.log('isNaN');
        ReplyMessage('Please enter a valid amount to tip! +tip {AMOUNT} @USER(\'s)');
        return ;
      }
      const fee = toShor(config.wallet.tx_fee);
      // Check that tip amount is above fee
      if (amount > fee) {
        message.channel.stopTyping(true);
        console.log('tipAmount < config.wallet.tx_fee - fee: ' + fee);
        ReplyMessage('Please enter a valid amount to tip! Must be more than the fee `{' + config.wallet.tx_fee + '}` +tip {AMOUNT} @USER(\'s)');
        return ;
      }

      // Check that value is within the QRL limits
      const test = isQRLValue(amount);
      if (!test) {
        message.channel.stopTyping(true);
        console.log('isQRLValue');
        ReplyMessage('Invalid amount. Please try again.');
        return;
      }
      // Check if mentions user
      if (message.mentions.users.first() == message.author) {
        ReplyMessage('You can\'t tip yourself');
        console.log('message.mentions.users.first() == message.author');
        message.channel.stopTyping(true);
        return;
      }
      const userInfo = await getUserInfo({ service: 'discord', service_id: userID });
      console.log(userInfo[0].wallet_pub);
      // check balance and if less than tipAmount fail
    }

    function tipAmount() {
      for (const arg of args) {
        console.log(typeof (arg));
        const checkValue = isQRLValue(arg);
        console.log('isQRLValue/CheckValue: ' + checkValue);
        if(checkValue) {
          const amount = arg;
          console.log('tipAmount given: ' + arg);
        return [amount, checkValue];
        }
      }
    }

    // set tip amount here
    let tip = tipAmount();
    console.log('tip contents ' + tip)
    // log the entire map of users into console
    console.dir(message.mentions.users);

    // console.log('args' + args);

    checks(tip);

    tip = toShor(tip);
    console.log('tipAmount: ' + tip);


    // We have users mentioned, get the tipList into map
    const tipList = message.mentions.users.map(user => {
      const userName = user.username;
      // const output = JSON.parse(JSON.stringify(userName));
      // return `@${output}`;
      const output = '@' + JSON.parse(JSON.stringify(userName));
      const service_user_ID = user.id;
      const userid = '<@!' + user.id + '>';
      const bot = user.bot;
      const discriminator = user.discriminator;
      const lastMessageID = user.lastMessageID;
      const lastMessageChannelID = user.lastMessageChannelID;
      const avatar = user.avatar;

      const details = { userName: output, service_user_ID: service_user_ID, userid: userid, bot: bot, discriminator: discriminator, avatar: avatar, lastMessageID: lastMessageID, lastMessageChannelID: lastMessageChannelID };
      return details;
    });
    console.log('tipList: \n' + JSON.stringify(tipList));

    const userList = message.mentions.users.map(user => {
      const service_user_ID = user.id;
      const userid = '<@!' + user.id + '>';
      if ((userid === config.discord.bot_id) && (!args.includes(config.discord.bot_id))) {
        // console.log(chalk.red('bot mentioned, don\'t count it, again'));
      }
      else {
        const output = JSON.parse(JSON.stringify(service_user_ID));
        return `<@${output}>`;
      }
    });
    // get the tip-to userID into map
    const UserIDList = message.mentions.users.map(user => {
      const user_ID = '@' + user.id;
      const userName = user.username;
      const output = JSON.parse(JSON.stringify({ Service_ID: user_ID, service_user_name: userName }));
      return output;
    });
    const tipListJSON = JSON.parse(JSON.stringify(tipList));

    function TipUserCount() {
      // console.log('tipList: ' + JSON.stringify(tipList));

      if (tipList.includes('@' + config.bot_details.bot_name)) {
        const tipUserCount = (tipListJSON.length - 1);
        console.log('tipUserCount: ' + tipUserCount);
        return tipUserCount;
      }
      else {
        const tipUserCount = tipListJSON.length;
        console.log('else tipUserCount: ' + tipUserCount);
        return tipUserCount;
      }
    }
    const tipUserCount = TipUserCount();

    console.log('final tipUserCount: ' + tipUserCount);
    console.log('final tipListJSON: ' + JSON.stringify(tipListJSON));
  },
};