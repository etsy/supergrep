jQuery(function ($) {

    function createCookie(name, value, days) {
        var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toGMTString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + value + expires + "; path=/";
    }

    function readCookie (name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    function eraseCookie (name) {
        createCookie(name, "", -1);
    }

    function genExampleData () {
        return { name: 'web', lines: [
            "web1234 [" + new Date() + "] [error] [client 127.0.0.1] [xxxxxxxxxxxxxxxxxxxxxxxxxxxx] [error] PHP Fatal: something crapped the bed! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget orci nec quam bibendum vehicula in a risus. Pellentesque augue tellus, fermentum sit amet viverra ac, cursus nec neque. Praesent ornare ligula vitae risus fermentum gravida. Duis mollis ligula sed lorem posuere a porttitor neque vulputate. Integer ac ullamcorper diam. Aliquam urna dolor, vestibulum a faucibus vitae, lobortis non magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean tincidunt tincidunt velit. Suspendisse pretium pharetra dolor vitae sollicitudin. Nullam sem arcu, fringilla sit amet placerat quis, consectetur eget quam. Nulla laoreet faucibus malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "web1234 [" + new Date() + "] [error] [client 127.0.0.1] [xxxxxxxxxxxxxxxxxxxxxxxxxxxx] [error] [ErrorHandler] [phplib/Example.php:123] [12345678] This is an error messaged: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget orci nec quam bibendum vehicula in a risus. Pellentesque augue tellus, fermentum sit amet viverra ac, cursus nec neque. Praesent ornare ligula vitae risus fermentum gravida. Duis mollis ligula sed lorem posuere a porttitor neque vulputate. Integer ac ullamcorper diam. Aliquam urna dolor, vestibulum a faucibus vitae, lobortis non magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean tincidunt tincidunt velit. Suspendisse pretium pharetra dolor vitae sollicitudin. Nullam sem arcu, fringilla sit amet placerat quis, consectetur eget quam. Nulla laoreet faucibus malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "web1234 [" + new Date() + "] [warning] [client 127.0.0.1] [xxxxxxxxxxxxxxxxxxxxxxxxxxxx] [warning] [ErrorHandler] [phplib/Example.php:123] [12345678] This is an error messaged: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget orci nec quam bibendum vehicula in a risus. Pellentesque augue tellus, fermentum sit amet viverra ac, cursus nec neque. Praesent ornare ligula vitae risus fermentum gravida. Duis mollis ligula sed lorem posuere a porttitor neque vulputate. Integer ac ullamcorper diam. Aliquam urna dolor, vestibulum a faucibus vitae, lobortis non magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean tincidunt tincidunt velit. Suspendisse pretium pharetra dolor vitae sollicitudin. Nullam sem arcu, fringilla sit amet placerat quis, consectetur eget quam. Nulla laoreet faucibus malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "web1234 [" + new Date() + "] [info] [client 127.0.0.1] [xxxxxxxxxxxxxxxxxxxxxxxxxxxx] [error] [ErrorHandler] [phplib/Example.php:123] [12345678] This is an error messaged: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget orci nec quam bibendum vehicula in a risus. Pellentesque augue tellus, fermentum sit amet viverra ac, cursus nec neque. Praesent ornare ligula vitae risus fermentum gravida. Duis mollis ligula sed lorem posuere a porttitor neque vulputate. Integer ac ullamcorper diam. Aliquam urna dolor, vestibulum a faucibus vitae, lobortis non magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean tincidunt tincidunt velit. Suspendisse pretium pharetra dolor vitae sollicitudin. Nullam sem arcu, fringilla sit amet placerat quis, consectetur eget quam. Nulla laoreet faucibus malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "web1234 [" + new Date() + "] [error] [client 127.0.0.1] [xxxxxxxxxxxxxxxxxxxxxxxxxxxx] [info] [ErrorHandler] [phplib/Example.php:123] [12345678] This is an error messaged: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget orci nec quam bibendum vehicula in a risus. Pellentesque augue tellus, fermentum sit amet viverra ac, cursus nec neque. Praesent ornare ligula vitae risus fermentum gravida. Duis mollis ligula sed lorem posuere a porttitor neque vulputate. Integer ac ullamcorper diam. Aliquam urna dolor, vestibulum a faucibus vitae, lobortis non magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean tincidunt tincidunt velit. Suspendisse pretium pharetra dolor vitae sollicitudin. Nullam sem arcu, fringilla sit amet placerat quis, consectetur eget quam. Nulla laoreet faucibus malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "web1234 [" + new Date() + "] [debug] [client 127.0.0.1] [xxxxxxxxxxxxxxxxxxxxxxxxxxxx] [debug] [ErrorHandler] [phplib/Example.php:123] [12345678] This is an error messaged: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget orci nec quam bibendum vehicula in a risus. Pellentesque augue tellus, fermentum sit amet viverra ac, cursus nec neque. Praesent ornare ligula vitae risus fermentum gravida. Duis mollis ligula sed lorem posuere a porttitor neque vulputate. Integer ac ullamcorper diam. Aliquam urna dolor, vestibulum a faucibus vitae, lobortis non magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean tincidunt tincidunt velit. Suspendisse pretium pharetra dolor vitae sollicitudin. Nullam sem arcu, fringilla sit amet placerat quis, consectetur eget quam. Nulla laoreet faucibus malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "web1234 [" + new Date() + "] [other] [client 127.0.0.1] [xxxxxxxxxxxxxxxxxxxxxxxxxxxx] [other] This is an error messaged: Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eget orci nec quam bibendum vehicula in a risus. Pellentesque augue tellus, fermentum sit amet viverra ac, cursus nec neque. Praesent ornare ligula vitae risus fermentum gravida. Duis mollis ligula sed lorem posuere a porttitor neque vulputate. Integer ac ullamcorper diam. Aliquam urna dolor, vestibulum a faucibus vitae, lobortis non magna. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aenean tincidunt tincidunt velit. Suspendisse pretium pharetra dolor vitae sollicitudin. Nullam sem arcu, fringilla sit amet placerat quis, consectetur eget quam. Nulla laoreet faucibus malesuada. Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "web1234 [" + new Date() + "] [info] [client 127.0.0.1] [xxxxxxxxxxxxxxxxxxxxxxxxxxxx] [info] [EXCEPTION] [phplib/Dev/ExceptionHandler.php:156] [0] Uncaught HTTP_MissingParameterException: Missing parameter: network at phplib/HTTP/Request.php line 694. Stack trace: #2 param(Array, &#39;network&#39;, &#39;MISSING_DEFAULT_...&#39;) phplib/HTTP/Request.php:503 #1 getGet(&#39;network&#39;) phplib/Sharing.php:96 #0 processShare() /htdocs/share.php:6"
        ] };
    }

    guiders.createGuider({
        id: "guide_welcome",
        title: "Welcome to Supergrep++",
        description: "This is a quick guide to the new features in Supergrep. If you do not want to do this now, just click 'Exit Guide'; you can always restart the guide later.",
        overlay: true,
        buttons: [
            { name: "Exit Guide", onclick: function () {
                guiders.hideAll();
                guiders.show('guide_restart_abort');
            } },
            { name: "Next", onclick: function ()  {
                saveState();
                Etsy.Supergrep.clearEntries();
                $("#loading").hide();
                guiders.next();
            } }
            ],
        next: "guide_sgclassic"
    });

    guiders.createGuider({
        id: "guide_sgclassic",
        title: "Classic Supergrep",
        description: "If you do not like the new interface or are having problem, you can always go back to the classic view with this link.",
        attachTo: '#classic-view',
        position: 7,
        buttons: [
            { name: "Next" }
            ],
        next: "guide_legend"
    });

    guiders.createGuider({
        id: "guide_legend",
        title: "Help - Legend",
        description: "This button shows examples of all the log entry types and what each of the datapoints are in a log entry.",
        attachTo: '#legend-help',
        position: 6,
        buttons: [
            { name: "Show Legend", onclick: function () { $('#legend-help').trigger('click'); guiders.next(); } }
            ],
        next: "guide_legendDetails"
    });

    guiders.createGuider({
        id: "guide_legendDetails",
        title: "Legend",
        description: "These are the datapoints that are included in each log entry and the types of log entries that supergrep can display.",
        attachTo: '#legend-dialog',
        position: 9,
        width: 200,
        buttons: [
            { name: "Next", onclick: function () { guiders.hideAll(); $('#legend-dialog').dialog('close'); guiders.next(); } }
            ],
        next: "guide_logsources"
    });

    guiders.createGuider({
        id: "guide_logsources",
        title: "Log Sources",
        description: "These check boxes control which log sources supergrep will stream. They can be combined in any combination.",
        attachTo: '#logsource-options',
        position: 5,
        buttons: [
            { name: "Next" }
            ],
        next: "guide_viewoptions"
    });

    guiders.createGuider({
        id: "guide_viewoptions",
        title: "View Options",
        description: "These options control how the log entries are displayed to you.",
        attachTo: '#view-options',
        position: 5,
        buttons: [
            { name: "Next" }
            ],
        next: "guide_viewoptions_autoscroll"
    });

    //TODO: show lines scrolling
    guiders.createGuider({
        id: "guide_viewoptions_autoscroll",
        title: "Autoscroll",
        description: "Checking this option will cause the view to jump to new log entries when they appear.",
        attachTo: '#view-options',
        position: 5,
        buttons: [
            { name: "Next" }
            ],
        next: "guide_viewoptions_wrap"
    });

    //TODO: show lines wrapped
    guiders.createGuider({
        id: "guide_viewoptions_wrap",
        title: "Wrap lines",
        description: "When this option is checked, large log entries will take up more than one line on the screen. The upshot is that you can see the complete log on screen at all times.",
        attachTo: '#view-options',
        position: 5,
        buttons: [
            { name: "Show me!", onclick: function () {
                Etsy.Supergrep.writeLogEntries(genExampleData());
                guiders.next();
            } }
            ],
        next: "guide_viewoptions_wrap_demo"
    });
    guiders.createGuider({
        id: "guide_viewoptions_wrap_demo",
        title: "Wrap lines",
        description: "Try checking and unchecking the 'Wrap lines' option to see how it affects the display of log entries. Then, click 'Next' when you are ready.",
        attachTo: '#view-options',
        position: 5,
        buttons: [
            { name: "Next" }
            ],
        next: "guide_viewoptions_reverse"
    });

    guiders.createGuider({
        id: "guide_viewoptions_reverse",
        title: "Reverse sort",
        description: "By default new log entries are added to the top of the screen. To have them appear at the bottom like they do in Supergrep classic, make sure this option is checked.<br/><br/>Try checking and unchecking the 'Reverse sort' options to see how it affects the display of log entries.<br/><br/>Click 'Next' when you are ready to continue.",
        attachTo: '#view-options',
        position: 5,
        buttons: [
            { name: "Next" }
            ],
        next: "guide_viewoptions_max"
    });

    guiders.createGuider({
        id: "guide_viewoptions_max",
        title: "Max entries",
        description: "This value is the maximum number of log entries that will be displayed. Once that limit is reached, older log entries are removed.<br/><br/>Try entering '3' into the box then press the 'tab' key to see how it affects the display of log entries.<br/><br/>Click 'Next' when you are ready to continue.",
        attachTo: '#view-options',
        position: 5,
        buttons: [
            { name: "Next", onclick: function () { $('#max-entries').val(500).trigger('change'); Etsy.Supergrep.clearEntries(); guiders.next(); } }
            ],
        next: "guide_highlight"
    });

    guiders.createGuider({
        id: "guide_highlight",
        title: "Highlighting",
        description: "This field allows you to highlight log entries based on matching terms or a regex.",
        attachTo: '#highlight-options',
        position: 6,
        buttons: [
            { name: "Next" }
            ],
        next: "guide_highlight_help"
    });

    guiders.createGuider({
        id: "guide_highlight_help",
        title: "Highlighting",
        description: "This link will show you the formats allowed for highlighting rules.",
        attachTo: '#highlight-rule-help',
        position: 6,
        buttons: [
            { name: "Next", onclick: function () { $('#highlight-rule-help').trigger('click'); guiders.next(); } }
            ],
        next: "guide_highlight_help_show"
    });

    guiders.createGuider({
        id: "guide_highlight_help_show",
        title: "Highlighting Rules",
        description: "This help dialog shows you how to format your hightlighting and filtering rules.",
        attachTo: '#rule-help-dialog',
        position: 9,
        width: 300,
        buttons: [
            { name: "Next", onclick: function () {
                $('#rule-help-dialog').dialog('close');
                Etsy.Supergrep.writeLogEntries(genExampleData());
                $('#highlight-log').val('debug, warning').trigger('change');
                guiders.next();
            } }
            ],
        next: "guide_highlight_example1"
    });

    guiders.createGuider({
        id: "guide_highlight_example1",
        title: "Highlighting Example #1",
        description: "Here we see what happens when we highlight using the keywords 'debug' and 'warning'.",
        attachTo: '#highlight-log',
        position: 10,
        buttons: [
            { name: "Next", onclick: function () {
                $('#rule-help-dialog').dialog('close');
                $('#highlight-log').val('/(debug|warning)/i').trigger('change');
                guiders.next();
            } }
            ],
        next: "guide_highlight_example2"
    });

    guiders.createGuider({
        id: "guide_highlight_example2",
        title: "Highlighting Example #2",
        description: "Here is the same rule expressed as a regex.",
        attachTo: '#highlight-log',
        position: 10,
        buttons: [
            { name: "Next", onclick: function () {
                $('#rule-help-dialog').dialog('close');
                $('#highlight-log').val('').trigger('change');
                guiders.next();
            } }
            ],
        next: "guide_filter"
    });

    guiders.createGuider({
        id: "guide_filter",
        title: "Filtering",
        description: "Filtering works just like highlighting except instead of coloring matching entries, it hides them.",
        attachTo: '#filter-log',
        position: 10,
        buttons: [
            { name: "Show me", onclick: function () {
                $('#filter-log').val('errorhandler').trigger('change');
                guiders.next();
            } }
            ],
        next: "guide_filter_example"
    });

    guiders.createGuider({
        id: "guide_filter_example",
        title: "Filter Example",
        description: "Here we are filtering any log entries that contain 'errorhandler' (case insensitive). Notice how some of the log entries are now gone.",
        attachTo: '#clear-field-filter',
        position: 10,
        buttons: [
            { name: "Next" }
            ],
        next: "guide_filter_clear"
    });

    guiders.createGuider({
        id: "guide_filter_clear",
        title: "Clearing Rules",
        description: "Highlighting and filtering rules can be easily cleared by clicking the '[X]' button. Try it now!",
        attachTo: '#clear-field-filter',
        position: 5,
        offset: { top: 0, left: 35 },
        buttons: [
            { name: "Next", onclick: function () {
                $('#filter-log').val('').trigger('change');
                guiders.next();
            } }
            ],
        next: "guide_clearlog"
    });

    guiders.createGuider({
        id: "guide_clearlog",
        title: "Clearing Log Entries",
        description: "If you ever need to clear the log entries, just click this button. Try it now!",
        attachTo: '#clear-log',
        position: 6,
        buttons: [
            { name: "Next", onclick: function () { Etsy.Supergrep.clearEntries(); guiders.next(); } }
            ],
        next: "guide_intrologs"
    });

    guiders.createGuider({
        id: "guide_intrologs",
        title: "Log Entries",
        description: "Next, you are going to be introduced to a few features on the log entries themselves and then you are done!",
        overlay: true,
        buttons: [
            { name: "Next", onclick: function () {
                $('#sort-order').attr('checked', false).trigger('change');
                $('#highlight-log').val('').trigger('change');
                $('#filter-log').val('').trigger('change');
                $('#max-entries').val(500).trigger('change');
                Etsy.Supergrep.writeLogEntries(genExampleData());
                guiders.next();
            } }
            ],
        next: "guide_rawlog"
    });

    guiders.createGuider({
        id: "guide_rawlog",
        title: "Raw Logs",
        description: "If you ever need to see the original, raw log entry, just click the 'Raw Log' link.",
        attachTo: '.rawlog-link:first',
        position: 6,
        buttons: [
            { name: "Next", onclick: function () {
                var id = $('.rawlog-link:first').parent('li.log').attr('id');
                $('#' + id + ' .rawdata').show();
                guiders.next();
            } }
            ],
        next: "guide_rawlog_show"
    });

    guiders.createGuider({
        id: "guide_rawlog_show",
        title: "Raw Logs",
        description: "This is the raw log data, exactly is it was recorded.",
        attachTo: '.rawdata:first',
        position: 6,
        buttons: [
            { name: "Next", onclick: function () {
                var id = $('.rawlog-link:first').parent('li.log').attr('id');
                $('#' + id + ' .rawdata').hide();
                guiders.next();
            } }
            ],
        next: "guide_stacktrace"
    });

    guiders.createGuider({
        id: "guide_stacktrace",
        title: "Stack Trace",
        description: "If the log entry contains a recognized stack trace, this link will appear.",
        attachTo: '.stacktrace-link:first',
        position: 6,
        buttons: [
            { name: "Next", onclick: function () {
                var id = $('.stacktrace-link:first').parent('li.log').attr('id');
                $('#' + id + ' .stacktrace').show();
                guiders.next();
            } }
            ],
        next: "guide_stacktrace_show"
    });

    guiders.createGuider({
        id: "guide_stacktrace_show",
        title: "Stack Trace",
        description: "This is the parsed stack trace, showing call depth, function call + params, and a link to the source file and line number in Github.",
        attachTo: '.stacktrace:first',
        position: 7,
        buttons: [
            { name: "Next", onclick: function () {
                var id = $('.rawlog-link:first').parent('li.log').attr('id');
                guiders.next();
            } }
            ],
        next: "guide_export"
    });

    guiders.createGuider({
        id: "guide_export",
        title: "Exporting Data",
        description: "One last thing before we finish.<br/><br/>These links allow you to send a raw log or stack trace to either a gist or to an IRC channel/nick. For more info on how that works, click the '[?]' link.",
        attachTo: '.stacktrace:first .gist:first',
        position: 5,
        buttons: [
            { name: "Next", onclick: function () {
                Etsy.Supergrep.clearEntries();
                guiders.next();
            } }
            ],
        next: "guide_done"
    });

    guiders.createGuider({
        id: "guide_done",
        title: "End of Tour",
        description: "That's about it. Have fun!",
        overlay: true,
        buttons: [
            { name: "Next" }
            ],
        next: "guide_restart"
    });

    guiders.createGuider({
        id: "guide_restart",
        title: "Viewing this guide",
        description: "BTW, if you ever want to view this guide again, just click this button.",
        attachTo: '#guide-help',
        position: 6,
        buttons: [
            { name: "Close", onclick: function () {
                guiders.hideAll();
                restoreState();
            } }
            ]
    });
    guiders.createGuider({
        id: "guide_restart_abort",
        title: "Viewing this guide",
        description: "BTW, if you ever want to view this guide again, just click this button.",
        attachTo: '#guide-help',
        position: 6,
        buttons: [
            { name: "Close", onclick: function () {
                guiders.hideAll();
            } }
            ]
    });

    var cookieName = 'supergreptour';

    var seenTour = readCookie(cookieName);
    createCookie(cookieName, 1, 365);
    if (seenTour) {
        return;
    }

    var origOptions;

    function saveState () {
        origOptions = {
            highlight: $('#highlight-log').val(),
            filter: $('#filter-log').val(),
            logweb: $('#log-web').is(":checked"),
            autoscroll: $('#autoscroll').is(":checked"),
            wrap: $('#wrap-lines').is(":checked"),
            sort: $('#sort-order').is(":checked"),
            max: $('#max-entries').val()
        };

        $('#max-entries').val(100).trigger('change');
        $('#log-web, #wrap-lines, #sort-order').attr('checked', false).trigger('change');
        $('#log-web').trigger('change');
        $('#autoscroll').attr('checked', true).trigger('change');
        $('#highlight-log').val('').trigger('change');
        $('#filter-log').val('').trigger('change');
    }

    function restoreState () {
        $('#max-entries').val(origOptions.max).trigger('change');
        $('#highlight-log').val(origOptions.highlight).trigger('change');
        $('#filter-log').val(origOptions.filter).trigger('change');
        $('#autoscroll').attr('checked', origOptions.autoscroll).trigger('change');
        $('#wrap-lines').attr('checked', origOptions.wrap).trigger('change');
        $('#sort-order').attr('checked', origOptions.sort).trigger('change');
        $('#log-web').attr('checked', origOptions.logweb);
        Etsy.Supergrep.clearEntries();
        $('#log-web').trigger('change');
    }

    guiders.show('guide_welcome');

});
