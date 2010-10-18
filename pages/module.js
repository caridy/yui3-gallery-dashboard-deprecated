var YUI = require('yui3').YUI,
    fs = require('fs'),
    exec = require('child_process').exec;

function _yetiReady (path, module, build, cb) {
    cb(false);
}

function _jslintReady (path, module, build, cb) {
    cb(false);
}

function _getSource (path, module, build, cb) {
    cb(false);
}

function _docReady (path, module, build, cb) {

    var repo    = (path.indexOf('/var/node')===0 ? '/var/node' : '/Users/caridy/Bubbling'),
        yuidoc  = repo+'/yuidoc',

        src         = repo+'/yui3-gallery/src/gallery-'+module+'/js',
        parser      = yuidoc+'/parser/gallery-'+module,
        template    = yuidoc+'/template',
        api         = path+'/static/api/'+module,

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

function _getModuleInfo (config, cb) {
    YUI({ debug: !!config.debug }).use('yql', 'node', function(page) {
        page.YQL("select * from yui.gallery.module where module='"+config.module+"'", function(r) {
            cb(page, r);
        }, {
            env: 'http:/'+'/yuilibrary.com/yql/yui.env' 
        });
    });
}

exports.render = function(req, res, config) {
    _getModuleInfo(config, function(page, r) {

        var title = 'Gallery Module - '+config.module,
            module = r.query.results.json;

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

    });
};

exports.api = function(req, res, config) {

    _getModuleInfo(config, function(page, r) {
        var module = r.query.results.json;
        var content = page.Lang.sub(res.partial(config.partial), module);

        _docReady (config.path, config.module, module.buildtag, function(r) {
            var iframe = '';
            if (r) {
                // api is available
                iframe = '<iframe src="/api/'+config.module+'/index.html" class="api-iframe"><iframe>';
            } else {
                // api is not available
                iframe = '<p class="red">API is not available for this module</p>';
            }
            res.send(content+iframe, {});
        });
    });

};

exports.yeti = function(req, res, config) {

    _getModuleInfo(config, function(page, r) {
        var module = r.query.results.json;
        var content = page.Lang.sub(res.partial(config.partial), module);

        _yetiReady (config.path, config.module, module.buildtag, function(r) {
            var iframe = '';
            if (r) {
                // api is available
                iframe = '<iframe src="/yeti/'+config.module+'/index.html" class="api-iframe"><iframe>';
            } else {
                // api is not available
                iframe = '<p class="red">YETI results are not available for this module</p>';
            }
            res.send(content+iframe, {});
        });
    });

};

exports.jslint = function(req, res, config) {

    _getModuleInfo(config, function(page, r) {
        var module = r.query.results.json;
        var content = page.Lang.sub(res.partial(config.partial), module);

        _jslintReady (config.path, config.module, module.buildtag, function(r) {
            var iframe = '';
            if (r) {
                // api is available
                iframe = '<iframe src="/jslint/'+config.module+'/index.html" class="api-iframe"><iframe>';
            } else {
                // api is not available
                iframe = '<p class="red">JSLint report is not available for this module</p>';
            }
            res.send(content+iframe, {});
        });
    });

};

exports.source = function(req, res, config) {

    _getModuleInfo(config, function(page, r) {
        var module = r.query.results.json;
        var content = page.Lang.sub(res.partial(config.partial), module);

        _getSource (config.path, config.module, module.buildtag, function(r) {
            var iframe = '';
            if (r) {
                // api is available
                iframe = '<iframe src="/jslint/'+config.module+'/index.html" class="api-iframe"><iframe>';
            } else {
                // api is not available
                iframe = '<p class="red">Source Code is not available for this module</p>';
            }
            res.send(content+iframe, {});
        });
    });

};