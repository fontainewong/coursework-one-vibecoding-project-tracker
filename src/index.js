// Directory entry for `node --test src/` on Node versions that require an index.
// Vite uses main.jsx; this entry runs only the source test suite.
import { readdirSync } from 'node:fs';

for (const name of readdirSync(new URL('.', import.meta.url)).filter((name) => name.endsWith('.test.js')).sort()) {
  await import(new URL(name, import.meta.url));
}
