var fs = require('fs'),
    YUI = require('yui3').YUI

exports.render = function(req, res, config) {
    var sql = "select modules.url, modules.module, modules.title, modules.summary, modules.buildtag from yui.gallery."+config.bucket;

    YUI({ debug: !!config.debug }).use('yql', 'node', function(page) {
        var title = 'Gallery Modules - Bucket: '+config.bucket;
        page.YQL(sql, function(r) {

            var parts = res.partial('module_list.html');
            var ul = page.Node.create('<ul class="modules"></ul>');
            page.one('body').append(ul);
            page.each(r.query.results.json.modules, function(d) {
                ul.append(page.Lang.sub(parts, d));
            });

            res.render('modules.html', {
                locals: {
                    instance: page,
                    content: '#content',
                    sub: {
                        title: title
                    },
                    after: function(Y) {
                        Y.one('title').set('innerHTML', title);
                        Y.one('#content h1').set('innerHTML', title);
                        Y.all('#nav li').removeClass('selected');
                        Y.one('#nav li.modules').addClass('selected');
                    }
                }
            });
        }, { env: 'http:/'+'/yuilibrary.com/yql/yui.env' });

    });
};