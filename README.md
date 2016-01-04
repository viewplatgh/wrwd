RWD web edition
====

WRWD is a web edition of RWD, RWD project is hosted at here: https://sourceforge.net/projects/rdwtwdb/

RWD stands for Readable Writable worDbook, it's a foreign language learning tool, focusing on managing ones own vocabulary.

WRWD let one create, save and handle the wordbook via a browser, so that WRWD is much easier to access and take advantage of the Internet.

Open index.html in a browser or visit http://viewplatgh.github.io/wrwd/ to try a live WRWD.

RWD documentation: http://rdwtwdb.sourceforge.net/manual/toc.html

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js and npm](nodejs.org) Node ^4.2.3, npm ^2.14.7
- [Bower](bower.io) (`npm install --global bower`)
- [Ruby](https://www.ruby-lang.org) and then `gem install sass`
- [Grunt](http://gruntjs.com/) (`npm install --global grunt-cli`)
- [MongoDB](https://www.mongodb.org/) - Keep a running daemon with `mongod`

### Developing

1. Run `npm install` to install server dependencies.

2. Run `bower install` to install front-end dependencies.

3. Run `mongod` in a separate shell to keep an instance of the MongoDB Daemon running

4. Run `grunt serve` to start the development server. It should automatically open the client in your browser when ready.

## Build & development

Run `grunt build` for building and `grunt serve` for preview.

### Testing

Running `npm test` will run the unit tests with karma.


License
====
 RWD web edition
 Copyright (C) 2014  Rob Lao (www.roblao.com)

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details <http://www.gnu.org/licenses/>.
