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

  // Get user info if found.
  function getUserInfo(args) {
      return new Promise(resolve => {
      const data = dbHelper.GetAllUserInfo(args);
      resolve(data);
    });
  }


   // function to check all required
    async function checks(tipAmount) {
      // Check for
      /*
      - Calling @here/groups- this is not enabled yet
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
      if (isNaN(tipAmount)) {
        ReplyMessage('Please enter a valid amount to tip! +tip {AMOUNT} @USER(\'s)');
        return ;
      }
      // Check that tip amount is above 0
      if (tipAmount < 0) {
        message.channel.stopTyping(true);
        ReplyMessage('Please enter a valid amount to tip! +tip {AMOUNT} @USER(\'s)');
        return ;
      }

      // Check that value is within the QRL limits
      const test = isQRLValue(tipAmount);
      if (!test) {
        message.channel.stopTyping(true);
        ReplyMessage('Invalid amount. Please try again.');
        return;
      }
      // Check if mentions user
      if (message.mentions.users.first() == message.author) {
        ReplyMessage('You can\'t tip yourself');
        message.channel.stopTyping(true);
        return;
      }
      const userInfo = await getUserInfo({ service: 'discord', service_id: userID });
      console.log(userInfo);

    }
    const tipAmount = args[0];
    checks(tipAmount);

    console.log('');
  },
};