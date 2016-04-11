import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default {
  entry: './test/modelicoSpec.js',
  format: 'umd',
  moduleName: 'modelicoSpec',
  plugins: [ json(), babel() ],
  dest: './dist/modelico-spec.js'
};
