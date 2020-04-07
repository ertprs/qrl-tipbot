module.exports = {
  name: 'tip',
  description: 'Tips!',
  args: true,
  guildOnly: false,
  cooldown: 10,
  aliases: ['send', 'gift', 'give', 'pay'],
  usage: '\n<tip amount> <user1> <user2> <user3> <etc.> \nEXAMPLE: `+tip 1 @CoolUser`',
  execute(message, args) {
    message.channel.startTyping();
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const config = require('../../../_config/config.json');
    const wallet = require('../../qrl/walletTools');
    const tipAmount = args[0] * 1000000000;
    const tipAmountQuanta = args[0];
    const fee = config.wallet.tx_fee * 1000000000;
    const GetAllUserInfo = dbHelper.GetAllUserInfo;
    const addFutureTips = dbHelper.addFutureTip;
    const addTransaction = dbHelper.addTransaction;
    const add_tip_to = dbHelper.addTipTo;
    const addToTips = dbHelper.addTip;
    const username = `${message.author}`;
    const userID = username.slice(1, -1);
    const addToTipsArgsArray = [];
    const GetAllUserInfoPromise = GetAllUserInfo({ service: 'discord', service_id: userID });
    const not_found_addressTo = [];
    const found_addressTo = [];
    const not_found_tipAmount = [];
    const found_tipAmount = [];
    // check if user mentioned another user to tip
    if (!message.mentions.users.size) {
      message.reply('No Users mentioned. \n`+help tip` for help');
      message.channel.stopTyping(true);
      return ;
    }
    // We have users mentioned, get the tipList into map
    const tipList = message.mentions.users.map(user => {
      const userName = user.username;
      const output = JSON.parse(JSON.stringify(userName));
      return `@${output}`;
    });
    const userList = message.mentions.users.map(user => {
      const service_user_ID = user.id;
      const output = JSON.parse(JSON.stringify(service_user_ID));
      return `<@${output}>`;
    });
    // get the tip-to userID into map
    const UserIDList = message.mentions.users.map(user => {
      const user_ID = '@' + user.id;
      const userName = user.username;
      const output = JSON.parse(JSON.stringify({ Service_ID: user_ID, service_user_name: userName }));
      return output;
    });
    const tipListJSON = JSON.parse(JSON.stringify(tipList));

    const tipUserCount = tipListJSON.length;
    //  check for tip amount, fail if not found...
    if (isNaN(tipAmount)) {
      message.reply('Please enter a valid amount to tip! +tip {AMOUNT} @USER(\'s)');
      message.channel.stopTyping(true);
      return ;
    }
    // fail if not number within range
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
    const test = isQRLValue(tipAmountQuanta);
    if (!test) {
      message.channel.stopTyping(true);
      message.reply('Invalid amount. Please try again.');
      return;
    }
    // fail if amount is 0 or less.
    if (tipAmount < 0) {
      message.channel.stopTyping(true);
      message.reply('Please enter a valid amount to tip! +tip {AMOUNT} @USER(\'s)');
      return ;
    }
    // check if tipping self and fail if found
    if (message.mentions.users.first() == message.author) {
      message.reply('You can\'t tip yourself');
      message.channel.stopTyping(true);
      return;
    }
    // get  tip-from-user info values from database since correct input(args) were given
    GetAllUserInfoPromise.then(function(userInfo) {
      // console.log('GETALLUSRERINFO: ' + JSON.stringify(userInfo));
      const found = userInfo[0].user_found;
      if (found == 'false') {
        message.channel.stopTyping(true);
        const embed = new Discord.MessageEmbed()
          .setTitle('ERROR')
          .setDescription('user not found, please sign up with `+add`')
          .setColor(0x000000)
          .addField('User Found', found);
        message.channel.send({ embed });
        return;
      }
      // check for opt out
      if (userInfo[0].opt_out == '1') {
        message.channel.stopTyping(true);
        const embed = new Discord.MessageEmbed()
          .setTitle('ERROR')
          .setDescription('You have Opted Out of the TipBot. To tip you must opt back in.')
          .setColor(0x000000)
          .addField('Opt-Out', userInfo[0].opt_out)
          .addField('Opt-Out Date', userInfo[0].optout_date)
          .addField('To opt back in', '`+opt-in`');
        message.author.send({ embed })
          .then(() => {
            message.reply('There was an error, see your DM');
          })
          .catch(error => {
            message.channel.stopTyping(true);
            console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
            return;
          });
        return;
      }
      // we have results from user lookup, asign values for tip from user
      const wallet_pub = userInfo[0].wallet_pub;
      const wallet_bal = userInfo[0].wallet_bal;
      const total_tip = tipUserCount * tipAmount + fee;
      // check that the users balance is enough to tip the request
      const wallet_bal_shor = wallet_bal * 1000000000;
      if ((wallet_bal_shor - total_tip) < 0) {
        // not enough funds...
        message.channel.stopTyping(true);
        const embed = new Discord.MessageEmbed()
          .setTitle('ERROR - Not enough funds in user wallet')
          .setDescription('[Check your address on the explorer](' + config.bot_details.explorer_url + '/a/' + wallet_pub + ')')
          .setColor(0x000000)
          .addField('Wallet Balance:', wallet_bal + ' QRL')
          .addField('Amount attempted to tip:', tipUserCount * tipAmount / 1000000000 + ' QRL');
        message.author.send({ embed })
          .then(() => {
            if (message.channel.type === 'dm') return;
            message.reply('\n:moneybag: You need more funds! :moneybag:');
          })
          .catch(error => {
            message.channel.stopTyping(true);
            console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
            return;
          });
        return;
      }
      // tipping user has funds, and is not opted out.
      const allServiceIDs = message.mentions.users.map(function(id) {
        return id.id;
      });
      const stringUserIDs = allServiceIDs.join();
      // console.log('stringUserIDs' + stringUserIDs);
      // add users to the tips db and create a tip_id to track this tip through
      // we need to send { trans_id, from_user_id, to_users_id, tip_amount, from_service, time_stamp}
      const addToTipsDBinfo = { from_user_id: userID, to_users_id: stringUserIDs, tip_amount: tipAmountQuanta, from_service: 'discord', time_stamp: new Date() };
      const AddToTipsDBinfoPromise = addToTips(addToTipsDBinfo);
      // add this tip to the db and begin the tipping proecss
      AddToTipsDBinfoPromise.then(function(AddToTipsArgs) {
        // we expect back { tip_id: (tip ID from db insert) }
        const tip_id = AddToTipsArgs[0].tip_id;
        // push the tip_id to an array for later use
        addToTipsArgsArray.push({ tip_id: tip_id });
        return addToTipsArgsArray;
      });
      let found_count = 0;
      let not_found_count = 0;

      // tip_id created, sort the users found and not-found
      async function tip() {
        const iterator = UserIDList.entries();
        for (const Service_ID of message.mentions.users) {
          const Value = iterator.next().value;
          // console.log('VALUE: ' + JSON.stringify(Value));
          // set the users values to variables from the iterator.next().value we got from above
          const serviceid = Value[1].Service_ID;
          const serviceUserName = Value[1].service_user_name;
          const GetAllTipedUserInfoPromise = GetAllUserInfo({ service: 'discord', service_id: serviceid });
          // search for the tipto user here in the database with info from above
          await GetAllTipedUserInfoPromise.then(function(tippedUserInfo) {
            // console.log('tippedUserInfo ' + JSON.stringify(tippedUserInfo));
            const tippedUserFound = tippedUserInfo.user_found;
            if (tippedUserFound == 'true') {
              const tippedUsedOptOut = tippedUserInfo[4].opt_out;
              if (tippedUsedOptOut !== 1) {
              // check if tipping self and fail if found
                const message_auth = '@' + message.author.id;
                if (serviceid == message_auth) {
                  message.author.send('You can\'t tip yourself');
                  message.channel.stopTyping(true);
                }
                else{
                  ++found_count;
                  // user is found, add their wallet_pub to addressTo array and return.
                  const tipTo_user_wallet = tippedUserInfo[0].wallet_pub;
                  found_addressTo.push(tipTo_user_wallet);
                  found_tipAmount.push(tipAmount);
                  // add user to tip_to here?
                  // add_tip_to
                  const user_id = userInfo[0].user_id;
                  const tip_id = addToTipsArgsArray[0].tip_id;
                  // check that tip_id is there, else wait for it...

                  const check_tip_id = function() {
                    if(tip_id == undefined) {
                      // check again in a second
                      setTimeout(check_tip_id, 1000);
                    }
                  };
                  check_tip_id();

                  const add_tip_to_info = { tip_id: tip_id, tip_amt: tipAmountQuanta, user_id: user_id };
                  add_tip_to(add_tip_to_info).then(function(tip_toResults) {
                    // console.log('tip_toResults: ' + JSON.stringify(tip_toResults));
                  });
                }
              }
            }
            else {
              ++not_found_count;
              // user is not found, add them to the future_tips DB.
              // We need to send { service: SERVICE, user_id: SERVICE_ID, user_name: SERVICE_user_name, tip_from: tipFrom_user_id, tip_amount: tip_to_user_amount, time_stamp: date_tip_was_made }
              const usernNotFoundInfo = { service: 'discord', user_id: serviceid, user_name: serviceUserName, tip_from: userID, tip_amount: tipAmountQuanta };
              const addTo_Future_tipsPromise = addFutureTips(usernNotFoundInfo);
              addTo_Future_tipsPromise.then(function(futureTipsID) {
                // console.log('f' + JSON.stringify(futureTipsID));
                // add to tips_to database and mark as a future tip with the tipID
                //
                // console.log('addToTipsArgsArray not found: ' + JSON.stringify(addToTipsArgsArray));
                const user_id = userInfo[0].user_id;
                const tip_id = addToTipsArgsArray[0].tip_id;
                // check that tip_id is ther, else wait for it...
                const check_tip_id = function() {
                 if(tip_id == undefined) {
                    // check again in a second
                    setTimeout(check_tip_id, 1000);
                  }
                };
                check_tip_id();


                const future_tip_id = futureTipsID[0].tip_id;
                const add_tip_to_info = { tip_id: tip_id, tip_amt: tipAmountQuanta, user_id: user_id, future_tip_id: future_tip_id };
                add_tip_to(add_tip_to_info).then(function(tip_toResults) {
                  // console.log('tip_toResults: ' + JSON.stringify(tip_toResults));
                });
              });
            }
          });
        }
      }

      async function tipAwait() {
        const tipUser = await tip();
        tipUser;
        if (not_found_count > 0) {
          const tip_to_hold = tipAmount * not_found_count;
          not_found_addressTo.push(config.wallet.hold_address);
          not_found_tipAmount.push(tip_to_hold);
        }
        if (not_found_count == 0 && found_count == 0) {
          // if in a chat, delete their tip message and reply with the list of tipped users
          if(message.guild != null) {
            message.delete();
          }
          message.channel.stopTyping(true);
          message.reply('sorry, no users found or they have opted out. No tip sent...');
          return;
        }
        // if in a chat, delete their tip message and reply with the list of tipped users
        if(message.guild != null) {
          message.delete();
        }
        message.channel.stopTyping(true);
        message.reply('Tipped ' + userList + ' `' + tipAmountQuanta + '` QRL.\n*All tips are on-chain, and will take some time to process.*');
        const send_to_addresses = found_addressTo.concat(not_found_addressTo);
        const send_to_amount = found_tipAmount.concat(not_found_tipAmount);
        const tipToInfo = { amount: send_to_amount, fee: fee, address_from: wallet_pub, address_to: send_to_addresses };
        // transfer the funds here
        const transfer = wallet.sendQuanta;
        transfer(tipToInfo).then(function(transferQrl) {
          console.log('transferQrl' + transferQrl);
          const transferOutput = JSON.parse(transferQrl);
          const tx_hash = transferOutput.tx.transaction_hash;
          // write to transactions db
          const tip_id = addToTipsArgsArray[0].tip_id;
          const txInfo = { tip_id: tip_id, tx_type: 'tip', tx_hash: tx_hash };
          const addTransactionPromise = addTransaction(txInfo);
          addTransactionPromise.then(function(txRes) {
            // console.log('txRes' + JSON.stringify(txRes));

            return txRes;
          });
          message.channel.stopTyping(true);
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('Tip Sent!')
            .setDescription('Your tip was posted on the network. It may take a few minuets to confirm, see the transaction info in the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + tx_hash + ')')
            .addField('Transfer amount', '**' + total_tip / 1000000000 + '**')
            .addField('Transfer fee', '**' + config.wallet.tx_fee + '**')
            .addField('Transfer To Address', '** ' + userList + '**')
            .setFooter('The TX Fee is taken from the transfer amount and set by the bot owner. \nThe current fee is set to ' + config.wallet.tx_fee + ' QRL');
          message.author.send({ embed })
            .then(() => {
              if (message.channel.type !== 'dm') return;
            })
            .catch(error => {
              message.channel.stopTyping(true);
              console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
            });
          message.channel.stopTyping(true);
          return;
        });
      }
      // send the tip here
      tipAwait();
      return JSON.stringify(userInfo);
    });
    message.channel.stopTyping(true);

  },
};

