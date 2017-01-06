import json from 'rollup-plugin-json'
import babel from 'rollup-plugin-babel'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: './index.js',
  format: 'umd',
  moduleName: 'Modelico',
  noConflict: true,
  plugins: [ nodeResolve(), json(), babel() ],
  external: ['immutable'],
  globals: {
    immutable: 'Immutable'
  },
  dest: './dist/modelico.js'
}
