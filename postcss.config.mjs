import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import atImport from 'postcss-import';
import 'postcss-nested-import';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Replaces a `/* @settings-inject */` marker comment with a Style Settings
// block: `/* @settings` + the verbatim contents of src/settings.yaml + `*/`.
// The YAML is injected as a raw comment node so its indentation survives
// intact (Style Settings parses the comment body as YAML).
const settingsInject = () => ({
  postcssPlugin: 'settings-inject',
  Once(root, { postcss }) {
    const yamlPath = path.resolve(__dirname, 'src/settings.yaml');
    const yaml = fs.readFileSync(yamlPath, 'utf8').trim();

    let found = false;
    root.walkComments((comment) => {
      if (comment.text.trim() === '@settings-inject') {
        const injected = postcss.comment({ text: '@settings\n' + yaml + '\n' });
        // PostCSS stores the whitespace before each node in raws.before.
        // A programmatically created node has none, and replaceWith() does
        // not copy the marker's raws, so without this the block is emitted
        // glued to the preceding comment. Give it a blank line before, and
        // push the following node onto its own line too.
        injected.raws.before = '\n\n';
        const next = comment.next();
        comment.replaceWith(injected);
        if (next) next.raws.before = '\n\n';
        found = true;
      }
    });

    if (!found) {
      throw new Error(
        'settings-inject: no `/* @settings-inject */` marker found in the CSS'
      );
    }
  }
});
settingsInject.postcss = true;

/** @type {import('postcss-load-config').Config} */
export default {
  plugins: [
    atImport(),
    settingsInject(),
  ]
}
