#!/usr/bin/env node
/**
 * CLI tool for transforming markdown files to html from a src folder to dest
 * usage: node ./git-wiki-to-html.js [srcFolder] [dstFolder] [custom-options-folder]
 *
 * rules/menu files defaults to ./data/default/*  - if not provided
 * new rules/menu items are merged on top of default rules
 *
 * Note: After `npm install` the path to ./node_modules/bin/ can be used
 *
 */
'use strict';
const debug = require('debug')('git-wiki-to-html-bin');
const fs = require('fs');
const path = require('path');
const GitWikiToHTML = require('../');
const Console = require('console').Console;
const _ = require('lodash');
const argv = require('minimist')(process.argv.slice(2));

const myConsole = new Console(process.stdout, process.stderr);


if (Object.keys(argv).length === 1 || argv['help']) {
    myConsole.log(`
NAME

    git-wiki-to-html -- Parse markdown .md files from src folder and transform them to html files in target folder

SYNOPSIS

    git-wiki-to-html [--src=srcFolder] [--dest=destFolder] [--template=template] [--options=optionsfile]

DESCRIPTION

    Parse markdown .md files from src folder and based on the options transform them to html files in target folder.
    At same time it generates menu html file with the hierarchy of items based on the file names

    The following options are available:

    --src          Sets the source directory for parsing markdown files (defaults to working directory)

    --dest         Sets the target directory for transformed html files (defaults to working directory)

    --template     Uses one of pre-defined options templates (markdown, northstar-angular). 
                   "markdown" template generates only the menu in __Sidebar.md file for github wiki side menu

    --options      Allow to set an local .json file as the options file (applied on top of default and template options)
                   If not set it seeks for a options.json file in working directory
`);
    process.exit(0);
}

// set folders
let baseDir = __dirname;
let dataDir = path.join(baseDir, '../data');
let workDir = process.cwd();

debug('baseDir: %s', baseDir);
debug('dataDir: %s', dataDir);
debug('workDir: %s', workDir);

let concatArrays = (objValue, srcValue) => {
    if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
};

let getPath = (targetPath) => {
    return path.isAbsolute(targetPath) ? targetPath : path.join(workDir, targetPath);
};

// set src & det folders
let srcDir = argv['src'] ? getPath(argv['src']) : null;
let destDir = argv['dest'] ? getPath(argv['dest']) : null;

if (srcDir && (!fs.existsSync(srcDir) || !fs.lstatSync(srcDir).isDirectory())) {
    myConsole.log('Parameter --src should be a directory', srcDir);
    process.exit(1);
}

if (destDir && (!fs.existsSync(destDir) || !fs.lstatSync(destDir).isDirectory())) {
    myConsole.log('Parameter --dest should be a directory', destDir);
    process.exit(1);
}

// look for options first in template
let template = argv['template'] || null;
let optionsFile = argv['options'] ?  getPath(argv['options']) : getPath('options.json');
let templateFile = template ? path.join(dataDir, template, 'options.json') : null;
// load default rules
let defaultOptions = require(path.join(dataDir, 'default', 'options.json'));
defaultOptions.srcDir = srcDir || workDir;
defaultOptions.destDir = destDir || workDir;

if (template) {
    if (fs.existsSync(templateFile) && fs.lstatSync(templateFile).isFile()) {
        debug('Using package options template: %s', template);
        let templateOptions = require(templateFile);
        defaultOptions = _.mergeWith(defaultOptions, templateOptions, concatArrays);
    } else {
        debug('Template parameter not matching any directory: %s', templateFile);
    }
}

// check for custom options.json file
if (optionsFile) {
    if (fs.existsSync(optionsFile) && fs.lstatSync(optionsFile).isFile()) {
        debug('Using custom options file template: %s', optionsFile);
        let customOptions = require(optionsFile);
        defaultOptions = _.mergeWith(defaultOptions, customOptions, concatArrays);
    } else {
        debug('Options file parameter not matching any file: %s', optionsFile);
    }
}

debug('srcDir: %s', srcDir);
debug('destDir: %s', destDir);

const obj = new GitWikiToHTML(defaultOptions);

try {
    obj.transform();
    myConsole.log('Transform DONE. %s Files generated: ', obj.resFiles.length);
} catch (err) {
    myConsole.log('Error: ', err);
    process.exit(1);
}
