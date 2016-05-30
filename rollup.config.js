import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';

export default {
  entry: './index.js',
  format: 'umd',
  moduleName: 'Modelico',
  plugins: [ nodeResolve(), json(), babel() ],
  dest: './dist/modelico.js'
};
