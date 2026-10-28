import path from 'path';
import { fileURLToPath } from 'url';
import atImport from 'postcss-import';
import 'postcss-nested-import';
import settingsInject from './postcss/settings-inject.mjs';
import inlineGoogleFonts from './postcss/inline-google-fonts.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: [
    // 1. Combine: inline every local @import into one tree.
    atImport(),
    // 2. Inject: these run on the combined tree (what becomes theme.css), so
    //    their marker comments can live in any source file.
    settingsInject({
      file: path.resolve(__dirname, 'src/settings.yaml')
    }),
    inlineGoogleFonts({
      cacheDir: path.resolve(__dirname, '.cache/fonts')
    })
  ]
}
