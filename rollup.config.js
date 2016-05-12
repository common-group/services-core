import babel from 'rollup-plugin-babel';

//This is the standalone rollup config file to bundle and build dist files.
//With rollup installed globally in your environment, you can simple run rollup -c.
export default {
  entry: 'src/c.js',
  dest: 'dist/catarse.js',
  sourceMap: true,
  format: 'iife',
  moduleName: 'c',
  plugins: [babel()],
  globals: {
      underscore: '_',
      moment: 'moment',
      mithril: 'm',
      chartjs: 'Chart',
      replaceDiacritics: 'replaceDiacritics',
      ['mithril-postgrest']: 'postgrest',
      ['i18n-js']: 'I18n'
  }
};
