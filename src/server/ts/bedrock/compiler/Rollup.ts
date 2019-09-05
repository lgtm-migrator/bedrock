/* eslint-disable */
import * as rollup from 'rollup';
import * as path from 'path';
import * as fs from 'fs';
import * as mkdirp from 'mkdirp';
import * as Imports from './Imports';
import {ExitCodes} from '../util/ExitCodes';
import * as FileUtils from '../util/FileUtils';

export const compile = function (tsConfigFile, scratchDir, exitOnCompileError, srcFiles, success) {
  const scratchFile = path.join(scratchDir, 'compiled/tests.ts');
  const dest = path.join(scratchDir, 'compiled/tests.js');

  const outputOptions: rollup.OutputOptions = {
    name: 'ephoxTests',
    file: dest,
    format: 'iife',
    sourcemap: true
  };

  const tsConfig = FileUtils.readFileAsJson(tsConfigFile);
  const include = tsConfig.include ? tsConfig.include : [];

  mkdirp.sync(path.dirname(scratchFile));
  fs.writeFileSync(scratchFile, Imports.generateImports(false, scratchFile, srcFiles));

  const typescript = require('rollup-plugin-typescript2');
  const resolve = require('rollup-plugin-node-resolve');
  const sourcemaps = require('rollup-plugin-sourcemaps');

  rollup.rollup({
    input: scratchFile,
    treeshake: false,
    plugins: [
      resolve({
        jsnext: true,
        customResolveOptions: {
          moduleDirectory: path.join(path.dirname(tsConfigFile), 'node_modules')
        }
      }),
      typescript({
        cacheRoot: path.join(scratchDir, 'rts2_cache'),
        tsconfig: tsConfigFile,
        verbosity: 2,
        check: false,
        // clean: true,
        tsconfigOverride: {
          compilerOptions: {
            declaration: false
          },
          include: include.concat([
            path.resolve(scratchFile)
          ])
        }
      }),
      sourcemaps()
    ]
  }).then(function (bundle) {
    bundle.generate(outputOptions);
    return bundle.write(outputOptions);
  }).then(function () {
    success(dest);
  }).catch(function (err) {
    console.log(err);

    if (exitOnCompileError) {
      process.exit(ExitCodes.failures.error);
    }

    success(dest);
  });
};
