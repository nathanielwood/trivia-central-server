// config/index.js

import fs from 'fs';
import custom from './custom';

export default () => {
  fs.access('./custom.js', fs.F_OK, (err) => {
    if (err) {
      console.log('The custom config file is required.'); // eslint-disable-line
      console.log('Copy config/outline.js to config/custom.js and fill it out with custom configurations'); //eslint-disable-line
      return {};
    }
    return custom;
  });
};
