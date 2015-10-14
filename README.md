# Supergrep

Supergrep is a web based log streamer written in node. It can be used quite nicely to surface new log lines (errors, etc.) that aren't normally expected.

Essentially, having supergrep running in your browser while changes are being made allows for new/novel log patterns to show up, because under the hood, what we're really doing is:

    $ tail -f {log filename} | grep -v {stuff you'd expect to see in log lines}

It's intended on being a noise reduction and change-awareness tool.

## This is an Archived Project

Supergrep is no longer actively maintained and is no longer in sync with the version used internally at Etsy.

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

After setting this up locally and seeing how it works you'll probably want to run in production. There are many [init](http://en.wikipedia.org/wiki/Init) daemons that you can run this under. We've included a simple init.d script to get you started. This is known to work under RedHat flavors of linux. You will have to edit the OPTIONS to specify the path where supergrep is installed.  It also sets a parameter for prodConfig.js that can take similar options as the localConfig.js that is included.

## Log Format

Here is an example log line from our logs that this tool supports.  You can modify it to support your log format.

    web0081 : [Tue Aug 28 13:55:05 2012] [error] [client 10.101.136.5] [e4G2F4OpKIEiCj-eAQuEKo-H-XDB] [error] [ClientLogger] [/somepath/lib/Logger.php:140] [0] uncaught: message="Object doesn&#39;t support this action" referrer="http://www.etsy.com/search?q=juliana+bracelets&view_type=gallery&ship_to=ZZ&min=0&max=0&page=8" data="{&quot;url&quot;:&quot;http://lognormal.net/boomerang/cb5494ba3c140e877cba92969c4c9f8cd712d8af2f307f956895dd1d&quot;,&quot;line&quot;:5,&quot;userAgent&quot;:&quot;Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)&quot;}", referer: http://www.etsy.com/search?q=juliana+bracelets&view_type=gallery&ship_to=ZZ&min=0&max=0&page=9

## Contributing

Patches welcome!
