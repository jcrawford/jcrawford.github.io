const fs = require('fs');
const path = require('path');

/**
 * Strip Partytown debug artifacts from the production build.
 * gatsby-plugin-google-gtag copies the entire @builder.io/partytown lib,
 * including the debug/ directory, into public/~partytown/. The debug files
 * are not needed in production and bloat the deploy by several MB.
 */

const publicDir = path.resolve(__dirname, '..', 'public');
const partytownDir = path.join(publicDir, '~partytown');
const debugDir = path.join(partytownDir, 'debug');

if (!fs.existsSync(partytownDir)) {
  console.log('No ~partytown directory found; nothing to strip.');
  process.exit(0);
}

function rmrfSync(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

rmrfSync(debugDir);
console.log('Removed Partytown debug artifacts from', debugDir);

// Optional: also remove the debug entry from the copied lib files list if it exists.
const libJsonPath = path.join(partytownDir, 'lib', 'debug.txt');
if (fs.existsSync(libJsonPath)) {
  fs.rmSync(libJsonPath, { force: true });
  console.log('Removed Partytown debug metadata:', libJsonPath);
}
