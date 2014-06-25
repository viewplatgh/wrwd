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
requirejs.config({
	paths: {
        requirejs: "require",
		jquery: "jquery-1.9.1",
        jquery_ui: "ui/jquery-ui",
		jquery_layout: "jquery.layout-1.3.0",
        jstree: "jstree/jstree",
        ace: "ace/ace",
        can: "amd/can",
        sprintf: "sprintf",
        getopt: "getopt",
        wrwd: "wrwd"
	},
    shim: {
        wrwd: {
            deps: ["jstree", "ace", "sprintf", "getopt", "can"],
        },
        jstree: {
            deps: ["jquery_layout"],
        },
        jquery_layout: {
            deps: ["jquery", "jquery_ui"],
        },
        ace: {
            deps: ["jquery"],
        },
    }
});

requirejs(["jquery", "jquery_ui", "jquery_layout", "jstree", "ace", "can", "can/util/object", "sprintf", "getopt", "wrwd"],
	function ($, jquery_ui, jquery_layout, jstree, ace, can, co, sptf, getopt, wrwd) {
		// Setup 'shift + >' hotkey
        var shiftDown = false;
        $(window).keydown(function (k) {
            var code = (k.keyCode ? k.keyCode : k.which);
            //console.log(code);
            switch (code) {
                case 16: // shift
                    shiftDown = true;
                    break;
                case 190: // '>'
                    if (shiftDown) {
                        $(".middle-south").click();
                        return false;
                    }
                    break;
                //case 27: // esc
                //    break; // didn't find a way to blur $(".middle-south")...
                default:
                    break;
            }
        });
        $(window).keyup(function (k) {
            var code = (k.keyCode ? k.keyCode : k.which);
            if (code === 16)
                shiftDown = false;
        });


        // Setup layout
        var wly = $('body').layout({
                    center__paneSelector: ".outer-center", // container
                    west__paneSelector: ".outer-west",  // left tree view
                    north__paneSelector: ".outer-north", // website header
                    west__size: 225,
                    north__size: 100,
                    spacing_open: 4,
                    spacing_closed: 6,
                    north__maxSize: 200,
                    center__childOptions: {
                        center__paneSelector: ".middle-center", // ouput console
                        east__paneSelector: ".middle-east", // right list view
                        south__paneSelector: ".middle-south",   // readline/getline console
                        east__size: 225,
                        south__size: 25,
                        south__minSize: 25,
                        spacing_open: 4,
                        spacing_closed: 6
                    }
                });

        //wly.addPinBtn(".outer-west", "west");
        $("<span></span>").attr("id", "outer-west-closer").prependTo(".outer-west");
        wly.addCloseBtn("#outer-west-closer", "west");

       $("#outer_west_jstree").jstree({
                                        "core": {
                                           "themes": {
                                               "name" : "default",
                                               "dots" : false
                                           },
                                           "data" : function (obj, cb) {
                                                cb.call(this, wrwd.getFileJsonData());
                                        	    //cb.call(this, ['Root 1', 'Root 2']);
                                           }
                                        },
                                        lang : {
                                           new_node : "New ...",
                                        },
                                        "types" : {
                                                "#" : {
                                                    "valid_children" : ["file"]
                                                },
                                                "file" : {
                                                    "icon" : "glyphicon glyphicon-book",
                                                    "valid_children" : ["page"]
                                                },
                                                "page" : {
                                                    "icon" : "glyphicon glyphicon-file",
                                                    "valid_children" : ["word"]
                                                },
                                                "word" : {
                                                    "icon" : "glyphicon glyphicon-pencil"
                                                }
                                            },
                                        "plugins" : ["types"]
                                      });
        wrwd.output("Welcome to RWD web edition");
        wrwd.output(sprintf("Copyright (c) %s Rob Lao (www.roblao.com)", (new Date()).getFullYear()));
        wrwd.output("type 'help -l' for details.");    
	});