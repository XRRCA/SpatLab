/**
 * Git help to HTML module
 * Copyright(c) 2017
 *
 * MIT Licensed
 *
 */
'use strict';
const debug = require('debug')('git-wiki-to-html');
let fs = require('fs');
const marked  = require('marked');
const Mustache  = require('mustache');
const path = require('path');
const util = require('util');
const localeMatch = '^([a-z][a-zA-Z_]+)';
const linkCleanup = [[/\?/g, '%3F']];

/**
 * Module for transforming markdown files from a srcDir to html with menu generated
 * and rules applied pre/post markdown processing
 *
 * @param {object} options for the module
 * @return {Function}
 * @api public
 */

class GitWikiToHTML {
    constructor(options) {
        options = options || {};
        this.rules = options.rules || {};
        // set a simple default menu tpl
        this.menuTpls = options.menu || {
            'item': '<li><a href="{{link}}">{{title}}</a></li>',
            'category': '<li><span>{{title}}</span><ul>{{{subitems}}}</ul></li>',
            'category-1': '<ul>{{{subitems}}}</ul>'
        };
        this.menus = [];
        this.srcDir = options.srcDir || './';
        this.destDir = options.destDir || './';
        // TODO set default separator to # for windows support and validate allowed chars in separator
        // TODO allowed [#-_]+
        this.separator = options.separator || ':';
        this.hashSeparator = options.hashSeparator || encodeURIComponent(this.separator);
        // TODO set default multilang to false
        this.multilang = options.multilang === false ? false : true;
        // TODO set empty prefix as default
        this.prefixFiles = typeof(options.prefixFiles) !== undefined ? options.prefixFiles : 'Help';
        // File filters depend on single/multilang mode
        // uderscored_locale#categ1#categ2#item.md
        // categ1#categ2#item.md
        this.filesFilterRule = options.filesFilterRule ||
            [
                this.multilang ? localeMatch + this.separator : '^[a-zA-Z]',
                this.prefixFiles ? this.prefixFiles : '',
                '.*.md$'
            ].join('');
        this.linkTemplate = options.linkTemplate || './#/%s';
        this.menuFileName = options.menuFile || '_menu_.html';
        this.menuOnly = options.menuOnly ? !!(options.menuOnly) : false;
        this.srcFiles = [];
        this.resFiles = [];
        this.defaultLanguage = options.defaultLanguage || 'en';

        this.menu = {};
    }

    transform() {
        debug('transform');
        if (!this.validConfiguration()) {
            throw new Error('Invalid SRC/DEST folder options');
        }

        let files = this.loadFiles();
        if (!this.menuOnly) {
            files.forEach((item) => {
                let content = fs.readFileSync(path.join(this.srcDir, item), 'utf-8');
                let transfContent = this.parse(content);
                this.writeFile(item.replace(/\.md$/, '.html'), transfContent);
            });
        }

        debug('All files written');
        this.menu = this.buildMenuTree(this.srcFiles);
        if (this.menu.size > 0) {
            // sync write menu(s)
            if (this.multilang) {
                this.menu.forEach((langMenu, language) => {
                    let menuStr = this.getMenu(
                        this.prefixFiles ? langMenu.get(this.prefixFiles) : langMenu);
                    debug('Write menu file: %s', `${language}${this.separator}${this.menuFileName}`);
                    fs.writeFileSync(path.join(this.destDir,
                        `${language}${this.separator}${this.menuFileName}`), menuStr);
                });
            } else {
                let menuStr = this.getMenu(this.prefixFiles ? this.menu.get(this.prefixFiles) :
                    this.menu);
                debug('Write menu file: %s', this.menuFileName);
                fs.writeFileSync(path.join(this.destDir, this.menuFileName), menuStr);
            }
        }
    }

    /**
     * Transforms the filenames list into an menu hierarchy object
     * @param  array
     */
    buildMenuTree(filesListObj) {
        let orderedFilesListObj = this.getOrderedFiles(filesListObj, this.rules.order || []);
        let menu = new Map();
        orderedFilesListObj.forEach((item) => {
            let rawItem = item.replace(/.md$/, '');
            let parts = rawItem.split(this.separator);
            let iterator = menu;
            parts.forEach((menuitem, index) => {
                if (!iterator.has(menuitem)) {
                    iterator.set(menuitem, new Map());
                }
                let subMenu = iterator.get(menuitem);
                if (index == parts.length - 1) {
                    subMenu.set('_link', rawItem.replace(new RegExp(this.separator, 'g'), this.hashSeparator));
                }

                iterator = subMenu;
            });
        });
        return menu;
    }

    getMenu(menuMap, menuKey, level) {
        level = level || 1;
        if (!menuMap || !(menuMap instanceof Map)) return '';
        // only _link inside
        if (menuMap.has('_link') && menuMap.size == 1) {
            return this.getMenuTpl(menuKey, menuMap.get('_link'), '', level, 'item');
        }

        // category object
        let rootLink = null;
        if (menuMap.size > 0) {
            let str = '';
            menuMap.forEach((itemMenu, key) => {
                // endpoint
                // currently we are not supporting category with separate link
                if (key !== '_link') {
                    str +=  this.getMenu(itemMenu, key, level + 1);
                } else {
                    rootLink = itemMenu;
                }
            });
            // saving category _link for template usage
            let ulLink = rootLink || '';
            return this.getMenuTpl(menuKey, ulLink, str, level, 'category');
        }
    }

    getMenuTpl(key, link, subitems, level, type) {
        key = key || '';
        link = link || '';
        level = level || 1;
        type = type || 'item';
        let title = key.replace(/-/gm, ' ').trim();
        // some characters need escaped for links
        if (linkCleanup) linkCleanup.forEach((rule) => { link = link.replace(rule[0], rule[1]); });
        // strip lang locales if any
        if (this.multilang) link = link.replace(new RegExp(localeMatch + this.hashSeparator), '');
        let formatedLink = link ? util.format(this.linkTemplate, link) : null;
        let result = '';
        let tplMenu = this.menuTpls;

        switch (type) {
        case 'item':
            result = tplMenu['item'];
            break;
        case 'category':
            // look for a level based template before falling on categ
            result = tplMenu['category-' + level] ? tplMenu['category-' + level] : tplMenu['category'];
            break;
        }

        // add level iterator object for moustache level based repeats
        let levelCount = level - 1;
        let levelRepeat = new Array(levelCount);
        levelRepeat.fill(level);
        return  Mustache.render(result, {title: title, link: formatedLink, id: link, subitems: subitems, level: level,
            levelRepeat: levelRepeat});
    }

    loadFiles() {
        debug('loadFiles');
        if (this.srcFiles && this.srcFiles.length > 0) {
            debug('loadFiles - loaded from object');
            return this.srcFiles;
        }

        // load files if not already loaded
        let filenames = fs.readdirSync(this.srcDir);
        this.srcFiles = filenames.filter((item) => {
            return !!item.match(new RegExp(this.filesFilterRule));
        });
        return this.srcFiles.sort();
    }

    parse(content) {
        content = this.applyRules(content, this.rules['pre'] || []);
        content = marked(content);
        content = this.applyRules(content, this.rules['post'] || []);
        return content;
    }

    applyRules(content, rules) {
        if (rules && rules.length > 0) {
            rules.forEach((ruleObj) => {
                let key = Object.keys(ruleObj)[0];
                let fromRule = new RegExp(key, 'gm');
                content = content.replace(fromRule, ruleObj[key]);
            });
        }
        return content;
    }

    writeFile(filename, content) {
        fs.writeFileSync(path.join(this.destDir, filename), content);
        debug('File generated: %s', path.join(this.destDir, filename));
        this.resFiles.push(filename);
    }

    validConfiguration() {
        if (!fs.statSync(this.srcDir).isDirectory()) {
            debug('Invalid SRC folder: ', this.srcDir);
            return false;
        }

        if (!fs.statSync(this.destDir).isDirectory()) {
            debug('Invalid OUTPUT folder: ', this.destDir);
            return false;
        }
        return true;
    }

    getOrderedFiles(sourceArr, priorityList) {
        let sourceArrSorted = Object.assign([], sourceArr);
        return sourceArrSorted.sort((item1, item2) => {
            let revOrder = Object.assign([], priorityList || []);
            revOrder.reverse();
            // order rules don't have locales'
            let langReg = this.multilang ? new RegExp(localeMatch + this.separator) : '';
            let index1 = revOrder.indexOf(item1.replace(langReg, ''));
            let index2 = revOrder.indexOf(item2.replace(langReg, ''));
            if (index1 === -1 && index2 === -1) {
                return item1 > item2 ? 1 : (item1 < item2 ? -1 : 0);
            } else {
                return index1 > index2 ? -1 : (index1 < index2 ? 1 : 0);
            }
        });
    }

    getTranslationObject(filesListObj) {
        let langs = [];
        let langTransObj = {};
        let transObj = {};
        filesListObj.forEach(
            (item) => {
                let rawItem = item.replace(/.md$/, '');
                let parts = rawItem.split(this.separator);
                let lang = parts.shift();

                if (langs.indexOf(lang) === -1) langs.push(lang);

                // the transObj based on default language
                if (lang === this.defaultLanguage) {
                    parts.forEach((part) => {
                        let transKey = part.replace(/-/gm, ' ').trim();
                        if (!transObj[transKey]) {
                            transObj[transKey] = transKey;
                        }
                    });
                }
            }
        );

        langs.forEach((langKey) => {
            langTransObj[langKey] = transObj;
        });

        return langTransObj;
    }
}

module.exports = GitWikiToHTML;
