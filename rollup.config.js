import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';

export default {
  entry: './index.js',
  format: 'umd',
  moduleName: 'Modelico',
  plugins: [ json(), babel() ],
  dest: './dist/modelico.js'
};
