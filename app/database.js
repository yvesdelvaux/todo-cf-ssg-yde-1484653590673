var async = require("async");

function Database(appEnv, serviceName, dbName, waterfallCallback) {
  var self = this;

  console.log("DBA - Initializing database...");

  var cloudant = require('nano')(appEnv.getServiceCreds(serviceName).url).db;
  var todoDb;
  var prepareDbTasks = [];

  // create the db
  prepareDbTasks.push(
    function (callback) {
      console.log("DBA - Creating database...");
      cloudant.create(dbName, function (err, body) {
        if (err && err.statusCode == 412) {
          console.log("DBA - Database already exists");
          callback(null);
        } else if (err) {
          callback(err);
        } else {
          callback(null);
        }
      });
    });

  // use it
  prepareDbTasks.push(
    function (callback) {
      console.log("DBA - Setting current database to", dbName);
      todoDb = cloudant.use(dbName);
      callback(null);
    });

  async.waterfall(prepareDbTasks, function (err, result) {
    if (err) {
      console.log("DBA - Error in database preparation", err);
    }

    waterfallCallback(err, todoDb);
  });

}

// callback(err, database)
module.exports = function (appEnv, serviceName, dbName, callback) {
  return new Database(appEnv, serviceName, dbName, callback);
}
