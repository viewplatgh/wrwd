"use strict";
define(function(requirejs){
    var wrwd = ({});
    var $ = requirejs("jquery");
    var ace = requirejs("ace/ace"); //TODO: Not sure why requirejs("ace") does not work
    //var ace = requirejs("ace");
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
    wrwd.deal_with_type = { add:0, update:1, erase:2 };


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
                            //wrwdOutput('unexpected option %s %s', option.option, option.optarg);

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

    wrwd.dealWithFileChange = function () {
        return function (pgIdx, wdIdx, dwType, newFile) {
            // only call this handler in wrwd.file's methods
            newFile = typeof newFile !== 'undefined' ? newFile : false;
            $('#outer_west_jstree').jstree(true).refresh();
            this.output(sprintf("dealWithFileChange called : %d, %d, %d, %s", pgIdx, wdIdx, dwType, newFile));
        };
    }();

    wrwd.createWord = function () {
        var wordProps = ['term', 'phone', 'source', 'examp', 'rem'];

        return function (wd) { 
                var word = ({});
                word.term = '';
                word.phone = '';
                word.source = '';
                word.examp = '';
                word.rem = wrwd.remember_type.unknown;

                wordProps.map(function (item) {
                    if (wd.hasOwnProperty(item)) {
                        word[item] = wd[item];
                    }
                });

                word.getJsonData = function (i) {
                    return { 
                        "id" : sprintf("word_%s_%d", this.term, i),
                        "text" : this.term,
                        "type" : "word",
                    };
                }
                return word;
            };
    }();

    wrwd.createPage = function () {
        return function () {
            var page = ({});
            page.idx = -1;
            page.wordArray = [];
            page.insertWord = function (pos, wd) {
                this.wordArray.splice(pos, 0, wd);
                this.idx = pos;
                wrwd.dealWithFileChange(-1, pos, wrwd.deal_with_type.add);
            };
            page.backInsertWord = function (wd) {
                this.insertWord(this.wordArray.length, wd);
            }
            page.removeWord = function (pos) {
                this.wordArray.splice(pos, 1);
                if ((pos < this.idx) || (this.idx == this.wordArray.length))
                    --this.idx;
                wrwd.dealWithFileChange(-1, pos, wrwd.deal_with_type.erase);
            };
            page.removeIndexWord = function () {
                this.removeWord(this.idx);
            };
            page.getWord = function (pos) {
                return this.wordArray[pos];
            }
            page.getIndexWord = function () {
                return this.getWord(this.idx);
            }
            page.getWordJsonData = function () {
                var jsonData = [];
                for (var i = 0; i < this.wordArray.length; ++ i) {
                    jsonData.push(this.wordArray[i].getJsonData(i));
                }
                return jsonData;
            }
            page.getJsonData = function (i) {
                return {
                    "id" : sprintf("page_%d", i),
                    "text" : sprintf("page %d", i),
                    "children" : page.getWordJsonData(),
                    "type" : "page"
                };
            }
            return page;
        };
    }();

    wrwd.createFile = function () {
        return function (name) {
            var file = ({});
            file.name = name;
            file.idx = -1;
            file.pageArray = [];
            file.insertPage = function (pos, pg) {
                this.pageArray.splice(pos, 0, pg);
                this.idx = pos;
                wrwd.dealWithFileChange(pos, -1, wrwd.deal_with_type.add);
            };
            file.backInsertPage = function (pg) {
                this.insertPage(this.pageArray.length, pg);
            };
            file.removePage = function (pos) {
                this.pageArray.splice(pos, 1);
                if ((pos < this.idx) || (this.idx == this.pageArray.length))
                    -- this.idx;
                wrwd.dealWithFileChange(pos, -1, wrwd.deal_with_type.erase);
            };
            file.removeIndexPage = function () {
                this.removePage(this.idx);
            };
            file.browsePage = function (pos) {
                if (typeof(this.pageArray[pos]) == "undefined") {
                    wrwd.output(sprintf("Page %s does not exist", pos));
                    return pos;
                }
                this.idx = pos;
            };
            file.getPage = function (pos) {
                return this.pageArray[pos];
            };
            file.getIndexPage = function () {
                return this.getPage(this.idx);
            };
            file.removeIndexWord = function () {
                this.getIndexPage().removeIndexWord();
                wrwd.dealWithFileChange(this.idx, this.getIndexPage().idx, wrwd.deal_with_type.erase);
            };
            file.backInsertIndexWord = function (wd) {
                this.getIndexPage().backInsertWord(wd);
                wrwd.dealWithFileChange(this.idx, this.getIndexPage().idx, wrwd.deal_with_type.add);
            };
            file.getPageJsonData = function () {
                var jsonData = [];
                for (var i = 0; i < this.pageArray.length; ++ i) {
                    jsonData.push(this.pageArray[i].getJsonData(i));
                }
                return jsonData;
            };
            file.getJsonData = function () {
                return [  //'Simple root node',
                           {
                             "id" : file.name,
                             "text" : file.name,
                             "type" : "file",
                             //'state' : {
                             //  'opened' : true,
                             //  'selected' : true
                             //},
                             "children": file.getPageJsonData(),
                              //[
                               //{ 'text' : 'Child 1' },
                               //'Child 2'
                             //]
                          }
                        ];
            };
            return file;
        };
    }();

    wrwd.setFile = function (f) {
        this.file = f;
        this.dealWithFileChange(-1, -1, this.deal_with_type.add, true);
    }

    wrwd.getFileJsonData = function (){
        return function () {
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
    }();

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