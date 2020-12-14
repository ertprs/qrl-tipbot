#!/bin/bash

###############################
#							  #
# Backup Tipbot Files		  #
#							  #
###############################

# Run this script from crontab just after the node backup file. 
# This will tar, and move the files to specific directories for syncing to additional services. 
# get latest files into dir
/usr/bin/nodejs $HOME/qrl-tips/_scripts/backup/backup.js

FileLocation=`cat $HOME/qrl-tips/_config/config.json |jq -r .backup.location`

cd $FileLocation
# Tar the files to location defined in BackupLocation
tar -czf TipBot_Backup.tar.gz -C $FileLocation/backup . >/dev/null 2>&1

