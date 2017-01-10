'use strict';
const StoryMaker = require('./lib/story-maker');
const config = require('./config');
const co = require('co');

module.exports = function(input, option) {
  const storyMaker = new StoryMaker(config);
  return co(storyMaker.package.bind(storyMaker, input, option));
};
