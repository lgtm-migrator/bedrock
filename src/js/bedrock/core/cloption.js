var fs = require('fs');

/* Really basic command line parsing ... nothing is optional, there are no flags */
var param = function (name, info, validate, short) {
  var p = function (args, o) {
    var value = args[0];
    validate(name, value);
    args.shift();
    o[name] = value;
  };

  return {
    p: p,
    name: name,
    info: info,
    short: short
  };
};

var parse = function (args, params, program) {
  var init = { };

  try {
    if (args.length - params.length < 0) throw new Error('Incorrect number of arguments: ' + args.length + '. Required ' + params.length + '+');
    params.map(function (p) {
      p.p(args, init);
    });
  } catch (err) {
    console.error(err);
    usage(program, params);
  }
  return init;
};

var validateFile = function (name, value) {
  try {
    if (!fs.existsSync(value)  && fs.statSync(value).isFile()) throw new Error('Property: ' + name + ' => Value: ' + value + ' was not a file');
  } catch (err) {
    throw new Error('Property: ' + name + ' => Value: ' + value + ' was not a file or ' + err);
  }
};

var isAny = function (name, value) {
  return true;
};

var files = function (name, info, short) {
  var p = function (args, o) {
    var set = args.slice(0);
    set.forEach(function (s) {
      validateFile(name + '.', s);
    });
    o[name] = set;
  };
  return {
    p: p,
    name: name,
    info: info,
    short: short
  };
};

var usage = function (program, params) {
  var s = 'usage: ' + program + ' ' + params.map(function (p) { return p.short; }).join(' ') + '\n' +
         '\n' +
         'arguments:\n\n' +
         params.map(function (p) {
          return '  ' + p.short + ': ' + p.info;
         }).join('\n\n') +
         '\n';
  console.error('\n');
  console.error(s);
  process.exit(-1);
};

module.exports = {
  parse: parse,
  param: param,
  files: files,
  validateFile: validateFile,
  isAny: isAny
};