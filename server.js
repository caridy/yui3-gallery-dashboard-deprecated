#!/usr/bin/env node

//Needed for monit/upstart
//Change directory into the script directory so includes resolve
process.chdir(__dirname);

var express = require('express'),
    YUI = require('yui3').YUI,
    PATH = __dirname,
    DEBUG = true;

console.log ('caridy: '+PATH);   
//Create the express application and allow the use of Spark (http://github.com/senchalabs/spark)
var app = module.exports = express.createServer();
/**
* Create the external instance that will host our "express" server.
* For a performance gain, you can "use" common modules here, so they 
* are available when a new instance is created per request.
*/
YUI({ debug: false }).use('express', 'node', function(Y) {
    
    //Configure it with some simple configuration options.
    app.configure(function(){
        app.use(express.methodOverride());
        app.use(express.bodyDecoder());
        app.use(express.cookieDecoder());        
        app.use(app.router);
        app.use(express.conditionalGet());
        app.use(express.cache());
        app.use(express.gzip());        
        app.use(express.staticProvider(PATH + '/static'));
    });
    
    //Set the development environment to debug, so YUI modues echo log statements
    app.configure('development', function(){
        DEBUG = true;
    });
    //Set the production environment to halt all debug logs.
    app.configure('production', function(){
        DEBUG = false;
    });
        
    /**
    * This version of the YUIExpress engine comes with a simple YUI combo handler
    * So you can put "use" inside your locals var on render:
    *
    * res.render('index.html', {
    *       locals: {
    *           use: ['dd', 'tabview']
    *       }
    * });
    *
    * This will load a URL into the page like this:
    * <script src="/combo?dd&tabview"></script>
    *
    * Note, currently it has to be "/combo", the internal renderer doesn't
    * know what you set this to. Eventually we can add it to YUI.configure.
    */
    app.get('/combo', YUI.combo);
    
    /**
    * This is the "black magic" part. This tells Express to use YUI to render
    * all HTML pages
    */
    app.register('.html', YUI);

    
    /**
    * These partials will be added to every page served by YUI, good for templating.
    * They can be added to by locals.partials on a per page basis. A partial looks like this:
    * {
    *   name: 'header', //Name of the /views/partial/{name}.html file to load
    *   method: 'append', //append,prepend,appendChild
    *   node: '#conent', //Any valid selector
    *   enum: 'one', //one,all
    *   fn: function //The callback function to run after the action.
    * }
    * Defaults to enum: "one" and method: "append"
    */

    YUI.partials = [
        {
            name: 'layout_head',
            node: 'head'
        }
    ];

    /**
    * YUI.configure allows you to configure routes for the yui2 & yui3 assests.
    * With this config you will serve yui2 assets from /yui2/ and yui3 assets from
    * /yui3
    * 
    */
    YUI.configure(app, {
        yui2: '/yui2/',
        yui3: '/yui3/'
    });

    /**
    * The route controller for the default page: /
    * This is a simple example of serving a static HTML page with a little
    * Javascript to enhance the page.
    */
    app.get('/', function(req, res) {
        //Render from ./views/index.html
        res.render('index.html', {
            //Locals used by the YUI renderer
            locals: {
                /**
                * This is the content placeholder in your ./views/layout.html file.
                * The content of index.html will be inserted here.
                */
                content: '#content',
                /**
                * Standard object hash to be passed to Y.Lang.sub after the
                * content has been loaded, but before it's inserted into the YUI
                * instance on render.
                */
                sub: {
                    title: 'YUI3 Gallery: Dashboard'
                },
                /**
                * The after method will be invoked after the layout.html file
                * has been loaded into the instance. This allows you to change
                * the total layout, after all the peices have been assembled.
                */
                after: function(Y, options, partial) {
                    Y.one('title').set('innerHTML', 'YUI3 Gallery: Dashboard');
                }
            }
        });
    });

    app.get('/apidoc/:id?', function(req, res) {
        require('./pages/module.js').api(req, res, {
            debug: DEBUG,
            module: req.params.id,
            path: PATH,
            partial: 'module_api.html'
        });
    });

    app.get('/yeti/:id?', function(req, res) {
        require('./pages/module.js').partial(req, res, {
            debug: DEBUG,
            module: req.params.id,
            path: PATH,
            partial: 'module_yeti.html'
        });
    });

    app.get('/jslint/:id?', function(req, res) {
        require('./pages/module.js').partial(req, res, {
            debug: DEBUG,
            module: req.params.id,
            path: PATH,
            partial: 'module_jslint.html'
        });
    });

    app.get('/module/:id?', function(req, res) {
        require('./pages/module.js').render(req, res, {
            debug: DEBUG,
            module: req.params.id,
            page: 'module.html'
        });
    });

    app.get('/modules', function(req, res) {
        require('./pages/modules.js').render(req, res, {
            debug: DEBUG,
            bucket: 'oncdn'
        });
    });

    app.listen(8001);
    if (DEBUG) {
        console.log('Server running at: http://localhost:8001/');
    }

});