/// <reference path="../../typings/globals/ace/index.d.ts" />
/// <reference path="../../typings/globals/jstree/index.d.ts" />

'use strict';
/* eslint no-sync: 0 */
import * as $ from 'jquery';
import * as ace from 'brace';
import * as util from 'util';
import * as _ from 'lodash';

require('jstree');
require('brace/mode/javascript');
require('brace/theme/clouds');
require('brace/keybinding/vim');
let can = require('can');
let canList = require('can-define/list/list');
let canMap = require('can-define/map/map');
let canEvent = require('can-event');
import { BasicParser } from './getopt';

const STR_PAGE_NOT_READY = 'Page not ready. Create a page at first. e.g. new -p';
const STR_PAGE_NOT_EXIST = 'Page %s does not exist';
const STR_FILE_NOT_READY = 'File not ready. Create or open a file at first. e.g. new -f myvo';
const STR_WORD_NOT_READY = 'Word not ready. Create a word at first. e.g. new -w hello';
const STR_UNKNOWN_CMD_OPTION = 'Unknown command or option. Type help for usage information.';
const STR_MISSING_OPTION = 'Missing valid option. Type help for usage information.';
const STR_OPTION_ARGUMENT_NOT_A_NUMBER = 'Option argument is not a number';
const STR_MATCH_MULTIPLE_CMD = '%s could match one of following commands: %s';
const STR_OUT_OF_RANGE = 'Argument out of range';
export const rememberType = { unknown: 0, imaging: 1, known: 2, familiar: 3, impressed: 4 };

let canWord = canMap.extend({}, {
  term: '',
  phon: '',
  source: '',
  examp: '',
  rem: rememberType.unknown,
  json: function (i: number, pgIdx: number) {
    return {
      'id' : `word_${this.term}_${i}`,
      'text': i === pgIdx ? `* ${this.term}` : this.term,
      'type': 'word',
    };
  },
});

let canPage = canList.extend({
  idx: -1,
  insertWord: function (pos: number, wd) {
    this.idx = pos;
    this.splice(pos, 0, wd);
  },
  backInsertWord: function (wd) {
    this.insertWord(this.length, wd);
  },
  removeWord: function (pos: number) {
    this.splice(pos, 1);
    if ((pos < this.idx) || (this.idx === this.length)) {
      let oldVal = this.idx;
      -- this.idx;
      canEvent.trigger.call(
        this,
        'length',
        ['idx', 'change', oldVal, this.idx]
      ); // To update the *
    }
  },
  removeIndexWord: function () {
    this.removeWord(this.idx);
  },
  getWord: function (pos: number) {
    return this.attr(pos);
  },
  setWord: function (pos: number, wd) {
    this.attr(pos, wd);
  },
  getIndexWord: function () {
    return this.getWord(this.idx);
  },
  setIndexWord: function (wd) {
    this.setWord(this.idx, wd);
  },
  editIndexWord: function (pseudoWd) {
    let wordProps = ['term', 'phon', 'source', 'examp', 'rem'];
    let idxWd = this.getIndexWord();

    for (let prop in pseudoWd) {
        if (wordProps.indexOf(prop) > -1) {
          let oldVal = _.clone(idxWd);
          idxWd.set(prop, pseudoWd[prop]);
          canEvent.trigger.call(
            idxWd,
            'change',
            [prop, 'change', oldVal, idxWd]
          );
        }
    }
  },
  wordJson: function () {
    let json = [];
    for (let i = 0; i < this.length; ++ i) {
      json.push(this.getWord(i).json(i, this.idx));
    }
    return json;
  },
  json: function (i: number, flIdx: number) {
    return {
      'id': `page_${i}`,
      'text': i === flIdx ? `* page ${i}` : `page ${i}`,
      'children' : this.wordJson(),
      'type': 'page'
    };
  },
  slide_word: function (par) {
    this.idx += par;
    this.idx = this.idx >= 0 ?
      this.idx % this.length :
      (this.length - Math.abs(this.idx) % this.length) % this.length;
    return this.idx;
  },
  setIndex: function (idx) {
    this.idx = idx;
  },
  getIndex: function () {
    return this.idx;
  }
});

let canFile = canList.extend({
  name: '',
  idx: -1,
  insertPage: function (pos: number, pg) {
    this.idx = pos;
    this.splice(pos, 0, pg);
  },
  backInsertPage: function (pg) {
    this.insertPage(this.length, pg);
  },
  removePage: function (pos: number) {
    this.splice(pos, 1);
    if ((pos < this.idx) || (this.idx === this.length)) {
        let oldVal = this.idx;
        -- this.idx;
        canEvent.trigger.call(
          this,
          'length',
          ['idx', 'change', oldVal, this.idx]
        ); // To update the *
    }
  },
  removeIndexPage: function () {
    this.removePage(this.idx);
  },
  browsePage: function (pos: number) {
    let oldVal = this.idx;
    this.setIndex(pos);
    canEvent.trigger.call(this, 'length', ['idx', 'change', oldVal, pos]);
  },
  getPage: function (pos: number) {
    return this.attr(pos);
  },
  getIndexPage: function () {
    return this.getPage(this.idx);
  },
  removeIndexWord: function () {
    this.getIndexPage().removeIndexWord();
  },
  backInsertIndexWord: function (wd) {
    this.getIndexPage().backInsertWord(wd);
  },
  pageJson: function () {
    let jsonData = [];
    for (let i = 0; i < this.length; ++ i) {
        jsonData.push(this.getPage(i).json(i, this.idx));
    }
    return jsonData;
  },
  json: function () {
    return [{
        'id' : this.name,
        'text' : this.name,
        'type' : 'file',
        'children': this.pageJson(),
      }];
  },
  slide_word: function (par) {
    this.getIndexPage().slide_word(par);
  },
  setIndex: function (idx) {
    this.idx = idx;
  },
  getIndex: function () {
    return this.idx;
  }
});

export class Wrwd {
  file: any;

  public readline: ace.Editor;

  constructor() {
    this.readline = ace.edit('rwd_readline');
    this.readline.getSession().setMode('ace/mode/text');
    this.readline.setTheme('ace/theme/clouds');
    this.readline.setHighlightActiveLine(false);
    this.readline.setShowPrintMargin(false);
    this.readline.renderer.setShowGutter(false);
    (<any>this.readline.renderer).container.style.overflow = 'hidden';
    (<any>this.readline.renderer).$maxLines = 4;
    (<any>this.readline.renderer).setHighlightGutterLine(false);
    this.readline.renderer.setStyle('ace_one-line');
    (<any>this.readline).$mouseHandler.$focusWaitTimout = 0;

    let that = this;

    // blur when pressing 'ESC' (but not working in vim mode...)
    this.readline.keyBinding.addKeyboardHandler(function(data, hashId, keyString, keyCode, e) {
      if (keyString === 'esc' && hashId === 0) {
        data.editor.blur();
        return {command: null};
      }
    }, 0);

    this.readline.setKeyboardHandler('ace/keyboard/vim');
    this.readline.commands.addCommand({
      name: 'parseCmdLine',
      bindKey: {win: 'Return', mac: 'Return', linux: 'Return'},
      exec: readline => {
          let cmdLine = readline.getSession().getValue();
          that.output(cmdLine);
          that.cmdParse(cmdLine);
          that.readline.selectAll();
          that.readline.removeLines();
      },
      readOnly: false
    });
  }

  public output(text: string) {
    let line = $('<div class="wrwd-output"></div>');
    line.html(text);
    let out = $('#main-content > .ui-layout-center > .ui-layout-content');
    out.append(line);
    out.scrollTop(out.prop('scrollHeight'));
  }

  public cmdParse(line: string) {
    let argv = line.trim().split(' ');
    // let optstr;
    let parser;
    let optarg;
    let option;
    let that = this;
    function basic_parser(ops, cmd) {
      argv.shift();
      argv.unshift('');
      argv.unshift(cmd);
      return new BasicParser(ops, argv, that.output);
    }

    let cmdMap = {
      'auto': () => {
        //TODO: Implement auto
        parser = basic_parser('l(load)', 'auto');
      },
      'browse': () => {
        parser = basic_parser('p:(page)', 'browse');
        option = parser.getopt();
        if (option === undefined) {
          this.output(STR_MISSING_OPTION);
          return;
        } else {
          do {
            switch (option.option) {
              case 'p':
                if (isNaN(option.optarg)) {
                  this.output(STR_OPTION_ARGUMENT_NOT_A_NUMBER);
                } else {
                  if (typeof(this.file) !== 'undefined') {
                    if (typeof(this.file.getPage(option.optarg)) !== 'undefined') {
                      this.file.browsePage(parseInt(option.optarg, 10));
                    } else {
                      this.output(util.format(STR_PAGE_NOT_EXIST, option.optarg));
                    }
                  } else {
                    this.output(STR_FILE_NOT_READY);
                  }
                }
                break;
              default:
                break;
            }
            option = parser.getopt();
          } while (option !== undefined);
        }
      },
      'close': () => {
        this.close();
      },
      'delete': () => {
        parser = basic_parser('p(page)w(word)', 'delete');
        if ((option = parser.getopt()) !== undefined) {
          if (typeof(this.file) !== 'undefined') {
            switch (option.option) {
              case 'p':
                this.file.removeIndexPage();
                break;
              case 'w':
                if (this.file.length > 0) {
                  this.file.removeIndexWord();
                } else {
                  this.output(STR_PAGE_NOT_READY);
                }
                break;
              default:
                break;
            }
          } else {
            this.output(STR_FILE_NOT_READY);
          }
        } else {
          this.output(STR_MISSING_OPTION);
        }
      },
      'edit': () => {
        parser = basic_parser('w:(word)h:(phon)s:(source)i:(interp)e:(examp)r:(rem)', 'edit');

        if (typeof(this.file) !== 'undefined') {
          if (typeof(this.file.getIndexPage()) !== 'undefined') {
            if (typeof(this.file.getIndexPage().getIndexWord()) !== 'undefined') {
              var wd = ({});
              var oamp = { 'w': 'term', 'h': 'phon', 's': 'source', 'i': 'interp', 'e': 'examp', 'r': 'rem' };
              while ((option = parser.getopt()) !== undefined) {
                switch (option.option) {
                  case 'w':
                  case 'h':
                  case 's':
                  case 'i':
                  case 'e':
                  case 'r':
                    wd[oamp[option.option]] = option.optarg;
                    break;
                  default:
                    break;
                }
              }
              if (!_.isEqual(wd, ({}))) {
                this.file.getIndexPage().editIndexWord(wd);
              }
            } else {
              this.output(STR_WORD_NOT_READY);
            }
          } else {
            this.output(STR_PAGE_NOT_READY);
          }
        } else {
          this.output(STR_FILE_NOT_READY);
        }
      },
      'exit': () => {
        this.close();
      },
      'goto': () => {
        parser = basic_parser('', 'goto');
        optarg = parseInt(parser.getoptarg(), 10);
        if (typeof(this.file.getIndexPage()) === 'undefined') {
          this.output(STR_PAGE_NOT_READY);
        } else {
          if (this.file.getIndexPage().length === 0) {
            this.output(STR_WORD_NOT_READY);
          } else {
            if (isNaN(optarg)) {
              this.output(STR_UNKNOWN_CMD_OPTION);
            } else if (optarg < this.file.getIndexPage().length && optarg >= 0) {
              let oldVal = this.file.getIndexPage().getIndex();
              this.file.getIndexPage().setIndex(optarg);
              canEvent.trigger.call(this.file.getIndexPage(), 'length', ['idx', 'change', oldVal, optarg]);
            } else {
              this.output(STR_OUT_OF_RANGE);
            }
          }
        }
      },
      'help': () => {
      // __t("usage of rwd:"),
      //             __t("   auto                                    extract options ready for autocomplete"),
      //             __t("             <-h, --phon> [num]            choose phonetic symbols from options"),
      //             __t("             <-s, --source> [num]          choose term in source language from options"),
      //             __t("             <-i, --interp> [num]          choose interpret in destination language from options"),
      //             __t("             <-e, --examp> [num]           choose example from options"),
      //             __t("             <-l, --load>                  fast autocomplete with first choice"),
      //             __t("   browse    <-p, --page> [num]            browse a page after open a file"),
      //             __t("   close                                   close a file"),
      //             __t("   delete    <-p, --page>                  delete a page"),
      //             __t("             <-w, --word>                  delete a word"),
      //             __t("   edit      <-w, --word> [string]         edit a word"),
      //             __t("             <-h, --phon> [string]         phonetic symbols"),
      //             __t("             <-s, --source> [string]       term in source language"),
      //             __t("             <-i, --interp> [string]       interpret in destination language"),
      //             __t("             <-e, --examp> [string]        example"),
      //             __t("             <-r, --rem> [string]          remember type [unknown, imaging, known, familiar, impressed]"),
      //             __t("   exit                                    exit program"),
      //             __t("   goto      [num]                         set index in a page"),
      //             __t("   help      <-l, --license>               show this message or license"),
      //             __t("   list      <-f, --file>                  list pages in a file"),
      //             __t("             <-p, --page>                  list words in a page"),
      //             __t("   new       <-f, --file>                  new a file"),
      //             __t("             <-p, --page>                  new a page"),
      //             __t("             <-w, --word> [string]         new a word"),
      //             __t("             <-h, --phon> [string]         phonetic symbols"),
      //             __t("             <-s, --source> [string]       term in source language"),
      //             __t("             <-i, --interp> [string]       interpret in destination language"),
      //             __t("             <-e, --examp> [string]        example"),
      //             __t("             <-r, --rem> [string]          remember type"),
      //             __t("   next      <-d, --distance> [num]        step to next [num] words"),
      //             __t("   open      <-f, --file> [string]         open a file"),
      //             __t("   plugin                                  show plugin configuration and options"),
      //             __t("             <-s, --speech> [num]          select speech plugin"),
      //             __t("             <-a, --auto> [num]            select autocomplete plugin"),
      //             __t("             <-l, --location> [string]     set plugin location"),
      //             __t("   previous  <-d, --distance> [num]        step to previous [num] words"),
      //             __t("   proxy     <-n, --none>                  set not to use proxy"),
      //             __t("             <-h, --host> [string]         set host url"),
      //             __t("             <-p, --port> [num]            set port"),
      //             __t("   quit                                    same as \'exit\'"),
      //             __t("   redo                                    redo last command"),
      //             __t("   save      <-f, --file> [string]         save a file"),
      //             __t("             <-x, --xmlfile> [string]      save a xml file"),
      //             __t("   show      <-l, --level> [num]           show the word"),
      //             __t("   size      <-f, --file>                  show size of the file"),
      //             __t("             <-p, --page>                  show size of the page"),
      //             __t("   sort      <-l, --lexical>               sort words by lexical"),
      //             __t("             <-r, --random>                sort words by random"),
      //             __t("             <-e, --remember>              sort words by remember type"),
      //             __t("   state     <-l, --linemode>              set state linemode [readline, getline]"),
      //             __t("             <-m, --listmask>              set state listmask [0-7] or [r, e, s]"),
      //             __t("             <-s, --showflag>              set state showflag [true, false] or [0, 1]"),
      //             __t("   undo                                    undo last command"),
      //             __t("   voice     <-w, --word>                  speak word"),
      //             __t("             <-e, --examp>                 speak example")
      parser = basic_parser('l(license)', 'list');
      option = parser.getopt();
      if (option === undefined) {
        this.output('<table><tr><td>usage of rwd:</td><td width=\"30%\"></td></tr>\
          <tr><td>auto</td><td></td><td>extract options ready for autocomplete</td></tr>\
          <tr><td></td><td>&lt;-l, --load&gt;</td><td>fast autocomplete with first choice</td></tr>\
          <tr><td>browse</td><td>&lt;-p, --page&gt; [num]</td><td>browse a page after open a file</td></tr>\
          <tr><td>close</td><td></td><td>close a file</td></tr>\
          <tr><td>delete</td><td>&lt;-p, --page&gt;</td><td>delete a page</td></tr>\
          <tr><td></td><td>&lt;-w, --word&gt;</td><td>delete a word</td></tr>\
          <tr><td>edit</td><td>&lt;-w, --word&gt; [string]</td><td>edit a word</td></tr>\
          <tr><td></td><td>&lt;-h, --phon&gt; [string]</td><td>phonetic symbols</td></tr>\
          <tr><td></td><td>&lt;-s, --source&gt; [string]</td><td>term in source language</td></tr>\
          <tr><td></td><td>&lt;-i, --interp&gt; [string]</td><td>interpret in destination language</td></tr>\
          <tr><td></td><td>&lt;-e, --examp&gt; [string]</td><td>example</td></tr>\
          <tr><td></td><td>&lt;-r, --rem&gt; [string]</td><td>remember type [unknown, imaging, known, familiar, impressed]</td></tr>\
          <tr><td>exit</td><td></td><td>same as &apos;close&apos;. To quit wrwd, close the browser.</td></tr>\
          <tr><td>goto</td><td>[num]</td><td>set index in a page</td></tr>\
          <tr><td>help</td><td>&lt;-l, --license&gt;</td><td>show this message or license</td></tr>\
          <tr><td>list</td><td>&lt;-f, --file&gt;</td><td>list pages in a file</td></tr>\
          <tr><td></td><td>&lt;-p, --page&gt;</td><td>list words in a page</td></tr>\
          <tr><td>new</td><td>&lt;-f, --file&gt;</td><td>new a file</td></tr>\
          <tr><td></td><td>&lt;-p, --page&gt;</td><td>new a page</td></tr>\
          <tr><td></td><td>&lt;-w, --word&gt; [string]</td><td>new a word</td></tr>\
          <tr><td></td><td>&lt;-h, --phon&gt; [string]</td><td>phonetic symbols</td></tr>\
          <tr><td></td><td>&lt;-s, --source&gt; [string]</td><td>term in source language</td></tr>\
          <tr><td></td><td>&lt;-i, --interp&gt; [string]</td><td>interpret in destination language</td></tr>\
          <tr><td></td><td>&lt;-e, --examp&gt; [string]</td><td>example</td></tr>\
          <tr><td></td><td>&lt;-r, --rem&gt; [string]</td><td>remember type</td></tr>\
          <tr><td>next</td><td>&lt;-d, --distance&gt; [num]</td><td>step to next [num] words</td></tr>\
          <tr><td>open</td><td>&lt;-f, --file&gt; [string]</td><td>open a file</td></tr>\
          <tr><td>plugin</td><td></td><td>show plugin configuration and options</td></tr>\
          <tr><td></td><td>&lt;-s, --speech&gt; [num]</td><td>select speech plugin</td></tr>\
          <tr><td></td><td>&lt;-a, --auto&gt; [num]</td><td>select autocomplete plugin</td></tr>\
          <tr><td></td><td>&lt;-l, --location&gt; [string]</td><td>set plugin location</td></tr>\
          <tr><td>previous</td><td>&lt;-d, --distance&gt; [num]</td><td>step to previous [num] words</td></tr>\
          <tr><td>proxy</td><td>&lt;-n, --none&gt;</td><td>set not to use proxy</td></tr>\
          <tr><td></td><td>&lt;-h, --host&gt; [string]</td><td>set host url</td></tr>\
          <tr><td></td><td>&lt;-p, --port&gt; [num]</td><td>set port</td></tr>\
          <tr><td>quit</td><td></td><td>same as &apos;close&apos;. To quit wrwd, close the browser.</td></tr>\
          <tr><td>redo</td><td></td><td>redo last command</td></tr>\
          <tr><td>save</td><td>&lt;-f, --file&gt; [string]</td><td>save a file</td></tr>\
          <tr><td>show</td><td>&lt;-l, --level&gt; [num]</td><td>show the word</td></tr>\
          <tr><td>size</td><td>&lt;-f, --file&gt;</td><td>show size of the file</td></tr>\
          <tr><td></td><td>&lt;-p, --page&gt;</td><td>show size of the page</td></tr>\
          <tr><td>sort</td><td>&lt;-l, --lexical&gt;</td><td>sort words by lexical</td></tr>\
          <tr><td></td><td>&lt;-r, --random&gt;</td><td>sort words by random</td></tr>\
          <tr><td></td><td>&lt;-e, --remember&gt;</td><td>sort words by remember type</td></tr>\
          <tr><td>state</td><td><-l, --linemode></td><td>set state linemode [readline, getline]</td></tr>\
          <tr><td></td><td>&lt;-m, --listmask&gt;</td><td>set state listmask [0-7] or [r, e, s]</td></tr>\
          <tr><td></td><td>&lt;-s, --showflag&gt;</td><td>set state showflag [true, false] or [0, 1]</td></tr>\
          <tr><td></td><td>undo</td><td>undo last command</td></tr>\
          <tr><td>voice</td><td>&lt;-w, --word&gt;</td><td>speak word</td></tr>\
          <tr><td></td><td>&lt;-e, --examp&gt;</td><td>speak example</td></tr>\
          </table>');
        } else {
          if (option.option === 'l') {
            this.output('This program is free software: you can redistribute it and/or modify');
            this.output('it under the terms of the GNU General Public License as published by');
            this.output('the Free Software Foundation, either version 3 of the License, or');
            this.output('(at your option) any later version.');
            this.output('This program is distributed in the hope that it will be useful,');
            this.output('but WITHOUT ANY WARRANTY; without even the implied warranty of');
            this.output('MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the');
            this.output('GNU General Public License for more details <http://www.gnu.org/licenses/>.');
          }
        }
      },
      'list': () => {
        parser = basic_parser('f(file)p(page)', 'list');

        while ((option = parser.getopt()) !== undefined) {
          switch (option.option) {
            case 'f':
              if (typeof(this.file) !== 'undefined') {
                for (let i = 0; i < this.file.pageArray.length; ++ i) {
                  this.output(util.format('page %d', i));
                }
              } else {
                this.output(STR_FILE_NOT_READY);
              }
              break;
            case 'p':
              if (typeof(this.file) !== 'undefined') {
                if (typeof(this.file.getIndexPage()) !== 'undefined') {
                  for (let i = 0; i < this.file.getIndexPage().wordArray.length; ++ i) {
                    this.output(util.format('%s', this.file.getIndexPage().getWord(i).term));
                  }
                } else {
                  this.output(STR_PAGE_NOT_READY);
                }
              } else {
                this.output(STR_FILE_NOT_READY);
              }
              break;
            default:
              break;
          }
        }
      },
      'new': () => {
        let nword;
        parser = basic_parser('f:(file)p(page)w:(word)h:(phon)s:(source)i:(interp)e:(examp)r:(rem)', 'new');
        option = parser.getopt();
        if (option === undefined) {
          this.output(STR_UNKNOWN_CMD_OPTION);
        } else {
          do {
            switch (option.option) {
              case 'f':
                var file = this.createFile(option.optarg);
                this.setFile(file);
                this.output(option.optarg);
                break;
              case 'p':
                if (typeof(this.file) !== 'undefined') {
                  var pg = this.createPage();
                  this.file.backInsertPage(pg);
                } else {
                  this.output(STR_FILE_NOT_READY);
                }
                break;
              case 'w':
                if (typeof(this.file) !== 'undefined') {
                  if (typeof(this.file.getIndexPage()) !== 'undefined') {
                    nword = this.createWord({term: option.optarg});
                  } else {
                    this.output(STR_PAGE_NOT_READY);
                  }
                } else {
                  this.output(STR_FILE_NOT_READY);
                }
                break;
              default:
                break;
            }
            option = parser.getopt();
          } while (option !== undefined);

          if (nword !== undefined) {
            this.file.backInsertIndexWord(nword);
          }
        }
      },
      'next': () => {
        parser = basic_parser('d:(distance)', 'next');
        option = parser.getopt();
        if (option === undefined) {
          option = { option: 'd', optarg: 1 };
        }
        switch (option.option) {
        case 'd':
          let oldIdx = this.file.getIndexPage().idx;
          this.file.slide_word(parseInt(option.optarg, 10));
          let newIdx = this.file.getIndexPage().idx;
          this.onFileChange(
              this.file.idx,
              -1,
              null,
              'idx',
              'change',
              newIdx,
              oldIdx
          );
          break;
        default:
          break;
        }
      },
      'open': () => {
        parser = basic_parser('f:(file)', 'open');
        while ((option = parser.getopt()) !== undefined) {
          switch (option.option) {
          }
        }
      },
      'plugin': () => {
        parser = basic_parser('s(speech)a(auto)', 'plugin');
        while ((option = parser.getopt()) !== undefined) {
          switch (option.option) {
          }
        }
      },
      'previous': () => {
        parser = basic_parser('d:(distance)', 'previous');
        option = parser.getopt();
        if (option === undefined) {
          option = { option: 'd', optarg: 1 };
        }
        switch (option.option) {
        case 'd':
          let oldIdx = this.file.getIndexPage().idx;
          this.file.slide_word(-1 * parseInt(option.optarg, 10));
          let newIdx = this.file.getIndexPage().idx;
          this.onFileChange(
              this.file.idx,
              -1,
              null,
              'idx',
              'change',
              newIdx,
              oldIdx
          );
          break;
        default:
          break;
        }
      },
      // 'proxy': () => {},
      'quit': () => {
        this.close();
      },
      'redo': () => {},
      'save': () => {
        parser = basic_parser('f:(file)x:(xmlfile)', 'save');
        while ((option = parser.getopt()) !== undefined) {
          switch (option.option) {
          }
        }
      },
      'show': () => {
        parser = basic_parser('l:(level)', 'show');
        while ((option = parser.getopt()) !== undefined) {
          switch (option.option) {
          }
        }
      },
      'size': () => {
        parser = basic_parser('f:(file)p:(page)', 'size');
        while ((option = parser.getopt()) !== undefined) {
          switch (option.option) {
          }
        }
      },
      'sort': () => {
        parser = basic_parser('l(lexical)r(random)e(remember)', 'sort');
        while ((option = parser.getopt()) !== undefined) {
          switch (option.option) {
          }
        }
      },
      'state': () => {
        parser = basic_parser('l:(linemode)m:(listmask)s:(showflag)', 'state');
        while ((option = parser.getopt()) !== undefined) {
          switch (option.option) {
          }
        }
      },
      'undo': () => {},
      'voice': () => {
        parser = basic_parser('w(word)e(examp)', 'voice');
        while ((option = parser.getopt()) !== undefined) {
          switch (option.option) {
          }
        }
      }
    };

    let pickedCmd = _.pickBy(cmdMap, (value, key) => {
      return _.startsWith(key, argv[0]);
    });

    let pickedCmdKeys = Object.keys(pickedCmd);
    switch (pickedCmdKeys.length) {
    case 0:
      this.output(STR_UNKNOWN_CMD_OPTION);
      break;
    case 1:
      pickedCmd[pickedCmdKeys[0]]();
      break;
    default:
      this.output(util.format(STR_MATCH_MULTIPLE_CMD, `'${argv[0]}'`, pickedCmdKeys.join(', ')));
      break;
    }
  }

  public onFileChange(pgIdx, wdIdx, event, attr, how, newVal, oldVal) {
    console.log(`onFileChange called : ${pgIdx}, ${wdIdx}, ${event}, ${attr}, ${how}, ${newVal}, ${oldVal}`);
    $('.ui-layout-west > .file-explorer-content').jstree(true).refresh();
  }

  public createWord(wd) {
    let that = this;
    let wordProps = ['term', 'phon', 'source', 'examp', 'rem'];

    let word = new canWord();

    wordProps.map((item) => {
      if (wd.hasOwnProperty(item)) {
        word[item] = wd[item];
      }
    });

    word.bind('change', (event, attr, how, newVal, oldVal) => {
      that.onFileChange(0, 0, event, attr, how, newVal, oldVal);
    });

    return word;
  }

  public createPage() {
    let that = this;

    let page = new canPage();
    let handler = (event, attr, how, newVal, oldVal) => {
      that.onFileChange(0, -1, event, attr, how, newVal, oldVal);
    };

    page.bind('length', handler);
    page.bind('change', handler);
    return page;
  }

  public createFile(name: string) {
    let that = this;

    let file = new canFile();
    file.name = name;
    file.bind('length', (event, attr, how, newVal, oldVal) => {
      that.onFileChange(-1, -1, event, attr, how, newVal, oldVal);
    });

    return file;
  }

  public setFile(f) {
    this.file = f;
    $('.ui-layout-west > .file-explorer-content').jstree(true).refresh(false, true);
  }

  public close() {
    this.file = undefined;
    $('.ui-layout-west > .file-explorer-content').jstree(true).refresh(false, true);
  }

  public fileJson() {
    if (typeof(this.file) !== 'undefined') {
      return this.file.json();
    } else {
      return [];
    }
  }
}
