var go = function (settings) {
  var serve = require('./bedrock/server/serve');
  var attempt = require('./bedrock/core/attempt');
  var version = require('./bedrock/core/version');
  var boltroutes = require('./bedrock/server/boltroutes');

  var runner = boltroutes.generate(settings.projectdir, settings.basedir, settings.config, settings.bundler, settings.testfiles, settings.stopOnFailure, 'src/resources/bedrock.html');

  var serveSettings = {
    projectdir: settings.projectdir,
    basedir: settings.basedir,
    testfiles: settings.testfiles,
    // There is no driver for manual mode.
    driver: attempt.failed('There is no webdriver for manual mode'),
    master: null, // there is no need for master,
    runner: runner,
    loglevel: settings.loglevel,
    customRoutes: settings.customRoutes
  };

  serve.start(serveSettings, function (service/* , done */) {
    console.log('bedrock-manual ' + version + ' available at: http://localhost:' + service.port);
  });
};

module.exports = {
  go: go,
  mode: 'forManual'
};

