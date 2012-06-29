// Log streaming
(function (window, $) {
    window.console = window.console || { log: function () {} };

    window.Etsy = window.Etsy || {};
    window.Etsy.Supergrep = window.Etsy.Supergrep || {};

    var sg = window.Etsy.Supergrep;

    sg.SortOrder = {
        Ascending: 'asc',
        Descending: 'dsc'
    };

    var pvt = {
        socket: null,
        targetLogs: [],
        logEntries: [],
        entryCounter: 0,
        hashes: {},
        unseen: 0,
        config: {
            maxEntries: 500,
            sortOrder: sg.SortOrder.Descending,
            autoscroll: true,
            filter: null,
            highlight: null,
            background: false,
            pageTitle: 'Supergrep++'
        },
        paths: {
            githubWebPrefix: 'https://github.com/your/repo/blob/master/',
        },
        regex: {
            /* Log parsing regexes */
                meta: /^((?:web)[\d]+)\s*\:?\s*\[([^\]]+)\]\s\[([^\]]+)\]\s\[(?:client\s*)?([^\]]+)\]/i,
                //DEV version of META regex
                meta_dev: /^((?:web)[\d]+)\s*\:?\s*\[([^\]]+)\]\s\[([^\]]+)\]\s\[(?:client\s*)?([^\]]+)\]/i,

                web: /^((?:web)[\d]+)\s*\:?\s*\[([^\]]+)\]\s(?:\[[^\]]+\])\s\[(?:client\s*)?([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s+/i,
                //DEV version of WEB regex
                web_dev: /^()\[([^\\[\]]+)\]\s()\[([^\\[\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+\[([^\]]+)\]\s+/i,

                gearman: /^((?:web)[\d]+)\s*\:?\s*\[([^\]]+)\]\s()\[([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s+/i,
                //DEV version of GEARMAN regex
                gearman_dev: /^()\[([^\]]+)\]\s()\[([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s\[([^\]]+)\]\s+/i,

            /* Log data parsing regexes */
                error: /\[(error)\]/ig,
                warning: /\[(warning)\]/ig,
                info: /\[((info|notice))\]/ig,
                debug: /\[(debug)\]/ig,
                phpFatal: /PHP Fatal/i,

            /* Stacktrace parsing regexes */
                stacktrace: /(\s#\d+\s)/g,
                fullStacktrace: /(?:stack trace:\s+|backtrace:(?:\\n|\s)*)(#\d+.+\.php(?:\:\d+|\(\d+\)))/i,
                stackSplitter: /\s*#\d+\s+/,
                stackFile: /(\/your\/path\/here\/|\/home\/[^\\\/]+)/i,
                phpFile: /\.php/i,
                stackInternalFunc: /\[internal\sfunction\]:\s*/i,
                stackFileLine: /\:\d+$/,
                stackAltFileLine: /\.php\((\d+)\):/i,

            /* Misc */
                codepath: /((\/your\/path\/here\/)([^\.]+.php)(?:\(([\d]+)\)|(?:\s*on)?\s+line\s+(\d+)|:(\d+)))/i,
                //Check to see if log is from DEV server
                devtest: /^\[/,
                token: /\[([a-z0-9-_]{28})\]/i,
                severity: /(?:\[[a-z0-9-_]{28}\])\s\[(error|warning)\]/i,
                fileNotFound: /File does not exist/i,
                url: /((?:https?:\/\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/ig
        }
    };

    function socketReconnect(sleep) {
        sg.writeMsg("Lost connection... retrying in " + sleep + " seconds");
        //TODO: configure timeout
        setTimeout(function() {
            if (!pvt.socket.socket.connected) {
                pvt.socket = io.connect();
            }
        }, sleep * 1000);
        setTimeout(function() {
            if (!pvt.socket.socket.connected && !pvt.socket.socket.connecting) {
                socketReconnect(sleep * 2);
            }
        }, (sleep + 3) * 1000);
    }

    sg.submitGist = function Etsy$Supergrep$submitGist (ns, timestamp, data) {
        $('#gistform-filename').val("supergrep[" + ns + "]" + timestamp);
        $('#gistform-data').val(unescape(data));
        $('#gistform').get(0).submit();
    };

    sg.submitIrc = function Etsy$Supergrep$submitIrc (target, data) {
        target = $.trim(target);

        if (!target) {
            return;
        }
        if (!target.match(/^(@|#)/)) {
            return;
        }

        var targetParts = target.split(' ');
        target = targetParts.shift();
        data = targetParts.join(' ') + "\n" + data;

        $.ajax('/v2/irccat', {
            type: 'POST',
            data: { target: target, data: data }
        });
    };

    sg.watchLogs = function Etsy$Supergrep$watchLogs (subscribedLogs, unsubscribedLogs) {
        pvt.subscribedLogs = subscribedLogs;
        pvt.unsubscribedLogs = unsubscribedLogs;

        if (!pvt.socket) {
            pvt.socket = io.connect(document.location.hostname, {
                transports: ['xhr-polling']
            });

            pvt.socket.on('connect', function () {
                $("#loading").hide();
                sg.writeMsg("Connection established");
                pvt.socket.emit('subscriptions', {
                    subscribeTo: pvt.subscribedLogs,
                    unsubscribeFrom: pvt.unsubscribedLogs
                });
            });

            pvt.socket.on('lines', function (data) {
                sg.writeLogEntries(data);
            });

            pvt.socket.on('disconnect', function () {
                if (! pvt.socket.connected) {
                    socketReconnect(2);
                }
            });
        } else {
            pvt.socket.emit('subscriptions', {
                    subscribeTo: pvt.subscribedLogs,
                    unsubscribeFrom: pvt.unsubscribedLogs
            });
        }
    };

    sg.setBackground = function Etsy$Supergrep$setBackground (isBackground) {
        pvt.config.background = !!isBackground;
        if (!pvt.config.background) {
            pvt.unseen = 0;
            $(document).attr("title", pvt.config.pageTitle);
        }
    };

    sg.parseFilterRule = function Etsy$Supergrep$parseFilterRule (rule) {
        rule = $.trim(rule);
        if (rule === '') {
            return null;
        }

        var result = rule.match(/^\/(.+)\/([igsm]*)$/);
        if (result) {
            return new RegExp(result[1], result[2]);
        }

        rule = rule.replace(/([\\\/\.\*\+\?\(\)\[\]\{\}\-\|])/g, '\\$1');
        var ruleParts = rule.split(/(?:\r\n|\n|\,)+/);
        var rulePartsSanitized = [];
        for (var i = 0, len = ruleParts.length; i < len; i++) {
            var part = $.trim(ruleParts[i]);
            if (part !== '') {
                rulePartsSanitized.push(part);
            }
        }
        if (!rulePartsSanitized.length) {
            return null;
        }

        return new RegExp('(' + rulePartsSanitized.join('|') + ')', 'i');
    };

    sg.setFilterInvert = function Etsy$Supergrep$setFilterInvert (invert) {
        pvt.config.filterInvert = !!invert;
        for (var i = 0, len = pvt.logEntries.length; i < len; i++) {
            this.evalLogEntry(pvt.logEntries[i]);
        }
    };

    sg.setFilter = function Etsy$Supergrep$setFilter (match) {
        pvt.config.filter = sg.parseFilterRule(match);
        for (var i = 0, len = pvt.logEntries.length; i < len; i++) {
            this.evalLogEntry(pvt.logEntries[i]);
        }
    };

    sg.setHighlight = function Etsy$Supergrep$setHighlight (match) {
        pvt.config.highlight = sg.parseFilterRule(match);
        for (var i = 0, len = pvt.logEntries.length; i < len; i++) {
            this.evalLogEntry(pvt.logEntries[i]);
        }
    };

    sg.evalLogEntry = function Etsy$Supergrep$evalLogEntry (entry) {
        if (pvt.config.highlight && entry.extra.rawdata.match(pvt.config.highlight)) {
            entry.element.addClass('highlight');
        } else {
            entry.element.removeClass('highlight');
        }
        if (pvt.config.filter && entry.extra.rawdata.match(pvt.config.filter)) {
            if (pvt.config.filterInvert) {
                entry.element.removeClass('hide');
                return true;
            } else {
                entry.element.addClass('hide');
                return false;
            }
        } else {
            if (pvt.config.filter && pvt.config.filterInvert) {
                entry.element.addClass('hide');
                return false;
            } else {
                entry.element.removeClass('hide');
                return true;
            }
        }
    };

    sg.setAutoscroll = function Etsy$Supergrep$setAutoscroll (autoscroll) {
        pvt.config.autoscroll = !!autoscroll;
        sg.scrollLog();
    };

    sg.scrollLog = function Etsy$Supergrep$scrollLog (entry) {
        if (pvt.config.sortOrder === this.SortOrder.Ascending) {
            if (!pvt.config.autoscroll) {
                return;
            }
            $("html").scrollTop($("html").height());
        } else {
            if (!pvt.config.autoscroll && entry) {
                $("html").scrollTop($("html").scrollTop() + entry.outerHeight());
            } else {
                $("html").scrollTop(0);
            }
        }
    };


    sg.setSortOrder = function Etsy$Supergrep$setSortOrder (sortOrder) {
        if (pvt.config.sortOrder === sortOrder) {
            return;
        }
        pvt.config.sortOrder = sortOrder;
        $('#results-list').empty();
        for (var i = 0, len = pvt.logEntries.length; i < len; i++) {
            this.displayEntry(pvt.logEntries[i].element);
        }
    };

    sg.getMaxEntries = function Etsy$Supergrep$getMaxEntries () {
        return pvt.config.maxEntries;
    };

    sg.setMaxEntries = function Etsy$Supergrep$setMaxEntries (max) {
        if (pvt.config.maxEntries === max) {
            return;
        }
        pvt.config.maxEntries = max;
        sg.trimEntries();
    };

    sg.trimEntries = function Etsy$Supergrep$trimEntries () {
        while (pvt.logEntries.length > pvt.config.maxEntries) {
            var entry = pvt.logEntries.shift();
            entry.element.remove();
            if (entry.extra.hash) {
                delete pvt.hashes[entry.extra.hash];
            }
        }
    };

    sg.displayEntry = function Etsy$Supergrep$displayEntry (element) {
        if (pvt.config.sortOrder === this.SortOrder.Ascending) {
            $(element).appendTo('#results-list');
        } else {
            $(element).prependTo('#results-list');
        }
        sg.scrollLog($(element));
    };

    sg.addEntry = function Etsy$Supergrep$addEntry (element, extra) {
        element = $(element);
        var entry = { element: element, extra: extra };
        var showing_entry = sg.evalLogEntry(entry);
        pvt.logEntries.push(entry);
        this.displayEntry(element);
        this.trimEntries();
        if (showing_entry && pvt.config.background) {
            pvt.unseen++;
            $(document).attr("title", '(' + pvt.unseen + ' new) ' + pvt.config.pageTitle);
        }
    };

    sg.clearEntries = function Etsy$Supergrep$clearEntries () {
        pvt.logEntries = [];
        $('#results-list').empty();
    };

    sg.writeMsg = function Etsy$Supergrep$writeMsg (data) {
        var templateData = { id: 'msg' + pvt.entryCounter++, data: data, rawdata: data };
        this.addEntry($(CWinberry.Templating.render('tpl_msgEntry', templateData)), templateData);
    };

    sg.parseLogEntry = function Etsy$Supergrep$parseLogEntry (ns, data) {
        try{
            var output = { ns: ns, rawdata: data, id: 'log' + pvt.entryCounter++ };

            //Check if the logs are from a DEV server
            var isDev = pvt.regex.devtest.test(data);

            var meta_matches = data.match(pvt.regex.meta);
            var error_matches = data.match(pvt.regex.error);
            var warning_matches = data.match(pvt.regex.warning);
            var token_matches = data.match(pvt.regex.token);
            var severity_matches = data.match(pvt.regex.severity);

            var severity = severity_matches ? severity_matches[1] : 'info';

            //TODO: break parsing into multiple functions
            if (ns === 'web') {
                var web_matches = data.match(
                    (ns === 'gearman') ?
                        (isDev ? pvt.regex.gearman_dev : pvt.regex.gearman)
                        :
                        (isDev ? pvt.regex.web_dev : pvt.regex.web)
                    );
                if (web_matches && web_matches.length === 9) {
                    data = data.replace(web_matches[0], '');
                    output.server = web_matches[1] || 'localhost';
                    output.timestamp = new Date(web_matches[2]);
                    //TODO: get better data parsing
                    if (isNaN(output.timestamp.getTime())) {
                        output.timestamp = new Date(0);
                    }
                    output.client = web_matches[3] || '127.0.0.1';
                    output.hash = web_matches[4];
                    output.severity = web_matches[5];
                    output.namespace = web_matches[6];
                    //TODO: standardize this
                    var pathTmp = web_matches[7] ? web_matches[7].split(':') : ['', 0];
                    output.path = {
                        url: web_matches[7].replace(pvt.regex.codepath, pvt.paths.githubWebPrefix + '$3#L$4$5$6'),
                        file: pathTmp[0].replace(pvt.regex.stackFile, ''),
                        line: pathTmp[1]
                    };
                    output.userid = (web_matches[8] && web_matches[8] !== '0') ? web_matches[8] : '';

                    // Parse the callstack
                    var fullStack = data.match(pvt.regex.fullStacktrace);
                    if (fullStack) {
                        output.stacktrace = [];
                        var stack = fullStack[1].split(pvt.regex.stackSplitter);
                        stack.shift();
                        for (var i = 0, len = stack.length; i < len; i++) {
                            var stackParts = stack[i].replace(pvt.regex.stackInternalFunc, '').split(' ');
                            var codeLine;
                            if (stack[i].match(pvt.regex.phpFile)) {
                                codeLine = stack[i].match(pvt.regex.stackAltFileLine) ?
                                    stackParts.shift().replace(pvt.regex.stackAltFileLine, '.php:$1')
                                    :
                                    stackParts.pop()
                                    ;
                            } else {
                                codeLine = '';
                            }
                            var codeLineParts;
                            if (codeLine.match(pvt.regex.stackFileLine)) {
                                codeLineParts = codeLine.split(':');
                            } else {
                                codeLineParts = ['', '0'];
                                stackParts.push(codeLine);
                            }
                            var stackCall = stackParts.join(' ');
                            var file = codeLineParts[0].replace(pvt.regex.stackFile, '');
                            var line = codeLineParts[1].replace('):', '');
                            if (file.indexOf('/') === 0) {
                                file = file.substring(1);
                            }
                            output.stacktrace.push({
                                call: stackCall,
                                file: file,
                                line: line,
                                url: !file ? '' : (pvt.paths.githubWebPrefix + file + '#L' + line) //TODO: detect search github files
                            });
                        }

                        data = data.replace(fullStack[0], '');
                    }
                } else {
                    if (meta_matches && meta_matches.length === 5) {
                        output.server = meta_matches[1];
                        output.timestamp = new Date(meta_matches[2]);
                        output.severity = meta_matches[3];
                        output.client = meta_matches[4];

                        // create a mapping of groups to names to be used as classnames
                        var meta_named_groups = {
                            'server' : meta_matches[1],
                            'timestamp' : meta_matches[2],
                            'apache_info' : meta_matches[3],
                            'client' : meta_matches[4]
                        };
                    }

                    //TODO: change the way this is rendered
                    for (var key in meta_named_groups) {
                        regex = new RegExp('(' + meta_named_groups[key].replace('[', '\\[').replace(']', '\\]') + ')', 'g');
                        data = data.replace(regex, '<span class="' + key + '">$1</span>');
                    }
                }
            } else {
                //Failed to recognize format so make a generic entry
                //TODO: change the way this is rendered
                data = data + (name ? '<span class="name">[' + name + ']</span> ' : '');
            }

            //Linkify any URLs floating around
            data = data.replace(pvt.regex.url, "<a target='_blank' href='$1'>$1</a>");

            //Save token if defined
            if (token_matches) {
                output.token = token_matches[1];
            }

            //Linkify any sourcecode references
            data = data.replace(pvt.regex.codepath, '<a target="_blank" href="' + pvt.paths.githubWebPrefix + '$3#L$4$5$6">$3:$4$5$6</a>');

            //Mark PHP fatal errors
            if (output.rawdata.match(pvt.regex.phpFatal)) {
                output.isFatal = true;
            }

            //Remove any extraneous whitespace
            output.data = $.trim(data);

            return output;

        } catch (ex) { console.log(ex); }
    };

    sg.writeLogEntry = function Etsy$Supergrep$writeLogEntry (ns, data) {
        var dataHash = hex_sha256(data);
        if (pvt.hashes[dataHash]) {
            return;
        }
        var templateData = this.parseLogEntry(ns, data);
        pvt.hashes[dataHash] = 1;
        templateData.hash = dataHash;
        this.addEntry($(CWinberry.Templating.render('tpl_logEntry', templateData)), templateData);
    };

    sg.writeLogEntries = function Etsy$Supergrep$writeLogEntries (entries) {
        $.each(entries.lines, function (index, value) {
            sg.writeLogEntry(entries.name, value);
        });
    };

})(window, jQuery);
