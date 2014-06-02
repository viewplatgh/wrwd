{
    appDir: '../www',
    baseUrl: 'js',
    paths: {
	jquery: 'jquery-1.9.1',
	jquery_layout: 'jquery.layout-1.3.0',
	ace_theme_clouds: 'ace/theme-clouds',
	ace_keybinding_vim: 'ace/keybinding-vim',
	ace: 'ace/ace',
	can: 'amd/can',
	jstree: 'jstree/jstree'
    },
    dir: '../www-built',
    modules: [
        {
            //module names are relative to baseUrl
            name: 'main',
            include: [
                      'jquery',
		      'jquery_layout',
		      'can',
		      'ace_theme_clouds',
		      'ace_keybinding_vim',
                      'ace',
                      'jstree',
		      'getopt',
		      'sprintf',
		      'wrwd',
            ]
        },
    ]
}
