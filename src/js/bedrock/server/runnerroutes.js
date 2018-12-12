var generate = function (mode, projectdir, basedir, configFile, bundler, testfiles, chunk, retries, singleTimeout, stopOnFailure, basePage, coverage) {
  var path = require('path');
  var routes = require('./routes');
  var compiler = require('../compiler/compiler');

  var files = testfiles.map(function (filePath) {
    return path.relative(projectdir, filePath);
  });

  var testGenerator = compiler(
    path.join(projectdir, configFile),
    path.join(projectdir, 'scratch'),
    mode === 'auto',
    files,
    coverage
  );

  const precompiledTests = (mode === 'auto' ? testGenerator.generate() : Promise.resolve(null));

  return precompiledTests.then(
    (precompTests) => {
      var routers = [
        routes.routing('GET', '/project', projectdir),
        routes.routing('GET', '/js', path.join(basedir, 'src/resources')),
        routes.routing('GET', '/lib/jquery', path.dirname(require.resolve('jquery'))),
        routes.routing('GET', '/lib/babel-polyfill', path.join(path.dirname(require.resolve('babel-polyfill')), '../dist')),
        routes.routing('GET', '/css', path.join(basedir, 'src/css')),
        routes.asyncJs('GET', '/compiled/tests.js', function (done) {
          if (precompTests !== null) {
            done(precompTests);
          } else {
            testGenerator.generate().then(done);
          }
        }),
        routes.routing('GET', '/compiled', path.join(projectdir, 'scratch/compiled')),
        routes.json('GET', '/harness', {
          stopOnFailure: stopOnFailure,
          chunk: chunk,
          retries: retries,
          timeout: singleTimeout
        })
      ];
    
      var fallback = routes.constant('GET', basedir, basePage);
    
      return {
        routers: routers,
        fallback: fallback
      };
    }
  );
};

module.exports = {
  generate: generate
};