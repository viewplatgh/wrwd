/// <reference path="../../../typings/globals/ace/index.d.ts" />

'use strict';
/* eslint no-sync: 0 */
import * as wrwd from '../../scripts/wrwd';
const angular = require('angular');

export class WrwdComponent {
  isLoggedIn: Function;
  isAdmin: Function;
  getCurrentUser: Function;

  constructor(Auth, $window) {
    'ngInject';
    this.isLoggedIn = Auth.isLoggedInSync;
    this.isAdmin = Auth.isAdminSync;
    this.getCurrentUser = Auth.getCurrentUserSync;

    (function () {
        let $ = $window.jQuery;
        let jqueryUI = $.ui;
        let jqueryLayout = $.layout;
        let jstree = $.jstree;
        let ace = $window.ace;
        let can = $window.can;
        let co = can.Object;
        let sptf = $window.sprintf;
        let wrwd = $window.createWrwd();
        wrwd.readline = ace.edit('rwd_readline');
        wrwd.readline.setHighlightActiveLine(false);
        wrwd.readline.setShowPrintMargin(false);
        wrwd.readline.renderer.setShowGutter(false);
        wrwd.readline.renderer.container.style.overflow = 'hidden';
        wrwd.readline.renderer.$maxLines = 4;
        wrwd.readline.renderer.setHighlightGutterLine(false);
        wrwd.readline.renderer.setStyle('ace_one-line');
        wrwd.readline.$mouseHandler.$focusWaitTimout = 0;

        // blur when pressing 'ESC' (but not working in vim mode...)
        wrwd.readline.keyBinding.addKeyboardHandler(function(data, hashId, keyString, keyCode, e){
            if (keyString === 'esc' && hashId === 0) {
                data.editor.blur();
                return {command: null};
            }
        });

        wrwd.readline.setTheme('ace/theme/clouds');
        wrwd.readline.setKeyboardHandler('ace/keyboard/vim');
        wrwd.readline.commands.addCommand({
                                            name: 'parseCmdLine',
                                            bindKey: {win: 'Return', mac: 'Return', linux: 'Return'},
                                            exec: function(readline){
                                                let cmdLine = readline.getSession().getValue();
                                                wrwd.output(cmdLine);
                                                wrwd.cmdParse(cmdLine);
                                                wrwd.readline.selectAll();
                                                wrwd.readline.removeLines();
                                            },
                                            readOnly: false
                                        });

        (function ($, jqueryUI, jqueryLayout, jstree, ace, can, co, sptf, wrwd) {

          /*
          *#######################
          * OUTER LAYOUT SETTINGS
          *#######################
          *
          * This configuration illustrates how extensively the layout can be customized
          * ALL SETTINGS ARE OPTIONAL - and there are more available than shown below
          *
          * These settings are set in 'sub-key format' - ALL data must be in a nested data-structures
          * All default settings (applied to all panes) go inside the defaults:{} key
          * Pane-specific settings go inside their keys: north:{}, south:{}, center:{}, etc
          */
          let layoutSettings = {
            name: "wrwdLayout", // NO FUNCTIONAL USE, but could be used by custom code to 'identify' a layout
                // options.defaults apply to ALL PANES - but overridden by pane-specific settings
            defaults: {
                size: "auto"
                , minSize: 50
                , paneClass: "pane"         // default = 'ui-layout-pane'
                , resizerClass: "resizer"   // default = 'ui-layout-resizer'
                , togglerClass: "toggler"   // default = 'ui-layout-toggler'
                , buttonClass: "button" // default = 'ui-layout-button'
                , contentSelector: ".file-explorer-content"   // inner div to auto-size so only it scrolls, not the entire pane!
                , contentIgnoreSelector: "span"     // 'paneSelector' for content to 'ignore' when measuring room for content
                , togglerLength_open: 35            // WIDTH of toggler on north/south edges - HEIGHT on east/west edges
                , togglerLength_closed: 35          // "100%" OR -1 = full height
                , hideTogglerOnSlide: true      // hide the toggler when pane is 'slid open'
                , togglerTip_open: "Close This Pane"
                , togglerTip_closed: "Open This Pane"
                , resizerTip: "Resize This Pane"
                //  effect defaults - overridden on some panes
                , fxName: "none"       // none, slide, drop, scale
                // , fxSpeed_open: 750
                // , fxSpeed_close: 1500
                // , fxSettings_open: { easing: "easeInQuint" }
                // , fxSettings_close: { easing: "easeOutQuint" }
            },
            north: {
                size: 100
                , maxSize: 200
                , spacing_open: 5         // cosmetic spacing
                , togglerLength_open: 0         // HIDE the toggler button
                , togglerLength_closed: -1          // "100%" OR -1 = full width of pane
                , resizable: true
                , slidable: false
                //  override default effect
                , fxName: "none"
            },
            // , south: {
            //     maxSize: 200
            //     , spacing_closed: 0         // HIDE resizer & toggler when 'closed'
            //     , slidable: false       // REFERENCE - cannot slide if spacing_closed = 0
            //     , initClosed: true
            //     //  CALLBACK TESTING...
            //     , onhide_start: function () { return confirm("START South pane hide \n\n onhide_start callback \n\n Allow pane to hide?"); }
            //     , onhide_end: function () { alert("END South pane hide \n\n onhide_end callback"); }
            //     , onshow_start: function () { return confirm("START South pane show \n\n onshow_start callback \n\n Allow pane to show?"); }
            //     , onshow_end: function () { alert("END South pane show \n\n onshow_end callback"); }
            //     , onopen_start: function () { return confirm("START South pane open \n\n onopen_start callback \n\n Allow pane to open?"); }
            //     , onopen_end: function () { alert("END South pane open \n\n onopen_end callback"); }
            //     , onclose_start: function () { return confirm("START South pane close \n\n onclose_start callback \n\n Allow pane to close?"); }
            //     , onclose_end: function () { alert("END South pane close \n\n onclose_end callback"); }
            //     //, onresize_start:         function () { return confirm("START South pane resize \n\n onresize_start callback \n\n Allow pane to be resized?)"); }
            //     , onresize_end: function () { alert("END South pane resize \n\n onresize_end callback \n\n NOTE: onresize_start event was skipped."); }
            // }
            west: {
                size: 250
                , spacing_closed: 21            // wider space when closed
                , togglerLength_closed: 21          // make toggler 'square' - 21x21
                , togglerAlign_closed: "top"        // align to top of resizer
                , togglerLength_open: 0         // NONE - using custom togglers INSIDE west-pane
                , togglerTip_open: "Close West Pane"
                , togglerTip_closed: "Open West Pane"
                , resizerTip_open: "Resize West Pane"
                , slideTrigger_open: "click"    // default
                , initClosed: false
                //  add 'bounce' option to default 'slide' effect
                , fxSettings_open: { easing: "easeOutBounce" }
            },
            // , east: {
            //     size: 250
            //     , spacing_closed: 21            // wider space when closed
            //     , togglerLength_closed: 21          // make toggler 'square' - 21x21
            //     , togglerAlign_closed: "top"        // align to top of resizer
            //     , togglerLength_open: 0             // NONE - using custom togglers INSIDE east-pane
            //     , togglerTip_open: "Close East Pane"
            //     , togglerTip_closed: "Open East Pane"
            //     , resizerTip_open: "Resize East Pane"
            //     , slideTrigger_open: "mouseover"
            //     , initClosed: true
            //     //  override default effect, speed, and settings
            //     , fxName: "drop"
            //     , fxSpeed: "normal"
            //     , fxSettings: { easing: ""} // nullify default easing
            // }
            center: {
                paneSelector: "#main-content"            // sample: use an ID to select pane instead of a class
                // , minWidth: 200
                // , minHeight: 200
            }
            };


            let outerLayout, innerLayout;
            // create the OUTER LAYOUT
            outerLayout = $(".main-container .content").layout( layoutSettings );

            /*******************************
             ***  CUSTOM LAYOUT BUTTONS  ***
             *******************************
             *
             * Add SPANs to the east/west panes for customer "close" and "pin" buttons
             *
             * COULD have hard-coded span, div, button, image, or any element to use as a 'button'...
             * ... but instead am adding SPANs via script - THEN attaching the layout-events to them
             *
             * CSS will size and position the spans, as well as set the background-images
             */

            // BIND events to hard-coded buttons in the NORTH toolbar
            //outerLayout.addToggleBtn( "#tbarToggleNorth", "north" );
            //outerLayout.addOpenBtn( "#tbarOpenSouth", "south" );
            //outerLayout.addCloseBtn( "#tbarCloseSouth", "south" );
            //outerLayout.addPinBtn( "#tbarPinWest", "west" );
            //outerLayout.addPinBtn( "#tbarPinEast", "east" );

            // save selector strings to lets so we don't have to repeat it
            // must prefix paneClass with "body > " to target ONLY the outerLayout panes
            let westSelector = ".main-container .content > .ui-layout-west"; // outer-west pane
            //let eastSelector = "body > .ui-layout-east"; // outer-east pane

            // CREATE SPANs for pin-buttons - using a generic class as identifiers
            //$("<span></span>").addClass("pin-button").prependTo( westSelector );
            //$("<span></span>").addClass("pin-button").prependTo( eastSelector );
            // BIND events to pin-buttons to make them functional
            //outerLayout.addPinBtn( westSelector +" .pin-button", "west");
            //outerLayout.addPinBtn( eastSelector +" .pin-button", "east" );

             // CREATE SPANs for close-buttons - using unique IDs as identifiers
            $("<span></span>").attr("id", "west-closer" ).prependTo( westSelector );
            //$("<span></span>").attr("id", "east-closer").prependTo( eastSelector );
            // BIND layout events to close-buttons to make them functional
            //TODO: Uncomment following line if fix 'Type error lang not definded issue'
            //outerLayout.addCloseBtn("#west-closer", "west");
            //outerLayout.addCloseBtn("#east-closer", "east");


            /*
            *#######################
            * INNER LAYOUT SETTINGS
            *#######################
            *
            * These settings are set in 'list format' - no nested data-structures
            * Default settings are specified with just their name, like: fxName:"slide"
            * Pane-specific settings are prefixed with the pane name + 2-underscores: north__fxName:"none"
            */
            let layoutSettings_Inner = {
                applyDefaultStyles:             true // basic styling for testing & demo purposes
            ,   minSize:                        20 // TESTING ONLY
            ,   spacing_closed:                 5
            ,   north__spacing_closed:          5
            ,   south__spacing_closed:          5
            ,   north__togglerLength_closed:    -1 // = 100% - so cannot 'slide open'
            ,   south__togglerLength_closed:    -1
            // ,   fxName:                         "none" // do not confuse with "slidable" option!
            // ,   fxSpeed_open:                   1000
            // ,   fxSpeed_close:                  2500
            // ,   fxSettings_open:                { easing: "easeInQuint" }
            // ,   fxSettings_close:               { easing: "easeOutQuint" }
            // ,   north__fxName:                  "none"
            // ,   south__fxName:                  "none"
            // ,   south__fxSpeed_open:            500
            // ,   south__fxSpeed_close:           1000
            ,   south__maxSize: 30
            ,   south__minSize: 30 
            ,   initClosed:                     false
            //,   center__minWidth:               200
            //,   center__minHeight:              300
            };

            /* Create the INNER LAYOUT - nested inside the 'center pane' of the outer layout
             * Inner Layout is create by createInnerLayout() function - on demand
             *
             */
            innerLayout = $("#main-content").layout( layoutSettings_Inner );
             /*
             *
             */


            // // DEMO HELPER: prevent hyperlinks from reloading page when a 'base.href' is set
            // $("a").each(function () {
            //     let path = document.location.href;
            //     if (path.substr(path.length-1)=="#") path = path.substr(0,path.length-1);
            //     if (this.href.substr(this.href.length-1) == "#") this.href = path +"#";
            // });




            // Setup layout
            // let wly = $('body').layout({
            //             center__paneSelector: ".outer-center", // container
            //             west__paneSelector: ".outer-west",  // left tree view
            //             north__paneSelector: ".outer-north", // website header
            //             west__size: 225,
            //             north__size: 100,
            //             spacing_open: 4,
            //             spacing_closed: 6,
            //             north__maxSize: 200,
            //             center__childOptions: {
            //                 center__paneSelector: ".middle-center", // ouput console
            //                 east__paneSelector: ".middle-east", // right list view
            //                 south__paneSelector: ".middle-south",   // readline/getline console
            //                 east__size: 225,
            //                 south__size: 25,
            //                 south__minSize: 25,
            //                 spacing_open: 4,
            //                 spacing_closed: 6
            //             }
            //         });

            //let wly = $("body").layout(layoutSettings);
            // // save selector strings to lets so we don't have to repeat it
            // // must prefix paneClass with "body > " to target ONLY the wly panes
            // let westSelector = "body > .ui-layout-west"; // outer-west pane
            // let eastSelector = "body > .ui-layout-east"; // outer-east pane

            // // CREATE SPANs for pin-buttons - using a generic class as identifiers
            // $("<span></span>").addClass("pin-button").prependTo(westSelector);
            // $("<span></span>").addClass("pin-button").prependTo(eastSelector);
            // // BIND events to pin-buttons to make them functional
            // wly.addPinBtn(westSelector + " .pin-button", "west");
            // wly.addPinBtn(eastSelector + " .pin-button", "east");
            // // CREATE SPANs for close-buttons - using unique IDs as identifiers
            // $("<span></span>").attr("id", "west-closer").prependTo(westSelector);
            // $("<span></span>").attr("id", "east-closer").prependTo(eastSelector);
            // // BIND layout events to close-buttons to make them functional
            // wly.addCloseBtn("#west-closer", "west");
            // wly.addCloseBtn("#east-closer", "east");


            //wly.addPinBtn(".outer-west", "west");
            // $("<span></span>").attr("id", "outer-west-closer").prependTo(".outer-west");
            // wly.addCloseBtn("#outer-west-closer", "west");

           $(".ui-layout-west > .file-explorer-content").jstree({
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
                                            "lang" : {
                                               new_node : "New ...",
                                            },
                                            "types" : {
                                                    "#" : {
                                                        "valid_children" : ["file"]
                                                    },
                                                    "file" : {
                                                        "icon" : "fa fa-book",
                                                        "valid_children" : ["page"]
                                                    },
                                                    "page" : {
                                                        "icon" : "fa fa-file",
                                                        "valid_children" : ["word"]
                                                    },
                                                    "word" : {
                                                        "icon" : "fa fa-question"
                                                    }
                                                },
                                            "plugins" : ["types"]
                                          });



            // Setup 'shift + >' hotkey
            let shiftDown = false;
            $($window).keydown(function (k) {
                let code = (k.keyCode ? k.keyCode : k.which);
                //console.log(code);
                switch (code) {
                    case 16: // shift
                        shiftDown = true;
                        break;
                    case 190: // '>'
                        if (shiftDown) {
                            wrwd.readline.focus();
                            return false;
                        }
                        break;
                    case 27: // esc
                        // did by wrwd.readline.keyBinding.addKeyboardHandler
                        break;
                    default:
                        break;
                }
            });
            $($window).keyup(function (k) {
                let code = (k.keyCode ? k.keyCode : k.which);
                if (code === 16) {
                    shiftDown = false;
                }
            });
        })($, jqueryUI, jqueryLayout, jstree, ace, can, co, sptf, wrwd);

        wrwd.output("Welcome to RWD web edition");
        wrwd.output($window.sprintf("Copyright (c) %s Rob Lao (www.roblao.com)", (new Date()).getFullYear()));
        wrwd.output("type 'help -l' for details.");      
      })();        
  }

}

export default angular.module('directives.wrwd', [])
  .component('wrwdLayout', {
    template: require('./wrwd.html'),
    controller: WrwdComponent
  })
  .name;
