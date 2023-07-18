# git-wiki-to-html

## Scope

> Export a gihub.com wiki to a website.

Generate files required for a single page javascript application starting from the markdown files of a [github.com Wiki](https://help.github.com/articles/about-github-wikis/) repository. Beside the content .html files corespondent to each .md file, it will also generate a multi-level menu based on filenames.

## Example

I have a Github Wiki with the following pages (created via the administration panel):

> Overview.md

> Migration:Migration from 3.x to 4.x.md

> Migration:Migration from 4.x to 5.x.md

> New Features:New Features in 4.x.md

> New Features:New Features in 3.x.md

I want to run a command to transform the files to a list of HTML/json files required for a standalone website.

_Menu_
* Overview
* Migration ^ 
    * Migration from 3.x to 4.x
    * Migration from 4.x to 5.x
* New Features ^
    * New Features in 4.x
    * New Features in 3.x

_Content (dinamically loaded on menu click)_

{Overview.md content transformed to HTML}

# Module Features

- generates a menu HTML (or json) file that can be loaded in a javascript single page application (customisable template) 
- generates for each of the markup files a HTML correspondent (customisable template and parsing rules)
- transforms internal (wiki) links to clickable local links
- supports multi-language templates (ex: en:Overview.md / fr:Overview.md) with only one entry in meny
- it provides a template for markdown side menu - auto-generate the github.com Wiki sidemenu from a repository

## Install

```
npm install -g git-wiki-to-html
```

## Usage
### Help and syntax:
```
git-wiki-to-html
```
If you get _command not found_ check that your (npm bin -g) folder is in your system $PATH

### Example from a github wiki repository
Real example starting from a public wiki repository: https://github.com/expressjs/express.wiki

```
git clone https://github.com/expressjs/express.wiki.git
mkdir express-website
# generates in dest folder .html files for each .md file and a menu with local links to them in index.html
git-wiki-to-html --src=express.wiki/ --dest=express-website/
```

```
# generates in the dest folder the menu and files for an Angular based application
git-wiki-to-html --src=express.wiki/ --dest=express-website/ --template=angular
```

```
cd express.wiki
# generates a _Sidebar.md file with
git-wiki-to-html --template=markdown
# commit and push your changes to origin to have a sidebar menu
git commit -m "Sidebar update for my wiki page"
git push master origin
```

Ex of result for above:
```
  * [Home](./Home)
  * [Application Patterns](./Application-Patterns)
  * [ESON JSON Configuration](./ESON-JSON-Configuration)
  * [Migrating from 2.x to 3.x](./Migrating-from-2.x-to-3.x)
  * [Migrating from 3.x to 4.x](./Migrating-from-3.x-to-4.x)
  * [New features in 3.x](./New-features-in-3.x)
  * [New features in 4.x](./New-features-in-4.x)
  * [README template](./README-template)
```

### Customizing 

Use _--option=/path/to/my/options.json_ to override the parsing rules with custom ones

* menu - replace rules for generating the menu file
* rules (pre/post) - Regex rules to be applied before and after HTML transformation
* rules.order - Specify a custom order (default lexical) to the menu items
* separator - provide a different separator
* prefixFiles - option to select only files starting with a prefix
* linkTemplate - define your local link template
* menuFile - replace the default filename for the menu file
* multilang - enable/disable menu parsing rules for locale prefixes

Source and target directory can be set using --src / --dest

A particular template can be used from default / angular / markdown

## Implementation example

[my Sales Activity - Online Help](https://mysa.ibm.com/help/#/)

Note: This application is build using this module and supports over 12 languages (Choose for example: French / Spanish, German to see how the content is displayed in a different language)
