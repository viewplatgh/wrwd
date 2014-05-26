
requirejs.config({
	paths: {
        requirejs: "require",
		jquery: "jquery-1.9.1.min",
		jquery_layout: "jquery.layout-1.3.0.min",
        jstree: "jstree/jstree.min",
        ace: "ace/ace",
        sprintf: "sprintf",
        getopt: "getopt",
        wrwd: "wrwd",
		//can: ""
	},
    shim: {
        wrwd: {
            deps: ["jstree", "ace", "sprintf", "getopt"],
        },
        jstree: {
            deps: ["jquery_layout"],
        },
        jquery_layout: {
            deps: ["jquery"],
        },
        ace: {
            deps: ["jquery"],
            exports: 'ace',
        },
    }
});


requirejs(["jquery", "wrwd"],
	function ($, wrwd) {
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
        $('body').layout({
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
    
        
	});