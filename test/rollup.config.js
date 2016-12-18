import babel from 'rollup-plugin-babel'

export default {
  entry: './test/modelicoSpec.js',
  format: 'umd',
  moduleName: 'modelicoSpec',
  plugins: [ babel() ],
  dest: './dist/modelico-spec.js'
}
