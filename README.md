# storyMaker

故事打包工具

makeStory(input, output, option)
- `input` Array 包含所有的内容音频 `[{type: "title", stream: "stream", subfix: "mp3"}]`
- `option` 故事包的参数
  - `name` 故事的名字
  - `version` 故事的版本

返回值为 Promise，回调中含有创建的压缩包的 stream 对象。

Example:
``` javascript
'use strict';

const fs = require('fs');
const path = require('path');

const makeStory = require('.');

const glob = require('glob');
const Promise = require('bluebird');

glob('test/*', (err, files) => {
  Promise.all(files.map(file => {
    return Promise.resolve({ type: path.basename(file, path.extname(file)), stream: fs.createReadStream(file), subfix: path.extname(file).slice(1) });
  })).then(data => {
    makeStory(data, { 'name': 'mama', 'version': '0.0.1' }).then(stream => {
      stream.pipe(fs.createWriteStream('test.tar.gz'));
    });
  });
});
```
