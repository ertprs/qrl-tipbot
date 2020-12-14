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

FileLocation=`cat /home/$USER/qrl-tips/_config/config.json |jq -r .backup.location`
echo $FileLocation

BackupLocation=/home/$USER/

cd $FileLocation
# Tar the files to location defined in BackupLocation
tar -czf TipBot_Backup.tar.gz -C $FileLocation/backup . >/dev/null 2>&1

# Remove the old files to do this again later
#rm -rf ${FileLocation}* 
