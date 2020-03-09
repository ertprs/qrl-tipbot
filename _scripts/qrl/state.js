const util = require('util');
const exec = util.promisify(require('child_process').exec);

// set an async function to call the stare from the node
async function qrlState(args) {
  // check if I have any arguments
  // console.log(`check args: ${args}`)

  if (args !== undefined) {
    // If yes, then get the details, greping the arg out
    const { stdout, stderr } = await exec(`qrl state |grep "${args}"`);
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    const state = stdout;
    console.log(`qrlState: ${state}`);
    return state;
  }
  // else the arg was not sent, retur the full output.
  else {
    const { stdout, stderr } = await exec('qrl --json state');
    if (stderr) {
      console.error(`error: ${stderr}`);
    }
    console.log(`qrlState: ${stdout}`);
    const state = stdout;
   return state;
  }
}
// export the functiion for use
module.exports = {
  qrlState : qrlState,
};
