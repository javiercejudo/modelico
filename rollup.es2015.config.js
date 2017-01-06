import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: './index.js',
  format: 'es',
  moduleName: 'Modelico',
  plugins: [ nodeResolve({skip: 'immutable'}), json() ],
  external: ['immutable'],
  dest: './dist/modelico.es2015.js'
}
