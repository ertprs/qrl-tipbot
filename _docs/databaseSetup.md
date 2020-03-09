# TipBot Database Setup

Each service will have a table for associating to a {users.user_id} to the social name/ID. 

You will set the configuration for the database in the main configuration file. We use mysql as the database. 

Look for the [#database] section there and add your details.


### DB Install

you will need to install the database for your system following the best installation guide for the various system.

for this guide, we have chosen MySQL.

```bash
## Install the database
sudo apt-get install mysql-server-5.7

## Configure the database
sudo mysql_secure_installation
```

Follow along and accept the defaults, setting the new root Password

#### DB Config

> MYSQL Database needs to exist prior to running this script.

MySQL requires a user be allowed privileges for the database you want to use. We will create a user, a database, and give all access to this user. Replace anything in a `{  }` with the same thing in the `{config.database.{SETTING}}` from your config. It must match!


```bash
# since we have restricted the root account su to root
sudo su 
# enter mysql shell
mysql
# create user and database
CREATE DATABASE [IF NOT EXISTS] {DATABASE_NAME}
CREATE USER '{DATABASE_USER}'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON {DATABASE_NAME} . * TO '{DATABASE_USER}'@'localhost';
FLUSH PRIVILEGES;

```

## Configuration

The `_config/config.js.example` file is meant to give a framework of all of the configuration directives required to run the various services. We are only concerned with the `{database}` section

```json
  "database" : {
    "db_name" : "DATABASE_NAME",
    "db_host" : "DATABASE_HOST",
    "db_pass" : "DATABASE_SECRET_PASSWORD_CHANGE_ME!!",
    "db_user" : "DATABASE_USER",
    "db_port" : "3006"
  },
```


## Writing to DB

Using the dbHelpers file we write and read various things from the database. this is then interacted with in the various commands from the social media accounts.