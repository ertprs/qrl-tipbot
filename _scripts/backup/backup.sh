#!/bin/bash

###############################
#							  #
# Backup Tipbot Files		  #
#							  #
###############################

# Run this script from crontab just after the node backup file. 
# This will tar, and move the files to specific directories for syncing to additional services. 
# Requires the script to be in the users /home directory under the original name.
# Also assumes that you are using the ./_scripts/backup/qrl-tipbotBackup/ directory in 
# your config file. {config.backup.location}

# Fix me to be smarter in the future.

# Script Variables
NOW=$(date +"%Y%m%dT%H%MZ")
FileLocation=`cat /home/$USER/qrl-tipbot/_config/config.json |jq -r .backup.location`
BackupLocation=/home/$USER/
# Remove the unencrypted file in the backup directory if there.
#check if file exists
count=`ls -1 ${FileLocation}*.sql 2>/dev/null | wc -l`
if [ $count != 0 ]
then 
  #rm -rf ${FileLocation}*.sql 
  count=`ls -1 ${FileLocation}*.sql 2>/dev/null | wc -l`
  if [ $count != 0 ]
  then 
    echo Failed to remove
  fi
fi 

# Tar the files to location defined in BackupLocation
tar -czf ${BackupLocation}${NOW}_TipBot_Backup.tar.gz -C $FileLocation ../../backup/ >/dev/null 2>&1

# Remove the old files to do this again later
#rm -rf ${FileLocation}* 
