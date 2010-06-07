var sys = require("sys");
var url = require("url");
var fs = require("fs");
var bind = require("./libraries/bind-js");
var markdown = require("./libraries/markdown-js/lib/markdown");
var srv = require("./libraries/xavlib/simple-router");
var chn = require("./libraries/xavlib/channel");

var DefaultBindHandler = (function() {
    function Handler(context, req, res) {
        bind.toFile("./content/templates/default.html", context, function(data) {
            res.writeHead(200, { "Conent-Length": data.length,
                                 "Content-Type": "text/html" });
            res.end(data, "utf8");
        });
    }

    return function(path, id, extContext) {
        if(Object.prototype.toString.call(id) !== "[object String]") { extContext = id; id = ""; }
        
        var context = { id: id,
                        link: bindLink,
                        content: function(callback) { callback("(: file ~ " + path + " :)"); } };
        
        for(var i in extContext) { context[i] = extContext[i]; }
        
        return function(req, res) { Handler(context, req, res); }; 
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

(function() { // Servers pics directory
    function addPicType(extension, mimeType) {
        var regPic = new RegExp("/pics/([/a-zA-Z0-9_-]+)\." + extension);
        srv.patterns.push({
            test: function(req) { return regPic.test(url.parse(req.url).pathname); },
            handler: function(req, res) {
                var uri = url.parse(req.url);
                var picName = regPic.exec(uri.pathname)[1];
            
                fs.readFile("./content/pics/" + picName + "." + extension, "binary", function(err, data) {
                    if(err) { throw err; }
                
                    res.writeHead(200, { "Content-Length": data.length,
                                         "Content-Type": mimeType });
                    res.end(data, "binary");
                });
            }
        });
    }
    
    addPicType("png", "image/png");
    addPicType("jpg", "image/jpeg");
    addPicType("gif", "image/gif");
})();

srv.error = DefaultBindHandler("./content/404.html");

srv.urls["/robots.txt"] = DefaultBindHandler("./content/robots.txt");

srv.urls["/client.js"] = srv.staticFileHandler("./libraries/xavlib/channel/client.js", "application/x-javascript");

srv.urls["/"] = srv.urls["/index.html"] = DefaultBindHandler("./content/index.html", "home");
srv.urls["/about-me"] = DefaultBindHandler("./content/about-me.html", "about-me");
srv.urls["/key-remapper"] = DefaultBindHandler("./content/key-remapper.html", "key-map");
srv.urls["/magnetic-poetry"] = DefaultBindHandler("./content/magnetic-poetry.html", "mag-poetry");
srv.urls["/tv-schedule-downloader"] = DefaultBindHandler("./content/tv-schedule-downloader.html", "tv-download");
srv.urls["/visual-sort"] = DefaultBindHandler("./content/visual-sort.html", "visual-sort");

srv.urls["/articles"] = 
srv.urls["/articles/"] = 
srv.urls["/articles/index.html"] = DefaultBindHandler("./content/articles/index.html", "articles");
srv.urls["/articles/operation-is-not-supported-code-9"] =
    DefaultBindHandler("./content/articles/operation-is-not-supported-code-9.html");

srv.urls["/drag-shapes"] =
srv.urls["/drag-shapes/"] =
srv.urls["/drag-shapes/index.html"] = DefaultBindHandler("./content/drag-shapes/index.html", "drag-shapes");
srv.urls["/drag-shapes/get-the-goal"] = DefaultBindHandler("./content/drag-shapes/get-the-goal.html");
srv.urls["/drag-shapes/rotate-image"] = DefaultBindHandler("./content/drag-shapes/rotate-image.html");
srv.urls["/drag-shapes/slanted-box"] = DefaultBindHandler("./content/drag-shapes/slanted-box.html");
srv.urls["/drag-shapes/comet-drag"] =
    DefaultBindHandler("./content/drag-shapes/comet-drag.html", require("./apps/comet-drag").start(chn));

chn.start(srv);

srv.server.listen(8000);