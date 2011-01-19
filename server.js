var url = require("url");
var fs = require("fs");
var bind = require("./libraries/bind-js");
var markdown = require("./libraries/markdown-js/lib/markdown");
var srv = require("./libraries/xavlib/simple-router");
var chn = require("./libraries/xavlib/channel");

process.title = "node-xavi.co";

var DefaultBindHandler = (function() {
    function handler(context, req, res) {
        bind.toFile("./content/templates/default.html", context, function(data) {
            res.writeHead(200, { "Conent-Length": data.length,
                                 "Content-Type": "text/html" });
            res.end(data, "utf8");
        });
    }
    
    function bindMarkdown(callback, val) {
        callback(markdown.renderJsonML(markdown.toHTMLTree(val,"Maruku")), {}, true); 
    }

    return function(path, id, extContext) {
        if(Object.prototype.toString.call(id) !== "[object String]") { extContext = id; id = ""; }
        
        var context = { id: id,
                        link: bindLink,
                        markdown: bindMarkdown,
                        content: function(callback) { callback("(: file ~ " + path + " :)"); } };
        
        for(var i in extContext) { context[i] = extContext[i]; }
        
        return function(req, res) { handler(context, req, res); }; 
    };
})();

var bindLink = (function() {
    var template = { "selected": "<span>(:name:)</span>",
                     "not-selected": "<a href='(:url:)'>(:name:)</a>" };
    
    return function(callback, val, context) {
        val = JSON.parse(val);
        
        if(context.id === val.id) { bind.to(template["selected"], val, callback); }
        else { bind.to(template["not-selected"], val, callback); }
    };
})();

srv.error = DefaultBindHandler("./content/404.html");

srv.patterns.push(srv.staticDirHandler("/pics/", "./content/pics/", "png", "image/png"));
srv.patterns.push(srv.staticDirHandler("/pics/", "./content/pics/", "jpg", "image/jpeg"));
srv.patterns.push(srv.staticDirHandler("/pics/", "./content/pics/", "gif", "image/gif"));

srv.urls["/robots.txt"] = srv.staticFileHandler("./content/robots.txt", "text/plain");

srv.urls["/client.js"] = srv.staticFileHandler("./libraries/xavlib/channel/client.js", "application/x-javascript");

srv.urls["/"] = srv.urls["/index.html"] = DefaultBindHandler("./content/index.html", "home");
srv.urls["/about-me"] = DefaultBindHandler("./content/about-me.html", "about-me");
srv.urls["/resume"] = DefaultBindHandler("./content/resume.html", "resume");
srv.urls["/key-remapper"] = DefaultBindHandler("./content/key-remapper.html", "key-map");
srv.urls["/magnetic-poetry"] = DefaultBindHandler("./content/magnetic-poetry.html", "mag-poetry");
srv.urls["/tv-schedule-downloader"] = DefaultBindHandler("./content/tv-schedule-downloader.html", "tv-download");
srv.urls["/visual-sort"] = DefaultBindHandler("./content/visual-sort.html", "visual-sort");

srv.urls["/interview"] = srv.staticFileHandler("./content/interview.html", "text/html");
srv.urls["/js-idiom"] = srv.urls["/js-idioms"] = srv.staticFileHandler("./content/js-idioms.html", "text/html");

srv.urls["/articles"] = 
srv.urls["/articles/"] = 
srv.urls["/articles/index.html"] = DefaultBindHandler("./content/articles/index.html", "articles");
srv.urls["/articles/operation-is-not-supported-code-9"] =
    DefaultBindHandler("./content/articles/operation-is-not-supported-code-9.html");
srv.urls["/articles/cool-chrome-eye-candy"] = DefaultBindHandler("./content/articles/cool-chrome-eye-candy.html");
srv.urls["/articles/qunit-html-template"] = DefaultBindHandler("./content/articles/qunit-html-template.html");
srv.urls["/articles/fun-with-tostring-in-javascript"] =
    DefaultBindHandler("./content/articles/fun-with-tostring-in-javascript.html");
srv.urls["/articles/fun-with-valueof-in-javascript"] =
    DefaultBindHandler("./content/articles/fun-with-valueof-in-javascript.html");
srv.urls["/articles/jquery-ui-css-themes-hosted-on-cdn"] =
    DefaultBindHandler("./content/articles/jquery-ui-css-themes-hosted-on-cdn.html");
srv.urls["/articles/function-caller-chromes-leaky-abstraction"] =
    DefaultBindHandler("./content/articles/function-caller-chromes-leaky-abstraction.html");
srv.urls["/articles/trouble-with-touch-events-jquery"] = 
    DefaultBindHandler("./content/articles/trouble-with-touch-events-jquery.html");
srv.urls["/articles/get-around-cross-domain-restrictions"] = 
    DefaultBindHandler("./content/articles/get-around-cross-domain-restrictions.html");
srv.urls["/articles/running-rails-app-from-github"] = 
    DefaultBindHandler("./content/articles/running-rails-app-from-github.html");

srv.urls["/drag-shapes"] =
srv.urls["/drag-shapes/"] =
srv.urls["/drag-shapes/index.html"] = DefaultBindHandler("./content/drag-shapes/index.html", "drag-shapes");
srv.urls["/drag-shapes/get-the-goal"] = DefaultBindHandler("./content/drag-shapes/get-the-goal.html");
srv.urls["/drag-shapes/rotate-image"] = DefaultBindHandler("./content/drag-shapes/rotate-image.html");
srv.urls["/drag-shapes/slanted-box"] = DefaultBindHandler("./content/drag-shapes/slanted-box.html");
srv.urls["/drag-shapes/comet-drag"] =
    DefaultBindHandler("./content/drag-shapes/comet-drag.html", require("./apps/comet-drag").start(chn));

chn.start(srv);

srv.server.listen(8004);
console.log("Serving xavi.co on port 8004");