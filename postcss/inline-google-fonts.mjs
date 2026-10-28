// inline-google-fonts: a PostCSS plugin that replaces Google Fonts @imports
// with self-contained @font-face rules whose src is a base64 data: URI.
//
// For every `@import url('https://fonts.googleapis.com/...')` it:
//   1. fetches the stylesheet (with a modern browser User-Agent, so Google
//      answers with woff2 sources),
//   2. downloads each referenced woff2 into `cacheDir` (skipped if present),
//   3. base64-encodes the file into the @font-face src,
//   4. removes the @import and emits the resulting @font-face rules at the
//      `/* @fonts-inject */` marker comment.
//
// Both the stylesheets and the woff2 files are cached, so repeat builds are
// offline and deterministic. Delete the cache dir to pick up font updates.
// Only the build output (theme.css) changes; source files are never touched.

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

// Google Fonts picks the font format from the User-Agent. Without a modern
// browser UA it serves ttf instead of woff2.
const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

const GOOGLE_CSS = /^https:\/\/fonts\.googleapis\.com\//;

const exists = (p) => fs.access(p).then(() => true, () => false);

const inlineGoogleFonts = (opts = {}) => {
  const {
    cacheDir = '.cache/fonts',
    // Google emits one @font-face per unicode subset, labeled by a preceding
    // comment (/* latin */, /* cyrillic */, ...). Keep only these. Set to
    // null to keep every subset.
    subsets = ['latin', 'latin-ext'],
    // Comment text marking where the @font-face rules are emitted:
    // `/* @fonts-inject */`. Exactly one is required.
    marker = '@fonts-inject',
    userAgent = DEFAULT_UA
  } = opts;

  const fetchText = async (url) => {
    const res = await fetch(url, { headers: { 'User-Agent': userAgent } });
    if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
    return res.text();
  };

  // Fetch a Google Fonts stylesheet, cached by a hash of its URL.
  const getCss = async (url) => {
    const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 12);
    const file = path.join(cacheDir, `${hash}.css`);
    if (await exists(file)) return fs.readFile(file, 'utf8');
    const css = await fetchText(url);
    await fs.writeFile(file, css, 'utf8');
    return css;
  };

  // Download a font file (once) and return it as a data: URI.
  const getDataUri = async (url) => {
    const file = path.join(cacheDir, path.basename(new URL(url).pathname));
    if (!(await exists(file))) {
      const res = await fetch(url, { headers: { 'User-Agent': userAgent } });
      if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
      await fs.writeFile(file, Buffer.from(await res.arrayBuffer()));
    }
    const data = await fs.readFile(file);
    return `data:font/woff2;base64,${data.toString('base64')}`;
  };

  return {
    postcssPlugin: 'inline-google-fonts',
    async Once(root, { postcss, result }) {
      const imports = [];
      root.walkAtRules('import', (rule) => {
        const m = rule.params.match(/^url\(\s*['"]?([^'")]+)['"]?\s*\)/);
        if (m && GOOGLE_CSS.test(m[1])) imports.push({ rule, url: m[1] });
      });

      // postcss-import cannot inline remote @imports, so it hoists them to
      // the top of the output (CSS requires @import first). Emitting the
      // faces there would put them above the preamble and the @settings
      // block, so they go at a marker comment instead.
      const markers = [];
      root.walkComments((c) => {
        if (c.text.trim() === marker) markers.push(c);
      });

      if (imports.length === 0) {
        markers.forEach((c) => c.remove());
        return;
      }
      if (markers.length !== 1) {
        throw new Error(
          `inline-google-fonts: expected exactly one \`/* ${marker} */\` ` +
          `marker in the CSS, found ${markers.length}`
        );
      }

      await fs.mkdir(cacheDir, { recursive: true });

      // The same family can be requested by more than one @import; emit
      // each (family, style, weight, unicode-range) face only once.
      const seen = new Set();
      const faces = [];
      let emitted = 0;

      for (const { rule, url } of imports) {
        const sheet = postcss.parse(await getCss(url), { from: url });
        let subset = null;

        for (const node of sheet.nodes) {
          if (node.type === 'comment') {
            subset = node.text.trim();
            continue;
          }
          if (node.type !== 'atrule' || node.name !== 'font-face') continue;
          if (subsets && subset && !subsets.includes(subset)) continue;

          const decl = (prop) => {
            let v = '';
            node.walkDecls(prop, (d) => { v = d.value; });
            return v;
          };
          const key = [
            decl('font-family'), decl('font-style'),
            decl('font-weight'), decl('unicode-range')
          ].join('|');
          if (seen.has(key)) continue;
          seen.add(key);

          // Rewrite every url(...) in src to an inline data: URI.
          for (const d of node.nodes.filter((n) => n.prop === 'src')) {
            const urls = [...d.value.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)];
            for (const [whole, fontUrl] of urls) {
              d.value = d.value.replace(whole, `url(${await getDataUri(fontUrl)})`);
            }
          }

          const face = node.clone();
          face.raws.before = '\n\n';
          if (subset) {
            const label = postcss.comment({ text: `${decl('font-family')} - ${subset}` });
            // Set raws explicitly; otherwise PostCSS copies the spacing of
            // other comments in the file (the multi-line preamble banner).
            label.raws = { before: '\n\n', left: ' ', right: ' ' };
            face.raws.before = '\n';
            faces.push(label);
          }
          faces.push(face);
          emitted++;
        }

        rule.remove();
      }

      const [cookie] = markers;
      const next = cookie.next();
      if (faces.length) {
        faces[0].raws.before = '\n\n';
        cookie.replaceWith(faces);
      } else {
        cookie.remove();
      }
      if (next) next.raws.before = '\n\n';

      result.messages.push({
        type: 'info',
        plugin: 'inline-google-fonts',
        text: `inlined ${emitted} @font-face rule(s) from ${imports.length} import(s)`
      });
    }
  };
};
inlineGoogleFonts.postcss = true;

export default inlineGoogleFonts;
