import json from 'rollup-plugin-json';

export default {
  entry: './index.js',
  format: 'umd',
  moduleName: 'Modelico',
  plugins: [ json() ],
  dest: './dist/modelico.es2015.js'
};
