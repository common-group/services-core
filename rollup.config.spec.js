import babel from 'rollup-plugin-babel';
import multiEntry from 'rollup-plugin-multi-entry';

export default {
  entry: 'spec/**/*.spec.js',
  dest: 'spec/bundle.spec.js',
  sourceMap: true,
  format: 'iife',
  moduleName: 'tests',
  plugins: [babel(), multiEntry()],
  globals: {
      underscore: '_',
      moment: 'moment',
      mithril: 'm',
      'chartjs': 'Chart',
      'replaceDiacritics': 'replaceDiacritics',
      ['mithril-postgrest']: 'postgrest',
      ['i18n-js']: 'I18n'
  }
};
