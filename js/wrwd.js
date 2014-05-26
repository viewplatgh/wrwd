define(function(requirejs){
    var wrwd = ({});
    var ace = requirejs("ace/ace"); //TODO: Not sure why requirejs("ace") does not work
    var $ = requirejs("jquery");

    wrwd.output = function (text) {
                        line = $("<div class=\"wrwd-output\"></div>");
                        line.html(text);
                        $(".middle-center").append(line);
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
                                            //wrwd.cmdParse(cmdLine);
                                            wrwd.readline.selectAll();
                                            wrwd.readline.removeLines();
                                        },
                                        readOnly: false
                                    });

    return wrwd;
});