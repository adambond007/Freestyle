/**
 * Module dependencies.
 */

var express = require('express');
var Provider = require('./fms-mongodb').Provider;


var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(require('stylus').middleware({ src: __dirname + '/public' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

var provider = new Provider('localhost', 27017);
// Routes

app.get('/', function(req, res){
    provider.findAll( function(error,docs){
        res.render('index.jade', { 
            locals: {
                title: 'FMS',
                providers:docs
            }
        });
    })
});

app.get('/fms/new', function(req,res){
    res.render('fms_new.jade',{locals: {
        title: 'New Provider'
    }
    });
});

app.post('/fms/new', function(req, res){
    provider.save({
        pao: req.param('pao'),
        concID: req.param('concID'),
        devID: req.param('devID'),
        subs_status: req.param('subs_status'),
        auth_status: req.param('auth_status'),
        route: req.param('route'),
        dev_man: req.param('dev_man'),
        for_key: req.param('for_key')
    }, function( error, docs) {
        res.redirect('/')
    });
});


app.get('/fms/:pao', function(req, res) {
    provider.findByPAO(req.params.pao, function(error, provider) {
        res.render('result.jade',
        { locals: {
            title: "Search on PAO",
            provider:provider
        }
        });
    });
});


app.get('/fms/id', function(req, res) {
    provider.findById(req.params.id, function(error, provider) {
        res.render('index.jade',
        { locals: {
            title: provider.title,
            providers:provider
        }
        });
    });
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);


