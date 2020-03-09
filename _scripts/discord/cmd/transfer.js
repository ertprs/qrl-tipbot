module.exports = {
  name: 'transfer',
  description: 'Transfer or withdraw QRL from your TipBot account to a personal wallet.',
  args: false,
  guildOnly: false,
  aliases: ['wd', 'withdraw', 'cashout'],
  usage: '\n__**transfer** { ***wd***, ***withdraw***, ***cashout*** }__\nTransfer or withdraw QRL from your TIpBot account to another QRL address.\n`+transfer 2 QRLADDRESS`',

  execute(message, args) {
    message.channel.startTyping();
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const Discord = require('discord.js');
    const checkuser = dbHelper.CheckUser;
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);
    const info = JSON.parse(JSON.stringify({ service: 'discord', user_id: UUID }));
    const found = checkuser(info);
    if(message.guild != null) {
      // delete the users message and give response
      message.delete();
    }
    if (args[0] == undefined || args [1] == undefined) {
      const embed = new Discord.RichEmbed()
        .setColor(0x000000)
        .setTitle('Transfer From TipBot')
        .setDescription('To transfer or withdraw from the tipbot I need some details.')
        .addField('Transfer given amount', '`+transfer {AMOUNT} {QRLADDRESS}`')
        .addField('Transfer entire balance', '`+transfer all {QRLADDRESS}`')
        .addField('To donate to the TipBot', '`+transfer all ' + config.bot_details.bot_donationAddress + '`');
      message.author.send({ embed })
        .then(() => {
          message.channel.stopTyping(true);
          if (message.channel.type === 'dm') return;
          message.reply('I\'ve sent you a DM. ');
        })
        .catch(error => {
          message.channel.stopTyping(true);
          console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
          message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
          return;
        });
      return;
    }
    // look for user in DB
    found.then(function(result) {
      const UserFound = result.user_found;
      if (UserFound !== 'true') {
        // user is not in the system, fail and return to user
        message.reply('You are not signed up yet!. `+add` to get started.');
        message.channel.stopTyping(true);
        return;
      }
      else {
        const user_id = result.user_id;
        // get user balance and subtract ammount to transfer from balance and fee.
        const walletBal = dbHelper.GetUserWalletBal;
        walletBal({ user_id: user_id }).then(function(BalResult) {
          const wallet_bal = BalResult.wallet_bal;
          if (wallet_bal < 0) {
            // wallet is empty, give error and return
            message.channel.stopTyping(true);
            message.reply('No funds to transfer, your TipBot balance is: **' + wallet_bal + '**');
            return;
          }
          // do maths on the transaction
          const fee = config.wallet.tx_fee * 1000000000;
          const trans_amt = args[0] * 1000000000;
          const transfer_to = args[1];
          const total_transfer = (trans_amt - fee);
          if (trans_amt > (wallet_bal * 1000000000)) {
            // more than user has
            message.channel.stopTyping(true);
            message.reply('You\'re trying to transfer more QRL than you have.\nCurrent balance: **' + wallet_bal + '**');
            return;
          }
          message.channel.stopTyping(true);
          message.author.send('I\'m sending that transaction, usually takes about 2 minuets to complete. I\'ll ping you when I\'m done.');
          // user has enough funds, calculate the fee and transfer funds
          // get user address to send from
          const Getwallet_pub = dbHelper.GetUserWalletPub;
          Getwallet_pub({ user_id: user_id }).then(function(pub) {
            const wallet_pub = pub.wallet_pub;
            if (args[0] == 'all') {
              // transfer all the funds
              const shor_bal = wallet_bal * 1000000000;
              const transfer_amt = (shor_bal - fee);
              const transferInfo = { address_to: transfer_to, amount: transfer_amt, fee: fee, address_from: wallet_pub };
              const transfer = wallet.sendQuanta;
              transfer(transferInfo).then(function(transferQrl) {
                const transferOutput = JSON.parse(transferQrl);
                const tx_hash = transferOutput.tx.transaction_hash;
                const embed = new Discord.RichEmbed()
                  .setColor(0x000000)
                  .setTitle('Funds Transfered')
                  .setDescription('Your transaction has posted on the network. It may take a few minuets to confirm, see the transaction info in the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + tx_hash + ')')
                  .addField('Transfer amount', '**' + transfer_amt / 1000000000 + '**')
                  .addField('Transfer fee', '**' + config.wallet.tx_fee + '**')
                  .addField('Transfer To Address', '** ' + transfer_to + '**')
                  .setFooter('The TX Fee is taken from the transfer amount and set by the bot owner. \nThe current fee is set to ' + config.wallet.tx_fee + ' QRL');
                message.author.send({ embed })
                  .then(() => {
                    if (message.channel.type !== 'dm') return;
                    message.reply('I\'ve sent you a DM. ');
                    message.channel.stopTyping(true);
                  })
                  .catch(error => {
                    console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                    message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
                    message.channel.stopTyping(true);
                  });
                  message.channel.stopTyping(true);
                return;
              });
            }
            // transfer the funds
            const transferInfo = { address_to: transfer_to, amount: total_transfer, fee: fee, address_from: wallet_pub };
            const transfer = wallet.sendQuanta;
            transfer(transferInfo).then(function(transferQrl) {
              const transferOutput = JSON.parse(transferQrl);
              const tx_hash = transferOutput.tx.transaction_hash;
              const embed = new Discord.RichEmbed()
                .setColor(0x000000)
                .setTitle('Funds Transfered')
                .setDescription('Your transaction has posted on the network. It may take a few minuets to confirm, see the transaction info in the [QRL Block Explorer](' + config.bot_details.explorer_url + '/tx/' + tx_hash + ')')
                .addField('Transfer amount', '**' + total_transfer / 1000000000 + '**')
                .addField('Transfer fee', '**' + config.wallet.tx_fee + '**')
                .addField('Transfer To Address', '** ' + transfer_to + '**')
                .setFooter('The TX Fee is taken from the transfer amount and set by the bot owner. Current fee is set to ' + config.wallet.tx_fee);
              message.author.send({ embed })
                .then(() => {
                  if (message.channel.type !== 'dm') return;
                  message.reply('I\'ve sent you a DM. ');
                  message.channel.stopTyping(true);
                })
                .catch(error => {
                  console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                  message.reply('It seems like I can\'t DM you! Do you have DMs disabled?');
                  message.channel.stopTyping(true);
                });
              message.channel.stopTyping(true);
            });
          });
        });
      }
    });
  },
};