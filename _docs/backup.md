# Backup the Bot

To provide redundancy and failsafe any catastrophes the bot needs to be backed up. We have peoples funds at risk and any compromise of them is unacceptable.

> A backup is not truly a backup until it is stored in at least 3 separate physical locations!

We will run the backup frequently, saving the latest data and pushing out to multiple locations. All data must be encrypted and the encryption phrase should be stored on other media.

**Backup Requirements**

- Data saved frequently
- Backed-up data is never stored in plain text
- Backups are stored on multiple platforms in separate locations
- Validation of the backup and successful transmission. Notify on failure

## Backup Data

We need to backup any of the user information and wallet files needed for rebuilding the bot upon failure.

| Data | Location | Description | 
| ---- | ---------| ----------- |
| Wallet File | ~/.qrl | The main wallet file used by the bot. File is encrypted already from setup for extra security. 
| Config File | {BOT_DIR}/_config/config.json | The bot main configuration file. |
| Bot Database | MySQL database | The bot database, containing user info and transaction details (Public keys and amounts) all info is public. |
| Node State Files | ~/.qrl/data/state | The QRL Blockchain. Will save time on the re-sync however is large. |


