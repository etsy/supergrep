(function (window, $) {
    window.console = window.console || { log: function () {} };

    window.CWinberry = window.CWinberry || {};
    window.CWinberry.Templating = window.CWinberry.Templating || {};

    ct = window.CWinberry.Templating;

    var templateCache = {};

    ct.render = function CWinberry$Templating$render (templateId, data) {
        return this.loadTemplate(templateId)(data);
    };

    ct.loadTemplate = function CWinberry$Templating$loadTemplate (templateId) {
        if (templateCache[templateId]) {
            return templateCache[templateId];
        }
        var templateSrc = $('#' + templateId);
        if (templateSrc.length === 0) {
            throw "Unrecognized template ID: " + templateId;
        }
        templateCache[templateId] = this.compile(templateSrc.text());
        return templateCache[templateId];
    };

    ct.compile = function CWinberry$Templating$compile (template) {
        function addText (buffer, text, unescaped) {
            unescaped = !!unescaped;
            buffer.push("\tprint(");
            buffer.push(unescaped ? text : "\"" + (text
                    .split("\r").join("\\r")
                    .split("\n").join("\\n")
                    .split("\t").join("\\t")
                    .split("\"").join("\\\"")
                ) + "\""
                );
            buffer.push(");\n");
        }

        function addCode (buffer, code) {
            if (code.indexOf("=") === 0) {
                addText(buffer, code.substring(1, code.length), true);
            } else {
                buffer.push("\t" + code);
            }
        }

        function renderTemplate (templateId, data) {
            addText(ct.render(templateId, data));
        }

        var buffer = [];
        var re = /(<%|%>)/g;
        var prvPos = 0;
        var prvSep = "";
        while (re.test(template)) {
            var curPos = re.lastIndex;
            var curSep = template.substring(curPos - 2, curPos);
            if (curSep == "<%") {
                addText(buffer, template.substring(prvPos, curPos - 2));
            } else { //curSep == "%>"
                addCode(buffer, template.substring(prvPos, curPos - 2));
            }
            prvPos = curPos;
            prvSep = curSep;
        }
        if (prvPos < template.length) {
            if (prvSep === "%>" || prvSep === "") {
                addText(buffer, template.substring(prvPos, template.length));
            } else { //prvSep == "%>"
                addCode(buffer, template.substring(prvPos, template.length));
            }
        }

        var src =
                "   var __output = [];\n" +
                "   var print = function () {\n" +
                "       __output.push.apply(__output, arguments);\n"+
                "   };\n" +
                "   var renderTemplate = function (templateId, data) {\n" +
                "       print(CWinberry.Templating.render(templateId, data));\n"+
                "   };\n" +
                    buffer.join('') +
                "   return(__output.join(''));"
                ;

        var templateFunc = null;
        try {
            templateFunc = new Function("data", src);
        } catch (ex) {
            throw "Failed to compile template: " + ex;
        }
        return templateFunc;
    };

})(window, jQuery);
