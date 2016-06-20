#!/usr/bin/env node
var chokidar = require('chokidar');
var build = require('./build');


chokidar.watch(['css', 'html', 'img', 'js', 'tmpl', 'build.js'], {
    ignored: /[\/\\]\./,
    ignoreInitial: true
}).on('all', function(event, path) {
    console.log('☆ %s: %s', event, path);
    // Re-require to get any changes.
    var name = require.resolve('./build');
    console.log('Reloading %s', name);
    delete require.cache[name];
    build = require('./build');
    build();
});
