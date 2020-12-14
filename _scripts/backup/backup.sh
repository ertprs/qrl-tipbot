#!/bin/bash

###############################
#							  #
# Backup Tipbot Files		  #
#							  #
###############################

# Run this script from crontab.

# This will tar, and move the files to specific directories for syncing to additional services. See backup.js 
# places backup tar file in $HOME/qrl-tips/_scripts/backup/qrl-tipbotBackup/

# get latest files into dir 
/usr/bin/nodejs $HOME/qrl-tips/_scripts/backup/backup.js
# location defined in config file
FileLocation=`cat $HOME/qrl-tips/_config/config.json |jq -r .backup.location`
cd $FileLocation
# Tar the files to location defined in BackupLocation
tar -czf TipBot_Backup.tar.gz -C $FileLocation/backup . >/dev/null 2>&1

openssl enc -aes-256-cbc -salt \
        -in TipBot_Backup.tar.gz -out TipBot_Backup.tar.gz.enc \
        -file $HOME/qrl-tips/backup/qrl-tipbotBackup/secret_pass.yxy