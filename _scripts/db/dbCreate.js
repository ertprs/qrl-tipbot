'use strict';
const mysql = require('mysql');
// check for config file where we expect it


// config file location from here...
const config = require('../../_config/config.json');

// connector to the database
const callmysql = mysql.createConnection({
  host: `${config.database.db_host}`,
  user: `${config.database.db_user}`,
  password: `${config.database.db_pass}`,
  database: `${config.database.db_name}`,
});

// connect to the MySQL server
callmysql.connect(function(err) {
  if (err) {
    return console.error('error: ' + err.message);
  }
  // create `users` table to store various user account data
  //  'users' table gives single id to use between accounts, and pulls user_id from '$SERVICE_users.id' table primary key.
  //  insert into this every time a user signs-up a new account.
  //  create $SERVICE_users table entry and enter the primary key from that insert to this table...
  //  Update this table with new account info from a previous account to link...
  //  User signs up --> creates an entry in both `users` and `$SERVICE_users`
  //  user links account from new service --> updates `user` table entry adding new `$SERVICE_users` table primary key 'id' into "$SERVICE_user_id" field
  const createUsers = `create table if not exists users(
                          id int primary key auto_increment,
                          discord_user_id int,
                          keybase_user_id int, 
                          github_user_id int, 
                          reddit_user_id int, 
                          trello_user_id int, 
                          twitter_user_id int,
                          slack_user_id int,
                          telegram_user_id int,
                          whatsapp_user_id int,
                          time_stamp DATETIME not null,
                          updated_at DATETIME not null
                      )`;
  callmysql.query(createUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createUsers results:');
    // console.log(results);
  });

  // user_info db used to store info on our users
  // opt_out, signed up from service, dates, and any other user settings we want to add

  const createUsersInfo = `create table if not exists users_info(
                          id int primary key auto_increment,
                          user_id int not null,
                          user_key varchar(255) not null,
                          user_auto_created BOOLEAN,
                          auto_create_date varchar(255),
                          signed_up_from ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                          signup_date DATETIME,
                          opt_out BOOLEAN default 0,
                          optout_date DATETIME,
                          updated_at DATETIME not null

                      )`;
  callmysql.query(createUsersInfo, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createUsersInfo results:');
    // console.log(results);
  });

  // Create the 'discord_users' table to store to users info from Discord
  // the id from here is inserted into the `users.discord_id` table and field
  const createDiscordUsers = `create table if not exists discord_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               discord_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createDiscordUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createDiscordUsers results:');
    // console.log(results);
  });


  // Create the 'twitter_users' table to store to users info from Twitter
  // the id from here is inserted into the `users.twitter_id` table and field
  const createTwitterUsers = `create table if not exists twitter_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               twitter_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createTwitterUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createTwitterUsers results:');
    // console.log(results);
  });

  const createRedditUsers = `create table if not exists reddit_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               reddit_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createRedditUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createRedditUsers results:');
    // console.log(results);
  });



  const createKeybaseUsers = `create table if not exists keybase_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               keybase_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createKeybaseUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createKeybaseUsers results:');
    // console.log(results);
  });

  const createGithubUsers = `create table if not exists github_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               github_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createGithubUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createGithubUsers results:');
    // console.log(results);
  });

  const createTrelloUsers = `create table if not exists trello_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               trello_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createTrelloUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createTrelloUsers results:');
    // console.log(results);
  });

  const createSlackUsers = `create table if not exists slack_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               slack_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createSlackUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createSlackUsers results:');
    // console.log(results);
  });
  const createTelegramUsers = `create table if not exists telegram_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               telegram_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createTelegramUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createTelegramUsers results:');
    // console.log(results);
  });
  const createWhatsAppUsers = `create table if not exists whatsapp_users(
                               id int primary key auto_increment,
                               user_name varchar(255) not null,
                               whatsap_id varchar(255) not null,
                               time_stamp DATETIME not null
                             )`;
  callmysql.query(createWhatsAppUsers, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createWhatsAppUsers results:');
    // console.log(results);
  });

  // create `wallet` table to store user wallet info
  // get the user_id from the 'users.id' table to join later...
  const createWallets = `create table if not exists wallets(
                          id int primary key auto_increment,
                          user_id int not null,
                          wallet_pub varchar(80) not null,
                          wallet_bal DECIMAL(24,9) not null default 0,
                          wallet_qr blob,
                          time_stamp DATETIME not null,
                          updated_at DATETIME not null
                        )`;
  callmysql.query(createWallets, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createWallets results:');
    // console.log(results);
  });

  // create the `tips` table to hold all info from a tip event
  const createTips = `create table if not exists tips(
                              id int primary key auto_increment,
                              from_user_id varchar(255) not null,
                              tip_amount DECIMAL(24,9) not null,
                              from_service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                              time_stamp DATETIME not null
                      )`;
  callmysql.query(createTips, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createTips results:');
    // console.log(results);
  });

  // create the `tips` table to hold all info from a tip event
  const createFutureTips = `create table if not exists future_tips(
                              id int primary key auto_increment,
                              service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                              user_id varchar(255) not null,
                              user_name varchar(255) not null,
                              tip_id int,
                              tip_from varchar(255) not null,
                              tip_amount DECIMAL(24,9) not null,
                              tip_paidout BOOLEAN default 0,
                              tip_donated BOOLEAN default 0,
                              donated_time_stamp DATETIME,
                              time_stamp DATETIME not null
                      )`;
  callmysql.query(createFutureTips, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createFutureTips results:');
    // console.log(results);
  });


  const createTipsTo = `create table if not exists tips_to(
                        id int primary key auto_increment,
                        tip_id int not null,
                        user_id int not null,
                        tip_amt DECIMAL(24,9) not null,
                        time_stamp DATETIME not null
                      )`;
  callmysql.query(createTipsTo, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createTipsTo results:');
    // console.log(results);
  });

  const createTransactions = `create table if not exists transactions(
                                id int primary key auto_increment,
                                tip_id int not null,
                                tx_hash varchar(255) not null,
                                time_stamp DATETIME not null
                             )`;


  callmysql.query(createTransactions, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createTransactions results:');
    // console.log(results);
  });


const createUserAgree = `create table if not exists users_agree(
                          id int primary key auto_increment,
                          user_id int not null,
                          agree BOOLEAN not null,
                          service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                          time_stamp DATETIME not null
                          )`;
  callmysql.query(createUserAgree, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createUserAgree results:');
    // console.log(results);
  });
  
  const createWithdrawls = `create table if not exists withdrawls(
                                id int primary key auto_increment,
                                user_id int not null,
                                tx_hash varchar(255) not null,
                                service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                                to_address varchar(80) not null,
                                time_stamp DATETIME not null
                             )`;


  callmysql.query(createWithdrawls, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createWithdrawls results:');
    // console.log(results);
  });

    const createFaucetPayouts = `create table if not exists faucet_payouts(
                                id int primary key auto_increment,
                                user_id int not null,
                                service ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'),
                                drip_amt DECIMAL(24,9) not null,
                                paid BOOLEAN default 0,
                                tx_hash varchar(255), 
                                updated_at DATETIME not null,
                                time_stamp DATETIME not null
                             )`;


  callmysql.query(createFaucetPayouts, function(err, results) {
    if (err) {
      console.log(err.message);
    }
    // log the output of sql command
    // console.log('createFaucetPayouts results:');
    // console.log(results);
  });

  // close the sql connection
  callmysql.end(function(err) {
    if (err) {
      return console.log(err.message);
    }
  });
});