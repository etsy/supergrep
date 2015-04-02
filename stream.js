var fs          = require('fs');
var qs          = require('querystring');
var net         = require('net');
var path        = require('path');
var exec        = require("child_process").exec;
var express     = require('express');
var socketio    = require('socket.io');
var less        = require('less');
var uglify      = require('uglify-js');
var LogReader   = require('./lib/logreader');

var STATIC_PATH = '/static';

var errorLines = [];
var logReaders = {};
var cache = { js: {}, jsc: {}, less: {} };

/* Config stuff */
    //Load config specified on command line
    var config = require(__dirname + "/" + process.argv[2]).config;
    if (!config.defaultMaxLines) {
        config.defaultMaxLines = 50;
    }
    //Set NODE_ENV based on config 'dev' flag; used by Express
    process.env.NODE_ENV = config.dev ? 'development' : 'production';

    //Create a log reader for each log defined in config
    config.files.forEach(function (file) {
        logReaders[file.name] = new LogReader(file, config);
    });

    // trap TERM signals and close all readers
    process.on('SIGTERM', function() {
        closeReaders();
        process.exit(0);
    });

/* Misc helper funcs */
    function closeReaders() {
      for (var name in logReaders) {
        logReaders[name].log.kill();
      }
    }

    function fileExists(path, cb) {
        fs.stat(path, function (err, stat) {
            cb(!err && stat.isFile());
        });
    }

    function dirExistsSync (path) {
        try {
            return fs.statSync(path).isDirectory();
        } catch (ex) {
            return false;
        }
    }

var app = express.createServer();
//Allow JSONP support
app.enable("jsonp callback");
app.use(express.logger());
app.use(express.bodyParser());
app.use(express.query());
app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

//IRCCat proxy
app.post('/irccat', function (req, res, next) {
        var postData = '';
        req.on('data', function (chunk) {
            postData += chunk;
        });
        req.on('end', function () {
            var params = qs.parse(postData);
            res.end('OK');
            if (params.target && params.data) {
                //TODO: fixed the double prefix
                params.data = config.irccat.prefix + params.data
                    .replace(/(^[\s\r\n]|[\s\r\n]$)/g)
                    .match(new RegExp('.{1,' + (config.irccat.maxchars - config.irccat.prefix.length) + '}', 'g'))
                    .join("\n")
                    .replace(/[\r\n]+/g, "\n" + config.irccat.prefix)
                    ;
                var telnet = new net.Socket();
                telnet.on('connect', function () {
                        telnet.end(params.target + ' ' + params.data + "\n");
                    })
                    .connect(config.irccat.port, config.irccat.host);
            }
        });
});
//Compiles LESS files to CSS
app.get('/*.css', function (req, res, next) {
    var cssFilename = __dirname + STATIC_PATH + req.url;
    fileExists(cssFilename, function (exists) {
        if (exists) {
            return next();
        }
        var lessFilename = cssFilename.replace(/\.css$/, '.less');
        fileExists(lessFilename, function (exists) {
            if (!exists) {
                return next();
            }
            if (cache.less[lessFilename]) {
                res.contentType('foo.css');
                return res.end(cache.less[lessFilename]);
            }
            fs.readFile(lessFilename, function (err, lessData) {
                if (err) {
                    return next();
                }
                lessData = lessData.toString();
                var pathParts = lessFilename.split('/');
                var filename = pathParts.pop();
                var lessPath = pathParts.join('/');
                var parser = new less.Parser ({
                      paths: [lessPath]
                    , filename: filename
                });
                parser.parse(lessData, function (err, tree) {
                    if (err) {
                        return next();
                    }
                    var cssData = tree.toCSS({ compress: !config.dev });
                    if (!config.dev) {
                        cache.less[lessFilename] = cssData;
                    }
                    res.contentType('foo.css');
                    return res.end(cssData);
                });
            });
        });
    });
});
//JS compiler/compressor
app.get('/*.jsc', function (req, res, next) {
    var jscFilename = __dirname + STATIC_PATH + req.url;
    fileExists(jscFilename, function (exists) {
        if (!exists) {
            return next();
        }
        if (cache.jsc[jscFilename]) {
            res.contentType('foo.js');
            return res.end(cache.jsc[jscFilename]);
        }
        fs.readFile(jscFilename, function (err, jscData) {
            if (err) {
                return next();
            }
            jscData = jscData.toString();
            var pathParts = jscFilename.split('/');
            pathParts.pop();
            var jsIncludePath = pathParts.join('/') + '/';
            var files = jscData.replace(/(^\s+|\s+$)/g, '').split(/\n+/g);

            var output = [];
            var jsReader = function () {
                if (files.length) {
                    var includeFile = files.shift().replace(/(^\s+|\s+$)/g, '');
                    if (includeFile === '') {
                        return jsReader();
                    }
                    var filePath = jsIncludePath + includeFile;
                    fs.readFile(filePath, function (err, jsData) {
                        if (err) {
                            console.log("Error loading JS file", filePath, err);
                        } else {
                            jsData = jsData.toString();
                            if (!config.dev) {
                                var tree = uglify.parser.parse(jsData);
                                tree = uglify.uglify.ast_squeeze(tree);
                                jsData = uglify.uglify.gen_code(tree);
                            }
                            output.push("\n/* JS include: " + includeFile + " */\n");
                            output.push(jsData);
                        }
                        jsReader();
                    });
                } else {
                    var compiledOutput = output.join("\n;\n");
                    if (!config.dev) {
                        cache.jsc[jscFilename] = compiledOutput;
                    }
                    res.contentType('foo.js');
                    return res.end(compiledOutput);
                }
            };
            jsReader();
        });
    });
});
//Blamebot functionality
app.get(config.blamebot.uri_match_regexp, function (req, res, next) {
    console.log('DEB', req.params);
    var reponame = req.params[0].toLowerCase();
    var filename = req.params[1];
    var startline = req.params[2];
    var endline = req.params[3] || startline;

    var cmd = config.blamebot.git_command + ' ' +
            config.blamebot.git_blame_options.join(' ') +
            " -L " + startline + "," + endline + " " +
            " -- " + filename;

    console.log('REQUEST', reponame, config.blamebot.git_checkout_dirs[reponame].path, filename, startline, endline);

    if (!config.blamebot.git_checkout_dirs[reponame]) {
        res.json({ error: {
            msg: 'Requested repository not found'
        }});
        return;
    }

    var child = exec(cmd, {"cwd" : config.blamebot.git_checkout_dirs[reponame].path},
        function (error, stdout, stderr) {
            if (error) {
                res.json({ error: {
                      msg: error
                    , details: stderr
                }});
                return;
            }

            var lines = stdout.split('\n');
            var details = {};
            for (var i = 0, len = lines.length; i < len; i++) {
                var line = lines[i].replace(/(^\s+|\s+^)/g).split(/\s/);
                if (line.length < 2) {
                    continue;
                }
                var key = line.shift();
                details[key] = line.join(' ');
            }

            res.json(details);
        });
});
//Redirect legacy /v2/* paths to /
app.all('/v2/:respath?', function (req, res, next) {
    var qs = req.url.split('?');
    qs.shift();
    res.redirect(
        '/' +
        (req.params.respath ? req.params.respath : '') +
        (qs.length ? '?' + qs.join('?') : '')
        );
});
app.use(express.staticCache());
app.use(express.static(__dirname + STATIC_PATH));
server = app.listen(config.port);

var websocket = socketio.listen(server);

websocket.sockets.on('connection', function (client) {
    var self = client;

    client.listeners = {};

    client.on('subscriptions', function(data) {
        if (data.subscribeTo) {
            data.subscribeTo.forEach(function (feed) {
                if (logReaders[feed] && !self.listeners[feed]) {
                    //console.log("gonna send" + util.inspect(logReaders[feed].lines));
                    self.emit('lines', {name: feed, lines: logReaders[feed].lines});

                    var listener = function (line) {
                        self.emit('lines', {name: feed, lines: [line]});
                    };

                    self.listeners[feed] = listener;

                    logReaders[feed].on("line", listener);
                }
            });
        }

        if (data.unsubscribeFrom) {
            data.unsubscribeFrom.forEach(function (feed) {
                if (self.listeners[feed]) {
                    logReaders[feed].removeListener("line", self.listeners[feed]);
                    delete self.listeners[feed];
                }
            });
        }
    });

    // remove the listeners so they don't just take up memory
    client.on('disconnect', function () {
        for (var feed in self.listeners) {
            logReaders[feed].removeListener("line", self.listeners[feed]);
            delete self.listeners[feed];
        }
    });

});

//Bootstrap for create/updating repos for blamebot
(function () {
    var key;
    var dir;

    function genUpdateRepoCallback (name) {
        return function (error, stdout, stderr) {
            setTimeout(function () { updateRepo(name); }, config.blamebot.refresh_time);
            console.log('UPDATE (' + name + ')', [error, stdout, stderr]);
        };
    }

    function updateRepo (name) {
        exec(config.blamebot.git_command + ' ' + config.blamebot.git_pull_options.join(' ')
            , { 'cwd' : config.blamebot.git_checkout_dirs[name].path }
            , genUpdateRepoCallback(name)
            );
    }

    var entry;
    var repoPath;
    for (key in config.blamebot.git_checkout_dirs) {
        entry = config.blamebot.git_checkout_dirs[key];
        repoPath = path.normalize(entry.path);
        if (dirExistsSync(repoPath)) {
            updateRepo(key);
        } else {
            if (config.git_clone_enabled) {
                exec(config.blamebot.git_command + ' ' + config.blamebot.git_clone_options.join(' ') + ' ' + entry.git + ' ' + repoPath
                    , genUpdateRepoCallback(key)
                    );
            }
        }
    }
})();
