var YUI = require('yui3').YUI,
    fs = require('fs'),
    exec = require('child_process').exec;

/*
exports.ls = function(path, cb) {

    exec("ls", function puts(error, stdout, stderr) { 
        if (error !== null) {
            console.log('exec error: ' + error);
            // parse the stdout string
            cb.call(stdout.split (' '));
        } else {
            cb.call([]);
        }
    });

};
*/

function _docReady (path, module, build, cb) {

    var repo    = (path.indexOf('/var/node')===0 ? '/var/node' : '/Users/caridy/Bubbling'),
        yuidoc  = repo+'/yuidoc',

        src         = repo+'/yui3-gallery/src/gallery-'+module+'/js',
        parser      = yuidoc+'/parser/gallery-'+module,
        template    = yuidoc+'/template',
        api         = path+'/static/doc/'+module,

        // final command
        generate = 'mkdir -p '+api+'; '+yuidoc+'/bin/yuidoc.py "'+src+'" -p "'+parser+'" -o "'+api+'" -t "'+template+'" -v "'+build+'" -Y 3';

    // sudo /var/node/yuidoc/bin/yuidoc.py "/var/node/yui3-gallery/src/gallery-dispatcher/js" -p "/var/node/yui3-gallery/parser/gallery-dispatcher" -o "/var/node/yui3-gallery/api/gallery-dispatcher" -t "/var/node/yuidoc/template" -v "gallery-2010.09.15-18-40" -Y 3

    // checking if the module api folder exists
    fs.stat(api, function (err, stat) {
        if (!err && stat.isDirectory()) {
            // doc is ready to be used
            console.log ('The API for module '+module+' was already generated.');
            cb(true);
        } else {
            console.log ('Generating API for module '+module+': '+ generate);
            exec(generate, function (error, stdout, stderr) { 
                if (error !== null) {
                    console.log('Error trying to generate API for module ' + module + ': ' + error);
                    // parse the stdout string
                    cb(false);
                } else {
                    cb(true);
                }
            });
        }
    });

};

exports.render = function(req, res, config) {
    var sql = "select * from yui.gallery.module where module='"+config.module+"'";

    YUI({ debug: !!config.debug }).use('yql', 'node', function(page) {
        var title = 'Gallery Module - '+config.module;
        page.YQL(sql, function(r) {

            var module = r.query.results.json;
            page.one('body').addClass('yui3-skin-sam')
            
            res.render(config.page, {
                locals: {
                    instance: page,
                    content: '#content',
                    sub: module,
                    after: function(Y) {
                        Y.one('title').set('innerHTML', title);
                        Y.all('#nav li').removeClass('selected');
                        Y.one('#nav li.modules').addClass('selected');
                    }
                }
            });
        }, { env: 'http:/'+'/yuilibrary.com/yql/yui.env' });

    });
};

exports.partial = function(req, res, config) {
    var sql = "select * from yui.gallery.module where module='"+config.module+"'";

    YUI({ debug: !!config.debug }).use('yql', 'node', function(page) {
        var title = 'Gallery Module - '+config.module;
        page.YQL(sql, function(r) {

            var module = r.query.results.json;
            var content = page.Lang.sub(res.partial(config.partial), module);
            res.send(content, {});

        }, { env: 'http:/'+'/yuilibrary.com/yql/yui.env' });

    });
};

exports.api = function(req, res, config) {
    var sql = "select * from yui.gallery.module where module='"+config.module+"'";

    YUI({ debug: !!config.debug }).use('yql', 'node', function(page) {
        var title = 'Gallery Module - '+config.module;
        page.YQL(sql, function(r) {

            var module = r.query.results.json;
            var content = page.Lang.sub(res.partial(config.partial), module);
            
            _docReady (config.path, config.module, module.buildtag, function(r) {
                var iframe = '';
                if (r) {
                    // api is available
                    iframe = '<iframe src="/doc/'+config.module+'/index.html" class="api"><iframe>';
                } else {
                    // api is not available
                    iframe = '<p class="red">API is not available for this module</p>';
                }
                res.send(content+iframe, {});
            });

        }, { env: 'http:/'+'/yuilibrary.com/yql/yui.env' });

    });
};