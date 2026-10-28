// settings-inject: a PostCSS plugin that replaces a `/* @settings-inject */`
// marker comment with an Obsidian Style Settings block:
// `/* @settings` + the verbatim contents of a YAML file + `*/`.
//
// The YAML is injected as a raw comment node so its indentation survives
// intact (Style Settings parses the comment body as YAML). The YAML is not
// parsed or validated here.
//
// The plugin only sees the marker if it is in the AST when the plugin runs.
// If it runs before postcss-import, the marker must be in the entry file;
// if it runs after, the marker can live in any imported file.

import fs from 'fs';
import path from 'path';

const settingsInject = (opts = {}) => {
  const {
    // Path to the Style Settings YAML. Relative paths resolve against the
    // current working directory; pass an absolute path to avoid surprises.
    file = 'src/settings.yaml',
    // Comment text marking where the block is emitted:
    // `/* @settings-inject */`. Exactly one is required.
    marker = '@settings-inject'
  } = opts;

  return {
    postcssPlugin: 'settings-inject',
    Once(root, { postcss, result }) {
      const yamlPath = path.resolve(file);

      const markers = [];
      root.walkComments((c) => {
        if (c.text.trim() === marker) markers.push(c);
      });
      if (markers.length !== 1) {
        throw new Error(
          `settings-inject: expected exactly one \`/* ${marker} */\` ` +
          `marker in the CSS, found ${markers.length}`
        );
      }

      const yaml = fs.readFileSync(yamlPath, 'utf8').trim();
      const injected = postcss.comment({ text: '@settings\n' + yaml + '\n' });

      // PostCSS stores the whitespace before each node in raws.before.
      // A programmatically created node has none, and replaceWith() does
      // not copy the marker's raws, so without this the block is emitted
      // glued to the preceding comment. Give it a blank line before, and
      // push the following node onto its own line too.
      injected.raws.before = '\n\n';
      const [cookie] = markers;
      const next = cookie.next();
      cookie.replaceWith(injected);
      if (next) next.raws.before = '\n\n';

      // Let watchers (postcss-cli --watch) rebuild when the YAML changes.
      result.messages.push({
        type: 'dependency',
        plugin: 'settings-inject',
        file: yamlPath,
        parent: result.opts.from
      });
    }
  };
};
settingsInject.postcss = true;

export default settingsInject;
