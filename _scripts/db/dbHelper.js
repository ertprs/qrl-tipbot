'use strict';
const mysql = require('mysql');
const config = require('../../_config/config.json');
const wallet = require('../qrl/walletTools');
// connector to the database
const callmysql = mysql.createPool({
  connectionLimit: 10,
  host: `${config.database.db_host}`,
  user: `${config.database.db_user}`,
  password: `${config.database.db_pass}`,
  database: `${config.database.db_name}`,
});
// expects { service: service, service_id: service_id }
// returns { user_found, wallet_pub, wallet_bal, user_id, user_name, opt_out optout_date 
async function GetAllUserInfo(args) {
  return new Promise(resolve => {
    const input = JSON.parse(JSON.stringify(args));
    const service_id = input.service_id;
    const service = input.service;
    let foundResArray = [];
    // get all users_info data here...
    const getAllInfoSearch = 'SELECT wallets.wallet_pub AS wallet_pub, wallets.wallet_bal AS wallet_bal, users.id AS user_id, ' + service + '_users.user_name AS user_name, users_info.opt_out AS opt_out, users_info.optout_date AS optout_date FROM wallets, users, ' + service + '_users, users_info WHERE users.id = wallets.user_id AND users.' + service + '_user_id = ' + service + '_users.id AND users.id = users_info.user_id AND ' + service + '_users.' + service + '_id = "' + service_id + '"';
    console.log('getAllInfoSearch: ' + getAllInfoSearch);
    callmysql.query(getAllInfoSearch, function(err, user_info) {
      if (err) {
        console.log('[mysql error]', err);
      }
      console.log('user_info: ' + JSON.stringify(user_info))
      if(user_info.length == 0) {
        const Results = { user_found: 'false' };
        foundResArray.push({ user_found: 'false' })
        resolve(Results);
        return Results;
      }
      else {
        foundResArray.push({ user_found: 'true' })
      }

      const user_id = user_info[0].user_id;
      console.log('\n\nuser_id' + user_id)


      // update the balance in the wallet database and refresh info
      GetUserWalletBal({ user_id: user_id });

      const getAgreeSearch = 'SELECT users_agree.* FROM users_agree WHERE users_agree.user_id = "' + user_id + '"';
      callmysql.query(getAgreeSearch, function(err, get_agree) {
        if (err) {
          console.log('[mysql error]', err);
        }

      if(get_agree.length == 0) {
        const Results = { user_agree: 'false' };
        foundResArray.push({ user_agree: 'false' })
        resolve(Results);
        return Results;
      }


      else {

        const infoResult = JSON.parse(JSON.stringify(get_agree));
        //check for user agree results
        foundResArray.push({ user_agree: 'true' })
        // const foundRes = { user_agree: 'true' };
        // Array.prototype.push.apply(foundRes, get_agree);
        Array.prototype.push.apply(foundResArray, get_agree);
        console.log('agree foundResArray ' + JSON.stringify(foundResArray));
        //resolve(foundResArray);
        //return foundResArray;
      }
      });
      
      callmysql.query(getAllInfoSearch, function(err, user_info_update) {
        if (err) {
          console.log('[mysql error]', err);
        }
        const infoResult = JSON.parse(JSON.stringify(user_info_update));
        // const foundRes = { user_found: 'true' };
        foundResArray.push({ user_found: 'true' });
        Array.prototype.push.apply(foundResArray, infoResult);
        console.log('getAllInfoSearch foundResArray ' + JSON.stringify(foundResArray));
        resolve(foundResArray);
        return foundResArray;
      });
      // resolve(foundResArray)
    });
  });
}

async function CheckUser(args) {
  /*
  Check for the user in users database
  We expect to recieve data about the service requesting { discord || twitter } and the user ID from that service as expected in the DB
  i.e.: { service: 'discord', user_id: userID }
  returns { user_found: true, user_id: id } | { user_found: false }
  */
  return new Promise(resolve => {
    if (args !== null) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const service = input.service;
      const input_user_id = input.user_id;
      const searchDB = 'SELECT users.id AS user_id FROM users INNER JOIN ' + service + '_users ON users.discord_user_id = ' + service + '_users.id WHERE ' + service + '_users.' + service + '_id = "' + input_user_id + '"';
      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        if (result.length) {
          if (result) {
            // user has opted out == 1
            const id = result[0].user_id;
            // get all users_info data here...
            const user_infoSearch = 'SELECT users_info.* from users INNER JOIN users_info ON users.id = users_info.user_id WHERE users_info.user_id = "' + id + '"';
            callmysql.query(user_infoSearch, function(err, user_info) {
              if (err) {
                console.log('[mysql error]', err);
              }
              // assign results to json and pass to return
              const searchResult = { user_found: 'true', user_id: id, user_auto_created: user_info[0].user_auto_created, auto_create_date: user_info[0].auto_create_date, signed_up_from: user_info[0].signed_up_from, signup_date: user_info[0].signup_date, opt_out: user_info[0].opt_out, optout_date: user_info[0].optout_date, updated_at: user_info[0].updated_at };
              const Results = JSON.parse(JSON.stringify(searchResult));
              resolve(Results);
              return Results;
            });
          }
        }
        else {
          // user not opt_out, return a false value;
          const searchResult = { user_found: 'false' };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        }
      });
    }
  });
}

async function GetUserID(args) {
  /*
  Check for the user in users database
  We expect to recieve data about the service requesting { discord || twitter } and the user ID from that service as expected in the DB
  i.e.: { service: 'discord', user_id: userID }
  userID = From the users.idtable:field
  returns { user_found: true, user_id: id } | { user_found: false }
  */
  return new Promise(resolve => {
    if (args !== null) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const service = input.service;
      const input_user_id = input.user_id;
      const searchDB = 'SELECT users.id AS user_id FROM users INNER JOIN ' + service + '_users ON users.' + service + '_user_id = ' + service + '_users.id WHERE ' + service + '_users.' + service + '_id = "' + input_user_id + '"';
      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        if (result.length) {
          if (result) {
            // user has opted out == 1
            const id = result[0].user_id;
            // assign results to json and pass to return
            const searchResult = { user_found: 'true', user_id: id };
            const Results = JSON.parse(JSON.stringify(searchResult));
            resolve(Results);
            return Results;
          }
        }
        else {
          // user not opt_out, return a false value;
          const searchResult = { user_found: 'false' };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        }
      });
    }
  });
}

async function CheckUserOptOut(args) {
  /*
  Check if the user has opted out
  expect args in json format { service: $SERVICENAME, user_id: $SERVICEUSERID }
  returns:
    true = { opt_out: 'true', optout_date: optout_date }
    false = {opt_out: 'false' }
  */
  return new Promise(resolve => {
    if(args) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const service = input.service;
      const user_id = input.user_id;
      const searchDB = 'SELECT users.id AS user_id, users.' + service + '_user_id AS ' + service + '_id, users_info.opt_out AS opt_out, users_info.optout_date AS optout_date FROM users INNER JOIN users_info ON users.id = users_info.user_id WHERE users_info.user_id = "' + user_id + '"';
      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        const opt_out = result[0].opt_out;
        if (opt_out === 1) {
          // user has opted out == 1
          const optout_date = result[0].optout_date;
          // assign results to json and pass to return
          const searchResult = { user_found: 'true', opt_out: 'true', optout_date: optout_date };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        }
        else {
          // user not opt_out, return a false value;
          const searchResult = { user_found: 'true', opt_out: 'false' };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        }
      });
    }

    else {
      // user not found...
      const searchResult = { user_found: 'false' };
      const Results = JSON.parse(JSON.stringify(searchResult));
      resolve(Results);
      return Results;
    }
  });
}

async function CheckUserSignup(args) {
  // CheckUserSignUp
  // returns { user_signup: true, signup_date: date, signed_up_from: service } | { user_signup: false }
  return new Promise(resolve => {
    if (args !== null) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const id = input.user_id;
      const searchDB = 'SELECT users_info.signed_up_from, users_info.signup_date FROM users INNER JOIN users_info ON users.id = users_info.user_id WHERE users_info.user_id = "' + id + '"';
      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        if (result[0].signed_up_from == 'NULL') {
          return result.signed_up_from;
        }
        const signed_up_from = result[0].signed_up_from;
        const signup_date = result[0].signup_date;
        if (signed_up_from != null) {
          // the user signed up somewhere
          const searchResult = { user_signup: 'true', signup_date: signup_date, signed_up_from: signed_up_from };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        }
        else {
          const searchResult = { user_signup: false };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        }
      });
    }
    else {
      console.log('error somewhere');
    }
  });
}

async function GetUserWalletPub(args) {
  // GetUserWallet
  // expects { user_id: user_id }
  // returns { wallet_pub: QRLADDRESS }
  return new Promise(resolve => {
    if (args !== null) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const id = input.user_id;
      const searchDB = 'SELECT wallets.wallet_pub AS wallet_pub, wallets.wallet_qr AS wallet_qr FROM users INNER JOIN wallets ON users.id = wallets.user_id WHERE wallets.user_id = "' + id + '"';
      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        const wallet_pub = result[0].wallet_pub;
        const wallet_qr = result[0].wallet_qr;
        const searchResult = { wallet_pub: wallet_pub, wallet_qr: wallet_qr };
        const Results = JSON.parse(JSON.stringify(searchResult));
        resolve(Results);
        return Results;
      });
    }
    else {
      console.log('error somewhere');
    }
  });
}

async function GetUserWalletBal(args) {
  // GetUserBal
  // expcts { user_id: user_id }
  // returns { wallet_bal: 100.000 }
  return new Promise(resolve => {
    if (args !== null) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const id = input.user_id;
      const searchDB = 'SELECT wallets.wallet_bal AS wallet_bal, wallets.wallet_pub AS wallet_pub FROM users INNER JOIN wallets ON users.id = wallets.user_id WHERE wallets.user_id = "' + id + '"';
      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        const wallet_bal = result[0].wallet_bal;
        const wallet_pub = result[0].wallet_pub;
        // now check the network for ths balance info and compaire.
        const NetBalance = wallet.GetBalance;
        NetBalance(wallet_pub).then(function(NetBal) {
          // should have netBal value from the network now, compare them
          const balance = NetBal.balance / 1000000000 ;
          const OldBal = wallet_bal / 1000000000;
          if (balance != OldBal) {
            // the balances are different, update the DB
            const updateInfo = { user_id: id, new_bal: balance };
            updateWalletBal(updateInfo).then(function(UpdateBalance) {
              return UpdateBalance;
            });
          }
          const return_bal = balance;
          const searchResult = { wallet_bal: return_bal };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        });
      });
    }
    else {
      console.log('error somewhere');
    }
  });
}


// :::: TO-DO :::: //
// this function needs help.
// :::: ::::::: :: //

async function GetUserWalletQR(args) {
  // GetUserWalletQR
  // returns { wallet_qr: QR_CODE }
  return new Promise(resolve => {
    if (args !== null) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const id = input.user_id;
      const searchDB = 'SELECT wallets.wallet_qr FROM users INNER JOIN wallets ON users.id = wallets.user_id WHERE wallets.user_id = "' + id + '"';
      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        const wallet_qr = result[0].wallet_qr;
        const fileName = 'user_' + id + '_QRcode.png';
        const searchResult = { wallet_qr: wallet_qr, fileName: fileName };
        const Results = JSON.parse(JSON.stringify(searchResult));
        resolve(Results);
        return Results;
      });
    }
    else {
      console.log('error somewhere');
    }
  });
}

async function AddUser(args) {
  /*
  We need to collect the following data
  { service: service, service_id: service_id, user_name: user_name, wallet_pub: wallet_pub, wallet_bal: wallet_bal, user_key: user_key, user_auto_created: user_auto_created, auto_create_date: auto_create_date opt_out, optout_date };
  */
  return new Promise(resolve => {
    const resultsArray = [];
    const input = JSON.parse(JSON.stringify(args));
    const service = input.service;
    const service_id = input.service_id;
    const user_name = input.user_name;
    const wallet_pub = input.wallet_pub;
    const user_key = input.user_key;
    const user_auto_created = input.user_auto_created;
    const auto_create_date = input.auto_create_date;
    const opt_out = input.opt_out;
    const service_usersValues = [ [ user_name, service_id, new Date()]];
    const addTo_service_users = 'INSERT INTO ' + service + '_users(user_name, ' + service + '_id, time_stamp) VALUES ?';
    callmysql.query(addTo_service_users, [service_usersValues], function(err, result) {
      if (err) {
        console.log('[mysql error]', err);
      }
      const insertid = result.insertId;
      resultsArray.push({ user_id: insertid });
      // trigger addUserTo_users directly after SERVICE_usersVal
      const usersValues = [ [insertid, new Date(), new Date()]];
      const addTo_users = 'INSERT INTO users(' + service + '_user_id, time_stamp, updated_at) VALUES ?';
      callmysql.query(addTo_users, [usersValues], function(err) {
        if (err) {
          console.log('[mysql error]', err);
        }
        const searchDB = 'SELECT users.id AS user_id FROM users INNER JOIN ' + service + '_users ON users.' + service + '_user_id = ' + service + '_users.id WHERE ' + service + '_users.' + service + '_id = "' + service_id + '"';
        callmysql.query(searchDB, function(err, result2) {
          if (err) {
            console.log('[mysql error]', err);
          }
          const userID = result2[0].user_id;
          resultsArray.push({ userID: userID });
          // both the addTo_wallet and addTo_users_info need the userID promise filled.
          const walletValues = [ [userID, wallet_pub, new Date(), new Date()] ];
          const addTo_wallet = 'INSERT INTO wallets(user_id, wallet_pub, time_stamp, updated_at) VALUES ?';
          callmysql.query(addTo_wallet, [walletValues], function(err) {
            if (err) {
              console.log('[mysql error]', err);
            }
            const user_infoValues = [ [userID, user_key, user_auto_created, auto_create_date, service, new Date(), opt_out, new Date(), new Date()]];
            const addTo_users_info = 'INSERT INTO users_info(user_id, user_key, user_auto_created, auto_create_date, signed_up_from, signup_date, opt_out, optout_date, updated_at) VALUES ?';
            callmysql.query(addTo_users_info, [user_infoValues], function(err) {
              if (err) {
                console.log('[mysql error]', err);
              }
              resultsArray.push({ user_added: 'true' });
              const futureTips_payout = 'SELECT SUM(tip_amount) AS future_tip_amount FROM future_tips WHERE user_id = "' + service_id + '" AND tip_paidout = "0"';
              callmysql.query(futureTips_payout, function(err, futureTipped) {
                if (err) {
                  console.log('[mysql error]', err);
                }
                if (futureTipped[0].future_tip_amount == 'NULL') {
                  return futureTipped[0].future_tip_amount;
                }
                const future_tip_amount = futureTipped[0].future_tip_amount * 1000000000;
                resultsArray.push({ future_tip_amount: future_tip_amount });
                resolve(resultsArray);
              });
            });
          });
        });
      });
    });
  });
}

async function AddWalletQR(args) {
  // add wallet QR to wallets db
  // expects {user_id: user_id, wallet_pub: wallet_pub };
  const wallet_pub = args.wallet_pub;
  const id = args.user_id;
  const QRCode = require('qrcode');
  const fs = require('fs');
  const fileName = 'user_' + id + '_QRcode.png';
  const file = __dirname + '/QR/' + fileName;
  QRCode.toDataURL(wallet_pub, function(err, url) {
    fs.writeFile(file, url, function(err) {
      if (err) throw err;
    });
    callmysql.query('UPDATE wallets SET wallet_qr = ?, updated_at = ? WHERE user_id = ?', [file, new Date(), id], function(err) {
      if (err) {
        console.log('[mysql error]', err);
      }
    });
  });
  const results = JSON.parse(JSON.stringify({ wallet_qr: file, fileName: fileName }));
  return results;
}

async function OptOut(args) {
  // this function sets the users_info.opt_out to 1 or true
  // If user has set true dont let tips be sent to them.
  const input = JSON.parse(JSON.stringify(args));
  callmysql.query('UPDATE users_info SET opt_out = ?, optout_date = ?, updated_at = ? WHERE user_id = ?', [true, new Date(), new Date(), input.user_id], function(err, result5) {
    if (err) {
      console.log('[mysql error]', err);
    }
    return(result5);
  });
  const optoutDB_Results = { opt_out: true, optout_date: new Date() };
  return JSON.stringify(optoutDB_Results);
}

async function OptIn(args) {
  // this function sets the users_info.opt_out to 1 or true
  // If user has set true dont let tips be sent to them.
  const input = JSON.parse(JSON.stringify(args));
  callmysql.query('UPDATE users_info SET opt_out = ?, optout_date = ?, updated_at = ? WHERE user_id = ?', [false, new Date(), new Date(), input.user_id], function(err, result6) {
    if (err) {
      console.log('[mysql error]', err);
    }
    return(result6);
  });

  const optinDB_Results = { opt_out: false, optin_date: new Date() };
  return JSON.stringify(optinDB_Results);
}

async function updateWalletBal(args) {
  // expects { user_id: user_id, new_bal: new_bal }
  // get the balance from the node and send here
  const wallet_bal = args.new_bal;
  callmysql.query('UPDATE wallets SET wallet_bal = ?, updated_at = ? WHERE user_id = ?', [wallet_bal, new Date(), args.user_id], function(err, result) {
    if (err) {
      console.log('[mysql error]', err);
    }
    return result;
  });
}

async function addTip(args) {
  return new Promise(resolve => {
  // we expect the following information to be submitted here
  // { from_user_id, to_users_id, tip_amount, from_service, time_stamp }
  // function to add tip to tips db
    const addTipResultsArray = [];
    const trans_id = '3333333';
    const from_user_id = args.from_user_id;
    const to_users_id = args.to_users_id;
    const tip_amount = args.tip_amount;
    const from_service = args.from_service;
    const time_stamp = args.time_stamp;
    const addTip_Values = [ [trans_id, from_user_id, to_users_id, tip_amount, from_service, time_stamp]];
    const addTip_info = 'INSERT INTO tips(trans_id, from_user_id, to_users_id, tip_amount, from_service, time_stamp ) VALUES ?';
    callmysql.query(addTip_info, [addTip_Values], function(err, addTip_ValuesResult) {
      if (err) {
        console.log('[mysql error]', err);
      }
      const tip_id = addTip_ValuesResult.insertId;
      addTipResultsArray.push({ tip_id: tip_id });
      resolve(addTipResultsArray);
    });
  });
}

async function addFutureTip(args) {
  return new Promise(resolve => {
  // this will write a user to database
  // we expect { service: SERVICE, user_id: SERVICE_ID, user_name: SERVICE_user_name, tip_from: TIP_FROM_TIPBOT_user_id, tip_amount: tip_to_user_amount, time_stamp: date_tip_was_made }
    const input = JSON.parse(JSON.stringify(args));
    const futureTipResultsArray = [];
    const service = input.service;
    const user_id = input.user_id;
    const user_name = input.user_name;
    const tip_from = input.tip_from;
    const tip_amount = input.tip_amount;
    const time_stamp = new Date();
    const tip_paidout = '0';
    const user_infoValues = [ [service, user_id, user_name, tip_from, tip_amount, tip_paidout, time_stamp] ];
    const addTo_users_info = 'INSERT INTO future_tips(service, user_id, user_name, tip_from, tip_amount, tip_paidout, time_stamp) VALUES ?';
    console.log('addToFutureTipsInfo: ' + addTo_users_info + user_infoValues)
    callmysql.query(addTo_users_info, [user_infoValues], function(err, addFutureTipRes) {
      if (err) {
        console.log('[mysql error]', err);
      }
      const DB_InsertId = addFutureTipRes.insertId;
      futureTipResultsArray.push({ tip_id: DB_InsertId });
      resolve(futureTipResultsArray);
      return futureTipResultsArray;
    });
  });
}

async function clearFutureTips(args) {
  return new Promise(resolve => {
    callmysql.query('UPDATE future_tips SET tip_paidout = "1" WHERE user_id = ? AND tip_paidout = "0"', [args.user_id], function(err, result) {
      if (err) {
        console.log('[mysql error]', err);
      }
      resolve(result);
      return result;
    });
  });
}

async function addTransaction(args) {
  // exepct { tip_id: fromTipDB, tx_hash: fromTX_HASH }
  return new Promise(resolve => {
    const txArray = [];
    const input = JSON.parse(JSON.stringify(args));
    const tip_id = args.tip_id;
    const tx_hash = args.tx_hash;
    // insert data into transactions db
    const user_infoValues = [ [tip_id, tx_hash, new Date()] ];
    const addto_Transaction_table = 'INSERT INTO transactions(tip_id, tx_hash, time_stamp) VALUES ?';
    callmysql.query(addto_Transaction_table, [user_infoValues], function(err, addFutureTipRes) {
      if (err) {
        console.log('[mysql error]', err);
      }
      const DB_InsertId = addFutureTipRes.insertId;
      txArray.push({ transaction_db_id: DB_InsertId });
      resolve(txArray);
      return txArray;
    });
  });
}

async function agree(args) {
  // expect { service: , user_id: }
  return new Promise(resolve => {
    const txArray = [];
    const user_id = args.user_id;
    const service = args.service;
    const agreeValues = [ [user_id, '1', service, new Date()] ];
    const agreeIntoDB = 'Insert INTO users_agree(user_id, agree, service, time_stamp) VALUES ?';
    callmysql.query(agreeIntoDB, [agreeValues], function(err, agreeIntoDBRes) {
      if (err) {
        console.log('[mysql error]', err);
      }
      const DB_InsertId = agreeIntoDBRes.insertId;
      txArray.push({ transaction_db_id: DB_InsertId });
      resolve(txArray);
      return txArray;
    });
    const optinDB_Results = { opt_out: false, optin_date: new Date() };
    return JSON.stringify(optinDB_Results);
  });
}

async function CheckAgree(args) {
  return new Promise(resolve => {
    if(args) {
      // args passed, check for the service used
      const input = JSON.parse(JSON.stringify(args));
      const service = input.service;
      const user_id = input.user_id;
      const searchDB = 'SELECT users.id AS user_id, users.' + service + '_user_id AS ' + service + '_id, users_agree.agree AS agree FROM users INNER JOIN users_agree ON users.id = users_agree.user_id WHERE users_agree.user_id = "' + user_id + '"';
      callmysql.query(searchDB, function(err, result) {
        if (err) {
          console.log('[mysql error]', err);
        }
        if (result.length == 0) {
          const searchResult = { agreed: 'false' };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return;
        }
        else {
          // user has agreed == 1
          // assign results to json and pass to return
          const searchResult = { agreed: 'true' };
          const Results = JSON.parse(JSON.stringify(searchResult));
          resolve(Results);
          return Results;
        }
      });
    }

    else {
      // user not found...
      const searchResult = { user_found: 'false' };
      const Results = JSON.parse(JSON.stringify(searchResult));
      resolve(Results);
      return Results;
    }
  });
}

module.exports = {
  GetAllUserInfo : GetAllUserInfo,
  CheckUser : CheckUser,
  CheckUserOptOut : CheckUserOptOut,
  CheckUserSignup : CheckUserSignup,
  GetUserID : GetUserID,
  GetUserWalletPub : GetUserWalletPub,
  GetUserWalletBal : GetUserWalletBal,
  GetUserWalletQR : GetUserWalletQR,
  AddUser : AddUser,
  AddWalletQR: AddWalletQR,
  OptOut : OptOut,
  OptIn : OptIn,
  addFutureTip : addFutureTip,
  addTip : addTip,
  clearFutureTips : clearFutureTips,
  addTransaction : addTransaction,
  agree : agree,
  CheckAgree: CheckAgree,
  updateWalletBal : updateWalletBal,
};