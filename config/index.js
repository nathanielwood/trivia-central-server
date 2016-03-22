// config/index.js
/* eslint-disable */

// ensures that the custom.js file has been created

var fs = require('fs');

try {
  fs.accessSync(__dirname + '/custom.js');
} catch (e) {
  console.log('The custom config file is required.');
  console.log('Copy config/outline.js to config/custom.js and fill it out with custom configurations');
  process.exit(1);
}
