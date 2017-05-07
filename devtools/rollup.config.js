import babel from 'rollup-plugin-babel'

export default {
  entry: './devtools/customFormatter.js',
  format: 'umd',
  moduleName: 'modelicoCustomFormatter',
  plugins: [babel()],
  dest: './dist/chrome-custom-formatter.js'
}
