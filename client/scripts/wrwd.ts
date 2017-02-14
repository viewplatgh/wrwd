/// <reference path="../../typings/globals/ace/index.d.ts" />
/// <reference path="../../typings/globals/jstree/index.d.ts" />

'use strict';
/* eslint no-sync: 0 */
import * as $ from 'jquery';
import * as ace from 'brace';
// import * as can from 'can';
// import * as jstree from 'jstree';
// let ace = require('brace');
let can = require('can');
let jstree = require('jstree');
import * as BasicParser from './getopt';

const STR_PAGE_NOT_READY = 'Page not ready. Create a page at first. e.g. new -p';
const STR_PAGE_NOT_EXIST = 'Page %s does not exist.';
const STR_FILE_NOT_READY = 'File not ready. Create or open a file at first. e.g. new -f myvo';
const STR_WORD_NOT_READY = 'Word not ready. Create a work at first. e.g. new -w hello';

let canWord = can.Map.extend({
  term: '',
  phon: '',
  source: '',
  examp: '',
  rem: Wrwd.rememberType.unknown,
  json: (i, pgIdx) => {
    return {
      'id' : `word_${this.term}_${i}`,
      'text': i === pgIdx ? `* ${this.term}` : this.term,
      'type': 'word',
    };
  },
});

let canFile = can.List.extend({
  name: '',
  idx: -1,
  insertPage: (pos, pg) => {
  },
  backInsertPage: (pg) => {
  },
  removePage: (pos) => {
  },
  removeIndexPage: () => {
  },
  browsePage: (pos) => {
  },
  getPage: (pos) => {
  },
  getIndexPage: () => {
  },
  removeIndexWord: () => {
  },
  backInsertIndexWord: (wd) => {
  },
  pageJson: () => {
  },
  json: () => {
  }
});

let canPage = can.List.extend({
  idx: -1,
  insertWord: (pos, wd) => {
  },
  backInsertWord: (wd) => {
  },
  removeWord: (pos) => {
  },
  removeIndexWord: () => {
  },
  getWord: (pos) => {
  },
  setWord: (pos, wd) => {
  },
  getIndexWord: () => {
  },
  setIndexWord: (wd) => {
  },
  editIndexWord: (pseudoWd) => {
  },
  wordJson: () => {
  },
  json: (i, flIdx) => {
  }
});

export class Wrwd {
  static rememberType = { unknown: 0, imaging: 1, known: 2, familiar: 3, impressed: 4 };
  file: any;

  public readline: ace.Editor;

  constructor() {
    this.readline = ace.edit('rwd_readline');
  }

  public output(text) {
    let line = $('<div class="wrwd-output"></div>');
    line.html(text);
    let out = $('#main-content > .ui-layout-center > .ui-layout-content');
    out.append(line);
    out.scrollTop(out.prop('scrollHeight'));
  }

  public cmdParse(line) {
  }

  public onFileChange(pgIdx, wdIdx, event, attr, how, newVal, oldVal) {
    console.log(`onFileChange called : ${pgIdx}, ${wdIdx}, ${event}, ${attr}, ${how}, ${newVal}, ${oldVal}`);
    // $('.ui-layout-west > .file-explorer-content').jstree(true).refresh();
  }

  public createWord(wd) {
    let that = this;
    let wordProps = ['term', 'phon', 'source', 'examp', 'rem'];

    let word = new canWord();

    wordProps.map((item) => {
      if (word.hasOwnProperty(item)) {
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

  public createFile(name) {
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
    can.trigger(this.file, 'length');
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
