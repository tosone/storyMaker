'use strict';

const fs = require('fs');
const path = require('path');

const makeStory = require('.');

const glob = require('glob');
const Promise = require('bluebird');

glob('test/*', (err, files) => {
  run(files).then(run.bind(null, files)).catch(e => console.log(e.stack));
});

function run(files) {
  return Promise.all(files.map(file => {
    return Promise.resolve({ type: path.basename(file, path.extname(file)), stream: fs.createReadStream(file), subfix: path.extname(file).slice(1) });
  })).then(data => {
    makeStory(data, { 'name': 'mama', 'version': '0.0.1' }).then(stream => {
      stream.pipe(fs.createWriteStream('test.tar.gz'));
    });
  });
}
