var create = function (params) {
  var saucelabs = require('saucelabs')({
    username: params.sauceUser,
    password: params.sauceKey
  });

  var reporter = require('./bedrock/core/reporter');

  var setJobPassed = function (session, name) {
    return function (result) {
      return new Promise(function (resolve, reject) {
        saucelabs.updateJob(session.id_, {
          name: name,
          result: true
        }, function () {
          resolve(result);
        });
      });
    };
  };

  var setJobFailed = function (session, name) {
    return function (err) {
      /* eslint no-unused-vars: "off"*/
      return new Promise(function (resolve, reject) {
        saucelabs.updateJob(session.id_, {
          name: name,
          result: false
        }, function () {
          resolve(err);
        });
      });
    };
  };

  var setName = function (session, name) {
    return new Promise(function (resolve, reject) {
      saucelabs.updateJob(session.id_, {
        name: name
      }, function () {
        resolve(name);
      });
    });
  };

  var runTest = function (suiteName, driver, f) {
    return driver.getSession().then(function (session) {
      var name = params.sauceJob;
      var setAsPassed = setJobPassed(session, name);
      var setAsFailed = setJobFailed(session, name);

      var logResults = reporter.write({
        name: suiteName,
        output: params.outputDir,
        sauce: {
          id: session.id_,
          job: params.sauceJob
        }
      });

      return setName(session, name).then(f).then(logResults).then(setAsPassed, setAsFailed);
    });
  };

  return {
    runTest: runTest
  };
};

module.exports = {
  create: create
};
