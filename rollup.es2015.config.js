import json from 'rollup-plugin-json';
import nodeResolve from 'rollup-plugin-node-resolve';
import flow from 'rollup-plugin-flow';

export default {
  entry: './index.js',
  format: 'es',
  moduleName: 'Modelico',
  plugins: [ flow(), nodeResolve(), json() ],
  dest: './dist/modelico.es2015.js'
};
