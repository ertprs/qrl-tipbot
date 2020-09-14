module.exports = {
  name: 'tip2',
  description: 'Tips!',
  args: true,
  guildOnly: false,
  cooldown: 1,
  aliases: ['!$'],
  usage: '\n<tip amount> <user1> <user2> <user3> <etc.> \nEXAMPLE: `+tip2 1 @CoolUser`',
  execute(message, args) {
    message.channel.startTyping();
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    // const wallet = require('../../qrl/walletTools');
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
        const min = toShor(0.000000001);
        const max = toShor(105000000);

        if(str >= min && str <= max) {
          test = true;
        }
      }
      console.log('str' + str);
      console.log('isQRLValue: ' + test);
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
        const checkValue = isQRLValue(toShor(arg));
        // console.log('isQRLValue/CheckValue: ' + checkValue);
        if(checkValue) {
          return toShor(arg);
        }
      }
    }

    async function tipbotInfo(ID) {
      // FIX ME HERE!!!
      return new Promise(resolve => {
        const userInfo = getUserInfo({ service: 'discord', service_id: ID });
        console.log(userInfo);
        resolve(userInfo);
      });
    }


    async function checks() {
      console.log('checks');
      /*
      checking for--
        - Calling @here/groups like @developers- this is not enabled yet
        - Did you tip yourself?
        */
      const userInfo = await tipbotInfo(userID);
      // check if user has enough funds in their account and if it exists
      console.log('checks - userInfo: ' + JSON.stringify(userInfo));


    }
    
    // ///////////////// sanity checks //////////////////////////////

    // check if user mentioned another user to tip
    if (!message.mentions.users.size) {
      console.log('No Users mentioned.');
      ReplyMessage('No Users mentioned. `+help tip` for help');
      return ;
    }
    // check if mentioned group and fail if so
    if (args.includes('@here') || args.includes('@everyone') || args.includes('@developer') || args.includes('@founder')) {
      console.log('Can\'t send to a group');
      ReplyMessage('Can\'t send to a group. Please send to individual user(s), up to 100 in a tip.');
      return;
    }
    // set tip amount here. Pulls the args and checks until it finds a good tip amount
    // iterates through the list of args given and looks for a number, first found wins.
    // This also checks the number to validate its a qrl amount isQRLValue()
    const givenTip = tipAmount();
    console.log('tip contents ' + givenTip);

    // check if amount is NaN
    if (isNaN(givenTip)) {
      console.log('isNaN');
      console.log('enter a valid amount to tip');
      ReplyMessage('Please enter a valid amount to tip! +tip {AMOUNT} @USER(\'s)');
      return ;
    }
    // Check that tip amount is above fee
    const fee = toShor(config.wallet.tx_fee);
    console.log('fee: ' + fee + '\namount: ' + givenTip);
    if (givenTip < fee) {
      message.channel.stopTyping(true);
      console.log('tipAmount < tx_fee - fee:\nFee: ' + fee + ' - Tip: ' + givenTip);
      ReplyMessage('Please enter a valid amount to tip! Must be more than the fee `{' + config.wallet.tx_fee + '}` +tip {AMOUNT} @USER(\'s)');
      return ;
    }

    // ///////////////// end sanity checks //////////////////////////////

    tipbotInfo(userID).then(function(tipingUserInfo) {
      console.log('INFO: ' + JSON.stringify(tipingUserInfo));
      const tippingUserUser_Found = JSON.stringify(tipingUserInfo[0].user_found);
      const tippingUserUser_agree = JSON.stringify(tipingUserInfo[0].user_agree);
      const tippingUserOpt_Out = JSON.stringify(tipingUserInfo[0].opt_out);

      console.log('tippingUserUser_Found: ' + tippingUserUser_Found);
      console.log('tippingUserUser_agree: ' + tippingUserUser_agree);
      console.log('tippingUserOpt_Out: ' + tippingUserOpt_Out);


      if (!tippingUserUser_Found) {
        console.log('User not found. Fail and warn');
        ReplyMessage('User not found. Add your user to the bot. `+add`');
        return;
      }
      if (tippingUserOpt_Out == 1) {
        const tippingUserOptOut_Date = JSON.stringify(tipingUserInfo[0].optout_date);
        ReplyMessage('User opt\'ed out of the bot on ' + tippingUserOptOut_Date + '. Please opt back in to use the bot. `+opt-in`');
        return;
      }


      if (!tippingUserUser_agree) {
        console.log('User has not agreed. Fail and warn');
        ReplyMessage('User needs to agree to the terms. `+agree`');
        return;
      }
      // user found in database and passes initial checks.
      const tippingUserWallet_Pub = JSON.stringify(tipingUserInfo[0].wallet_pub);
      const tippingUserWallet_Bal = toShor(JSON.stringify(tipingUserInfo[0].wallet_bal));
      const tippingUserUser_Id = JSON.stringify(tipingUserInfo[0].user_id);
      const tippingUserUser_Name = JSON.stringify(tipingUserInfo[0].user_name);
      

      // check balance to tip amount
      if (tippingUserWallet_Bal <= 0) {
        console.log('User has 0 balance. Fail and warn');
        ReplyMessage('You have no funds to tip. `+bal`');
        return;
      }

    // Get the tipList without bots
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

    // remove any null or empty array contents
    const filteredTipList = tipList.filter(function(el) {
      return el != null;
    });


    const found = filteredTipList.find(element => element == userID);


    // Check if mentions user
    console.log('filteredTipList: \n' + JSON.stringify(filteredTipList));
    console.log('message Author: ' + message.author);
    console.log('found: ' + found);
    console.log('message auth user found: ' + (JSON.stringify(filteredTipList)).includes(userID));

    if ((filteredTipList).includes(userID, 0)) {
      console.log('can\'t tip yourself, message.mentions.users.first() == message.author');
      ReplyMessage('You can\'t tip yourself');
      message.channel.stopTyping(true);
      return;
    }


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
  });
  },
};