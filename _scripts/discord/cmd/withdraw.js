module.exports = {
  name: 'withdraw',
  description: 'Transfer or withdraw QRL from your TipBot account to a personal wallet.',
  args: false,
  guildOnly: false,
  aliases: ['wd', 'transfer', 'cashout'],
  usage: '\n__**withdraw** { ***wd***, ***transfer***, ***cashout*** }__\nTransfer or withdraw QRL from your TIpBot account to another QRL address.\n`+transfer 2 QRLADDRESS`',
  execute(message, args) {
    // console.log('transfer called...' + JSON.stringify(args));
    // if not in private message delete the message
    if(message.guild != null) {
      //message.delete();
    }
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const Discord = require('discord.js');
    const chalk = require('chalk');
    // const checkuser = dbHelper.CheckUser;
    const getAllUserInfo = dbHelper.GetAllUserInfo;
    const wdDB = dbHelper.withdraw;
    const transfer = wallet.sendQuanta;
    // discord user id uuid is then striped of extra chars as UUID
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    const info = JSON.parse(JSON.stringify({ service: 'discord', service_id: UUID }));
    // const found = checkuser(info);
    const found = getAllUserInfo(info);
    const toShor = 1000000000;
    const lowestTipValue = 0.000000001;
    const highestTipValue = 105000000;

    function isQRLValue(str) {
      // Fail immediately.
      let test = false;
      // Check if it's only numeric and periods (no spaces, etc)
      if(/^[0-9]{0,8}[.]?[0-9]{0,9}$/.test(str)) {
        // And check for a value between 0.000000001 and 105000000
        if(str >= lowestTipValue && str <= highestTipValue) {
          test = true;
        }
      }
      return test;
    }

    // test the address to the regex pattern
    function isQRLAddress(addy) {
      let test = false;
      if(/^(Q|q)[0-9a-fA-f]{78}$/.test(addy)) {
        test = true;
      }
      return test;
    }
    // check that args are not blank. first args should be all || a number
    // second args should be qrl address
    if ((args[0] == undefined) || (args[0] == message.mentions.users.first() && args [1] == undefined) || (args[0] == message.mentions.users.first() && args[2] == undefined)) {
      message.channel.startTyping();
      message.reply('Incorrect info given, please check your DM\'s')
      // console.log('no args given');
      const embed = new Discord.MessageEmbed()
        .setColor(0x000000)
        .setTitle('Transfer From TipBot')
        .setDescription('To transfer or withdraw from the tipbot please provide some details.')
        .addField('Transfer given amount', '`+transfer {AMOUNT} {QRLADDRESS}`')
        .addField('Transfer entire balance', '`+transfer all {QRLADDRESS}`')
        .addField('To donate to the TipBot', '`+transfer all ' + config.bot_details.bot_donationAddress + '`');
      message.author.send({ embed })
        .then(() => {
          message.channel.stopTyping(true);
          if (message.channel.type === 'dm') return;
          // message.reply('I\'ve sent you a DM. ');
        })
        .catch(error => {
          message.channel.startTyping();
          console.error(chalk.red(`Could not send help DM to ${message.author.tag}.\n`), error);
          setTimeout(function() {
            message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
            message.channel.stopTyping(true);
          }, 1000);

          return;
        });
      return;
    }
    // look for user in DB
    // If found will return { user_found, wallet_pub, wallet_bal, user_id, user_name, opt_out, otpout_date }
    found.then(function(result) {
      // console.log('found results: ' + JSON.stringify(result));
      const UserFound = result[0].user_found;
      if (UserFound !== 'true') {
        // console.log('user found ' + UserFound);
        // user is not in the system, fail and return to user
        message.channel.startTyping();
        setTimeout(function() {
          message.author.send('You are not signed up yet!. `+add` to get started.');
          message.channel.stopTyping(true);
        }, 1000);
        return;
      }
      else {
        console.log('message.mentions.members.first() ' + '<@!' + message.mentions.members + '>')
        const botUser = '<@!' + message.mentions.members.first() + '>';
        // because we can either enter '+wd' or '@bot wd' we need to check for values in args...
        if (args[0] === botUser) {
          // the bot was mentioned first, shift all args to next number up...
        const transfer_to = args[2];
        return transfer_to;
        }
        else {
          const transfer_to = args[1];
          return transfer_to;
        }

        // set known values from getAllUserInfo search
        const user_id = result[0].user_id;
        const wallet_pub = result[0].wallet_pub;
        const wallet_bal = result[0].wallet_bal;
        const shor_bal = wallet_bal * toShor;
        // const user_name = result[0].user_name;
        const fee = config.wallet.tx_fee * toShor;
        // check for valid qrl address given as args[1]
        message.channel.startTyping();
        if (args[1] === wallet_pub || args[2] === wallet_pub) {
          // user sending to self.. fail and return to the user
          message.channel.startTyping();
          setTimeout(function() {
            message.reply('You cannot send funds to yourself. Please transfer out of the TipBot.');
            message.channel.stopTyping(true);
          }, 1000);
          return;
        }

        const addressTest = isQRLAddress(transfer_to);
        if (!addressTest) {
          message.channel.startTyping();
          setTimeout(function() {
            message.author.send('Invalid address given. Please try again.');
            message.channel.stopTyping(true);
          }, 1000);
          return;
        }
        // check for balance in wallet
        if (shor_bal <= 0) {
          // wallet is empty, give error and return
          message.channel.startTyping();
          setTimeout(function() {
            message.reply('No funds in your account.');
            message.channel.stopTyping(true);
          }, 1000);
          return;
        }
        // transfer all funds called.
        if (args[0] == 'all') {
          // transfer all the funds
          const transArray = [];
          const addressArray = [];
          const transfer_amt = Math.round(shor_bal - fee);
          transArray.push(transfer_amt);
          addressArray.push(transfer_to);
          const transferInfo = { address_to: addressArray, amount: transArray, fee: fee, address_from: wallet_pub };
          // console.log('transferInfo ' + JSON.stringify(transferInfo));
          transfer(transferInfo).then(function(transferQrl) {
            // console.log('transferQrl: ' + JSON.stringify(transferQrl));
            const transferOutput = JSON.parse(transferQrl);
            const tx_hash = transferOutput.tx.transaction_hash;
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('Funds Transfered')
              .setDescription('Your transaction has posted on the network. It may take a few minuets to confirm, see the transaction info in the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + tx_hash + '). Until the transaction confirms on the chain, you will still see a balance in your wallet. Please be patient as all good things take time')
              .addField('Transfer amount', '**' + transfer_amt / toShor + '**')
              .addField('Transfer fee', '**' + config.wallet.tx_fee + '**')
              .addField('Transfer To Address', '** ' + transfer_to + '**')
              .setFooter('The TX Fee is taken from the transfer amount and set by the bot owner. \nThe current fee is set to ' + config.wallet.tx_fee + ' QRL');
            message.author.send({ embed })
              .then(() => {
                if (message.channel.type !== 'dm') return;
                message.channel.stopTyping(true);
              })
              .catch(error => {
                console.error(chalk.red(`Could not send help DM to ${message.author.tag}.\n`), error);
                message.channel.startTyping();
                setTimeout(function() {
                  message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
                  message.channel.stopTyping(true);
                }, 1000);
              });
          });
          return;
        }
        else {
          // transfer amount given, do some checks and send
          // check that amount is correct value
          const trans_amt = args[0];
          const testQRLValue = isQRLValue(trans_amt);
          if (!testQRLValue) {
            message.channel.startTyping();
            setTimeout(function() {
              message.reply('Invalid amount. Please try again.');
              message.channel.stopTyping(true);
            }, 1000);
            return;
          }
          const trans_amt_shor = trans_amt * toShor;
          const total_transfer = Math.round(trans_amt_shor - fee);
          // console.log('trans_amt: ' + trans_amt + ' trans_amt_shor: ' + trans_amt_shor + ' total_transfer: ' + total_transfer);
          // check if amount is equal or less than bal
          // console.log('transfer Details. trans_amt :' + trans_amt + ' trans_amt_shor: ' + trans_amt_shor + ' total_transfer: ' + total_transfer);
          if (total_transfer > shor_bal) {
            // more than user has
            message.channel.startTyping();
            setTimeout(function() {
              message.author.send('You\'re trying to transfer more QRL than you have.\nCurrent balance: **' + wallet_bal + '**');
              message.channel.stopTyping(true);
            }, 1000);
            return;
          }
         // async function transferAmt() {
            const totalTransArray = [];
            const addressToArray = [];
            totalTransArray.push(total_transfer);
            addressToArray.push(transfer_to);
            const transferInfo = { address_to: addressToArray, amount: totalTransArray, fee: fee, address_from: wallet_pub };
              // console.log('transferInfo ' + JSON.stringify(transferInfo));
              transfer(transferInfo).then(function(transferQrl) {
                const transferOutput = JSON.parse(transferQrl);
                // console.log(chalk.cyan('transferQRL output: ') + chalk.bgGreen.black(JSON.stringify(transferQrl)));
                const tx_hash = transferOutput.tx.transaction_hash;
                const total_transferQuanta = total_transfer / toShor;
                const wdDBInfo = { service: 'discord', user_id: user_id, tx_hash: tx_hash, to_address: transfer_to, amt: total_transferQuanta };
                wdDB(wdDBInfo);
                const embed = new Discord.MessageEmbed()
                  .setColor(0x000000)
                  .setTitle('Funds Transfered')
                  .setDescription('Your transaction has posted on the network. It may take a few minuets to confirm, see the transaction info in the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + tx_hash + ')')
                  .addField('Transfer amount', '**' + total_transferQuanta + '**')
                  .addField('Transfer fee', '**' + config.wallet.tx_fee + '**')
                  .addField('Transfer To Address', '** ' + transfer_to + '**')
                  .setFooter('The TX Fee is taken from the transfer amount and set by the bot owner. Current fee is set to ' + config.wallet.tx_fee);
                message.author.send({ embed })
                  .then(() => {
                    message.channel.stopTyping(true);
                    if (message.channel.type !== 'dm') return;
                  })
                  .catch(error => {
                    console.error(chalk.red(`Could not send help DM to ${message.author.tag}.\n`), error);
                    message.channel.startTyping();
                    setTimeout(function() {
                      message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
                      message.channel.stopTyping(true);
                    }, 1000);
                  });
              });
            return;
        }
      }
    });
  },
};