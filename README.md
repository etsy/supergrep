# Supergrep

Supergrep is a web based log streamer written in node

## Getting Started

You can edit variables in localConfig.js and also in static/js/supergrep.js. Most of this should work out of the box but some of the cooler functionality is enabled by assuming certain pieces of data can be found in your logs.  You'll have to adjust the regexes to suit your logs.

Then you can install the node packages:

    $ node install

Run it:

    $ runlocal

## Installation

After setting this up locally and seeing how it works you'll probably want to run in production. There are many [init](http://en.wikipedia.org/wiki/Init) daemons that you can run this under. We've included a simple init.d script to get you started. This is known to work under RedHat flavers of linux. You will have to edit the OPTIONS to specify the path where supergrep is installed.  It also sets a parameters for prodConfig.js that can take similar options as the localConfig.js that is included.

## Contributing

Patches welcome!
