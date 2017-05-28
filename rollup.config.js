import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  entry: './index.js',
  format: 'umd',
  moduleName: 'Modelico',
  noConflict: true,
  plugins: [nodeResolve(), json(), babel()],
  external: ['ajv', 'immutable'],
  globals: {
    ajv: 'Ajv',
    immutable: 'Immutable'
  },
  dest: './dist/modelico.js'
}
