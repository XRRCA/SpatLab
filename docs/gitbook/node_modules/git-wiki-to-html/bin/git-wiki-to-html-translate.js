#!/usr/bin/env node
/**
 * CLI tool for transforming input files to json translation files from a src folder to dest
 * usage: node ./git-wiki-to-html-translate.js [srcFolder] <dstFolder>
 *
 *
 * Note: After `npm install` the path to ./node_modules/bin/ can be used
 *
 */
'use strict';
const GitWikiToHTML = require('../');
const Console = require('console').Console;
const fs = require('fs');
const path = require('path');

const myConsole = new Console(process.stdout, process.stderr);
if (process.argv.length < 3 || process.argv.indexOf('--help') > -1) {
    myConsole.log(
        'To generate translation files in target directory:',
        '\nusage: node ./git-wiki-to-html.js [srcFolder] <dstFolder>'
    );
    process.exit(0);
}

const obj = new GitWikiToHTML({
    'srcDir': process.argv[2] || null,
    'destDir': process.argv[3] || null
});

obj.loadFiles().then((files) => {
    const langObj = obj.getTranslationObject(files);
    Object.keys(langObj).forEach((language) => {
        const fileName = path.join(obj.destDir, `${language}.json`);
        myConsole.log('Language file generated: %s', fileName);
        fs.writeFileSync(fileName, JSON.stringify(langObj[language], null, 2));
    });

}).catch((err) => {
    myConsole.log('Error: ', err);
    process.exit(1);
});
