exports.config = {
    dev: false,
    port: 3000,
    lockFile: '/var/run/stream.pid',
    cache: {
        enabled: false,
        defaultExpiration: 60 * 60 * 15 //15 minutes
    },
    irccat: {
        host: 'irccat.yourdomain.com',
        port: 12345,
        prefix: 'SUPERGREP ',
        maxchars: 450
    },
    files: [
        {
            name: 'web',
            path: ['/var/log/httpd/info.log', '/var/log/httpd/php.log']
            // you can also do this
            //            filter: function (line, config) {
            //                if (! line.match(config.noisyErrors)) {
            //                    return line;
            //                } else {
            //                    return;
            //               }
            //            }
            //
            //  make sure to define below (in the config namespace):
            //    noisyErrors: new RegExp (/(something to ignore)/),
        },
        // add more files entries here if you want
        {
            name: 'chef',
            maxLines: 200,
            path: '/var/log/chef/client.log',
            filter: function (line) {
                if (line.match(/./)) {
                    return line;
                } else {
                    return false;
                }
            }
        }
    ],
    blamebot: {

        // Where is your git repo?
        "git_checkout_dirs" : {
            web:              { path: 'repos/Web/', git: 'git://github.com/somehwere.git' }
            // add more repos here
            },

        // What git command would you like me to use?
        "git_command" : "/usr/bin/env git",

        // What git options to use for blame
        "git_blame_options" : [
              'blame'
            , '-p'
            , '-w'
            , '--since=13.weeks'
            ],

        // What git options to use for pulling
        "git_pull_options" : [
                'pull'
              , '--rebase'
              , '--stat'
              , 'origin'
              , 'master'
            ],

        // whether to clone repos
        "git_clone_enabled" : true,

        // What git options to use for cloning
        "git_clone_options" : [
                'clone'
            ],

        // How frequently should a repo be updated?
        refresh_time: 15000,

        // What URI should I respond to?
        "uri_match_regexp" : /^\/blame\/([^\/]+)\/(.*)\@(\d+)(?:,(\d+))/
        // In this case, the URI "interface" works like this:
        // * Starting slash.
        // * The repo name (e.g. "Web/")
        // * The resource to get blame info on (e.g. phplib/somefile.php)
        // * The line number to get blame info on preceeded by a  '@' (e.g. @23)
        // * Optional the ending line number to get blame info on preceeded by a ',' (e.g. '@5,10')
        // * Optional querystring parameter 'callback' for JSONP (e.g. ?callback=doSomething)
        // Untested on Windows, but you would send in the path as it would
        //   work on your host OS.
    }

};
