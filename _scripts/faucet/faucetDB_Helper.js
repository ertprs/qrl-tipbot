'use strict';
const mysql = require('mysql');
const config = require('../../_config/config.json');
const wallet = require('../qrl/walletTools');

// connector to the database
const callmysqlFaucet = mysql.createPool({
  connectionLimit: 10,
  host: `${config.faucet_db.db_host}`,
  user: `${config.faucet_db.db_user}`,
  password: `${config.faucet_db.db_pass}`,
  database: `${config.faucet_db.db_name}`,
});

const callmysqlTipBot = mysql.createPool({
  connectionLimit: 10,
  host: `${config.database.db_host}`,
  user: `${config.database.db_user}`,
  password: `${config.database.db_pass}`,
  database: `${config.database.db_name}`,
});

async function Drip(args) {
  // send a payment request to the faucet for users address.
  // expects { service: service, user_id: user_id, wallet_pub: wallet_pub, amount: amount}
  if (args == null) {
    console.log('No args given to DRIP:');
    return;
  }
  console.log('args into Drip function: ' + JSON.stringify(args));
  // check for user in the faucet database
  const userid_searchDB = 'SELECT users.id AS user_id FROM users INNER JOIN ' + args.service + '_users ON users.discord_user_id = ' + args.service + '_users.id WHERE ' + args.service + '_users.' + args.service + '_id = "' + args.input_user_id + '"';
  callmysqlTipBot.query(userid_searchDB, function(err, result) {
    if (err) {
      console.log('[mysql error]', err);
    }
    if (result.length !== 'true') {
      // user not found, nothing returned
      console.log('user not found in search, something is wrong');
      return;
    }
    const user_id = result.user_id;
    // check for opt-out and fail if found...
    const optout_searchDB = 'SELECT users.id AS user_id, users.' + args.service + '_user_id AS ' + args.service + '_id, users_info.opt_out AS opt_out, users_info.optout_date AS optout_date FROM users INNER JOIN users_info ON users.id = users_info.user_id WHERE users_info.user_id = "' + user_id + '"';
    callmysqlTipBot.query(optout_searchDB, function(err, optout) {
      if (err) {
        console.log('[mysql error]', err);
      }
      if (optout.opt_out == 'true') {
        // user opted out
        console.log('user opted out. no drip');
        return;
      }
      // check for last drip and fail if less than time in config file since last drip
      const time_now = new Date();
      const one_hour = 60 * 60 * 1000;
      const compair_time = time_now - (config.faucet.payout_interval * one_hour);
      const lastDrip_DBcheck = 'SELECT * FROM  ';

      console.log('user has met conditions, get address and drip away\n... add the user to the payout db');
      // lookup the wallet address of the user
      const wallet_searchDB = 'SELECT wallets.wallet_pub FROM users INNER JOIN wallets ON users.id = wallets.user_id WHERE wallets.user_id = "' + user_id + '"';
      // console.log('GetUserWalletPub searchDB\t' + searchDB);
      callmysqlTipBot.query(wallet_searchDB, function(err, wallet_result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        const wallet_pub = wallet_result;
        console.log('users wallet_pub: ' + wallet_pub);

        // send config.faucet.payout amount to the users wallet.
        // set the wallet address and payout amount in the faucet payout database and let the faucet payout on its timer..
        // curently this is set to the testnet-faucet.ADMIN table as thats whats configured.

        // This will need to change TO-DO

        // service = args.service
        // service user id = args.input_user_id

        // from admin database...
        // PayoutSqlQuery = "select QRL_ADDR from ADMIN where (QRL_ADDR = '". $address ."' )";
        // values ID(), TX_ID, QRL_ADDR, IP_ADDR, PAYOUT, PAID, DATETIME
        // $PayOutSQL = "INSERT INTO ADMIN VALUES (id, NULL, '".$address."', '".$ipHash."', ".$faucetAmmount.", 1, now() )";


      });
    });
  });
}

async function checkPayments(args) {
  // expect { service, service_id }
  return new Promise(resolve => {
    // check the faucet_oayments db for the last time user recieved a tip, if ever.
    // check to curent time and if less than one day no tip...
    // set all results to an array to respond to user.
    const checkPaymentsArray = [];
    const service_id = args[0].service_id;
    const service = args[0].service;
    // search for user mentionend in the last config.faucer.payout_interval time. set in the config file
    const FaucetSearch = 'SELECT faucet_payouts.* FROM faucet_payouts, ' + service + '_users, users WHERE users.' + service + '_user_id = ' + service + '_users.id AND users.id = faucet_payouts.user_id AND ' + service + '_users.' + service + '_id = "' + service_id + '" AND faucet_payouts.time_stamp <= NOW() - INTERVAL ' + config.faucet.payout_interval + ' HOUR';
    callmysqlTipBot.query(FaucetSearch, function(err, faucet_result) {
      if (err) {
        console.log('[mysql error]', err);
      }
      console.log('users faucet results: ' + JSON.stringify(faucet_result));
      checkPaymentsArray.push(faucet_result);
      if (!faucet_result.length) {
        console.log('empty results');
        checkPaymentsArray.push({ drip_found: false });
        resolve(checkPaymentsArray);
        return checkPaymentsArray;
      }
      // drip found in db for user
      checkPaymentsArray.push({ drip_found: true });
      // returns for found { drip_found, drip_service, last_drip_amt, request_date, paid, tx_hash, paid_date }
      // returns for not found { drip_found }
      resolve(checkPaymentsArray);
    });
  });
}


module.exports = {
  Drip : Drip,
  checkPayments: checkPayments,
};
//
/*
INSERT INTO faucet_payouts('user_id, service, drip_amt, updated_at, time_stamp)
  VALUES(1, 'discord', .002, NOW(), NOW());

SELECT * FROM faucet_payouts WHERE user_id="1";


SELECT faucet_payouts.* FROM faucet_payouts, discord_users, users WHERE users.discord_user_id = discord_users.id AND users.id = faucet_payouts.user_id AND discord_users.discord_id = "@328611434177101835";


*/