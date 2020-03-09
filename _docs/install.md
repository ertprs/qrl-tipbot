# Installation Instructions

> Need to add the wallet generation functions to this, we need 3 addresses for the bot. 1 for faucet, 1 for bot donations, 1 for held tips awaiting users to signup. 
> **Define them in the config file**


## Server Setup

Grab a server from [DigitalOcean here](https://m.do.co/c/139fae3d80b5) for as low as $5 a month. Simple interface and great documentation to get you started.

Ubuntu 18.04 Server was used for the setup and configuration documentation. 

At the time of writing the server used was the $10/Mo or $0.015/hr with 2 GB / 1 CPU, 50 GB SSD disk, and 2 TB transfer


### Create new user

```bash
# add new user and add them to the sudo group
adduser {USERNAME}
adduser {USERNAME} sudo
```

### Configure fqdn & Hostname

Edit both hosts and hostname to add your hostname and domain name for the bot

```
# /etc/hostname

HOSTNAME.EXAMPLE.COM
```

```
# /etc/hosts

# add your ipv4 and ipv6 info and fqdn

10.10.10.10 HOSTNAME.EXAMPLE.COM HOSTNAME
127.0.0.1 HOSTNAME HOSTNAME
127.0.1.1 HOSTNAME.DOMAINNAME.COM HOSTNAME

```


### Update

```bash
apt-get update && apt-get upgrade -y
```
### Install Base Packages

```bash
sudo apt-get install -y mysql-server-5.7 git screen fail2ban ufw nodejs npm

```

### Configure Base Packages

#### mysql

```bash
## Set password and configure securely {defaults}
sudo mysql_secure_installation

# login with root user and setup database for the bot
sudo mysql -u root
# You will need to store this next password in the config file later, save it
CREATE USER 'qrltips'@'localhost' IDENTIFIED BY 'password';
CREATE DATABASE qrl_tips;
GRANT ALL PRIVILEGES ON qrl_tips.* TO 'qrltips'@'localhost';
FLUSH PRIVILEGES;
```

### fail2ban

copy `fail2ban.conf` to `fail2ban.local`
copy `jail.conf` to `jail.local`
edit both `.local` files.

- Configure to defend the server from ssh attacks
- Configure to use ufw `banaction = ufw`
- Configure sshd

```bash
service fail2ban restart
```

### Setup ufw

```bash
# open required ports only
sudo ufw allow Openssh
sudo ufw enable
sudo ufw status
```

### install QRL Node and Sync

This will install 2gb swap file if not found and install a qrl node for ubuntu 18.04


```bash
wget https://gist.githubusercontent.com/fr1t2/39ab618cef3ad16e7a5833e87d0eeaf1/raw/6e72d38cbdfd7b2d2b2f44efb2b431f4ac484a46/qrl_python_ubuntu_18.04 && chmod +x qrl_python_ubuntu_18.04 && sudo ./qrl_python_ubuntu_18.04
```

> **Optional** grab the state files from backup to save on the sync time.
> You may also want to configure the node to be testnet while you set things up. Do that here..

once you have all of the configuration settings correct start the node

```bash
start_qrl
```

### Install go

Install the latest go from source.

### Install QRL Wallet-api

```bash
go get github.com/theQRL/walletd-rest-proxy
```

### Start `qrl_walletd` and walletAPI

 open a screen and start the `qrl_walletd`

```bash
screen -R walletAPI

## in screen session
qrl_walletd
```
Change to the go directory and start the API

```bash
cd $GOPATH/src/github.com/theQRL/walletd-rest-proxy

# now start the API on default port
./walletd-rest-proxy -serverIPPort 127.0.0.1:5359 -walletServiceEndpoint 127.0.0.1:19010

# "ctl+a d" to exit leaving the screen running
```

Refer to [The Docs](https://docs.theqrl.org/developers/walletAPI/) for more commands using the walletAPI

## Install the Bot

```bash
git clone https:github.com/fr1t2/qrltips
```

Change into that directory and install node requirements.

```bash
npm install
## Should install all required packages
```

Start the bot in a screen session

```bash
screen -R Discord
## cd to the _script/discord dir
# in screen session
npm DiscordBot
```

Should see a printout of config found and confirm gilds etc.
