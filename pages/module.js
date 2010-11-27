var YUI = require('yui3').YUI,
    fs = require('fs'),
    exec = require('child_process').exec;

function _yetiReady (path, module, build, cb) {
    cb(false);
}

function _jslintReady (path, module, build, cb) {

    var repo    = (path.indexOf('/var/node')===0 ? '/var/node' : '/Users/caridy/Bubbling'),
        file    = repo+'/yui3-gallery/build/gallery-'+module+'/gallery-'+module+'.js',
        report  = path+'/static/jslint/'+module+'-'+build+'.txt',

        // final command
        jslint = 'jslint '+file+' | cat > '+report;

    // checking if the module api folder exists
    fs.stat(report, function (err, stat) {
        if (!err && stat.isDirectory()) {
            // doc is ready to be used
            console.log ('The JSLint report for module '+module+' was already generated.');
            cb(true);
        } else {
            console.log ('Generating JSLint report for module '+module+': '+ jslint);
            exec(jslint, function (err, stdout, stderr) { 
                if (err !== null) {
                    console.log('Error trying to generate JSLint report for module ' + module + ': ' + err);
                    // parse the stdout string
                    cb(false);
                } else {
                    cb(true);
                }
            });
        }
    });
}

function _getSource (path, module, build, cb) {
    var repo    = (path.indexOf('/var/node')===0 ? '/var/node' : '/Users/caridy/Bubbling'),
        file    = repo+'/yui3-gallery/build/gallery-'+module+'/gallery-'+module+'.js',
        html    = path+'/static/source/'+module+'-'+build+'.html';

    // checking if the module api folder exists
    fs.stat(html, function (err, stat) {
        if (!err && stat.isDirectory()) {
            // doc is ready to be used
            console.log ('The source code for module '+module+' was already highlighted.');
            cb(true);
        } else {            
            fs.stat(file, function (err, stat) {
                if (err !== null) {
                    console.log('Error trying to locate the source code for module ' + module + ': ' + file + ' - Error: ' + err);
                    // parse the stdout string
                    cb(false);
                } else {
                    fs.readFile(file, function (err, content) {
                        var highlighter = require("highlight").Highlight,
                            result = content;
                        if (err !== null) {
                            // parse the stdout string
                            cb(false);
                        } else {
                            // highlighting the content of the source
                            try {
                                result = highlighter(content+' ');
                            } catch (e) {
                                console.log('Error trying to hightlight the source code for module ' + module + ': ' + e);
                                result = content;
                            }
                            result = '<!DOCTYPE html><html><head><title>hightlighted source code for module ' + module + '</title><link rel="stylesheet" href="/assets/github.css" type="text/css"></head><body><pre>'+result+'</pre></body></html>';
                            // writting highlighted content to a file to avoid overhead (one time generation)
                            fs.writeFile(html, result, function (err1) {
                                if (err1) {
                                    console.log('Error trying to write the hightlighted source code for module ' + module + ': ' + err);
                                    cb(false);
                                } else {
                                    cb(true);
                                }
                            });
                        }
                    })
                }
            })
        }
    });
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
            exec(generate, function (err, stdout, stderr) { 
                if (err !== null) {
                    console.log('Error trying to generate API for module ' + module + ': ' + err);
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
                iframe = '<iframe src="/jslint/'+config.module+'-'+module.buildtag+'.txt" class="api-iframe"><iframe>';
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
                iframe = '<iframe src="/source/'+config.module+'-'+module.buildtag+'.html" class="api-iframe"><iframe>';
            } else {
                // api is not available
                iframe = '<p class="red">Source Code is not available for this module</p>';
            }
            res.send(content+iframe, {});
        });
    });

};