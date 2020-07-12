/*
npm install mysqldump
*/
/*
NEED TO WRITE
Need a recover script to rebuild the bot!
*/
// Script to backup all of the files needed to run the bot
// This file will accept variables and do things with them
//  to backup to various services.
// By default the script only backs up the files locally.
// Keep track of when the script was ran last in teh .last_run file located in this directory.

// const webdav = require('webdav');
// const aws = require('awsSDK');

const fs = require('fs');
const crypto = require('crypto');
const config = require('../../_config/config.json');


/*
The file /_scripts/backup/.last_run will hold all of the relavant information for
each file that was backed up, including the sha256sum of the file when created.
This file will track the last run, last rolled, and allow tracking of when we should do things
// FEATURE - Add signing functions from the qrl-cli lattice keys and track this in
	ephemeral communications to a private location. Also signing and encrypting with the
	lattice keys would add validity to that system and security to this one.
	or notorize it on the chain using the Public Bot wallet
*/

const last_run_file_path = '__dirname/.last_run';
// const last_run = fs.readFileSync(last_run_file_path);
// const last__run_data = JSON.parse(last_run);
const mysqldump = require('mysqldump');

// calculate if it has been $days since the last backup
function checkDate(days) {
  const date = new Date();
  const last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
  const day = last.getDate();
  const month = last.getMonth() + 1;
  const year = last.getFullYear();
  const daysData = { date: date, last: last, day: day, month: month, year: year };
  return daysData;
}

// function to update the last_run json file
// data comes in an array { service: (dropbox, webdav, rsync, s3), sha256sum: sha256sum, file_name: file_name }
function updateLastRun(data) {
	const time_now = new Date();
	const updated_info = {
		service: data.service,
		sha256sum: data.sha256sum,
		file_name: data.file_name,
		last_updated: time_now,
	};
	const update = JSON.stringify(updated_info, null, 2);
	// check for file? may not need this at all...
	try {
		if (fs.existsSync(last_run_file_path)) {
			// file exists, send the update info
			fs.writeFileSync(update);
			console.log('Updated last_run with this data:\n' + update);
		}
		else {
			console.log('no file found at: ' + last_run_file_path);
		}
	}
	catch(err) {
		console.error(err);
		}
}

// sha256sum file. Send the file location to sum
function sha256sum(file) {
	// change the algo to sha1, sha256 etc according to your requirements
	const algo = 'sha256';
	const shasum = crypto.createHash(algo);

	const s = fs.ReadStream(file);
	s.on('data', function(d) { shasum.update(d); });
	s.on('end', function() {
		const d = shasum.digest('hex');
		console.log(d);
		return d;
	});
}

// backup database into a tar.gz file and save in the backup folder
function sqlBackup() {
	// dump the result straight to a compressed file
	mysqldump({
		connection: {
			host: config.database.db_host,
			user: config.database.db_user,
			password: config.database.db_pass,
			database: config.database.db_name,
		},
		dumpToFile: config.backup.location,
		compressFile: true,
	});
}

// Roll files in the backup, moving and removing old backups to manage the size
function rollFiles() {
/*
Keep backups for the last month in various snapshots
- Monthly backup (first day of the month, Includes the state files)
- Weekly Backups (Save every Friday of the month @ 00:00)
- Daily Backups (Save the last week every day @ 00:00)
- Save the last 24Hrs (Save every hour, on the hour)
- Write the roll update to thelast_run file
*/
// set the time now into a variable
/* const now = new Date();

now.setDate(now.getDate()-7);

var mydatestring =  ''; // from the json file, change for each in the file... format should be - '2016-07-26T09:29:05.00';
var mydate = new Date(mydatestring);
var difference = now - mydate; // difference in milliseconds
const TOTAL_MILLISECONDS_IN_A_WEEK = 1000 * 60 * 24 * 7;

if (Math.floor(difference / TOTAL_MILLISECONDS_IN_A_WEEK) >= 7) {
    console.log('Current date is more than 7 days older than : ' + mydatestring);
}
*/
}
// tar everything
// Take all files and tar tehm into one condensed file to send in email?

const week = checkDate(7);
console.log(week);

// Upload files to webdav


// Upload files to s3 bucket