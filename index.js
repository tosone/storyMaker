'use strict';

const path = require('path');
const fs = require('fs-extra');
const Promise = require('bluebird');
const targz = require('tar.gz')({}, { 'fromBase': true });

const config = require('./config');

class MakeStory {
  constructor() {
    this.config = config;
  }

  init(input, output, option) {
    this.option = option;
    this.input = path.resolve(input || __dirname);
    this.output = path.resolve(output || __dirname);
    this.compress = [path.join(path.dirname(this.output), this.config.packageName), path.join(path.dirname(this.output), this.config.manifestName)];
    return Promise.coroutine(function* () {
      this.tempDir = yield this.tempDir();
      yield this.writeFile(this.option);
      let read = targz.createReadStream(this.tempDir);
      let write = fs.createWriteStream(this.output);
      read.pipe(write);
    }.bind(this))();
  }

  compress() {

  }

  copyFile(file, dir) {
    return new Promise((resolve, reject) => {
      fs.copy(file, dir, err => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  testFile(file) {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(path.join(path.dirname(this.input), file))) {
        resolve();
      }
      reject();
    });
  }

  tempDir() {
    return new Promise((resolve, reject) => {
      fs.mkdtemp('/tmp/makeStory', (err, folder) => {
        if (err) {
          reject(err);
        } else {
          resolve(folder);
        }
      });
    });
  }

  writeFile(option) {
    this.option.name = this.option.name || 'BabyStory';
    this.option.type = this.option.type || 'BabyStory';
    this.option.version = this.option.version || 'v0.0.1';
    this.option.author = this.option.author || 'automatic';

    return new Promise((resolve, reject) => {
      fs.writeFile(path.join(this.tempDir, this.config.packageName), JSON.stringify(option), err => {
        if (err) {
          reject(err);
        } else {
          let manifestFileContent = '';
          if (fs.existsSync(path.join(path.resolve(this.input), 'title.amr'))) {
            this.compress.push('title.amr');
            manifestFileContent += 'title.amr\n';
            fs.copySync(path.join(path.resolve(this.input), 'title.amr'), path.join(this.tempDir, 'title.amr'));
          }
          if (fs.existsSync(path.join(path.resolve(this.input), 'title.ogg'))) {
            this.compress.push('title.ogg');
            manifestFileContent += 'title.ogg\n';
            fs.copySync(path.join(path.resolve(this.input), 'title.ogg'), path.join(this.tempDir, 'title.ogg'));
          }
          if (fs.existsSync(path.join(path.resolve(this.input), 'content.amr'))) {
            this.compress.push('content.amr');
            manifestFileContent += 'content.amr\n';
            fs.copySync(path.join(path.resolve(this.input), 'content.amr'), path.join(this.tempDir, 'content.amr'));
          }
          if (fs.existsSync(path.join(path.resolve(this.input), 'content.ogg'))) {
            this.compress.push('content.ogg');
            manifestFileContent += 'content.ogg\n';
            fs.copySync(path.join(path.resolve(this.input), 'content.ogg'), path.join(this.tempDir, 'content.ogg'));
          }
          fs.writeFile(path.join(this.tempDir, this.config.manifestName), manifestFileContent, err => {
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
