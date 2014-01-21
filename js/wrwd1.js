var wrwd = ({});

wrwd.ASSERT = function (v) {
    if (!v) {
        throw new Error("Assert failure! " + v + " is not true!");
    }
};

wrwd.supports_html5_storage = function () {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } 
    catch (e) {
        return false;
    }
};

/*
 * getopt.js: node.js implementation of POSIX getopt() (and then some)
 *
 * Copyright 2011 David Pacheco. All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

wrwd.goError = function (msg)
{
    return (new Error('getopt: ' + msg));
};

/*
 * The BasicParser is our primary interface to the outside world.  The
 * documentation for this object and its public methods is contained in
 * the included README.md.
 */
wrwd.goBasicParser = function (optstring, argv)
{
    var ii;

    wrwd.ASSERT(optstring || optstring === '', 'optstring is required');
    wrwd.ASSERT(optstring.constructor === String, 'optstring must be a string');
    wrwd.ASSERT(argv, 'argv is required');
    wrwd.ASSERT(argv.constructor === Array, 'argv must be an array');

    this.gop_argv = new Array(argv.length);
    this.gop_options = {};
    this.gop_aliases = {};
    this.gop_optind = 2;
    this.gop_subind = 0;

    for (ii = 0; ii < argv.length; ii++) {
        wrwd.ASSERT(argv[ii].constructor === String,
            'argv must be string array');
        this.gop_argv[ii] = argv[ii];
    }

    this.parseOptstr(optstring);
};

/*
 * Parse the option string and update the following fields:
 *
 *  gop_silent  Whether to log errors to stderr.  Silent mode is
 *          indicated by a leading ':' in the option string.
 *
 *  gop_options Maps valid single-letter-options to booleans indicating
 *          whether each option is required.
 *
 *  gop_aliases Maps valid long options to the corresponding
 *          single-letter short option.
 */
wrwd.goBasicParser.prototype.parseOptstr = function (optstr)
{
    var chr, cp, alias, arg, ii;

    ii = 0;
    if (optstr.length > 0 && optstr[0] == ':') {
        this.gop_silent = true;
        ii++;
    } else {
        this.gop_silent = false;
    }

    while (ii < optstr.length) {
        chr = optstr[ii];
        arg = false;

        if (!/^[\w\d]$/.test(chr))
            throw (goError('invalid optstring: only alphanumeric ' +
                'characters may be used as options: ' + chr));

        if (ii + 1 < optstr.length && optstr[ii + 1] == ':') {
            arg = true;
            ii++;
        }

        this.gop_options[chr] = arg;

        while (ii + 1 < optstr.length && optstr[ii + 1] == '(') {
            ii++;
            cp = optstr.indexOf(')', ii + 1);
            if (cp == -1)
                throw (goError('invalid optstring: missing ' +
                    '")" to match "(" at char ' + ii));

            alias = optstr.substring(ii + 1, cp);
            this.gop_aliases[alias] = chr;
            ii = cp;
        }

        ii++;
    }
};

wrwd.goBasicParser.prototype.optind = function ()
{
    return (this.gop_optind);
};

/*
 * For documentation on what getopt() does, see README.md.  The following
 * implementation invariants are maintained by getopt() and its helper methods:
 *
 *  this.gop_optind     Refers to the element of gop_argv that contains
 *              the next argument to be processed.  This may
 *              exceed gop_argv, in which case the end of input
 *              has been reached.
 *
 *  this.gop_subind     Refers to the character inside
 *              this.gop_options[this.gop_optind] which begins
 *              the next option to be processed.  This may never
 *              exceed the length of gop_argv[gop_optind], so
 *              when incrementing this value we must always
 *              check if we should instead increment optind and
 *              reset subind to 0.
 *
 * That is, when any of these functions is entered, the above indices' values
 * are as described above.  getopt() itself and getoptArgument() may both be
 * called at the end of the input, so they check whether optind exceeds
 * argv.length.  getoptShort() and getoptLong() are called only when the indices
 * already point to a valid short or long option, respectively.
 *
 * getopt() processes the next option as follows:
 *
 *  o If gop_optind > gop_argv.length, then we already parsed all arguments.
 *
 *  o If gop_subind == 0, then we're looking at the start of an argument:
 *
 *      o Check for special cases like '-', '--', and non-option arguments.
 *        If present, update the indices and return the appropriate value.
 *
 *      o Check for a long-form option (beginning with '--').  If present,
 *        delegate to getoptLong() and return the result.
 *
 *      o Otherwise, advance subind past the argument's leading '-' and
 *        continue as though gop_subind != 0 (since that's now the case).
 *
 *  o Delegate to getoptShort() and return the result.
 */
wrwd.goBasicParser.prototype.getopt = function ()
{
    if (this.gop_optind >= this.gop_argv.length)
        /* end of input */
        return (undefined);

    var arg = this.gop_argv[this.gop_optind];

    if (this.gop_subind === 0) {
        if (arg == '-' || arg === '' || arg[0] != '-')
            return (undefined);

        if (arg == '--') {
            this.gop_optind++;
            this.gop_subind = 0;
            return (undefined);
        }

        if (arg[1] == '-')
            return (this.getoptLong());

        this.gop_subind++;
        wrwd.ASSERT(this.gop_subind < arg.length);
    }

    return (this.getoptShort());
};

/*
 * Implements getopt() for the case where optind/subind point to a short option.
 */
wrwd.goBasicParser.prototype.getoptShort = function ()
{
    var arg, chr;

    wrwd.ASSERT(this.gop_optind < this.gop_argv.length);
    arg = this.gop_argv[this.gop_optind];
    wrwd.ASSERT(this.gop_subind < arg.length);
    chr = arg[this.gop_subind];

    if (++this.gop_subind >= arg.length) {
        this.gop_optind++;
        this.gop_subind = 0;
    }

    if (!(chr in this.gop_options))
        return (this.errInvalidOption(chr));

    if (!this.gop_options[chr])
        return ({ option: chr });

    return (this.getoptArgument(chr));
};

/*
 * Implements getopt() for the case where optind/subind point to a long option.
 */
wrwd.goBasicParser.prototype.getoptLong = function ()
{
    var arg, alias, chr, eq;

    wrwd.ASSERT(this.gop_subind === 0);
    wrwd.ASSERT(this.gop_optind < this.gop_argv.length);
    arg = this.gop_argv[this.gop_optind];
    wrwd.ASSERT(arg.length > 2 && arg[0] == '-' && arg[1] == '-');

    eq = arg.indexOf('=');
    alias = arg.substring(2, eq == -1 ? arg.length : eq);
    if (!(alias in this.gop_aliases))
        return (this.errInvalidOption(alias));

    chr = this.gop_aliases[alias];
    wrwd.ASSERT(chr in this.gop_options);

    if (!this.gop_options[chr]) {
        if (eq != -1)
            return (this.errExtraArg(alias));

        this.gop_optind++; /* eat this argument */
        return ({ option: chr });
    }

    /*
     * Advance optind/subind for the argument value and retrieve it.
     */
    if (eq == -1)
        this.gop_optind++;
    else
        this.gop_subind = eq + 1;

    return (this.getoptArgument(chr));
};

/*
 * For the given option letter 'chr' that takes an argument, assumes that
 * optind/subind point to the argument (or denote the end of input) and return
 * the appropriate getopt() return value for this option and argument (or return
 * the appropriate error).
 */
wrwd.goBasicParser.prototype.getoptArgument = function (chr)
{
    var arg;

    if (this.gop_optind >= this.gop_argv.length)
        return (this.errMissingArg(chr));

    arg = this.gop_argv[this.gop_optind].substring(this.gop_subind);
    this.gop_optind++;
    this.gop_subind = 0;
    return ({ option: chr, optarg: arg });
};

wrwd.goBasicParser.prototype.errMissingArg = function (chr)
{
    if (this.gop_silent)
        return ({ option: ':', optopt: chr });

    wrwd.output('option requires an argument -- ' + chr + '\n');
    return ({ option: '?', optopt: chr, error: true });
};

wrwd.goBasicParser.prototype.errInvalidOption = function (chr)
{
    if (!this.gop_silent)
        wrwd.output('illegal option -- ' + chr + '\n');

    return ({ option: '?', optopt: chr, error: true });
};

/*
 * This error is not specified by POSIX, but neither is the notion of specifying
 * long option arguments using "=" in the same argv-argument, but it's common
 * practice and pretty convenient.
 */
wrwd.goBasicParser.prototype.errExtraArg = function (chr)
{
    if (!this.gop_silent)
        wrwd.output('option expects no argument -- ' +
            chr + '\n');

    return ({ option: '?', optopt: chr, error: true });
};

wrwd.remember_type = { unknown:0, imaging:1, known:2, familiar:3, impressed:4 };

wrwd.output = function (text) {
    line = $("<div class=\"wrwd-output\"></div>");
    line.text(text);
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
            parser = new this.goBasicParser(optstr, argv);

            while ((option = parser.getopt()) !== undefined) {
                switch (option.option) {
                    case 'p':
                        if (typeof(this.file) != "undefined") {
                            if (typeof(this.file.getPage(option.optarg)) != "undefined") {
                                this.file.browsePage(option.optarg);    
                            }
                            else {
                                this.output("Page not ready. Create a page at first. e.g: new -p 0");
                            }                            
                        }
                        else {
                            this.output("File not ready. Create or open a file at first. e.g: new -f myvo");
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
            parser = new this.goBasicParser(optstr, argv);
            while ((option = parser.getopt()) !== undefined) {
                switch (option.option) {
                    case 'p':
                        this.file.removeIndexPage();
                        break;
                    case 'w':
                        this.file.getIndexPage().removeIndexWord();
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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

            while ((option = parser.getopt()) !== undefined) {
                switch (option.option) {

                }
            }
            break;
        case "goto":
            optstr = "";
            break;
        case "help":
            break;
        case "list":
            optstr = "f(file)p(page)";
            argv.shift();
            argv.unshift('');
            argv.unshift("list");
            parser = new this.goBasicParser(optstr, argv);

            while ((option = parser.getopt()) !== undefined) {
                switch (option.option) {
                    case 'f':
                        for(var i = 0; i < this.file.pageArray.length; ++ i) {
                            this.output(sprintf("page %d", i));
                        }
                        break;
                    case 'p':
                        for(var i = 0; i < this.file.getIndexPage().wordArray.length; ++ i) {
                            this.output(sprintf("%s", this.file.getIndexPage().getWord(i).term));
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

            parser = new this.goBasicParser(optstr, argv);

            while ((option = parser.getopt()) !== undefined) {
                switch (option.option) {
                    case 'f':
                        this.file = wrwd.createFile(option.optarg);
                        this.output(option.optarg);
                        break;

                    case 'p':
                        if (typeof(this.file) != "undefined") {
                            var pg = wrwd.createPage();
                            this.file.insertPage(this.file.pageArray.length, pg);
                        }
                        else {
                            this.output("File not ready. Create or open a file at first. e.g: new -f myvo");
                        }
                        break;

                    case 'w':
                        if (typeof(this.file) != "undefined") {
                            if (typeof(this.file.getIndexPage()) != "undefined") {
                                nw_word = wrwd.createWord({term:option.optarg}); 
                            }
                            else {
                                this.output("Page not ready. Browse the page at first. e.g: browse -p 0");
                            }                            
                        }
                        else {
                            this.output("File not ready. Create or open a file at first. e.g: new -f myvo");
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
                this.file.getIndexPage().insertWord(undefined, nw_word);
            }
            break;
        case "next":
            optstr = "";
            argv.shift();
            argv.unshift('');
            argv.unshift("");
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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
            parser = new this.goBasicParser(optstr, argv);

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

wrwd.createWord = (function () {
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
            return word;
        };
}());

wrwd.createPage = (function () {
    return function () {
        var page = ({});
        page.idx = 0;
        page.wordArray = [];
        page.insertWord = function(pos, wd) {
            pos = pos === undefined ? this.idx : pos;
            this.wordArray.splice(pos, 0, wd);
        };
        page.removeWord = function(pos) {
            this.wordArray.splice(pos, 1);
        };
        page.removeIndexWord = function() {
            this.removeWord(this.idx);
        };
        page.getWord = function(pos) {
            return this.wordArray[pos];
        }
        page.getIndexWord = function() {
            return this.getWord(this.idx);
        }
        return page;
    };
}());

wrwd.createFile = (function () {
    return function (name) {
        var file = ({});
        file.name = name;
        file.idx = 0;
        file.pageArray = [];
        file.insertPage = function(pos, pg) {
            oldLen = this.pageArray.length;
            this.pageArray.splice(pos, 0, pg);
            if (oldLen == this.pageArray.length)
                wrwd.output("Nothing happened to page.");
        };
        file.removePage = function(pos) {
            oldLen = this.pageArray.length;
            this.pageArray.splice(pos, 1);
            if (oldLen == this.pageArray.length)
                wrwd.output("Nothing happened to page.");
        };
        file.removeIndexPage = function() {
            this.removePage(this.idx);
        };
        file.browsePage = function(pos) {
            if (typeof(this.pageArray[pos]) == "undefined") {
                wrwd.output(sprintf("Page %s does not exist", pos));
                return pos;
            }
            this.idx = pos;
        };
        file.getPage = function(pos) {
            return this.pageArray[pos];
        };
        file.getIndexPage = function() {
            return this.getPage(this.idx);
        }
        return file;
    };
}());


$(document).ready(function () {
    $('body').layout({
        center__paneSelector: ".outer-center",
        west__paneSelector: ".outer-west",
        north__paneSelector: ".outer-north",
        west__size: 225,
        north__size: 100,
        spacing_open: 4,
        spacing_closed: 6,
        north__maxSize: 200,
        center__childOptions: {
            center__paneSelector: ".middle-center",
            east__paneSelector: ".middle-east",
            south__paneSelector: ".middle-south",
            east__size: 225,
            south__size: 25,
            south__minSize: 25,
            spacing_open: 4,
            spacing_closed: 6
        }
    });

    $(".middle-south").console({
        promptLabel: ">",
        commandValidate: function (line) {
            return true;
        },
        commandHandle: function (line) {
            wrwd.output(line);
            wrwd.cmdParse(line);
            return true;
        },
        animateScroll: false,
        promptHistory: false,
        disposable: true
    });

    self.setInterval(function () { $(".jquery-console-cursor").toggle(); }, 500);

    wrwd.output("Welcome to RWD web edition");
    wrwd.output("Copyright (C) 2013 viewpl");
    wrwd.output("type 'help -l' for details.");
});

$(window).keydown(function (k) {
    var code = (k.keyCode ? k.keyCode : k.which);
    if (code == '>') {
        $(".middle-south").click();
    }
});
