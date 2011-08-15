var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;

Provider = function(host, port) {
  this.db= new Db('fms-mongo', new Server(host, port, {auto_reconnect: true}, {}));
  this.db.open(function(){});
};


Provider.prototype.getCollection= function(callback) {
  this.db.collection('providers', function(error, provider_collection) {
    if( error ) callback(error);
    else callback(null, provider_collection);
  });
};

Provider.prototype.findAll = function(callback) {
    this.getCollection(function(error, provider_collection) {
      if( error ) callback(error)
      else {
        provider_collection.find().toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


Provider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, provider_collection) {
      if( error ) callback(error)
      else {
        provider_collection.findOne({_id: provider_collection.db.bson_serializer.ObjectID.createFromHexString(id)}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};


Provider.prototype.findByPAO = function(pao, callback) {
    this.getCollection(function(error, provider_collection) {
      if( error ) callback(error)
      else {
        provider_collection.findOne({pao: pao, auth_status: "A"}, function(error, result) {
          if( error ) callback(error)
          else {
             if( typeof(result)=="undefined")
             {   result = [1];
                 result.concID = "You are not Authorised for this device";
                 callback(null, result) 
             }
             else
             {  
                 callback(null, result)
             } 
           }
        });
      }
    });
};

Provider.prototype.save = function(providers, callback) {
    this.getCollection(function(error, provider_collection) {
      if( error ) callback(error)
      else {
        if( typeof(providers.length)=="undefined")
          providers = [providers];

        for( var i =0;i< providers.length;i++ ) {
          provider = providers[i];
          provider.created_at = new Date();
          if( provider.comments === undefined ) provider.comments = [];
          for(var j =0;j< provider.comments.length; j++) {
            provider.comments[j].created_at = new Date();
          }
        }

        provider_collection.insert(providers, function() {
          callback(null, providers);
        });
      }
    });
};

exports.Provider = Provider;

