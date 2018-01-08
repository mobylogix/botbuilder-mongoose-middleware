"use strict";
var replaceDot_Atrate = require("./replaceDot");

var IStorageClient = (function () {
  function IStorageClient(options) {
    this.options = options;
  }

  IStorageClient.prototype.initialize = function (callback) {
    if (!this.options.db) {
      callback("Mongoose client object is not provided!");
    } else {
      this.db  = this.options.db;
    }

    this.collectionName = this.options.collectionName || "userData";

    callback(null);
  };

  IStorageClient.prototype.retrieve = function (partitionKey, rowKey, callback) {
    const {collectionName} = this;
    var id = partitionKey + ',' + rowKey;
    if(rowKey !== "userData"){
      this.db.then(db => {
        console.log(db);
        var query = {"$and": [{"userid": id}]};
        var iterator = db.connections[0].collection(collectionName).find(query);
        iterator.toArray(function (error, result, responseHeaders) {
          if (error) {
            console.log("Error", error)
            callback(error, null, null);
          } else if (result.length > 0) {
            var data = result[0];
            var finaldoc = replaceDot_Atrate.substituteKeyDeep(data, /\@/g, '.');
            finaldoc["id"] = id;
            callback(null, finaldoc, null);
          } else {
            callback(null, null, null);
          }
        });
      });
    } else {
      this.db.then(db => {
        var query = {"$and": [{"userid": partitionKey}]};
        var iterator= db.connections[0].collection(collectionName).find(query);
        iterator.toArray(function (error, result, responseHeaders) {
          if (error) {
            callback(error, null, null);
          } else if (result.length > 0) {
            callback(null, result[0], null);
          } else {
            callback(null, null, null);
          }
        });
      });
    }
  };

  IStorageClient.prototype.insertOrReplace = function (partitionKey, rowKey, entity, isCompressed, callback) {
    var id = partitionKey + ',' + rowKey;
    const {collectionName} = this;
    if(rowKey !== "userData"){
      this.db.then(db => {
        var newEntity = replaceDot_Atrate.substituteKeyDeep(entity, /\./g, '@');
        var condition = {'userid': id};
        var updateobj = {"$set": {"data": newEntity, "isCompressed": false}};
        db.connections[0].collection(collectionName).update(condition, updateobj, {upsert: true}, function (err, res) {
          callback(err, res, "");
        });
      });
    } else{
      this.db.then(db => {
        var conditions = {'userid': partitionKey};
        var update = {"$set": {"data": entity}};
        db.connections[0].collection(collectionName).update(conditions, update, {upsert: true}, function(err,res) {
          callback(err, res,"");
        });
      });
    }
  };

  IStorageClient.getError = function (error) {
    if (!error)
      return null;
    return new Error('Error Code: ' + error.code + ' Error Body: ' + error.body);
  };

  return IStorageClient;
}());

exports.IStorageClient = IStorageClient;
