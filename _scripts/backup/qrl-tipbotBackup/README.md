This is where the backup files will be once the backup.sh script is run.

Set this in crontab to run daily `0 01 * * * $HOME/qrl-tips/_scripts/backup/backup.sh`

then Rsync the backup tar to another server somewhere for safe keeping. 

THe wallet file is encrypted and the database has nothing worth interest.

