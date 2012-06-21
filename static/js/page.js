//This is for the benefit of jStorage
jQuery.extend({
    toJSON: JSON.stringify,
    evalJSON: JSON.parse
});

// Page initialization
jQuery(function ($) {
    window.Etsy = window.Etsy || {};
    window.Etsy.Page = window.Etsy.Page || {};

    //HACK: for browsers without a real window.onhashchange event
    var lastHash = window.location.hash;
    (function () {
        if (!("onhashchange" in window)) {
            setInterval(function () {
                if (window.location.hash !== lastHash) {
                    lastHash = window.location.hash;
                    $(window).trigger('hashchange');
                }
            }, 100);
        }
    })();

    var disableSaveForm = true;
    function saveForm () {
        if (disableSaveForm) {
            return;
        }

        var data = {};
        $('.display-option input, .display-option textarea').each(function (index, element) {
            data[element.id] = (element.type === 'checkbox') ? element.checked : element.value;
        });
        lastHash = encodeURIComponent(JSON.stringify(data));
        window.location.hash = lastHash;
    }

    function loadForm () {
        var data = null;
        try {
            data = JSON.parse(decodeURIComponent(window.location.hash.replace(/^#/, '')));
        } catch (ex) { return ;}
        $('.display-option input, .display-option textarea').each(function (index, element) {
            if (element.id in data) {
                var oldValue = null;
                if (element.type === 'checkbox') {
                    oldValue = element.checked;
                    element.checked = data[element.id];
                } else {
                    oldValue = element.value;
                    element.value = data[element.id];
                }
                if (oldValue !== data[element.id]) {
                    $(element).trigger('change');
                }
            }
        });
    }

    //Hook into changes to the HASH
    $(window).bind('hashchange', function () {
        if (lastHash !== window.location.hash) {
            loadForm();
        }
    });

    loadForm();

    //Hook into when page is being watched
    $(window).bind('blur', function () {
        Etsy.Supergrep.setBackground(true);
    });
    $(window).bind('focus', function () {
        Etsy.Supergrep.setBackground(false);
    }).trigger('focus');

    //Hook the clear log link
    $('#clear-log').bind('click', function () {
        Etsy.Supergrep.clearEntries();
        return false;
    });

    //Hook the legend link
    $('#legend-help').bind('click', function () {
        $('#legend-dialog').dialog({
            autoOpen: true,
            width: 600,
            buttons: {
                "Ok": function() {
                    $(this).dialog("close");
                }
            }
        });
        return false;
    });

    //Hook the guide link
    $('#guide-help').bind('click', function () {
        guiders.hideAll();
        guiders.show('guide_welcome');
        return false;
    });

    //Hook the filter/highlight help links
    $('.rule-help').bind('click', function () {
        $('#rule-help-dialog').dialog({
            autoOpen: true,
            width: 600,
            buttons: {
                "Ok": function() {
                    $(this).dialog("close");
                }
            }
        });
        return false;
    });

    //Hook into line wrap checkbox
    $('#wrap-lines').bind('change', function() {
        saveForm();
        $('#results').toggleClass('wrapping', this.checked);
    }).trigger('change');

    //Hook sort order check box
    $('#sort-order').bind('change', function() {
        saveForm();
        Etsy.Supergrep.setSortOrder(this.checked ?
            Etsy.Supergrep.SortOrder.Ascending
            :
            Etsy.Supergrep.SortOrder.Descending
            );
    }).trigger('change');

    //Hook autoscroll checkbox
    $('#autoscroll').bind('change', function() {
        saveForm();
        Etsy.Supergrep.setAutoscroll(this.checked);
    }).trigger('change');

    //Hook max entry field
    $('#max-entries').bind('change', function() {
        var max = parseInt(this.value, 10);
        if (isNaN(max)) {
            this.value = Etsy.Supergrep.getMaxEntries();
            return;
        }
        this.value = max;
        saveForm();
        Etsy.Supergrep.setMaxEntries(max);
    }).trigger('change');

    //Hook filter clear button
    $('#clear-field-filter').bind('click', function () {
        $('#filter-log').val('').trigger('change');
        return false;
    });

    //Hook filter
    $('#filter-log').bind('change', function() {
        var ruleGood = false;
        try {
            ruleGood = !!Etsy.Supergrep.parseFilterRule(this.value);
        } catch (ex) {}
        if ($.trim(this.value) !== '' && !ruleGood) {
            $('#filter-log').addClass('error');
            return;
        }
        $('#filter-log').removeClass('error');
        saveForm();
        Etsy.Supergrep.setFilter(this.value);
    }).trigger('change');

    $('#filter-invert-option').bind('change', function() {
        Etsy.Supergrep.setFilterInvert(!!$('#filter-invert-option:checked').length);
    }).trigger('change');

    //Hook filter clear button
    $('#clear-field-highlight').bind('click', function () {
        $('#highlight-log').val('').trigger('change');
        return false;
    });

    //Hook highlighter
    $('#highlight-log').bind('change', function() {
        var ruleGood = false;
        try {
            ruleGood = !!Etsy.Supergrep.parseFilterRule(this.value);
        } catch (ex) {}
        if ($.trim(this.value) !== '' && !ruleGood) {
            $('#highlight-log').addClass('error');
            return;
        }
        $('#highlight-log').removeClass('error');
        saveForm();
        Etsy.Supergrep.setHighlight(this.value);
    }).trigger('change');

    //NOTE: this should be the last event defined/triggered
    //Hook into changes to log selection
    $('.log-option').bind('change', function() {
        var enabledLogs = [],
            disabledLogs = [];

        $('.log-option').each(function () {
            var log = $(this).attr('data-log');

            if ($(this).is(':checked')) {
                enabledLogs.push(log);
            } else {
                disabledLogs.push(log);
            }
        });

      saveForm();
      Etsy.Supergrep.watchLogs(enabledLogs, disabledLogs);
    });

    $('#log-web').trigger('change');

    disableSaveForm = false;

    window.Etsy.Page.showBlame = function showBlame (link, file, line) {
        var container = $(link).parents('li:first');
        //This should be a template
        var output = $('<span class="blameInfo">Loading...</span>');
        $(link).remove();
        container.append(output);
        $.ajax('/blame/web/' + file + '@' + line + ',' + line, {
              dataType: 'jsonp'
            , success: function (data, textStatus, jqXHR) {
                if (data.error) {

                }
                output.text(data.error ?
                    ('[Blamebot error: ' + (data.error.details || data.error.msg) + ']')
                    :
                    ('[' + (new Date(data['author-time'] * 1000)).format('m/d HH:MM:ss') + '] ' + data['author'] + ' - ' + data['summary'])
                    );
            }
        });
    };

});
