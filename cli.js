'use strict';

const os = require('os');
const program = require('commander');

program
  .option('-n, --name', 'Story name')
  .option('-v, --version <version>', 'Specify version for story', '0.0.1')
  .option('-t, --template <template>', 'Specify template', process.env.make_story_template)
  .parse(process.argv);

console.log(' - sessions %j', program.sessions);
console.log(' - template %j', program.template);
console.log(' - css %j', program.css);
