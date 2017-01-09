'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const Promise = require('bluebird');
const targz = require('tar.gz')({}, { 'fromBase': true });

const config = require('./config');

class MakeStory {
  constructor() {
    this.config = config;
  }

  init(input, option) {
    this.manifestFileContent = [];
    this.option = option;
    this.input = input;
    return Promise.coroutine(function* () {
      this.tempDir = yield this.mkTempDir();
      yield this.genInputFiles();
      this.sortContent();
      yield this.writeFile(this.option);
      return targz.createReadStream(this.tempDir);
    }.bind(this))();
  }

  mkTempDir() {
    return new Promise((resolve, reject) => {
      fs.mkdtemp('/tmp/makeStory_', (err, folder) => {
        if (err) {
          reject(err);
        } else {
          resolve(folder);
        }
      });
    });
  }

  genInputFiles() {
    return Promise.all(this.input.map(info => {
      this.manifestFileContent.push(info.type + "." + info.subfix);
      let file = fs.createWriteStream(path.join(this.tempDir, info.type + "." + info.subfix));
      info.stream.pipe(file);
      info.stream.on('close', Promise.resolve);
    }));
  }

  sortContent() {
    let temp = [];
    _.forEach(this.manifestFileContent, v => {
      if (/title/.test(v)) {
        temp.push(v);
      }
    });
    // content 音频排序
    _.forEach(this.manifestFileContent, v => {
      if (!/title/.test(v)) {
        temp.push(v);
      }
    });
    this.manifestFileContent = temp;
  }

  writeFile(option) {
    this.option.name = this.option.name || 'BabyStory';
    this.option.type = this.option.type || 'BabyStory';
    this.option.version = this.option.version || 'v0.0.1';
    this.option.author = this.option.author || 'automatic';

    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(this.tempDir, this.config.packageName), JSON.stringify(option), err => { // package.json
        if (err) {
          reject(err);
        } else {
          fs.writeFile(path.join(this.tempDir, this.config.manifestName), this.manifestFileContent.join('\n'), err => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        }
      });
    });
  }
}

let makeStory = new MakeStory();
module.exports = makeStory.init.bind(makeStory);
