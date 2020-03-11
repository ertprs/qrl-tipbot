# MySQL Tables Definition

## Tipbot Tables

### `Users` Table

The `users` table is intended to be the main user_id used throughout the bot. This ID will be assigned to any user related entries.

- **id** *primary_key* is created at entry time  
- **discord_user_id** inserted from the `discord_users.id` table.field  
- **twitter_user_id** ambitious isn't it  
- **time_stamp** is created at entry time `NOW()`  
- **updated_at** is created at entry time  


```
 ______________________________________________________________________
|  id  | discord_users_id | twitter_users_id | time_stamp | updated_at |
|------|------------------|------------------|------------|------------|
| *int |       int        |        int       |  DATETIME  |  DATETIME  |
-----------------------------------------------------------------------

## sample data

+----+-----------------+-----------------+---------------------+---------------------+
| id | discord_user_id | twitter_user_id | time_stamp          | updated_at          |
+----+-----------------+-----------------+---------------------+---------------------+
|  1 |               1 |            NULL | 2020-02-04 08:39:16 | 2020-02-04 08:39:16 |
|  2 |               2 |            NULL | 2020-02-04 08:39:16 | 2020-02-04 08:39:16 |
|  3 |               3 |            NULL | 2020-02-04 08:39:16 | 2020-02-04 08:39:16 |
|  4 |            NULL |               1 | 2020-02-04 08:39:16 | 2020-02-04 08:39:16 |
|  5 |            NULL |               2 | 2020-02-04 08:39:16 | 2020-02-04 08:39:16 |
|  6 |            NULL |               3 | 2020-02-04 08:39:16 | 2020-02-04 08:39:16 |
+----+-----------------+-----------------+---------------------+---------------------+

```


### `user_info` Table

The `users_info` table is intended to store user defined input. Tracking signed_up dates and service, as well as opt_out

- **id** *primary_key* is created at entry time  
- **user_id** from `users.id` table.field to join user and wallet
- **user_key** bcrypt_salt created to use for hashing info in the database {future feature}
- **user_auto_created** BOOLEAN if the user was created automatically.
- **auto_created_date** date auto-create happened   
- **signed_up_from** enum value can be one of the services integrated with. 
  - if `NULL` or `0` the user has not signed up yet, but has received tips
- **signup_date** date account was signed up from a social media platform
- **opt_out** give users option to opt out of the service, BOOLEAN value
  - if true don't allow tips to be sent to the user, DEFAULT false.
- **optout_date** date optout was selected
- **updated_at** is modified every change here at entry time `NOW()`  

```
 __________________________________________________________________________________________________________________________________________________
|  id  | user_id | user_key | user_auto_created | auto_create_date |        signed_up_from      | signup_date | opt_out | optout_date | updated_at |
|------|---------|----------|-------------------|------------------|----------------------------|-------------|---------|-------------|------------|
| *int |   int   | char(25) |     BOOLEAN       |     DATETIME     | ENUM('discord', 'twitter') |   DATETIME  | BOOLEAN |   DATETIME  |  DATETIME  |
----------------------------------------------------------------------------------------------------------------------------------------------------
```

### `users_agree` Table

The `users_agree` table collects the user agreement from the user. This allows the bot to send user address and allows user to start tipping

- **id** - *primary_key* created at entry time
- **user_id**
- **agree** - boolean agree or not
- **time_stamp** - time agreed

```
 ___________________________________________
|  id  |  user_id   |  agree  | time_stamp |
|------|------------|---------|------------|
| *int |     int    | boolean |  DATETIME  |
--------------------------------------------
```


### `discord_users` Table

The `discord_users` table will store all discord user information at account signup time.

- **id** *primary_key* is created at entry time  
- **user_name** Discord User Name
- **discord_id** Discord ID to identify the user uniquely
- **time_stamp** is created at entry time `NOW()`  

```
 _________________________________________________
|  id  |  user_name   |  discord_id  | time_stamp |
|------|--------------|--------------|------------|
| *int | varchar(255) | varchar(255) |  DATETIME  |
---------------------------------------------------
```

### `twitter_users` Table
add same for twitter users here

The `twitter_users` table will store all discord user information at account signup time.
- **id** *primary_key* is created at entry time  
- **user_name** Discord User Name
- **discord_id** Discord ID to identify the user uniquely
- **time_stamp** is created at entry time `NOW()`  

```
 _________________________________________________
|  id  |  user_name   |  twitter_id  | time_stamp |
|------|--------------|--------------|------------|
| *int | varchar(255) | varchar(255) |  DATETIME  |
---------------------------------------------------
```


### `wallets` Table

Store wallet details here

> ToDo
> - protect the user data here using the salt and server salt to generate secure storage?.

- **id** *primary_key* is created at entry time 
- **user_id** from `users.id` table.field to join user and wallet
- **wallet_pub** example QRL wallet address `Q020500269080119667eb86fb8623beebdf3bd65d484c30ac0ac15d234a40bff788189a344af1a7`
- **wallet_bal** the last known balance of the wallet. Update every check or function that needs it
- **wallet_qr** QR code generated for the given address, shown to user to aid in deposit...
- **time_stamp** is created at entry time `NOW()`  
- **updated_at** updated every bal update?

```
 ____________________________________________________________________________________
|  id  | user_id |  wallet_pub |  wallet_bal   | wallet_qr | time_stamp | updated_at |
|------|---------|-------------|---------------|-----------|------------|------------|
| *int |   int   | varchar(80) | DECIMAL(24,9) |   blob    |  DATETIME  | DATETIME   |
--------------------------------------------------------------------------------------
```

### `tips` Table

Store details from the tip transaction

- **id** *primary_key* is created at entry time 
- **tans_id** from `transactions.id` table.field to tip and transaction
- **from_user_id** the `users.id` that initiated the tip
- **to_users_id** list of users to tip
- **tip_amount** ammount to tip
- **from_service** the service that was used to tip from
- **time_stamp** is created at entry time `NOW()`  

```
# tips
 _________________________________________________________________________________________________________
|  id  | trans_id | from_user_id | to_users_id  |   tip_amount  |        from_service        | time_stamp |
-------|----------|--------------|--------------|---------------|----------------------------|------------|
| *int |    int   | varchar(255) | varchar(600) | DECIMAL(24,9) | ENUM('discord', 'twitter') |  DATETIME  |
-----------------------------------------------------------------------------------------------------------
```

### `future_tips` Table

This table holds tips to users that have not signed up yet
We will keep these in memory for a set ampunt of time
after this timeframe is up the bot will keep these tips in internal wallets.

- **id** *primary_key* auto generated at entry.
- **service** user service used to send tip
- **user_id** - Service user_id for the user to tip_to once signed up
- **user_name** - user name of the tip_to user
- **tip_from** - Service user_id of the tipped_from user
- **tip_amount** - exact amount to tip to the user
- **tip_paidout** - BOOLEAN used to track if the tip was paid or not. Default is 0
- **time_stamp** - time_stamp of when  the tip was sent. Used to track if funds still available to user


```
# future_tips
 _________________________________________________________________________________________________________________________________________________________________________________________________
|  id  |                                     service                                                           | user_id |   user_name  |    tip_from  |   tip_amount  | tip_paidout | time_stamp |
|------|-------------------------------------------------------------------------------------------------------|---------|--------------|--------------|---------------|-------------|------------|
| *int | ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp'), |   int   | varchar(255) | varchar(255) | DECIMAL(24,9) |   BOOLEAN   |  DATETIME  |
---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
```


### `tips_from` Table

lookup table for the tip from party. this is joined to the `tips_to` table for lookups

- **id** *primary_key* is created at entry time 
- **tip_id** from `tips.id` table.field
- **user_id** the `users.id` that initiated the tip. Use their wallet
- **total_tip** total amount that was transfered from their wallet
- **tip_to_count** number of accounts to tip, max 100.
- **time_stamp** is created at entry time `NOW()`  


```
# tips_from
 _____________________________________________________________________
|  id  | tip_id | user_id |   total_tip   | tip_to_count | time_stamp |
|------|--------|---------|---------------|--------------|------------|
| *int |   int  |   int   | DECIMAL(24,9) |      int     |  DATETIME  |
-----------------------------------------------------------------------
```

### `tips_to` Table

- **id** *primary_key* is created at entry time 
- **tip_id** from `tips.id` table.field
- **user_id** the `users.id` that is receiving the tip. Send to their wallet
- **tip_amt** tip amount that was transfered to their wallet
- **time_stamp** is created at entry time `NOW()`  

```
# tips_to
 ___________________________________________________________
|  id  | tip_id | user_id |      tip_amt      | time_stamp |
|------|--------|---------|-------------------|------------|
| *int |   int  |   int   |   DECIMAL(24,9)   |  DATETIME  |
------------------------------------------------------------
```

### `transactions` Table

Store details from the actual QRL transaction here.

- **id** *primary_key* is created at entry time 
- **tip_id** from `tips.id` table.field
- **tx_hash** the transaction hash from the tip
- **time_stamp** is created at entry time `NOW()`  


```
 ___________________________________________
|  id  | tip_id |    tx_hash   | time_stamp |
|------|--------|--------------|------------|
| *int |  int   | varchar(255) |  DATETIME  |
---------------------------------------------

```

### `Withdrawls` Table

store info related to withdraw and transfers from the bot addresses. 

- **id** *primary_key* is created at entry time
- **user_id** from `users.id` the user sending the tx
- **tx_hash** The tx_hash from the QRL transaction
- **service** service that intiated the transfer
- **time_stamp** when the tx happened


```
 _________________________________________________________________________________
|  id  | user_id |     tx_hash      |             service            | time_stamp |
|------|---------|------------------|--------------------------------|------------|
| *int |   int   |   varchar(255)   |   ENUM('discord', 'twitter')   |  DATETIME  |
-----------------------------------------------------------------------------------
```



## Faucet Tables

### `faucet_payouts` Table

Useed to track the payouts from the faucet. This will store all of the transaction details including the user_id, tx_hash from the qrl transaction, total amount transfered and the time it all happened.

- **id** *primary_key* is created at entry time
- **user_ids** the user id from `users.id`
- **tx_hash** tx hash from the qrl tx
- **total_payout_amt** - total amount sent through the faucet
- **time_stamp** the timestamp of entry

```sql
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| Field      | Type                                                                                         | Null | Key | Default | Extra          |
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
| id         | int(11)                                                                                      | NO   | PRI | NULL    | auto_increment |
| user_id    | int(11)                                                                                      | NO   |     | NULL    |                |
| service    | enum('discord','keybase','github','reddit','trello','twitter','slack','telegram','whatsapp') | YES  |     | NULL    |                |
| drip_amt   | decimal(24,9)                                                                                | NO   |     | NULL    |                |
| paid       | tinyint(1)                                                                                   | YES  |     | 0       |                |
| tx_hash    | varchar(255)                                                                                 | YES  |     | NULL    |                |
| updated_at | datetime                                                                                     | NO   |     | NULL    |                |
| time_stamp | datetime                                                                                     | NO   |     | NULL    |                |
+------------+----------------------------------------------------------------------------------------------+------+-----+---------+----------------+
```


```
 ____________________________________________________________________
|  id  |   user_ids   |   tx_hash    | total_payout_amt | time_stamp |
|------|--------------|--------------|------------------|------------|
| *int | varchar(600) | varchar(255) |  DECIMAL(24,9)   |  DATETIME  |
----------------------------------------------------------------------

```

### `faucet_requests` Table

Used to track the requests from the faucet. This will store all of the request details including the user_id, tx_hash from the qrl transaction, total amount transfered and the time it all happened.

- **id** *primary_key* is created at entry time
- **user_id** the user id from `users.id`
- **service** the service requesting the faucet payout
- **drip_amt** amount of faucet payout
- **paid_out** boolean value if the faucet has paid out
- **updated_at** when the record was last updated, to show payout change.
- **time_stamp** the timestamp of entry


```
 _________________________________________________________________________________________________________________________________________________________________
|  id  | user_id |                                                service                                               | drip_amt      | updated_at | time_stamp |
|------|---------|------------------------------------------------------------------------------------------------------|---------------|------------|------------|
| *int |   int   | ENUM('discord', 'keybase', 'github', 'reddit', 'trello', 'twitter', 'slack', 'telegram', 'whatsapp') | DECIMAL(24,9) |  DATETIME  |  DATETIME  |
-------------------------------------------------------------------------------------------------------------------------------------------------------------------

```


---



### ADMIN

Curent talble that holds all faucet info.
**TO-DO** Brreak this up into a few and add user_id to the mix to track users.

```sql

SELECT * FROM ADMIN;

#+----+-------+-----------------------------------+-----------------------------------+---------------+------+---------------------+
#| ID | TX_ID | QRL_ADDR                          | IP_ADDR                           | PAYOUT        | PAID | DATETIME            |
#+----+-------+-----------------------------------+-----------------------------------+---------------+------+---------------------+
#|  1 | NULL  | Q010500778c6ff5~~~b355bf1292f37fe | 1588984ee127b~~~7c46c4949b80f210f | 100.000000000 |    0 | 2020-02-15 00:10:10 |
#|  2 | NULL  | Q010500778c6ff5~~~b355bf1292f37fe | 1588984ee127b7c~~~46c4949b80f210f |   1.000000000 |    0 | 2020-02-15 00:11:20 |
#+----+-------+-----------------------------------+-----------------------------------+---------------+------+---------------------+


```