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
    var canObject = requirejs("can/util/object");
    var basicParser = requirejs("getopt");

    wrwd.STR_PAGE_NOT_READY = "Page not ready. Create a page at first. e.g. new -p";
    wrwd.STR_PAGE_NOT_EXIST = "Page %s does not exist.";
    wrwd.STR_FILE_NOT_READY = "File not ready. Create or open a file at first. e.g. new -f myvo";
    wrwd.STR_WORD_NOT_READY = "Word not ready. Create a work at first. e.g. new -w hello";

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
        var argv = line.trim().split(' ');
        var optstr;
        var parser;
        var optarg;
        var option;
        var basic_parser = function(ops, cmd) {
            argv.shift();
            argv.unshift('');
            argv.unshift(cmd);
            return new basicParser(ops, argv, wrwd.output);
        }
        switch (argv[0]) {
            case "auto":
                //TODO: Implement auto
                parser = basic_parser("l(load)", "auto");
                break;
            case "browse":
                parser = basic_parser("p:(page)", "browse");
                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {
                        case 'p':
                            if (typeof(this.file) !== "undefined") {
                                if (typeof(this.file.getPage(option.optarg)) !== "undefined") {
                                    this.file.browsePage(option.optarg);    
                                }
                                else {
                                    this.output(sprintf(this.STR_PAGE_NOT_EXIST, option.optarg));
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
            case "close":
                this.close();
                break;
            case "delete":
                parser = basic_parser("p(page)w(word)", "delete");
                if((option = parser.getopt()) !== undefined) {
                    if (typeof(this.file) !== "undefined") {
                        switch (option.option) {
                            case 'p':
                                this.file.removeIndexPage();
                                break;
                            case 'w':
                                if (this.file.length > 0) {
                                    this.file.removeIndexWord();
                                }
                                else {
                                    this.output(this.STR_PAGE_NOT_READY);
                                }
                                break;
                            default:
                                break;
                        }
                    }
                    else {
                        this.output(this.STR_FILE_NOT_READY);
                    }
                }
                break;
            case "edit":
                parser = basic_parser("w:(word)h:(phon)s:(source)i:(interp)e:(examp)r:(rem)", "edit");

                if (typeof(this.file) !== "undefined") {
                    if (typeof(this.file.getIndexPage()) !== "undefined") {
                        if (typeof(this.file.getIndexPage().getIndexWord()) !== "undefined") {
                            var wd = ({});
                            var oamp = { 'w':"term", 'h':"phon", 's':"source", 'i':"interp", 'e':"examp", 'r':"rem" };
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
                            if (!canObject.same(wd, ({}))) {
                                this.file.getIndexPage().editIndexWord(wd);
                            }
                        }
                        else {
                            this.output(this.STR_WORD_NOT_READY);
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
            case "exit":
                this.close();
                break;
            case "goto":
                parser = basic_parser("", "goto");
                optarg = parser.getoptarg();
                //TODO: this.goto
                break;
            case "help":
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
                parser = basic_parser("l(license)", "list");
                option = parser.getopt();
                if (option === undefined) {
                    this.output("<table><tr><td>usage of rwd:</td><td width=\"30%\"></td></tr>\
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
                                </table>");        
                }
                else {
                    if (option.option == 'l') {
                        this.output("This program is free software: you can redistribute it and/or modify");
                        this.output("it under the terms of the GNU General Public License as published by");
                        this.output("the Free Software Foundation, either version 3 of the License, or");
                        this.output("(at your option) any later version.");
                        this.output("This program is distributed in the hope that it will be useful,");
                        this.output("but WITHOUT ANY WARRANTY; without even the implied warranty of");
                        this.output("MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the");
                        this.output("GNU General Public License for more details <http://www.gnu.org/licenses/>.");                        
                    }
                }
                break;
            case "list":
                parser = new basic_parser("f(file)p(page)", "list");

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {
                        case 'f':
                            if (typeof(this.file) !== "undefined") {
                                for(var i = 0; i < this.file.pageArray.length; ++ i) {
                                    this.output(sprintf("page %d", i));
                                }
                            }
                            else {
                                this.output(this.STR_FILE_NOT_READY);                            
                            }
                            break;
                        case 'p':
                            if (typeof(this.file) !== "undefined") {
                                if (typeof(this.file.getIndexPage()) !== "undefined") {
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
                var nw_word;
                parser = new basic_parser("f:(file)p(page)w:(word)h:(phon)s:(source)i:(interp)e:(examp)r:(rem)", "new");

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {
                        case 'f':
                            var file = wrwd.createFile(option.optarg);
                            this.setFile(file);
                            this.output(option.optarg);
                            break;
                        case 'p':
                            if (typeof(this.file) !== "undefined") {
                                var pg = wrwd.createPage();
                                this.file.backInsertPage(pg);
                            }
                            else {
                                this.output(this.STR_FILE_NOT_READY);
                            }
                            break;
                        case 'w':
                            if (typeof(this.file) !== "undefined") {
                                if (typeof(this.file.getIndexPage()) !== "undefined") {
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
                if (nw_word !== undefined) {
                    this.file.backInsertIndexWord(nw_word);
                }
                break;
            case "next":
                parser = new basic_parser("d(distance)", "next");

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {
                    case 'd':
                        break;
                    default:
                        break;
                    }
                }
                break;
            case "open":
                parser = new basic_parser("f:(file)", "open")
                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "plugin":
                parser = new basic_parser("s(speech)a(auto)", "plugin");
                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {
                        
                    }
                }
                break;
            case "previous":
                parser = new basic_parser("d(distance)", "previous");

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "quit":
                this.close();
                break;
            case "redo":
                break;
            case "save":
                parser = new basic_parser("f:(file)x:(xmlfile)", "save");

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "show":
                parser = new basic_parser("l:(level)", "show");

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "size":
                parser = new basic_parser("f:(file)p:(page)", "size");

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "sort":
                parser = new basic_parser("l(lexical)r(random)e(remember)", "sort");

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "state":
                parser = new basic_parser("l:(linemode)m:(listmask)s:(showflag)", "state");

                while ((option = parser.getopt()) !== undefined) {
                    switch (option.option) {

                    }
                }
                break;
            case "undo":
                break;
            case "voice":
                parser = new basic_parser("w(word)e(examp)", "voice");

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
        //{{DEBUG
        console.log(sprintf("onFileChange called : %d, %d, %s, %s, %s, %s, %s", pgIdx, wdIdx, event, attr, how, newVal, oldVal));
        //console.log(JSON.stringify(this.file.getJsonData()));
        //}}DEBUG
        $('#outer_west_jstree').jstree(true).refresh();
    };

    wrwd.createWord = function () {
        var wordProps = ['term', 'phon', 'source', 'examp', 'rem'];
        var rwdWord = canMap.extend({
            term: '',
            phon: '',
            source: '',
            examp: '',
            rem: wrwd.remember_type.unknown,
            getJsonData: function (i, pg_idx) {
                return { 
                    "id" : sprintf("word_%s_%d", this.term, i),
                    "text" : i == pg_idx ? sprintf("* %s", this.term) : this.term,
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

                word.bind("change", function(event, attr, how, newVal, oldVal) {
                    wrwd.onFileChange(0, 0, event, attr, how, newVal, oldVal); //TODO: find page/word index instead of 0,0
                });

                return word;
            };
    }();  

    wrwd.createPage = function () {
        var wrwdPage = canList.extend({
            idx: -1,
            insertWord: function(pos, wd) {
                this.idx = pos;
                this.splice(pos, 0, wd);
            },
            backInsertWord: function(wd) {
                this.insertWord(this.length, wd);
            },
            removeWord: function(pos) {
                this.splice(pos, 1);
                if ((pos < this.idx) || (this.idx == this.length)) {
                    var oldVal = this.idx;
                    -- this.idx;
                    can.trigger(this, "length", ["idx", "change", oldVal, this.idx]); // To update the *
                }                
            },
            removeIndexWord: function () {
                this.removeWord(this.idx);
            },
            getWord: function(pos) {
                return this.attr(pos);
            },
            setWord: function(pos, wd) {
                this.attr(pos, wd);
            },
            getIndexWord: function () {
                return this.getWord(this.idx);
            },
            setIndexWord: function(wd) {
                this.setWord(this.idx, wd);
            },
            editIndexWord: function (pseudo_wd) {
                var wordProps = ['term', 'phon', 'source', 'examp', 'rem'];
                var idx_wd = this.getIndexWord();

                for(var prop in pseudo_wd) {
                    if (wordProps.indexOf(prop) > -1) {
                        idx_wd.attr(prop, pseudo_wd[prop]);
                    }
                }
            },
            getWordJsonData: function () {
                var jsonData = [];
                for (var i = 0; i < this.length; ++ i) {
                    jsonData.push(this.getWord(i).getJsonData(i, this.idx));
                }
                return jsonData;
            },
            getJsonData: function (i, fl_idx) {
                return {
                    "id": sprintf("page_%d", i),
                    "text": i == fl_idx ? sprintf("* page %d", i) : sprintf("page %d", i),
                    "children" : this.getWordJsonData(),
                    "type": "page"
                };
            }
        });
        return function () {
                var page = new wrwdPage();
                var handler = function(event, attr, how, newVal, oldVal) {
                    wrwd.onFileChange(0, -1, event, attr, how, newVal, oldVal);
                };
                page.bind("length", handler);
                page.bind("change", handler);
                return page;
            };
    }();

    wrwd.createFile = function () {
        var wrwdFile = canList.extend({
            name: '',
            idx: -1,
            insertPage: function (pos, pg) {
                this.idx = pos;         
                this.splice(pos, 0, pg);       
            },
            backInsertPage: function (pg) {
                this.insertPage(this.length, pg);
            },
            removePage: function (pos) {
                this.splice(pos, 1);
                if ((pos < this.idx) || (this.idx == this.length)) {
                    var oldVal = this.idx;
                    -- this.idx;
                    can.trigger(this, "length", ["idx", "change", oldVal, this.idx]); // To update the *
                }
            },
            removeIndexPage: function () {
                this.removePage(this.idx);
            },
            browsePage: function (pos) {
                var oldVal = this.idx;
                this.idx = pos;
                can.trigger(this, "length", ["idx", "change", oldVal, pos]);
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
                    jsonData.push(this.getPage(i).getJsonData(i, this.idx));
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
    };

    wrwd.close = function () {
        this.file = undefined;
        $('#outer_west_jstree').jstree(true).refresh();
    }; 

    wrwd.getFileJsonData = function () {
        if (typeof(this.file) !== "undefined") {
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