'use strict';

const expect = require('chai').expect,
    sinon = require('sinon'),
    rewire = require('rewire'),
    GitWikiToHTML = rewire('../lib/git-wiki-to-html.js');

describe('Testsuite GitWikiToHTML', () => {
    let fsMock = {
        statSync: () => {},
        writeFileSync: () => {},
        readFileSync: () => {},
        readdirSync: () => {}
    };

    let statSyncStub, readdirSyncStub, readFileSyncStub, writeFileSyncStub;

    before(() => {
        GitWikiToHTML.__set__('fs', fsMock);
    });

    beforeEach(() => {
        readFileSyncStub = sinon.stub(fsMock, 'readFileSync');
        statSyncStub = sinon.stub(fsMock, 'statSync');
        readdirSyncStub = sinon.stub(fsMock, 'readdirSync');
        writeFileSyncStub = sinon.stub(fsMock, 'writeFileSync');
    });

    afterEach(() => {
        readFileSyncStub.restore();
        statSyncStub.restore();
        readdirSyncStub.restore();
        writeFileSyncStub.restore();
        writeFileSyncStub.restore();
    });

    describe('Multilanguage', () => {

        let dirContent = [
            '.git',
            'Home.md',
            'en:Help.md',
            'en:Help:Landing-Some-Page.md',
            'fr_ca:Help.md',
            'test.txt'
        ];

        let dirFilteredContent = [
            'en:Help.md',
            'en:Help:Landing-Some-Page.md',
            'fr_ca:Help.md'
        ];

        let menuBuilt = {
            'en': {
                'Help': {
                    'Categ-page': {
                        'Item-page-1': {
                            '_link': 'en:Help:Categ-page:Item-page-1'
                        },
                        'Item-page-2': {
                            '_link': 'en:Help:Categ-page:Item-page-2'
                        }
                    },
                    'Landing-Some-Page': {
                        '_link': 'en:Help:Landing-Some-Page'
                    },
                    '_link': 'en:Help'
                }
            },
            'fr_ca': {
                'Help': {
                    'Categ-page': {
                        'Item-page-1': {
                            'Page': {
                                '_link': 'fr_ca:Help:Categ-page:Item-page-2'
                            }
                        }
                    },
                    '_link': 'fr_ca:Help'
                }
            }
        };

        let menuSrcFiles = [
            'en:Help.md',
            'en:Help:Landing-Some-Page.md',
            'en:Help:Categ-page:Item-page-1.md',
            'en:Help:Categ-page:Item-page-2.md',
            'fr_ca:Help.md',
            'fr_ca:Help:Categ-1:Categ-2:Page.md'
        ];

        it('Testcase - Constructor - default params', () => {
            let error = null;
            let parser;
            try {
                parser = new GitWikiToHTML();
            } catch (err) {
                error = err;
            }
            expect(error).to.be.null;
            expect(parser).not.to.be.null;
            expect(parser.srcDir).to.equal('./');
            expect(parser.srcDir).to.equal('./');
        });

        it('Testcase - Constructor - with params', () => {
            let error = null;
            let parser;
            try {
                parser = new GitWikiToHTML({
                    srcDir: './path/to/src',
                    destDir: './path/to/dest'
                });
            } catch (err) {
                error = err;
            }
            expect(error).to.be.null;
            expect(parser).not.to.be.null;
            expect(parser.srcDir).to.equal('./path/to/src');
            expect(parser.destDir).to.equal('./path/to/dest');
        });

        it('Testcase - validConfiguration - valid', () => {
            statSyncStub.returns({isDirectory: () => { return true; }});
            let parser = new GitWikiToHTML({
                srcDir: './path/to/src',
                destDir: './path/to/dest'
            });

            let isValid = parser.validConfiguration();
            expect(isValid).to.equal(true);
        });

        it('Testcase - validConfiguration - invalid srcDir', () => {
            statSyncStub.returns({isDirectory: () => { return false; }});
            let parser = new GitWikiToHTML({
                srcDir: './invalid-path/to/src',
                destDir: './invalid-path/to/dest'
            });

            let isValid = parser.validConfiguration();
            expect(isValid).to.equal(false);
        });

        it('Testcase - validConfiguration - invalid srcDir', () => {
            statSyncStub.withArgs('./path/to/src').returns({isDirectory: () => { return true; }});
            statSyncStub.withArgs('./invalid-path/to/dest').returns({isDirectory: () => { return false; }});
            let parser = new GitWikiToHTML({
                srcDir: './path/to/src',
                destDir: './invalid-path/to/dest'
            });

            let isValid = parser.validConfiguration();
            expect(isValid).to.equal(false);
        });

        it('Testcase - loadFiles - not cached', () => {
            readdirSyncStub.returns(dirContent);
            let parser = new GitWikiToHTML();

            let res = parser.loadFiles();
            expect(res).to.deep.equal(dirFilteredContent);
        });

        it('Testcase - loadFiles - read failure', () => {
            readdirSyncStub.throws(new Error('read fail'));
            let parser = new GitWikiToHTML();
            let error;
            try {
                parser.loadFiles();
            } catch (err) {
                error = err;
            }

            expect(error.message).to.equal('read fail');

        });

        it('Testcase - loadFiles - from cache', () => {
            readdirSyncStub.returns([]);
            let parser = new GitWikiToHTML();
            let res = parser.srcFiles = ['en:sample:file.md'];
            expect(res).to.deep.equal(['en:sample:file.md']);
        });

        it('Testcase - writeFile', () => {
            writeFileSyncStub.returns(true);
            let parser = new GitWikiToHTML(
                {destDir: './dest'}
            );

            parser.writeFile('en:test:file.html', '<p>HTML file</p>');
            expect(writeFileSyncStub.calledWith('dest/en:test:file.html')).to.equal(true);
            expect(parser.resFiles[0]).to.equal('en:test:file.html');
        });

        it('Testcase - parse', () => {
            let parser = new GitWikiToHTML();
            let content = parser.parse('# Title for the page');
            expect(content).to.equal('<h1 id="title-for-the-page">Title for the page</h1>\n');
        });

        it('Testcase - transform', () => {
            let parser = new GitWikiToHTML();
            parser.srcFiles = ['en:Help.md', 'en:Help:Landing.md', 'fr_ca:Help.md', 'fr_ca:Help:Landing.md'];
            sinon.stub(parser, 'validConfiguration').returns(true);
            readFileSyncStub.returns('# content');
            writeFileSyncStub.returns(true);

            parser.transform();
            expect(readFileSyncStub.callCount).to.equal(4);
            expect(parser.resFiles[0]).to.equal('en:Help.html');
            expect(parser.resFiles[1]).to.equal('en:Help:Landing.html');
        });

        it('Testcase - transform - not validConfiguration', () => {
            let parser = new GitWikiToHTML();
            parser.srcFiles = ['en:Help.md', 'en:Help:Landing.md'];
            sinon.stub(parser, 'validConfiguration').returns(false);
            readFileSyncStub.returns('# content');
            writeFileSyncStub.returns(true);

            let error;
            try {
                parser.transform();
            } catch (err) {
                error = err;
            }
            expect(error).to.be.ok;
            expect(error.message).to.equal('Invalid SRC/DEST folder options');
        });

        it('Testcase - transform - loadFiles fails', () => {
            let parser = new GitWikiToHTML();
            let errorExpected = new Error('Load fails');
            parser.srcFiles = ['en:Help.md', 'en:Help:Landing.md'];
            sinon.stub(parser, 'validConfiguration').returns(true);
            sinon.stub(parser, 'loadFiles').throws(errorExpected);

            let error;
            try {
                parser.transform();
            } catch (err) {
                error = err;
            }
            expect(error).to.be.ok;
            expect(error).to.deep.equal(errorExpected);
        });

        it('Testcase - transform - write fails', () => {
            let parser = new GitWikiToHTML();
            let errorExpected = new Error('Write failure');
            parser.srcFiles = ['en:Help.md', 'en:Help:Landing.md'];
            sinon.stub(parser, 'validConfiguration').returns(true);
            readFileSyncStub.returns('# content');
            writeFileSyncStub.throws(errorExpected);

            let error;
            try {
                parser.transform();
            } catch (err) {
                error = err;
            }
            expect(error).to.be.ok;
            expect(error).to.deep.equal(errorExpected);
        });

        it('Testcase - applyRules - empty rules - same content', () => {
            let parser = new GitWikiToHTML();
            let content = `# Some content h1
                Another line here
            `;
            let resp = parser.applyRules(
                content,
                null);
            expect(resp).to.equal(content);
        });

        it('Testcase - applyRules - a list of markdown rules', () => {
            let parser = new GitWikiToHTML();
            let content = `# Some content h1 ((link))
                Another line here
            `;
            let expectedRes = `# Something content h1 (%28link%29)
                Another line here
            `;
            let resp = parser.applyRules(
                content,
                [
                    {'Some ': 'Something '},
                    {'\\((.*)\\((.*)\\)(.*)\\)': '($1%28$2%29$3)'}
                ]);
            expect(resp).to.equal(expectedRes);
        });

        it('Testcase - applyRules - empty rules - a list of html rules', () => {
            let parser = new GitWikiToHTML();
            let content = `<h1 id="soemthing">Text</h1>
            <h2>Text H2</h2>
            <table><tr><td>content here</td></tr></table>
            <table id="tbl-id"><tr><td>content here</td></tr></table>
            <img src="/path/to/img" />
            `;
            let expectedRes = `<h1 class='ibm-h1' id="soemthing">Text</h1>
            <h2 class='ibm-h2'>Text H2</h2>
            <table class="ibm-data-table ibm-altcols ibm-grid"><tr><td>content here</td></tr></table>
            <table class="ibm-data-table ibm-altcols ibm-grid" id="tbl-id"><tr><td>content here</td></tr></table>
            <img class="ibm-resize" src="/path/to/img" />
            `;
            let resp = parser.applyRules(
                content,
                [
                    {'<h([1-3])': '<h$1 class=\'ibm-h$1\''},
                    {'<table([\\s]?)': '<table class="ibm-data-table ibm-altcols ibm-grid"$1'},
                    {'<img ': '<img class="ibm-resize" '}
                ]);
            expect(resp).to.equal(expectedRes);
        });

        it('Testcase - buildMenuTree - default order', () => {
            let parser = new GitWikiToHTML({
                rules: {
                    order: []
                }
            });
            let result = parser.buildMenuTree(menuSrcFiles);

            expect(result.get('en').get('Help').get('Landing-Some-Page').get('_link'))
                .to.equal('en%3AHelp%3ALanding-Some-Page');
            expect(result.get('en').get('Help').get('Categ-page').get('Item-page-1').get('_link'))
                .to.equal('en%3AHelp%3ACateg-page%3AItem-page-1');
        });

        it('Testcase - buildMenuTree - ordered', () => {
            let parser = new GitWikiToHTML({
                rules: {
                    order: [
                        'Help:Categ-page:Item-page-2.md'
                    ]
                }
            });
            let result = parser.buildMenuTree(menuSrcFiles);
            let lev1EnMapKeys = (result.get('en').get('Help')).keys();
            expect(lev1EnMapKeys.next().value).to.equal('Categ-page');
            expect(lev1EnMapKeys.next().value).to.equal('_link');
            expect(lev1EnMapKeys.next().value).to.equal('Landing-Some-Page');
            let lev2EnMapKeys = (result.get('en').get('Help').get('Categ-page')).keys();
            expect(lev2EnMapKeys.next().value).to.equal('Item-page-2');
            expect(lev2EnMapKeys.next().value).to.equal('Item-page-1');
        });

        it('Testcase - getMenuTpl - item', () => {
            let parser = new GitWikiToHTML();
            parser.menu = menuBuilt;
            let result = parser.getMenuTpl('Item-page-1', 'en%3AHelp%3ACateg-page%3AItem-page-1', null, null, 'item');
            expect(result).to.deep.equal('<li><a href=".&#x2F;#&#x2F;Help%3ACateg-page%3AItem-page-1">Item page 1'
            + '</a></li>');
        });

        it('Testcase - getMenuTpl - categ', () => {
            let parser = new GitWikiToHTML();
            let result = parser.getMenuTpl('Categ-Page', null, '_SUBITEMS_', 2, 'category');
            expect(result).to.deep.equal('<li><span>Categ Page</span><ul>_SUBITEMS_</ul></li>');
        });

        it('Testcase - getMenuTpl - categ level', () => {
            let parser = new GitWikiToHTML();
            let result = parser.getMenuTpl('Categ-Page', null, '_SUBITEMS_', 1, 'category');
            expect(result).to.deep.equal('<ul>_SUBITEMS_</ul>');
        });

        it('Testcase - getMenu', () => {
            let parser = new GitWikiToHTML();
            let menuMap = parser.buildMenuTree(menuSrcFiles);
            let resultFr = parser.getMenu(menuMap.get('fr_ca').get('Help'));
            expect(resultFr).to.deep.equal('<ul><li><span>Categ 1</span><ul><li><span>Categ 2</span><ul><li>'
            + '<a href=".&#x2F;#&#x2F;Help%3ACateg-1%3ACateg-2%3APage">Page</a></li></ul></li></ul></li></ul>');
            let resultEn = parser.getMenu(menuMap.get('en').get('Help'));
            expect(resultEn).to.deep.equal('<ul><li><span>Categ page</span><ul><li><a href=".&#x2F;#&#x2F;'
            + 'Help%3ACateg-page%3AItem-page-1">Item page 1</a></li><li><a href=".&#x2F;#&#x2F;Help%3ACateg'
            + '-page%3AItem-page-2">Item page 2</a></li></ul></li><li><a href=".&#x2F;#&#x2F;Help%3ALanding'
            + '-Some-Page">Landing Some Page</a></li></ul>');
        });

        it('Testcase - getMenu ordered', () => {
            let parser = new GitWikiToHTML({
                rules: {
                    order: [
                        'Help:Categ-page:Item-page-2.md'
                    ]
                }
            });
            let menuMap = parser.buildMenuTree(menuSrcFiles);
            let result = parser.getMenu(menuMap.get('en').get('Help'));
            expect(result).to.deep.equal('<ul><li><span>Categ page</span><ul><li><a href=".&#x2F;#&#x2F;'
            + 'Help%3ACateg-page%3AItem-page-2">Item page 2</a></li><li><a href=".&#x2F;#&#x2F;Help%3ACat'
            + 'eg-page%3AItem-page-1">Item page 1</a></li></ul></li><li><a href=".&#x2F;#&#x2F;Help%3ALan'
            + 'ding-Some-Page">Landing Some Page</a></li></ul>');
        });


        it('Testcase - getOrderedFiles', () => {
            let parser = new GitWikiToHTML();
            parser.menu = menuBuilt;
            let result = parser.getOrderedFiles([]);
            expect(result).to.deep.equal([]);
        });

        it('Testcase - getOrderedFiles', () => {
            let parser = new GitWikiToHTML();
            let result = parser.getOrderedFiles([
                'en:A:B', 'en:A:A', 'en:B', 'en:C', 'en:D', 'en:E', 'fr_ca:D', 'fr_ca:A:B'
            ], [
                'D', 'E', 'C'
            ]);
            expect(result).to.deep.equal([
                'en:D',
                'fr_ca:D',
                'en:E',
                'en:C',
                'en:A:A',
                'en:A:B',
                'en:B',
                'fr_ca:A:B'
            ]);
        });

        it('Testcase - getTranslationObject()', () => {
            const transDirFilteredContent = {
                en: {
                    'Help': 'Help',
                    'Landing Some Page': 'Landing Some Page'
                },
                fr_ca: {
                    'Help': 'Help',
                    'Landing Some Page': 'Landing Some Page'
                }
            };

            const parser = new GitWikiToHTML();
            const result = parser.getTranslationObject(dirFilteredContent);

            expect(result).to.deep.equal(transDirFilteredContent);
        });

        it('Testcase - getTranslationObject() - default lang only (en)', () => {
            const dirFilteredContentEn = [
                'en:Help.md',
                'en:Help:Landing-Some-Page.md'
            ];
            const transDirFilteredContentEn = {
                en: {
                    'Help': 'Help',
                    'Landing Some Page': 'Landing Some Page'
                }
            };

            const parser = new GitWikiToHTML();
            const result = parser.getTranslationObject(dirFilteredContentEn);

            expect(parser.defaultLanguage).equal('en');
            expect(result).to.deep.equal(transDirFilteredContentEn);
        });

        it('Testcase - getTranslationObject() - no files', () => {
            const parser = new GitWikiToHTML();
            const result = parser.getTranslationObject([]);
            expect(result).to.deep.equal({});
        });

        it('Testcase - test default rules for parsing links', () => {
            let str = `[IBM Link](https://github.ibm.com/mySA/help/wiki/Opportunity--%28OM%29-#-SC4BP-#-Opportunities) 
    text [GIT link](https://github.com/mySA/help/wiki/en-#-Help) and
    [GIT FR link](https://github.com/mySA/help/wiki/fr_CA-#-Help-#-Some-Page)`;
            const options = require('../data/default/options.json');
            // options.multilang = true;
            const parser = new GitWikiToHTML(
                options
            );

            const result = parser.parse(str);
            const expectedStr = `<p><a href="./Opportunity--(OM)-#-SC4BP-#-Opportunities.html">IBM Link</a> 
    text <a href="./Help.html">GIT link</a> and
    <a href="./Help-#-Some-Page.html">GIT FR link</a></p>
`;
            expect(result).to.deep.equal(expectedStr);
        });

        it('Testcase - test deprecated colon rules for parsing links', () => {
            let str = `[IBM Link](https://github.ibm.com/mySA/help/wiki/Opportunity--%28OM%29:SC4BP:Opportunities) 
    text [GIT link](https://github.com/mySA/help/wiki/en:Help) and
    [GIT FR link](https://github.com/mySA/help/wiki/fr_CA:Help:Some-Page)`;
            const options = require('../data/northstar-angular/options.json');
            // options.multilang = true;
            const parser = new GitWikiToHTML(
                options
            );

            const result = parser.parse(str);
            const expectedStr = `<p><a href="./#/Opportunity--(OM):SC4BP:Opportunities">IBM Link</a> 
    text <a href="./#/Help">GIT link</a> and
    <a href="./#/Help:Some-Page">GIT FR link</a></p>
`;
            expect(result).to.deep.equal(expectedStr);
        });
    });

    describe('Singlelanguage', () => {
        it('Testcase - getOrderedFiles', () => {
            let parser = new GitWikiToHTML({
                multilang: false
            });
            let result = parser.getOrderedFiles([
                'A:B', 'A:A', 'B', 'C', 'C:A', 'D', 'E'
            ], [
                'D', 'E', 'C:A'
            ]);
            expect(result).to.deep.equal([
                'D',
                'E',
                'C:A',
                'A:A',
                'A:B',
                'B',
                'C'
            ]);
        });

        it('Testcase - transform', () => {
            let parser = new GitWikiToHTML({
                multilang: false
            });
            parser.srcFiles = ['Help.md', 'Help:Landing.md'];
            sinon.stub(parser, 'validConfiguration').returns(true);
            let getMenuStub = sinon.stub(parser, 'getMenu').returns('HTML MENU');
            readFileSyncStub.returns('# content');
            writeFileSyncStub.returns(true);

            parser.transform();
            expect(readFileSyncStub.callCount).to.equal(2);
            expect(writeFileSyncStub.callCount).to.equal(3);
            expect(parser.resFiles[0]).to.equal('Help.html');
            expect(parser.resFiles[1]).to.equal('Help:Landing.html');
            expect(getMenuStub.calledWith(parser.menu)).to.be.true;
        });


        it('Testcase - transform with prefix', () => {
            let parser = new GitWikiToHTML({
                multilang: false,
                prefixFiles: 'Prefix'
            });
            parser.srcFiles = ['Prefix:Categ1.md', 'Prefix:Categ1:Item.md'];
            sinon.stub(parser, 'validConfiguration').returns(true);
            let getMenuStub = sinon.stub(parser, 'getMenu').returns('HTML MENU');
            readFileSyncStub.returns('# content');
            writeFileSyncStub.returns(true);

            parser.transform();
            expect(readFileSyncStub.callCount).to.equal(2);
            expect(writeFileSyncStub.callCount).to.equal(3);
            expect(getMenuStub.calledWith(parser.menu.get('Prefix'))).to.be.true;
        });

        it('Testcase - transform with menuOnly', () => {
            let parser = new GitWikiToHTML({
                multilang: false,
                menuOnly: true
            });
            parser.srcFiles = ['Prefix:Categ1.md', 'Prefix:Categ1:Item.md'];
            sinon.stub(parser, 'validConfiguration').returns(true);
            let getMenuStub = sinon.stub(parser, 'getMenu').returns('HTML MENU');
            readFileSyncStub.returns('# content');
            writeFileSyncStub.returns(true);

            parser.transform();
            expect(readFileSyncStub.callCount).to.equal(0);
            expect(writeFileSyncStub.callCount).to.equal(1);
            expect(getMenuStub.calledWith(parser.menu)).to.be.true;
        });

        it('Testcase - getMenuTpl - item special chars', () => {
            let parser = new GitWikiToHTML();
            parser.menu = null;
            let result = parser.getMenuTpl('Item-page-1?', 'Item-page-1?', null, null, 'item');
            expect(result).to.deep.equal('<li><a href=".&#x2F;#&#x2F;Item-page-1%3F">Item page 1?'
            + '</a></li>');
        });
    });
});
