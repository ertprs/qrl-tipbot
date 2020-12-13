module.exports = {
  name: 'withdraw',
  description: 'Transfer or withdraw QRL from your TipBot account to a personal wallet.',
  args: false,
  guildOnly: false,
  aliases: ['wd', 'transfer', 'cashout', 'send'],
  usage: '\n__**withdraw** { ***wd***, ***transfer***, ***cashout***, ***send*** }__\nTransfer or withdraw QRL from your TIpBot account to another QRL address.\nRequires amount/all and a QRL address to send to.\n\nExample to transfer all funds from the tipbot wallet: `+transfer all QRLADDRESS`\nExample to transfer an amount of funds: `+transfer 2.01 QRLADDRESS` ',
  execute(message, args) {
    console.log('transfer called...' + JSON.stringify(args));
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const Discord = require('discord.js');
    // const chalk = require('chalk');
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

    // use to send a reply to user with delay and stop typing
    // ReplyMessage(' Check your DM\'s');
    function ReplyMessage(content) {
      message.channel.startTyping();
      setTimeout(function() {
        message.reply(content);
        message.channel.stopTyping(true);
      }, 1000);
    }
    // errorMessage({ error: 'Can\'t access faucet from DM!', description: 'Please try again from the main chat, this function will only work there.' });
    function errorMessage(content, footer = '  .: Tipbot provided by The QRL Contributors :.') {
      message.channel.startTyping();
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

    function withdrawAmount() {
      for (const arg of args) {
        const checkValue = isQRLValue(arg);
        // console.log('isQRLValue/CheckValue: ' + checkValue);
        if(checkValue) {
          return arg;
        }
      }
    }

    function withdrawAddress() {
      for (const arg of args) {
        const checkAddress = isQRLAddress(arg);
        // console.log('isQRLValue/CheckValue: ' + checkValue);
        if(checkAddress) {
          return arg;
        }
      }
    }

    // /////////////////////////////////
    // check that args are not blank. //
    // /////////////////////////////////
    // first args should be all || a number
    // second args should be qrl address

    if ((args[0] == undefined) || (args[1] == undefined)) {
      // if not in private message delete the message
      if(message.guild != null) {
        message.delete();
      }
      errorMessage({ error: 'Incorrect info given...', description: 'Use this function to withdraw funds from the Tipbot. `+help withdraw` for more' });
      // console.log('no args given');
      // Print the warning with instruction to user
      const embed = new Discord.MessageEmbed()
        .setColor(0x000000)
        .setTitle('Transfer From TipBot')
        .setDescription('To transfer or withdraw from the tipbot please provide some details.')
        .addField('Transfer given amount', '`+transfer {AMOUNT} {QRLADDRESS}`')
        .addField('Transfer entire balance', '`+transfer all {QRLADDRESS}`')
        .addField('To donate to the TipBot Faucet', '`+transfer all ' + config.bot_details.bot_donationAddress + '`');
      message.author.send({ embed })
        .then(() => {
          message.channel.stopTyping(true);
          if (message.channel.type === 'dm') return;
          // message.reply('I\'ve sent you a DM. ');
        })
        .catch(error => {
          // console.error(chalk.red(`Could not send help DM to ${message.author.tag}.\n`), error);
          errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
          return;
        });
      return;
    }


    const transfer_to = withdrawAddress();
    const trans_amt = withdrawAmount();
    // //////////////////////
    // look for user in DB //
    // //////////////////////
    //
    // If found will return { user_found, wallet_pub, wallet_bal, user_id, user_name, opt_out, otpout_date }
    found.then(function(result) {
      // console.log('found results: ' + JSON.stringify(result));
      const UserFound = result[0].user_found;
      if (UserFound !== 'true') {
        // console.log('user found ' + UserFound);
        // user is not in the system, fail and return to user
        // if not in private message delete the message
        if(message.guild != null) {
          message.delete();
        }
        errorMessage({ error: 'User Not Found...', description: 'You are not signed up yet!. `+add` to get started.' });
        return;
      }
      else {
        // set known values from getAllUserInfo search
        const user_id = result[0].user_id;
        const wallet_pub = result[0].wallet_pub;
        const wallet_bal = result[0].wallet_bal;
        const shor_bal = wallet_bal * toShor;


        const fee = config.wallet.tx_fee * toShor;

        // check for address
        if (!transfer_to) {
          // if not in private message delete the message
          if(message.guild != null) {
            message.delete();
          }
          errorMessage({ error: 'Invalid Address...', description: 'Invalid QRL address given, starts with a `Q`. Please try again.' });
          return;
        }
        // check for user address
        if (transfer_to === wallet_pub) {
          // user sending to self.. fail and return to the user
          // if not in private message delete the message
          if(message.guild != null) {
            message.delete();
          }
          errorMessage({ error: 'User Address Detected...', description: 'You cannot send funds to yourself. Please transfer ***out*** of the TipBot.' });
          return;
        }

        if ( args[0] === 'all' || args[1] === 'all') {
          console.log('all called')
        if (!trans_amt) {
          // if not in private message delete the message
          if(message.guild != null) {
            message.delete();
          }
          errorMessage({ error: 'No Amount Given...', description: 'You must give an amount to withdraw or `all` to clean out the address. `+help withdraw` for more.' });
          return;
        }
        }
        // check for balance in wallet
        if (shor_bal <= 0 || shor_bal < trans_amt) {
          // wallet is empty, give error and return
          // if not in private message delete the message
          if(message.guild != null) {
            message.delete();
          }
          errorMessage({ error: 'Lacking Enough Funds...', description: 'You need more quanta for that transaction, `+bal` for your current balance.' });
          return;
        }

        // transfer all funds called.
        if (args[0] == 'all' || args[1] == 'all' || args[2] == 'all') {
          // transfer all the funds
          // if not in private message delete the message
          if(message.guild != null) {
            message.delete();
            ReplyMessage('Sending your transaction to the blockchain, I\'ll be right back...');
          }
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
            message.channel.send('Funds have been sent! ' + message.author.toString() + '  details are in your DM\'s.\n*It may take a bit for the transaction to confirm.*');
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('Funds Transfered')
              .setDescription('Your transaction has posted on the network. It may take a few minuets to confirm, see the transaction info in the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + tx_hash + '). Until the transaction confirms on the chain, you will still see a balance in your wallet. Please be patient as all good things take time')
              .addField('Transfer amount', '**' + transfer_amt / toShor + '**')
              .addField('Transfer fee', '**' + config.wallet.tx_fee + '**')
              .addField('Transfer To Address', '**[' + transfer_to + '](' + config.bot_details.explorer_url + '/a/' + transfer_to + ')**')
              .addField('Transaction Hash', '**[' + tx_hash + '](' + config.bot_details.explorer_url + '/tx/' + tx_hash + ')**')
              .setFooter('The TX Fee is taken from the transfer amount and set by the bot owner. \nThe current fee is set to ' + config.wallet.tx_fee + ' QRL');
            message.author.send({ embed })
              .then(() => {
                if (message.channel.type !== 'dm') return;
                message.channel.stopTyping(true);
              })
              .catch(error => {
                // console.error(chalk.red(`Could not send help DM to ${message.author.tag}.\n`), error);
                errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
              });
          });
          return;
        }
        else {
          // transfer amount given, do some checks and send
          // check that amount is correct value
          if (!trans_amt) {
            // if not in private message delete the message
            if(message.guild != null) {
              message.delete();
            }
            errorMessage({ error: 'Invalid Amount Given...', description: 'You need to give a valid amount to tip. `+help tip` for more info.' });
            return;
          }
          const trans_amt_shor = trans_amt * toShor;
          const total_transfer = Math.round(trans_amt_shor - fee);
          // check if amount is equal or less than bal
          // console.log('transfer Details. trans_amt :' + trans_amt + ' trans_amt_shor: ' + trans_amt_shor + ' total_transfer: ' + total_transfer);
          if (total_transfer > shor_bal) {
            // more than user has
            // if not in private message delete the message
            if(message.guild != null) {
              message.delete();
            }
            errorMessage({ error: 'Lacking Enough Funds...', description: 'You need more quanta for that transaction, `+bal` for your current balance.' });
            message.author.send('You are trying to send more QRL than you have. Your current balance is: **' + wallet_bal + '**')
              .catch(error => {
                errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });

              // deleteMessage();
              });
            return;
          }
          // user has given good info and not 'all' selected to transfer. Send the amount given to user defined address
          // if not in private message delete the message
          if(message.guild != null) {
            message.delete();
          }
          // message.reply('Sending your transaction to the blockchain, I\'ll be right back...');
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


            message.channel.stopTyping(true);
            const embed = new Discord.MessageEmbed()
              .setColor(0x000000)
              .setTitle('Funds Transfered')
              .setDescription('Your transaction has posted on the network. It may take a few minuets to confirm, see the transaction info in the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + tx_hash + '). Until the transaction confirms on the chain, you will still see a balance in your wallet. Please be patient as all good things take time')
              .addField('Transfer amount', '**' + total_transferQuanta + '**')
              .addField('Transfer fee', '**' + config.wallet.tx_fee + '**')
              .addField('Transfer To Address', '**[' + transfer_to + '](' + config.bot_details.explorer_url + '/a/' + transfer_to + ')**')
              .addField('Transaction Hash', '**[' + tx_hash + '](' + config.bot_details.explorer_url + '/tx/' + tx_hash + ')**')
              .setFooter('The TX Fee is taken from the transfer amount and set by the bot owner. \nThe current fee is set to ' + config.wallet.tx_fee + ' QRL');
            message.author.send({ embed })
              .then(() => {
                message.channel.stopTyping(true);
                if (message.channel.type !== 'dm') {
                  ReplyMessage('Funds have been sent! Details are in your DM\'s.\n*It may take a bit for the transaction to confirm.*');
                  // return;
                }
              })
              .catch(error => {
                // console.error(chalk.red(`Could not send help DM to ${message.author.tag}.\n`), error);
                errorMessage({ error: 'Direct Message Disabled', description: 'It seems you have DM\'s blocked, please enable and try again...' });
              });
          });
          return;
        }
      }
    });
  },
};