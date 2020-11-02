module.exports = {
  name: 'tip2',
  description: 'Tips!',
  args: true,
  guildOnly: false,
  cooldown: 1,
  aliases: ['!$'],
  usage: '\n<tip amount> <user1> <user2> <user3> <etc.> \nEXAMPLE: `+tip2 1 @CoolUser`',
  execute(message, args) {
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');
    const futureTippedUserInfo = [];
    const futureTippedUserIDs = [];
    const tippedUserInfo = [];
    const tippedUserWallets = [];
    const tippedUserTipAmt = [];
    const tippedUserIDs = [];
    const tippedUserServiceIDs = [];
    const fee = toShor(config.wallet.tx_fee);

    const username = `${message.author}`;
    const userID = username.slice(1, -1);

    message.channel.startTyping();

    function ReplyMessage(content) {

      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
    }

    function replyMessage(header, description, content, footer = '.: Tipbot provided by The QRL Contributors :.') {
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x000000)
          .setTitle('ERROR: ' + header)
          .setDescription(description)
          .addField(content)
          .setFooter(footer);
        message.reply({ embed });
        message.channel.stopTyping(true);
      }, 1000);
    }

    function errorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      setTimeout(function() {
        const embed = new Discord.MessageEmbed()
          .setColor(0x000000)
          .setTitle(':warning:  ERROR: ' + content.error)
          .setDescription(content.description)
          .setFooter(footer);
        message.reply({ embed });
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

    function toQuanta(number) {
      const shor = 1000000000;
      return number / shor;
    }
    function isQRLValue(str) {
      // receive amount in shor, do accordingly
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
      // console.log('str' + str);
      // console.log('isQRLValue: ' + test);
      return test;
    }

    // Get user info.
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }

    // send the users data to future_tips for when they sign up
    async function futureTipsDBWrite(futureTipInfo) {
      return new Promise(resolve => {
        // console.log('futureTipsDBWrite futureTipInfo' + JSON.stringify(futureTipInfo));
        const infoToSubmit = { service: 'discord', user_id: futureTipInfo.user_id, user_name: futureTipInfo.user_name, tip_id: futureTipInfo.tip_id, tip_from: futureTipInfo.tip_from, tip_amount: toQuanta(futureTipInfo.tip_amount), time_stamp: new Date() };
        console.log('futureTipsDBWrite infoToSubmit: ' + JSON.stringify(infoToSubmit));
        const addToFutureTipsDBinfoWrite = dbHelper.addFutureTip(infoToSubmit);
        resolve(addToFutureTipsDBinfoWrite);
      });
    }

    async function tipDBWrite(tipInfo) {
      // send the users data to future_tips for when they sign up
      return new Promise(resolve => {
        // console.log('tipDBWrite tipInfo' + JSON.stringify(tipInfo));
        const addToTipsDBinfo = { from_user_id: tipInfo.from_user_id, tip_amount: toQuanta(tipInfo.tip_amount), from_service: 'discord', time_stamp: new Date() };
        console.log('tipDBWrite addToTipsDBinfo: ' + JSON.stringify(addToTipsDBinfo));
        const addToTipsDBinfoWrite = dbHelper.addTip(addToTipsDBinfo);
        resolve(addToTipsDBinfoWrite);
      });
    }


    async function tipToDBWrite(tipToInfo) {
      // send the users data to future_tips for when they sign up
      return new Promise(resolve => {
        // console.log('tipToDBWrite tipToInfo' + JSON.stringify(tipToInfo));
        const addToTipsToDBinfo = { tip_id: tipToInfo.tip_id, from_user_id: userID, user_id: tipToInfo.user_id, tip_amt: toQuanta(tipToInfo.tip_amt), future_tip_id: tipToInfo.future_tip_id, time_stamp: new Date() };
        console.log('tipToDBWrite addToTipsToDBinfo: ' + JSON.stringify(addToTipsToDBinfo));
        const addToTipsToDBinfoWrite = dbHelper.addTipTo(addToTipsToDBinfo);
        resolve(addToTipsToDBinfoWrite);
      });
    }


    /*
    async function transactionDBWrite(transactionInfo) {
      // send the transaction data once the tip is sent
      return new Promise(resolve => {
        // console.log('transactionDBWrite transactionInfo' + JSON.stringify(transactionInfo));
        const transInfo = { from_user_id: transactionInfo.from_user_id, to_users_id: transactionInfo.to_users_id, tip_amount: toQuanta(transactionInfo.tip_amount), from_service: 'discord', time_stamp: new Date() };
        console.log('transInfo: ' + transInfo);
        const transInfoWrite = dbHelper.addTransaction(transInfo);
        resolve(transInfoWrite);
      });
    }
    */


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
        resolve(userInfo);
      });
    }


    function Count(list) {
      // console.log('tipList: ' + JSON.stringify(tipList));
      const arrayCount = list.length;
      return arrayCount;
    }
    // check if user mentioned another user to tip
    if (!message.mentions.users.size) {
      // console.log('No Users mentioned.');
      // ReplyMessage('No Users mentioned. `+help tip` for help');
      errorMessage({ error: 'No User(s) Mentioned...', description: 'Who are you tipping? enter `+help tip` for instructions' });
      return ;
    }
    // check if mentioned group and fail if so
    if (args.includes('@here') || args.includes('@everyone') || args.includes('@developer') || args.includes('@founder')) {
      console.log('Can\'t send to a group');
      // ReplyMessage('Can\'t send to a group. Please send to individual user(s), up to 100 in a tip.');
      errorMessage({ error: 'Can\'t Tip Groups...', description: 'Please send to individual user(s), up to 100 users in a tip.' });
      return;
    }
    // set tip amount here. Pulls the args and checks until it finds a good tip amount
    // iterates through the list of args given and looks for a number, first found wins.
    // This also checks the number to validate its a qrl amount isQRLValue()
    const givenTip = tipAmount();
    // console.log('tip contents ' + givenTip);

    // check if amount is NaN
    if (isNaN(givenTip)) {
      console.log('isNaN');
      console.log('enter a valid amount to tip');
      // ReplyMessage('Please enter a valid amount to tip! +tip {AMOUNT} @USER(\'s)');
      errorMessage({ error: 'Invalid Amount Given...', description: 'Please enter a valid amount to tip! `+tip {AMOUNT} @USER(\'s)`' });
      return ;
    }
    // Check that tip amount is above fee
    console.log('fee: ' + fee + '\namount: ' + givenTip);
    if (givenTip < fee) {
      message.channel.stopTyping(true);
      console.log('tipAmount < tx_fee - fee:\nFee: ' + fee + ' - Tip: ' + givenTip);
      // ReplyMessage('Please enter a valid amount to tip! Must be more than the fee `{' + config.wallet.tx_fee + '}` +tip {AMOUNT} @USER(\'s)');
      errorMessage({ error: 'Invalid Amount Given...', description: 'Tip must be more than TX Fee: `{' + config.wallet.tx_fee + '}`' });
      return ;
    }

    // Get user info into scope from database
    tipbotInfo(userID).then(function(tipingUserInfo) {
      console.log('Tipping user INFO: ' + JSON.stringify(tipingUserInfo));
      const tippingUserUser_Found = JSON.stringify(tipingUserInfo[0].user_found);
      const tippingUserUser_agree = JSON.stringify(tipingUserInfo[0].user_agree);
      const tippingUserOpt_Out = JSON.stringify(tipingUserInfo[0].opt_out);
      // log the output for debug
      console.log('tippingUserUser_Found: ' + tippingUserUser_Found);
      console.log('tippingUserUser_agree: ' + tippingUserUser_agree);
      console.log('tippingUserOpt_Out: ' + tippingUserOpt_Out);
      // check for tipping user in the system
      if (tippingUserUser_Found == 'false') {
        console.log('User not found. Fail and warn');
        errorMessage({ error: 'User Not Found...', description: 'Please sign up to the tipbot. Enter `+add` to create a wallet then `+agree` to use the bot' });
        // ReplyMessage('User not found. Add your user to the bot. `+add`');
        return;
      }
      // check for tipping user opt-out
      if (tippingUserOpt_Out == 1) {
        const tippingUserOptOut_Date = JSON.stringify(tipingUserInfo[0].optout_date);
        errorMessage({ error: 'User Has `Opt-Out` Status...', description: 'You opted out on ' + tippingUserOptOut_Date + '. Please opt back in to use the bot. `+opt-in`' });
        // ReplyMessage('User opt\'ed out of the bot on ' + tippingUserOptOut_Date + '. Please opt back in to use the bot. `+opt-in`');
        return;
      }
      // check for tipping user agree
      if (!tippingUserUser_agree) {
        console.log('User has not agreed. Fail and warn');
        errorMessage({ error: 'User Has Agreed to Terms...', description: 'Please agree to the terms to start using the bot. Enter `+terms` to read or `+agree`' });
        // ReplyMessage('User needs to agree to the terms. `+agree`');
        return;
      }

      // user found in database and passes initial checks.
      const tippingUserWallet_Pub = JSON.stringify(tipingUserInfo[0].wallet_pub);
      console.log('tippingUserWallet_Pub: ' + tippingUserWallet_Pub);
      const tippingUserWallet_Bal = toShor(JSON.stringify(tipingUserInfo[0].wallet_bal));
      console.log('tippingUserWallet_Bal: ' + tippingUserWallet_Bal);
      const tippingUserUser_Id = JSON.stringify(tipingUserInfo[0].user_id);
      console.log('tippingUserUser_Id: ' + tippingUserUser_Id);
      const tippingUserUser_Name = JSON.stringify(tipingUserInfo[0].user_name);
      console.log('tippingUserUser_Name: ' + tippingUserUser_Name);

      // check balance to tip amount
      if (tippingUserWallet_Bal <= 0) {
        console.log('User has 0 balance. Fail and warn');
        errorMessage({ error: 'User Wallet Empty...', description: 'No funds to tip. Transfer funds with `+deposit` or pull from the faucet if full with `+drip`' });
        // ReplyMessage('You have no funds to tip. `+bal`');
        return;
      }

      // Get the tipList (send tip to) without bots in the array
      const tipList = message.mentions.users.map(user => {
        const userName = user.username;
        const output = '@' + JSON.parse(JSON.stringify(userName));
        const service_user_ID = user.id;
        const userid = '@' + user.id;
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
        if (userid === userID) {
        // user mentioned self, do not count and move on
          console.log('User mentioned self');
          errorMessage({ error: 'User Tipped Self...', description: 'You can\'t tip yourself! Removing you from the tip and proceeding' });
          // ReplyMessage('You can\'t tip yourself! Removing you from the tip...');
          return;
        }
        // check for user in the tipbot database and grab addresses etc. for them.
        // Not a bot, return details
        const details = { userName: output, service_user_ID: service_user_ID, userid: userid, bot: bot, discriminator: discriminator, avatar: avatar, lastMessageID: lastMessageID, lastMessageChannelID: lastMessageChannelID, verified: verified, mfaEnabled: mfaEnabled };
        return details;
      });

      // remove any null or empty contents
      const filteredTipList = tipList.filter(function(el) {
        return el != null;
      });
      console.log('filteredTipList: ' + JSON.stringify(filteredTipList));

      // get the bots into array
      const botList = message.mentions.users.map(user => {
        const userName = user.username;
        const output = '@' + JSON.parse(JSON.stringify(userName));
        const userid = '<@!' + user.id + '>';
        const bot = user.bot;
        if (!bot) {
          // if not a bot don't do anything
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
      const bots = [];
      const botUserCount = Count(botListJSON);
      console.log('botUserCount: ' + botUserCount);
      // if bot count is positive warn user and continue
      if (botUserCount > 0) {
        console.log('Bots are tipped, send warning and continue..');
        // getting bot userid into array to respond to user with. userid is the correct format to notify user in
        for(let i = 0, l = filteredBotList.length; i < l; i++) {
          bots.push(' ' + filteredBotList[i].userid);
        }
        errorMessage({ error: 'Bots Mentioned In Tip...', description: 'You can\'t tip robots! Removing ' + bots + ' from the tip and proceeding.' });
        // ReplyMessage('No bot tipping allowed! Removing the robots and sending to the rest...\rBots mentioned ' + bots);
      }
      const tipListJSON = JSON.parse(JSON.stringify(filteredTipList));
      const tipUserCount = Count(tipListJSON);
      console.log('tipUserCount: ' + tipUserCount);

      // check the balance of tipping user to total tip amount
      console.log('user Balance: ' + tippingUserWallet_Bal);
      console.log('Tip Amount: ' + (givenTip * tipUserCount));
      const tipTotal = ((givenTip * tipUserCount) + fee);
      if (tippingUserWallet_Bal < tipTotal) {
        console.log('More than user bal. fail and error with balance');
        errorMessage({ error: 'Tipping more than you have...', description: 'Enter `+bal` to get your current balance.' });
        // ReplyMessage('Trying to send more than you have... Please try again. \nYou tried sending `' + toQuanta(tipTotal)) + 'qrl` which is `' + (tipTotal - tippingUserWallet_Bal) + 'qrl` more than you have.';
        return;
      }

      async function userInfo() {

        for(let i = 0, l = filteredTipList.length; i < l; i++) {
          // check for user in the tipbot database and grab addresses etc. for them.
          const tipToUserInfo = await tipbotInfo(filteredTipList[i].userid);
          console.log('tipToUserInfo: ' + JSON.stringify(tipToUserInfo));
          const tipToUserFound = tipToUserInfo[0].user_found;
          const tipToUserOptOut = tipToUserInfo[0].opt_out;
          // If tipped user is found then...
          if (tipToUserFound === 'true') {
            // If tipped user Opt-Out true...
            if (tipToUserOptOut === '1') {
              // user found and opted out. Add to the future_tips table and set the wallet address to the hold address...
              futureTippedUserInfo.push(filteredTipList[i]);
              const futureTippedUserId = ' <@!' + filteredTipList[i].service_user_ID + '>';
              futureTippedUserIDs.push(futureTippedUserId);
              // assign the config.hold.address here for future tips payout
              tippedUserWallets.push(config.wallet.hold_address);
              tippedUserTipAmt.push(givenTip);
              continue;
            }
            else {
              // user found and not opted out, add to array and move on
              const tipToUserUserId = ' <@!' + filteredTipList[i].service_user_ID + '>';
              const tippedUserServiceID = filteredTipList[i].userid;
              const tipToUserUserWalletPub = tipToUserInfo[0].wallet_pub;
              // push user data to arrays for tipping
              tippedUserIDs.push(tipToUserUserId);
              tippedUserServiceIDs.push(tippedUserServiceID);
              tippedUserWallets.push(tipToUserUserWalletPub);
              tippedUserInfo.push(tipToUserInfo);
              tippedUserTipAmt.push(givenTip);
              continue;
            }
          }
          else {
            // the user is not in the database yet, add to the future_tips table and set the wallet address to the hold address
            futureTippedUserInfo.push(filteredTipList[i]);
            const futureTippedUserId = ' <@!' + filteredTipList[i].service_user_ID + '>';
            futureTippedUserIDs.push(futureTippedUserId);
            // assign the config.hold.address here for future tips payout
            tippedUserWallets.push(config.wallet.hold_address);
            tippedUserTipAmt.push(givenTip);
          }
        }
        // arrays are full, now send the transactions and set database.

        // add users to the tips db and create a tip_id to track this tip through
        const addTipInfo = { from_user_id: userID, tip_amount: givenTip };
        const addTipResults = await tipDBWrite(addTipInfo);
        const tip_id = addTipResults[0].tip_id;
        // check for tx_id to be created...
        const check_tip_id = function() {
          if(tip_id == undefined) {
            // check again in a second
            setTimeout(check_tip_id, 1000);
          }
        };
        check_tip_id();
        console.log('tip_id: ' + tip_id);

        // ///////// Found Tipped Users Database Entry ///////// //
        // looks through all users in the tippedUserInfo array assigned above.
        // For each user found, adds their info to the tips_to database. One entry each user
        // /////////////////////////////////////////////// //

        for(let i = 0, l = tippedUserInfo.length; i < l; i++) {
          const addTipToInfo = { tip_id: tip_id, tip_amt: givenTip, user_id: tippingUserUser_Id };
          console.log('addTipToInfo: ' + JSON.stringify(addTipToInfo));
          const addTipToCall = await tipToDBWrite(addTipToInfo);
          console.log('addTipToCall: ' + JSON.stringify(addTipToCall));
        }

        // ///////// Future Users Database Entry ///////// //
        // looks through all users in the futureTippedUserInfo array assigned above.
        // For each user found, adds their info to the future_tips_to database. One entry each user to be paid out in the future
        // /////////////////////////////////////////////// //

        for(let i = 0, l = futureTippedUserInfo.length; i < l; i++) {
          const addFutureTipToInfo = { user_id: futureTippedUserInfo[i].service_user_ID, user_name: futureTippedUserInfo[i].userName, tip_id: tip_id, tip_from: userID, tip_amount: givenTip };
          const addFutureTipToCall = await futureTipsDBWrite(addFutureTipToInfo);
          const future_tip_id = addFutureTipToCall[0].tip_id;
          const addTipToInfo = { tip_id: tip_id, tip_amt: givenTip, user_id: tippingUserUser_Id, future_tip_id: future_tip_id };
          const addTipToCall = await tipToDBWrite(addTipToInfo);
          console.log('addTipToCall' + JSON.stringify(addTipToCall));
        }
        return [filteredTipList, tippedUserWallets, tippedUserTipAmt, tip_id];

      }
      // get all tippedToUser info from the database
      userInfo().then(function(FinalInfo) {
        // using details above enter the transactions into the node and respond to users.
        console.log('\n\nFinalInfo: ' + JSON.stringify(FinalInfo));
        console.log('futureTippedUserInfo: ' + JSON.stringify(futureTippedUserInfo));
        console.log('tippedUserInfo: ' + JSON.stringify(tippedUserInfo));

        // const send_to_addresses = tippedUserWallets;
        // const send_to_amount = tippedUserTipAmt;

        // ///////// Send the transaction ///////// //
        const tipToInfo = { amount: tippedUserTipAmt, fee: fee, address_from: JSON.parse(tippingUserWallet_Pub), address_to: tippedUserWallets };
        console.log('tipToInfo: ' + JSON.stringify(tipToInfo));
        wallet.sendQuanta(tipToInfo).then(function(sendData) {
          const transferOutPut = JSON.parse(sendData);
          console.log('transferOutPut: ' + JSON.stringify(transferOutPut));
          const tx_hash = transferOutPut.tx.transaction_hash;
          const txInfo = { tip_id: FinalInfo[3], tx_type: 'tip', tx_hash: tx_hash };
          dbHelper.addTransaction(txInfo).then(function(transactionDBresp) {
            console.log('transactionDBresp: ' + JSON.stringify(transactionDBresp));

            // ///////// Add to database and write the tx_id to the tip record ///////// //

            // ///////// DM User tip details and address balance after the TX ///////// //

            // get address balance after tx
            console.log('tipTotal: ' + tipTotal);

            const newWal_bal = (toQuanta(tippingUserWallet_Bal) - toQuanta(tipTotal));

            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('Tip Sent!')
              .setDescription('Your tip was posted on the network! It may take a few minuets to confirm, see the transaction info in the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + tx_hash + ')')
              
              .addField('Sent a total of `', toQuanta(givenTip * tipUserCount).toFixed(9) + ' QRL`')
              .addField(tippedUserIDs + ' ' + futureTippedUserIDs + ' each received',  '`' + toQuanta(givenTip).toFixed(9) + ' QRL`')

              .addField('Network Fee', '**' + toQuanta(fee).toFixed(9) + ' QRL**', true)
              .addField('Total Transfer', '**' + toQuanta(tipTotal).toFixed(9) + ' QRL**', true )
              .addField('New Wallet Balance', '**' + newWal_bal + ' QRL**', true)

              .addField('Transaction Hash `', tx_hash + '`')
              .setFooter('The TX Fee is paid by the tip sender. \nThe current fee is set to ' + config.wallet.tx_fee + ' QRL');
            message.author.send({ embed })
              .then(() => {
                if (message.channel.type !== 'dm') return;
              })
              .catch(error => {
                message.channel.stopTyping(true);
                console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
              });

            if(message.guild != null) {
              deleteMessage();
            }
            message.channel.stopTyping(true);
            if (tipUserCount > 1) {
              ReplyMessage('you tipped ' + tippedUserIDs + ',' + futureTippedUserIDs + ' `' + toQuanta(givenTip) + '` QRL each.\n*All tips are on-chain, and will take some time to process.*');
            }
            else {
              ReplyMessage('you tipped ' + tippedUserIDs + ',' + futureTippedUserIDs + ' `' + toQuanta(givenTip) + '` QRL.\n*All tips are on-chain, and will take some time to process.*');
            }
            console.log('futureTippedUserIDs: ' + JSON.stringify(futureTippedUserIDs));
            console.log('tippedUserIDs: ' + JSON.stringify(tippedUserIDs));
          });

        });
      });
      // console.log('tippedUserWallets: ' + JSON.stringify(tippedUserWallets));
      // console.log('tippedUserTipAmt: ' + JSON.stringify(tippedUserTipAmt));
      // console.log('tippedUserServiceIDs: ' + JSON.stringify(tippedUserServiceIDs));
      // console.log('final tipListJSON: ' + JSON.stringify(tipListJSON));
    });
  },
};