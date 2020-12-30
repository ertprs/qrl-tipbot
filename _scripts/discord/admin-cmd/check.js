module.exports = {
  name: 'check',
  description: 'Check various functions',
  args: false,
  guildOnly: false,
  aliases: ['check', 'ch'],
  cooldown: 0,
  usage: '\n__**user** ***usr***__ :\t`Check for user`\n__**id**__ :\t`get user_id`\n__**optout** ***oo***__ :\t`Check if user has set opt_out`\n__**signup** ***su***__ :\t`check if user is signed up`\n__**walletPub** ***wp***__ :\t`Get wallet address`\n__**walletBal** ***wb***__\t`Get users wallet balance`',

  // execute(message, args) {
  execute(message, args) {
    message.channel.startTyping();
    const Discord = require('discord.js');
    const dbHelper = require('../../db/dbHelper');
    const checkUser = dbHelper.CheckUser;
    const config = require('../../../_config/config.json');
    // const getUserId = dbHelper.GetUserID;
    const checkOptOut = dbHelper.CheckUserOptOut;
    const checkSignedup = dbHelper.CheckUserSignup;
    const checkUserWalletPub = dbHelper.GetUserWalletPub;
    const checkUserWalletBal = dbHelper.GetUserWalletBal;
    const checkUserWalletQr = dbHelper.GetUserWalletQR;
    const username = `${message.author}`;
    const userID = username.slice(1, -1);
    const userToCheck = { service: 'discord', user_id: userID };
    const CheckUserPromise = checkUser(userToCheck);






    // checkForUser function returns results and outputs user info to discord
    async function checkForUser(userargs) {
      console.log('hmmm userargs ' + userargs);
      if (userargs != undefined) {
        const uuid = userargs;
        const UUID = uuid.slice(1, -1);
        const utCheck = { service: 'discord', user_id: UUID };
        const CUPromise = checkUser(utCheck);

        console.log('check_usr args: ' + JSON.stringify(utCheck));
        CUPromise.then(function(result) {
          const found = result.user_found;
          console.log('found: ' + found);
          if (found === 'true') {
            // GetAllUserInfo

            const getUserData = dbHelper.CheckUser(utCheck);
            getUserData.then(function(user_data) {
              console.log('user_data: ' + JSON.stringify(user_data));
              const id = result.user_id;
              let banned = result.banned;
              let banned_date = result.banned_date;
              if (!banned) {
                banned = false;
                banned_date = false;
              }
              let opt_out = result.opt_out;
              let opt_out_date = result.optout_date;
              if (!opt_out) {
                opt_out = false;
                opt_out_date = false;
              }
              // console.log('id: ' + id);
              const returnData = { found: 'true', user_id: id };
              const RETURNDATA = JSON.parse(JSON.stringify(returnData));
              // user found, return the results
              // console.log('result\t' + id + ' has been found ' + found);

              const embed = new Discord.MessageEmbed()
                .setColor(0x000000)
                .addField('User_found: ', '`' + found + '`', false)
                .addField('User_id: ', '`' + id + '`', false)
                .addField('signup_date: ', '`' + result.signup_date + '`', false)
                .addField('banned: ', '`' + banned + '`', true)
                .addField('banned_date: ', '`' + banned_date + '`', true)
                // .addField('User_auto_created: ', '`' + result.user_auto_created + '`', false)
                // .addField('Auto_create_date: ', '`' + result.auto_create_date + '`', false)
                .addField('signed_up_from: ', '`' + result.signed_up_from + '`', false)
                .addField('opt_out: ', '`' + opt_out + '`', true)
                .addField('optout_date: ', '`' + opt_out_date + '`', true)
                .addField('User last updated_at: ', '`' + result.updated_at + '`', false)
              message.reply({ embed })
                .then(cfu => cfu.channel.stopTyping())
                .catch(console.error);
              message.react('🇶')
                .then(() => message.react('🇷'))
                .then(() => message.react('🇱'))
                .catch(() => console.error('One of the emojis failed to react.'));
              message.channel.stopTyping(true);
              return RETURNDATA;
            });
          }
          else {
            // user not found
            const returnData = { found: 'false' };
            // console.log('returnData: ' + returnData);
            // console.log('User found:\t' + found);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .addField('User Found:\t', `\`${found}\``);
            message.channel.send({ embed })
              .then(cfu1 => cfu1.channel.stopTyping())
              .catch(console.error);
            message.channel.stopTyping(true);
            return JSON.parse(JSON.stringify(returnData));
          }
        });
        return;
      }


      CheckUserPromise.then(function(result) {
        const found = result.user_found;

        // console.log('found: ' + found);
        if (found == 'true') {
          const id = result.user_id;
          // console.log('id: ' + id);
          const returnData = { found: 'true', user_id: id };
          const RETURNDATA = JSON.parse(JSON.stringify(returnData));
          // user found, return the results
          // console.log('result\t' + id + ' has been found ' + found);
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .addField('User_found: ', `\`${found}\``)
            .addField('User_id: ', `\`${id}\``)
            .addField('User_auto_created: ', `\`${result.user_auto_created}\``)
            .addField('Auto_create_date: ', `\`${result.auto_create_date}\``)
            .addField('signed_up_from: ', `\`${result.signed_up_from}\``)
            .addField('signup_date: ', `\`${result.signup_date}\``)
            .addField('opt_out: ', `\`${result.opt_out}\``)
            .addField('optout_date: ', `\`${result.optout_date}\``)
            .addField('updated_at: ', `\`${result.updated_at}\``);

          message.author.send({ embed })
            .then(cfu => cfu.channel.stopTyping())
            .catch(console.error);
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          // result(result);
          // console.log('##### RETURNDATA #####\n' + 'found: ' + RETURNDATA.found + '\nuser_id: ' + RETURNDATA.user_id);
          message.channel.stopTyping(true);
          return RETURNDATA;
        }
        else {
          // user not found
          const returnData = { found: 'false' };
          // console.log('returnData: ' + returnData);
          // console.log('User found:\t' + found);
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .addField('User Found:\t', `\`${found}\``);
          message.channel.send({ embed })
            .then(cfu1 => cfu1.channel.stopTyping())
            .catch(console.error);
          message.channel.stopTyping(true);
          return JSON.parse(JSON.stringify(returnData));
        }
      });
    }
    async function getUserID() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        // console.log('found = ' + found)
        if (found !== 'true') {
          // user not found
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setDescription('Looks like you are not found.\n`+add` to add and account `+help` for the rest.')
            .addField('User Found:\t', `\`${found}\``);
          message.channel.send({ embed })
            .then(guid => guid.channel.stopTyping())
            .catch(console.error);
          message.channel.stopTyping(true);
          return console.log('error, user not found');
        }
        else {
          const id = check.user_id;
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .addField('User id:\t', `\`${id}\``);
          message.author.send({ embed })
            .then(guid1 => guid1.channel.stopTyping())
            .catch(console.error);
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping(true);
          // return JSON.parse(JSON.stringify(result));
        }
      });
    }
    async function checkUserOptOut() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        // console.log('found = ' + found)
        if (found !== 'true') {
          // user not found
          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setDescription('Looks like you are not found.\n`+add` to add and account `+help` for the rest.')
            .addField('User Found:\t', `\`${found}\``);
          message.author.send({ embed })
            .then(cuoo => cuoo.channel.stopTyping())
            .catch(console.error);
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping(true);
          return console.log('error, user not found');
        }
        const id = check.user_id;
        // console.log('id = ' + id)
        const optoutCheck = { service: 'discord', user_id: id };
        const CheckUserOptOutPromise = checkOptOut(optoutCheck);
        CheckUserOptOutPromise.then(function(result) {
          const opt_out = result.opt_out;
          if (opt_out == 'true') {
            // user opted out
            const optout_date = result.optout_date;
            // console.log('opt_out = ' + opt_out + ' On ' + optout_date);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .addField('User Opt-Out:\t', `\`${opt_out}\``)
              .addField('Opt-Out Date:\t', `\`${optout_date}\``);
            message.author.send({ embed })
              .then(cuoo1 => cuoo1.channel.stopTyping())
              .catch(console.error);
            message.react('🇶')
              .then(() => message.react('🇷'))
              .then(() => message.react('🇱'))
              .catch(() => console.error('One of the emojis failed to react.'));
            return JSON.parse(JSON.stringify(result));
          }
          else {
            // user not opted out
            // console.log('opt_out = ' + opt_out);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .addField('User Opt-Out:\t', `\`${opt_out}\``);
            message.channel.send({ embed })
              .then(cuoo2 => cuoo2.channel.stopTyping())
              .catch(console.error);
            return JSON.parse(JSON.stringify(result));
          }
        });
      });
    }


    // CheckUserSignup
    async function checkUserSignup() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        // console.log('found = ' + found)
        if (found !== 'true') {
          // user not found
          message.reply('Your not found in the System. Try `+add` or `+help`');
          message.channel.stopTyping(true);
          return console.log('error, user not found');
        }
        const id = check.user_id;
        // console.log('id = ' + id)

        const signedupCheck = { user_id: id };
        const CheckUserSignedUpPromise = checkSignedup(signedupCheck);
        CheckUserSignedUpPromise.then(function(result) {
          const user_signup = result.user_signup;
          if (user_signup == 'true') {
            // user opted out
            const signup_date = result.signup_date.slice(0, -14);
            const signup_service = result.signed_up_from;
            // console.log('opt_out = ' + opt_out + ' On ' + optout_date);
            message.author.send('\nYou Signed up on:\n:calendar: `' + signup_date + '` :calendar:\nFrom service:\n`' + signup_service + '`');
            message.react('🇶')
              .then(() => message.react('🇷'))
              .then(() => message.react('🇱'))
              .catch(() => console.error('One of the emojis failed to react.'));
            message.channel.stopTyping();
            return JSON.parse(JSON.stringify(result));
          }
          else {
            // user not opted out
            // console.log('opt_out = ' + opt_out);
            message.author.send('You were automaticaly enrolled when you recieved some tips! To claim them type `+add` or `+help` form more info.');
            message.react('🇶')
              .then(() => message.react('🇷'))
              .then(() => message.react('🇱'))
              .catch(() => console.error('One of the emojis failed to react.'));
            message.channel.stopTyping();
            return JSON.parse(JSON.stringify(result));
          }
        });
      });
    }


    // GetUserWallet


    async function checkUserWalletpub() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        if (found !== 'true') {
          message.reply('Your not found in the System. Try `+add` or `+help`');
          message.channel.stopTyping();
          return console.log('error, user not found');
        }
        const id = check.user_id;
        const userWalletPubCheck = { user_id: id };
        const CheckUserWalletPubPromise = checkUserWalletPub(userWalletPubCheck);
        CheckUserWalletPubPromise.then(function(result) {
          const wallet_pub = result.wallet_pub;
          message.author.send('`' + wallet_pub + '`');
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping();
          return JSON.parse(JSON.stringify(result));
        });
      });
    }
    async function checkUserWalletbal() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        if (found !== 'true') {
          message.reply('Your not found in the System. Try `+add` or `+help`');
          message.channel.stopTyping();
          return console.log('error, user not found');
        }
        const id = check.user_id;
        const userWalletBalCheck = { user_id: id };
        const CheckUserWalletBalPromise = checkUserWalletBal;
        CheckUserWalletBalPromise(userWalletBalCheck).then(function(result) {
          const wallet_bal = result.wallet_bal;
          message.author.send('Your wallet ballance:\n`' + wallet_bal + '`');
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping();
          return JSON.parse(JSON.stringify(result));
        });
      });
    }

    async function checkUserWalletqr() {
      CheckUserPromise.then(function(check) {
        const found = check.user_found;
        if (found !== 'true') {
          message.reply('Your not found in the System. Try `+add` or `+help`');
          message.channel.stopTyping();
          return console.log('error, user not found');
        }
        const id = check.user_id;
        const userWalletQrCheck = { user_id: id };
        const CheckUserWalletQrPromise = checkUserWalletQr(userWalletQrCheck);
        CheckUserWalletQrPromise.then(function(result) {
          console.log('results of the add and search: ' + JSON.stringify(result));
          const newBuff = Buffer.from(result.wallet_qr);
          console.log('Buffer data is now: ' + newBuff);


          const wallet_qr = result.wallet_qr;
          console.log('checkUserWalletqr: ' + newBuff);


          const embed = new Discord.MessageEmbed()
            .setColor(0x000000)
            .setTitle('**TipBot Account Info**')
            .setDescription('Wallet QR attached.')
            .setFooter(`TipBot Donation Address: ${config.bot_details.bot_donationAddress}`)
            .attachFile(newBuff)
            .setImage('attachment://' + result.fileName)

            .addField('For all of my commands:\t', '`+help`');
          message.author.send({ embed })
            .then(() => {
              if (message.channel.type === 'dm') return;
              message.reply('\nYou\'re details are in DM. :thumbsup:');
              message.channel.stopTyping();
            })
            .catch(error => {
              console.error(`Could not send DM to ${message.author.tag}.\n`, error);
              message.reply('Issues with the command! Do you have DMs disabled?');
            });
          // message.author.send('Your wallet QR:\n`' + wallet_qr + '`');
          message.react('🇶')
            .then(() => message.react('🇷'))
            .then(() => message.react('🇱'))
            .catch(() => console.error('One of the emojis failed to react.'));
          message.channel.stopTyping();
          return JSON.parse(JSON.stringify(result));
        });
      });
    }
    //
    // get args and do things
    //


    if (args != undefined) {
      // console.log('args: ' + args);
      if (args[0] === 'user' || args[0] === 'usr') {
        if (args[1] != undefined) {
          checkForUser(args[1]).then(function(result) {
            console.log('result: ' + result);
            message.channel.stopTyping(true);
            return result;
          });
          return;
        }
        checkForUser().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
        message.channel.stopTyping();
      }
      else if (args[0] === 'id') {
        // const { user_id } = GetUserID();
        // console.log('User id');
        getUserID().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
        // console.log(foud + ', ' + user_id);
        message.channel.stopTyping();
        // return console.log('return');
      }
      else if (args[0] === 'optout' || args[0] === 'oo') {
        // const { user_id } = GetUserID();
        // console.log('Opt Out Called');
        checkUserOptOut().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
        // console.log(foud + ', ' + user_id);
        message.channel.stopTyping();
      }
      else if (args[0] === 'signup' || args[0] === 'su') {
        // console.log('Signup');
        checkUserSignup().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
      }
      else if (args[0] === 'walletPub' || args[0] === 'wp') {
        // console.log('Wallet Pub');
        checkUserWalletpub().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
      }
      else if (args[0] === 'walletBal' || args[0] === 'wb') {
        // console.log('Wallet Bal');
        checkUserWalletbal().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
      }
      else if (args[0] === 'walletQR' || args[0] === 'wq') {
        // console.log('Wallet QR');
        checkUserWalletqr().then(function(result) {
          // console.log('result: ' + result);
          return result;
        });
      }
    }
  },
};