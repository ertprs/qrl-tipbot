module.exports = {


  // WRITE TO THE TRANSACTIONS DATABASE!!!!


  name: 'withdraw',
  description: 'Withdraw QRL from your TipBot account to a QRL wallet.',
  args: false,
  guildOnly: false,
  aliases: ['wd', 'transfer', 'cashout', 'Withdraw', 'WD', 'extract'],
  usage: '\n__**withdraw** { ***wd***, ***transfer***, ***cashout***, ***send*** }__\nTransfer or withdraw QRL from your TIpBot account to another QRL address.\nRequires amount/all and a QRL address to send to.\n\nExample to transfer all funds from the tipbot wallet: `+transfer all QRLADDRESS`\nExample to transfer an amount of funds: `+transfer 2.01 QRLADDRESS` ',
  execute(message, args) {
    // console.log('transfer called...' + JSON.stringify(args));
    const dbHelper = require('../../db/dbHelper');
    const wallet = require('../../qrl/walletTools');
    const config = require('../../../_config/config.json');
    const Discord = require('discord.js');
    // const chalk = require('chalk');
    // const checkuser = dbHelper.CheckUser;
    // const getAllUserInfo = dbHelper.GetAllUserInfo;

    // const wdDB = dbHelper.withdraw;

    // const transfer = wallet.sendQuanta;
    // discord user id uuid is then striped of extra chars as UUID
    const uuid = `${message.author}`;
    const UUID = uuid.slice(1, -1);

    // const info = JSON.parse(JSON.stringify({ service: 'discord', service_id: UUID }));
    // const found = checkuser(info);
    // const found = getAllUserInfo(info);

    const toShor = 1000000000;
    const lowestWDValue = 0.000000001;
    const highestWDValue = 105000000;

    let userFound = false;
    let userAgree = false;
    let userOptOut = true;
    let transfer_to = '';
    let trans_amt = '';
    // const user_id = '';
    let wallet_pub = '';
    let wallet_bal = '';
    // let shor_bal = '';
    const fee = config.wallet.tx_fee * toShor;
    const amtArray = [];
    const addressArray = [];
    const userArray = [];
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
        if(str >= lowestWDValue && str <= highestWDValue) {
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


    function withdrawAmount(balance) {
      for (const arg of args) {
        const checkValue = isQRLValue(arg);
        // console.log('isQRLValue/CheckValue: ' + checkValue);

        if(checkValue) {
          console.log('Valid amount given: ' + arg);
          return arg;
        }
        else if (arg === 'all') {
          console.log('all called, transfer full balance: ' + balance);
          return balance;
        }
      }
      // no valid amoutn given, return none
      return 0;
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

    // Get user info.
    async function getUserInfo(usrInfo) {
      return new Promise(resolve => {
        const data = dbHelper.GetAllUserInfo(usrInfo);
        resolve(data);
      });
    }

    // send the tx data to the transactiosn database
    async function transactionsDBWrite(txArgs) {
      return new Promise(resolve => {
        // {tip_id: fromTipDB, tx_hash: fromTX_HASH}
        // console.log('args futureTipInfo' + JSON.stringify(args));
        const txInfo = { tip_id: txArgs.withdraw_id, tx_hash: txArgs.tx_hash };
        const wdTxEntry = dbHelper.addTransaction(txInfo);
        resolve(wdTxEntry);
      });
    }
    // send the withdraw data to the withdraw database
    async function withdrawDBWrite(txArgs) {
      return new Promise(resolve => {
        // {service: 'discord', user_id: , tx_hash:, to_address:, amt: }
        // console.log('args futureTipInfo' + JSON.stringify(args));
        const txInfo = { service: 'discord', user_id: txArgs.user_id, tx_hash: txArgs.tx_hash, to_address: txArgs.to_address, amt: txArgs.amt };
        const wdDbEntry = dbHelper.withdraw(txInfo);
        resolve(wdDbEntry);
      });
    }
    // send the funds
    async function sendFunds(sendArgs) {
      return new Promise(resolve => {
        // console.log('args info' + JSON.stringify(info));
        const send = wallet.sendQuanta(sendArgs);
        resolve(send);
      });
    }
    // ########################################################
    //  Checks...
    // ########################################################
    async function commandChecks() {
      // ########################################################
      // Check args are not blank, as we need args to function
      if ((args[0] == undefined) || (args[1] == undefined)) {
        errorMessage({ error: 'Incorrect info given...', description: 'Use this function to withdraw funds from the Tipbot. `+help withdraw` for more' });
        return false;
      }
      // ########################################################
      // Check for user in system, agree, opt out?
      const userInfo = await getUserInfo({ service: 'discord', service_id: UUID });
      console.log('userInfo:' + JSON.stringify(userInfo));
      // ########################################################
      // is user found?
      if (userInfo[0].user_found) {
        userFound = true;
        console.log('userFound: ' + userFound);
      }
      else {
        // fail on error
        console.log('userFound: ' + userFound);
        errorMessage({ error: 'User Not Found...', description: 'You are not signed up yet!. `+add` to get started.' });
        return;
      }
      // ########################################################
      // has user agreed
      if (userInfo[0].user_agree) {
        console.log('user has agreed.');
        userAgree = true;
      }
      else {
        // fail on error
        console.log('userAgree: ' + userAgree);
        errorMessage({ error: 'User Has Not Agreed...', description: 'You must agree to the terms and conditions. `+terms` to read them.' });
        return false;
      }
      // ########################################################
      // has user opted out
      if (!userInfo[0].opt_out) {
        console.log('user has not opted out.');
        userOptOut = false;
      }
      else {
        // fail on error
        console.log('userOptOut: ' + userOptOut);
        errorMessage({ error: 'User Has Opted Out...', description: 'You have previously opted out of th etipbot. Enter `+opt-in` to start using the tipbot.' });
        return false;
      }

      transfer_to = withdrawAddress();
      console.log('transfer_to: ' + transfer_to);
      // ########################################################
      // incorrect address
      if (!transfer_to) {
        // transfer address not given or incorrrect
        console.log('Incorrect Address Given...');
        errorMessage({ error: 'Incorrect Address Given...', description: 'Please enter a correct QRL Address. To donate to the bot use\n `+wd all ' + config.faucet.faucet_wallet_pub });
        return false;
      }

      wallet_pub = userInfo[0].wallet_pub;
      console.log('wallet_pub: ' + wallet_pub);
      // ########################################################
      // check for user address in wd cmd, cant send to self
      if (transfer_to === wallet_pub) {
        // user sending to self.. fail and return to the user
        console.log('User Address Detected');
        errorMessage({ error: 'User Address Detected...', description: 'You cannot send funds to yourself. Please transfer ***out*** of the TipBot.' });
        return false;
      }

      wallet_bal = userInfo[0].wallet_bal;
      console.log('wallet_bal: ' + wallet_bal);
      // ########################################################
      // wallet is flat
      if (wallet_bal === 0) {
        // Wallet Balance is Flat
        console.log('Wallet Balance is Flat');
        errorMessage({ error: 'Wallet Balance is Flat...', description: 'You don\'t have any funds to withdraw. Get a tip or try the faucet `+drip`' });
        return false;
      }

      trans_amt = await withdrawAmount(wallet_bal);
      trans_amt = trans_amt * toShor;
      console.log('trans_amt: ' + trans_amt);
      const wd_amt = trans_amt - fee;
      // console.log('wd_amt: ' + wd_amt);
      amtArray.push(wd_amt);
      addressArray.push(transfer_to);
      // ########################################################
      // incorrect info in the transfer command
      if (trans_amt === 0) {
        // no transfer or incorrect tranfer amount given
        console.log('Invalid Transfer amount given');
        errorMessage({ error: 'Invalid Amount Given...', description: 'Please enter a valid number to withdraw or `+transfer all {QRL-ADDRESS}`.' });
        return false;
      }
      // ########################################################
      // wallet balance is less than balance
      if ((wallet_bal - fee) < trans_amt) {
        // trying to send more than you have
        console.log('Wallet Balance is less than withdraw amt');
        errorMessage({ error: 'Wallet Balance Is Less Than Withdraw...', description: 'You Don\'t have enough finds for that, check you `+bal` and try again.' });
        return false;
      }

      const pending = userInfo[0].pending;
      console.log('pending: ' + pending);
      const pendingBal = Number(wallet_bal) - Number(pending);
      console.log('pendingBal: ' + pendingBal);
      const appendedBal = pendingBal - wd_amt;
      console.log('appendedBal: ' + appendedBal);
      // ########################################################
      // Pending balance is less than wd amt
      if (appendedBal <= 0) {
        // pending balance is less than attempted withdraw
        console.log('Pending Balance is less than withdraw amt');
        errorMessage({ error: 'Pending Balance Is Less Than Withdraw...', description: 'You Don\'t have enough finds for that after all transactions clear, check you `+bal` and try again.' });
        return false;
      }
      // ########################################################
      // user passed checks. return true
      userArray.push(userInfo);
      const returnArray = [{ check: true, amtArray: amtArray, addressArray: addressArray }];
      return returnArray;
    }


    async function main() {
      // run commandChecks and fail if not successful
      const check = await commandChecks();
      console.log('check: ' + check[0].check);
      if (!check[0].check) {
        // the check command failed
        console.log('Check failed...');
        return;
      }

      // check passed, do stuff

      const transferInfo = { address_to: check[0].addressArray, amount: check[0].amtArray, fee: fee, address_from: userArray[0].wallet_pub };
      const transferFunds = await sendFunds(transferInfo);
      console.log('transferFunds: ' + JSON.stringify(transferFunds));

      const wdDbWrite = await withdrawDBWrite({ user_id: userArray[0].user_id, tx_hash: transferFunds.tx_hash, to_address: check[0].addressArray, amt: check[0].amtArray });
      console.log('wdDbWrite: ' + JSON.stringify(wdDbWrite));


      const txDbWrite = await transactionsDBWrite({ tip_id: wdDbWrite.insertId, tx_hash: transferFunds.tx_hash });
      console.log('txDbWrite: ' + JSON.stringify(txDbWrite));


    }


    main().then(function(returnToUser) {
      console.log('returnToUser: ' + returnToUser);
      ReplyMessage('Withdraw has been sent, please see you DM for details');
    });

  },
};