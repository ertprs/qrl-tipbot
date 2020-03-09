'use strict';


// file to hold useful functions and helpers for the scripts.


async function checkForUser(argsps) {
      CheckUserPromise.then(function(result) {
        const found = result.user_found;
        // console.log('found: ' + found);
        if (found == 'true') {
          const id = result.user_id;
          // console.log('id: ' + id);
          const returnData = { found: 'true', user_id: id };
           console.log('returnData: ' + JSON.stringify(returnData));
          return RETURNDATA = JSON.parse(JSON.stringify(returnData));
        }
        else {
          // user not found
          const returnData = { found: 'false' };
          // console.log('returnData: ' + returnData);
          // console.log('User found:\t' + found);
          return JSON.parse(JSON.stringify(returnData));
        }
      });
    }



module.exports = {
  checkForUser : checkForUser,

}