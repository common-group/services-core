import babel from 'rollup-plugin-babel';
import includePaths from 'rollup-plugin-includepaths';

let includePathOptions = {
    include: {},
    paths: ['src', 'src/c', 'src/root', 'src/vms']
};

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
      'chartjs': 'Chart',
      'replaceDiacritics': 'replaceDiacritics',
      ['mithril-postgrest']: 'postgrest',
      ['i18n-js']: 'I18n'
  }
};
