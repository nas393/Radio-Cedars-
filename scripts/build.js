// Build: one small script file and one small style file instead of thirty.
// src/index.html lists the scripts one by one (easy to edit); this writes
// public/index.html with a single bundle, public/dist/app.js and app.css,
// and points the offline copy (sw.js) at them.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const esbuild = require('esbuild');

const root = path.join(__dirname, '..');
const pub = path.join(root, 'public');
const src = fs.readFileSync(path.join(root, 'src', 'index.html'), 'utf8');

const scriptRe = /^\s*<script src="\/([\w.-]+\.js)" defer><\/script>\n/gm;
const scripts = [...src.matchAll(scriptRe)].map(m => m[1]);
const styleRe = /^\s*<link rel="stylesheet" href="\/([\w.-]+\.css)">\n/gm;
const styles = [...src.matchAll(styleRe)].map(m => m[1]);
if (!scripts.length || !styles.length) throw new Error('no scripts or styles found in src/index.html');

const js = scripts.map(f => `/* ${f} */\n` + fs.readFileSync(path.join(pub, f), 'utf8')).join('\n;\n');
const css = styles.map(f => fs.readFileSync(path.join(pub, f), 'utf8')).join('\n');
const outJs = esbuild.transformSync(js, { loader: 'js', minify: true, target: 'es2019', legalComments: 'none' }).code;
const outCss = esbuild.transformSync(css, { loader: 'css', minify: true, target: ['chrome90', 'safari14', 'firefox90'] }).code;
const hash = s => crypto.createHash('sha1').update(s).digest('hex').slice(0, 10);

fs.mkdirSync(path.join(pub, 'dist'), { recursive: true });
fs.writeFileSync(path.join(pub, 'dist', 'app.js'), outJs);
fs.writeFileSync(path.join(pub, 'dist', 'app.css'), outCss);

let html = src;
let first = true;
html = html.replace(styleRe, m => { if (!first) return ''; first = false; return m.replace(/href="[^"]+"/, `href="/dist/app.css?v=${hash(outCss)}"`); });
first = true;
html = html.replace(scriptRe, m => { if (!first) return ''; first = false; return m.replace(/src="[^"]+"/, `src="/dist/app.js?v=${hash(outJs)}"`); });
fs.writeFileSync(path.join(pub, 'index.html'), '<!-- built from src/index.html by scripts/build.js: edit that file, then npm run build -->\n' + html);

// the offline copy keeps the bundle instead of the separate files
const swPath = path.join(pub, 'sw.js');
let sw = fs.readFileSync(swPath, 'utf8');
sw = sw.replace(/const SHELL = \[[^\]]*\];/, m => {
  const items = [...m.matchAll(/'([^']+)'/g)].map(x => x[1]).filter(x => !/\.(js|css)$/.test(x) || x.startsWith('/dist/'));
  const keep = items.filter(x => !x.startsWith('/dist/'));
  return `const SHELL = ${JSON.stringify(['/', '/dist/app.css', '/dist/app.js', ...keep.filter(x => x !== '/')]).replace(/"/g, "'").replace(/,/g, ', ')};`;
});
sw = sw.replace(/const CACHE = '[^']*';/, `const CACHE = 'sawt-${hash(outJs + outCss)}';`);
fs.writeFileSync(swPath, sw);

const kb = n => (n / 1024).toFixed(0) + ' KB';
console.log(`scripts: ${scripts.length} files, ${kb(js.length)} → ${kb(outJs.length)}`);
console.log(`styles: ${styles.length} files, ${kb(css.length)} → ${kb(outCss.length)}`);
