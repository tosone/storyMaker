'use strict';

const fs = require('fs');
const path = require('path');

const _ = require('lodash');
const Promise = require('bluebird');
const targz = require('tar.gz')({}, { 'fromBase': true });

const mkdtemp = Promise.promisify(fs.mkdtemp);
const writeFile = Promise.promisify(fs.writeFile);

class StoryMaker {
  
  constructor(config) {
    this.config = config;
    this.manifestFileContent = [];
  }

  * package(input, option) {
    this.option = option;
    this.input = input;
    this.tempDir = yield this.mkTempDir();
    yield this.genInputFiles();
    this.sortContent();
    yield this.writeFile(this.option);
    return targz.createReadStream(this.tempDir);
  }

  * mkTempDir() {
    const folder = yield mkdtemp('/tmp/makeStory_');
    return folder;
  }

  * genInputFiles() {
    const genenratedFiles = yield this.input.map(this.genInputFile.bind(this));
    return genenratedFiles;
  }

  genInputFile(info) {
    const manifestFileContent = this.manifestFileContent;
    const tempDir = this.tempDir;
    return new Promise(function (resolve, reject) {
      manifestFileContent.push(`${info.type}.${info.subfix}`);
      const file = fs.createWriteStream(path.join(tempDir, `${info.type}.${info.subfix}`));
      info.stream.pipe(file);
      info.stream.on('close', resolve);
      info.stream.on('error', reject);
    });
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

  * writeFile() {
    this.option.name = this.option.name || 'BabyStory';
    this.option.type = this.option.type || 'BabyStory';
    this.option.version = this.option.version || 'v0.0.1';
    this.option.author = this.option.author || 'automatic';

    // package.json
    yield writeFile(path.join(this.tempDir, this.config.packageName), JSON.stringify(this.option.name));
    yield writeFile(path.join(this.tempDir, this.config.manifestName), this.manifestFileContent.join('\n'));
  }

}

module.exports = StoryMaker;
