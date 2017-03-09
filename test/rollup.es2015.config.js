import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: './test/modelicoSpec.js',
  format: 'es',
  moduleName: 'modelicoSpec',
  plugins: [ nodeResolve({skip: ['ajv']}), json() ],
  external: ['ajv'],
  globals: {
    ajv: 'Ajv'
  },
  dest: './dist/modelico-spec.es2015.js'
}
