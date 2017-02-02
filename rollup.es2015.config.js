import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: './index.js',
  format: 'es',
  moduleName: 'Modelico',
  plugins: [ nodeResolve({skip: ['ajv', 'immutable']}), json() ],
  external: ['ajv', 'immutable'],
  globals: {
    ajv: 'Ajv'
  },
  dest: './dist/modelico.es2015.js'
}
