var fs = require('fs'),
    YUI = require('yui3').YUI

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