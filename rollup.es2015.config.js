import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default {
  entry: './index.js',
  format: 'umd',
  moduleName: 'Modelico',
  plugins: [ json() ],
  dest: './dist/modelico.es2015.js'
};
