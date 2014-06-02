 // RWD web edition
 // Copyright (C) 2014  Rob Lao (www.roblao.com)

 // This program is free software: you can redistribute it and/or modify
 // it under the terms of the GNU General Public License as published by
 // the Free Software Foundation, either version 3 of the License, or
 // (at your option) any later version.

 // This program is distributed in the hope that it will be useful,
 // but WITHOUT ANY WARRANTY; without even the implied warranty of
 // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 // GNU General Public License for more details <http://www.gnu.org/licenses/>.
 
"use strict";
define(function(requirejs){
    var wrwd = ({});
    var $ = requirejs("jquery");
    var ace = requirejs("ace/ace"); //TODO: Not sure why requirejs("ace") does not work
    var can = requirejs("can");
    var canList = requirejs("can/list");
    var canMap = requirejs("can/map");
    var basicParser = requirejs("getopt");

    wrwd.STR_PAGE_NOT_READY = "Page not ready. Create a page at first. e.g: new -p 0";
    wrwd.STR_FILE_NOT_READY = "File not ready. Create or open a file at first. e.g: new -f myvo";

    // wrwd.supports_html5_storage = function () {
    //     try {
    //         return 'localStorage' in window && window['localStorage'] !== null;
    //     } 
    //     catch (e) {
    //         return false;
    //     }
    // };

    wrwd.remember_type = { unknown:0, imaging:1, known:2, familiar:3, impressed:4 };

    wrwd.output = function (text) {
                        var line = $("<div class=\"wrwd-output\"></div>");
                        line.html(text);
                        $(".middle-center").append(line);
                    };

    wrwd.cmdParse = function (line) {
        var argv = line.split(' ');
        var optstr;
        switch (argv[0]) {
            case "browse":
                optstr = "p:(page)";
                argv.shift();
                argv.unshift('');
                argv.unshift("browse");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {
                        case 'p':
                            if (typeof(this.file) != "undefined") {
                                if (typeof(this.file.getPage(option.optarg)) != "undefined") {
                                    this.file.browsePage(option.optarg);    
                                }
                                else {
                                    this.output(this.STR_PAGE_NOT_READY);
                                }                            
                            }
                            else {
                                this.output(this.STR_FILE_NOT_READY);
                            }
                            break;
                        default:
                            break;
                    }
                }
                break;
            case "delete":
                optstr = "p(page)w(word)";
                argv.shift();
                argv.unshift('');
                argv.unshift("delete");
                parser = new basicParser(optstr, argv, this.output);
                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {
                        case 'p':
                            this.file.removeIndexPage();
                            break;
                        case 'w':
                            this.file.removeIndexWord();
                            break;
                        default:
                            break;
                    }
                }
                break;
            case "edit":
                optstr = "w(word)h(phon)s(source)i(interp)e(examp)r(rem)";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "exit":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "goto":
                optstr = "";
                break;
            case "help":
                // this.output("usage of rwd:");
                // this.output("auto                                    extract options ready for autocomplete");
                // this.output("\t\t<-h, --phon> [num]                  choose phonetic symbols from options");
                // this.output("\t\t<-s, --source> [num]                choose term in source language from options");
                this.output("<div>usage of rwd:</div> <br/>\
                             <div>&#9;auto&#9;&#9;&#9;&#9;&#9;&#9;&#9;&#9;extract options ready for autocomplete</div>");
                break;
            case "list":
                optstr = "f(file)p(page)";
                argv.shift();
                argv.unshift('');
                argv.unshift("list");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {
                        case 'f':
                            if (typeof(this.file) != "undefined") {
                                for(var i = 0; i < this.file.pageArray.length; ++ i) {
                                    this.output(sprintf("page %d", i));
                                }
                            }
                            else {
                                this.output(this.STR_FILE_NOT_READY);                            
                            }
                            break;
                        case 'p':
                            if (typeof(this.file) != "undefined") {
                                if (typeof(this.file.getIndexPage()) != "undefined") {
                                    for(var i = 0; i < this.file.getIndexPage().wordArray.length; ++ i) {
                                        this.output(sprintf("%s", this.file.getIndexPage().getWord(i).term));
                                    }
                                }
                                else {
                                    this.output(this.STR_PAGE_NOT_READY);
                                }
                            }
                            else {
                                this.output(this.STR_FILE_NOT_READY);                            
                            }
                            break;
                        default:
                            break;
                    }
                }
                break;
            case "new":
                optstr = "f:(file)p(page)w:(word)h:(phon)s:(source)i:(interp)e:(examp)r:(rem)";
                argv.shift();
                argv.unshift('');
                argv.unshift("new");

                var parser, option;
                var nw_word;

                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {
                        case 'f':
                            var file = wrwd.createFile(option.optarg);
                            this.setFile(file);
                            this.output(option.optarg);
                            break;

                        case 'p':
                            if (typeof(this.file) != "undefined") {
                                var pg = wrwd.createPage();
                                this.file.backInsertPage(pg);
                            }
                            else {
                                this.output(this.STR_FILE_NOT_READY);
                            }
                            break;

                        case 'w':
                            if (typeof(this.file) != "undefined") {
                                if (typeof(this.file.getIndexPage()) != "undefined") {
                                    nw_word = wrwd.createWord({term:option.optarg});
                                }
                                else {
                                    this.output(this.STR_PAGE_NOT_READY);
                                }                            
                            }
                            else {
                                this.output(this.STR_FILE_NOT_READY);
                            }
                            break;

                        default:
                            /* error message already emitted by getopt */
                            //mod_assert.equal('?', option.option);
                            //this.output('unexpected option %s %s', option.option, option.optarg);

                            break;
                    }
                }
                if (nw_word != undefined) {
                    this.file.backInsertIndexWord(nw_word);
                }
                break;
            case "next":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "open":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "previous":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "quit":
                break;
            case "redo":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "save":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "show":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "size":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "sort":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "state":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "undo":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "voice":
                optstr = "";
                argv.shift();
                argv.unshift('');
                argv.unshift("");
                parser = new basicParser(optstr, argv, this.output);

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            default:
                this.output("Unknown command");
                break;
        }
    };

    wrwd.onFileChange = function (pgIdx, wdIdx, event, attr, how, newVal, oldVal) {
        // pgIdx, wdIdx: (?, ?): word, (?, -1): page, (-1, -1): file   
        // only call this in wrwd module observation event handler
        $('#outer_west_jstree').jstree(true).refresh();
        //{{DEBUG
        this.output(sprintf("onFileChange called : %d, %d, %s, %s, %s, %s, %s", pgIdx, wdIdx, event, attr, how, newVal, oldVal));
        //}}DEBUG
    };

    wrwd.createWord = function () {
        var wordProps = ['term', 'phone', 'source', 'examp', 'rem'];
        var rwdWord = canMap.extend({
            term: '',
            phone: '',
            source: '',
            examp: '',
            rem: wrwd.remember_type.unknown,
            getJsonData: function (i) {
                return { 
                    "id" : sprintf("word_%s_%d", this.term, i),
                    "text" : this.term,
                    "type" : "word",
                };
            },
        });

        return function (wd) { 
                var word = new rwdWord();

                wordProps.map(function (item) {
                    if (wd.hasOwnProperty(item)) {
                        word[item] = wd[item];
                    }
                });

                word.bind("term", function(event, attr, how, newVal, oldVal) {
                    wrwd.onFileChange(0, 0, event, attr, how, newVal, oldVal); //TODO: find page/word index instead of 0,0
                });

                return word;
            };
    }();

    wrwd.createPage = function () {
        var wrwdPage = canList.extend({
            idx: -1,
            insertWord: function(pos, wd) {
                this.splice(pos, 0, wd);
                this.idx = pos;
            },
            backInsertWord: function(wd) {
                this.insertWord(this.length, wd);
            },
            removeWord: function(pos) {
                this.splice(pos, 1);
                if ((pos < this.idx) || (this.idx == this.length))
                    -- this.idx;                
            },
            removeIndexWord: function () {
                this.removeWord(this.idx);
            },
            getWord: function(pos) {
                return this.attr(pos);
            },
            getIndexWord: function () {
                return this.getWord(this.idx);
            },
            getWordJsonData: function () {
                var jsonData = [];
                for (var i = 0; i < this.length; ++ i) {
                    jsonData.push(this.getWord(i).getJsonData(i));
                }
                return jsonData;
            },
            getJsonData: function (i) {
                return {
                    "id": sprintf("page_%d", i),
                    "text": sprintf("page %d", i),
                    "children" : this.getWordJsonData(),
                    "type": "page"
                };
            }
        });
        return function () {
                var page = new wrwdPage();
                page.bind("length", function(event, attr, how, newVal, oldVal) {
                    wrwd.onFileChange(0, -1, event, attr, how, newVal, oldVal);
                });
                return page;
            };
    }();

    wrwd.createFile = function () {
        var wrwdFile = canList.extend({
            name: '',
            idx: -1,
            insertPage: function (pos, pg) {
                this.splice(pos, 0, pg);
                this.idx = pos;                
            },
            backInsertPage: function (pg) {
                this.insertPage(this.length, pg);
            },
            removePage: function (pos) {
                this.splice(pos, 1);
                if ((pos < this.idx) || (this.idx == this.length))
                    -- this.idx;
            },
            removeIndexPage: function () {
                this.removePage(this.idx);
            },
            browsePage: function (pos) {
                //TODO: remove this validation to cmd parse
                // if (typeof(this.pageArray[pos]) == "undefined") {
                //     wrwd.output(sprintf("Page %s does not exist", pos));
                //     return pos;
                // }
                this.idx = pos;
            },
            getPage: function (pos) {
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
            getPageJsonData: function () {
                var jsonData = [];
                for (var i = 0; i < this.length; ++ i) {
                    jsonData.push(this.getPage(i).getJsonData(i));
                }
                return jsonData;
            },
            getJsonData: function () {
                return [
                          {
                             "id" : this.name,
                             "text" : this.name,
                             "type" : "file",
                             "children": this.getPageJsonData(),
                          }
                        ];
            }
        });

        return function (name) {
            var file = new wrwdFile();
            file.name = name;
            file.bind("length", function(event, attr, how, newVal, oldVal) {
                wrwd.onFileChange(-1, -1, event, attr, how, newVal, oldVal);
            });

            return file;
        };
    }();

    wrwd.setFile = function (f) {
        this.file = f;
        can.trigger(this.file, "length");
    }

    wrwd.getFileJsonData = function () {
        if (typeof(this.file) != "undefined") {
            return this.file.getJsonData();
        }
        else {
            return [];
        //return ['Simple root node',
        //               {
        //                 'text' : 'Root node 2',
        //                 'state' : {
        //                   'opened' : true,
        //                   'selected' : true
        //                 },
        //                 'children' : [
        //                   { 'text' : 'Child 1' },
        //                   'Child 2'
        //                 ]
        //              }
        //            ];
        }
    };

    wrwd.readline = ace.edit("rwd_readline");
    wrwd.readline.setHighlightActiveLine(false);
    wrwd.readline.setShowPrintMargin(false);
    wrwd.readline.renderer.setShowGutter(false);
    wrwd.readline.renderer.container.style.overflow = "hidden";
    wrwd.readline.renderer.$maxLines = 4;
    wrwd.readline.renderer.setHighlightGutterLine(false);
    wrwd.readline.renderer.setStyle("ace_one-line");
    wrwd.readline.$mouseHandler.$focusWaitTimout = 0;

    wrwd.readline.setTheme("ace/theme/clouds");
    wrwd.readline.setKeyboardHandler("ace/keyboard/vim");
    wrwd.readline.commands.addCommand({
                                        name: "parseCmdLine",
                                        bindKey: {win:"Return", mac:"Return", linux:"Return"},
                                        exec: function(readline){
                                            var cmdLine = readline.getSession().getValue();
                                            wrwd.output(cmdLine);
                                            wrwd.cmdParse(cmdLine);
                                            wrwd.readline.selectAll();
                                            wrwd.readline.removeLines();
                                        },
                                        readOnly: false
                                    });

    return wrwd;
});