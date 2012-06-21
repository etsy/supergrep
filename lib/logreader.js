var ee          = require('events').EventEmitter;
var spawn       = require('child_process').spawn;
var util        = require('util');
var sanitize    = require('validator').sanitize;

function LogReader (file, config) {
    var self = this;

    ee.call(this);
    this.setMaxListeners(0);

    if (!file.maxLines) { file.maxLines = config.defaultMaxLines; }

    this.file = file;
    this.lines = [];
    this.buffer = "";
    this.paths = [];

    var args = ['-n', file.maxLines, '-F'];

    if (file.path instanceof Array) {
        file.path.forEach(function (path) {
            args.push(path);
        });
    } else {
        args.push(file.path);
    }

    this.log = spawn('tail', args);

    this.log.stdout.on('data', function (data) {
        self.buffer += data;
        var lines = self.buffer.split(/\n/);

        if (lines.length) {
            self.buffer = lines.pop();

            lines.forEach(function (line) {
                if (self.file.filter) {
                    line = self.file.filter(line, config);
                }

                if (line) {
            line = sanitize(line).entityEncode();
                    self.lines.push(line);
                    self.emit("line", line);
                }
            });

            // resize internal array
            self.lines = self.lines.slice(-1 * self.file.maxLines);
        }
    });
}

util.inherits(LogReader, ee);

module.exports = LogReader;
