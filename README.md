# Supergrep

Supergrep is a web based log streamer written in node. It can be used quite nicely to surface new log lines (errors, etc.) that aren't normally expected.

Essentially, having supergrep running in your browser while changes are being made allows for new/novel log patterns to show up, because under the hood, what we're really doing is:

    $ tail -f {log filename} | grep -v {stuff you'd expect to see in log lines}

It's intended on being a noise reduction and change-awareness tool.

## Prerequisites

In order to run supergrep, you need [NodeJS](http://nodejs.org/) and [npm](http://howtonode.org/introduction-to-npm) ( NodeJS package manager).

## Getting Started

You can edit variables in localConfig.js and also in static/js/supergrep.js. Most of this should work out of the box but some of the cooler functionality is enabled by assuming certain pieces of data can be found in your logs.  You'll have to adjust the regexes to suit your logs.

Then you can install the node packages:

    $ npm install

Run it from your install directory like:

    $ ./runlocal
    
Point your browser to localhost (default port:3000) and then click on "Guide" to get a tour.


## Installation

After setting this up locally and seeing how it works you'll probably want to run in production. There are many [init](http://en.wikipedia.org/wiki/Init) daemons that you can run this under. We've included a simple init.d script to get you started. This is known to work under RedHat flavers of linux. You will have to edit the OPTIONS to specify the path where supergrep is installed.  It also sets a parameter for prodConfig.js that can take similar options as the localConfig.js that is included.

## Contributing

Patches welcome!
