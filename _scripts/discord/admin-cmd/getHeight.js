/* module.exports.getheight = function(callback) {
  execute('qrl --json state |grep height', function(height) {
    callback({ name: height.replace('\n', '') });
  });
};
*/

const util = require('util');
const exec = util.promisify(require('child_process').exec);

async function qrlState(args) {
  if (args === 'version') {
    const { stdout, stderr, error } = await exec('qrl --json state |grep version');
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    return stdout();

  }
  else if (args === 'state') {
    const { stdout, stderr, error } = await exec('qrl --json state |grep state');
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    return stdout();
  }
  else if (args === 'num_connections') {
    const { stdout, stderr, error } = await exec('qrl --json state |grep num_connections');
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    return stdout();
  }
  else if (args === 'num_known_peers:') {
    const { stdout, stderr, error } = await exec('qrl --json state |grep num_known_peers:');
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    return stdout();
  }
  else if (args === 'uptime') {
    const { stdout, stderr, error } = await exec('qrl --json state |grep uptime');
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    return stdout();
  }
  else if (args === 'block_height') {
    const { stdout, stderr, error } = await exec('qrl --json state |grep block_height');
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    return stdout();
  }
  else if (args === 'block_last_hash') {
    const { stdout, stderr, error } = await exec('qrl --json state |grep block_height');
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    return stdout();
  }
  else if (args === 'network_id') {
    const { stdout, stderr, error } = await exec('qrl --json state |grep block_height');
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    return stdout();
  }
  else {
    const { stdout, stderr, error } = await exec('qrl --json state');
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    console.log(stdout);
    console.log(stderr);
    return stdout();
  }
}
module.exports.version = qrlState('version');
module.exports.state = qrlState();
module.exports.num_connections = qrlState('num_connections');
module.exports.num_known_peers = qrlState('num_known_peers');
module.exports.uptime = qrlState('uptime');
module.exports.block_height = qrlState('block_height');
module.exports.block_last_hash = qrlState('block_last_hash');
module.exports.network_id = qrlState('network_id');
module.exports.STATE = qrlState('');
// qrlState('');