var path = require('path');

let filePathToImport = function (useRequire, scratchFile) {
  return function (filePath) {
    var importFilePath = path.join(path.dirname(filePath), path.basename(filePath, path.extname(filePath)));
    var relativePath = path.relative(path.dirname(scratchFile), importFilePath);

    // make sure slashes are escaped for windows
    relativePath = relativePath.replace(/\\/g, '\\\\');

    // make sure backslashes are replaced with forward slash for the UI and JSON output string.
    // Escaping the slashes would also work, but in case we accidentally interpret them later
    // let's just go with forward slash.
    filePath = filePath.replace(/\\/g, '/');

    return [
      useRequire ? 'require("' + relativePath + '");' : 'import "' + relativePath + '";', // rollup doesn't support require
      'if (__tests && __tests[__tests.length - 1] && !__tests[__tests.length - 1].filePath) {',
      '__tests[__tests.length - 1].filePath = "' + filePath + '";',
      '}'
    ].join('\n');
  };
};

let generateImports = function (useRequire, scratchFile, srcFiles) {
  var imports = srcFiles.map(filePathToImport(useRequire, scratchFile)).join('\n');

  return [
    'declare let require: any;',
    'declare let __tests: any;',
    imports,
    'export {};'
  ].join('\n');
};

module.exports = {
  generateImports: generateImports
};