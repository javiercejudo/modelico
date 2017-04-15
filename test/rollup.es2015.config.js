import json from 'rollup-plugin-json'
import nodeResolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'

export default {
  entry: './test/modelicoSpec.js',
  format: 'es',
  moduleName: 'modelicoSpec',
  plugins: [
    nodeResolve(),
    json(),
    babel({
      babelrc: false,
      plugins: ['transform-flow-strip-types']
    })
  ],
  external: ['ajv'],
  globals: {
    ajv: 'Ajv'
  },
  dest: './dist/modelico-spec.es2015.js'
}
