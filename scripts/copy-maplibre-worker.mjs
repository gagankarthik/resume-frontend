// MapLibre 6 runs its tile work in a module web worker that it loads from a
// file beside its own bundle. The bundler does not emit that file, so it is
// copied into public/ on install and the map is pointed at it with
// setWorkerUrl(). Runs on every install, so the worker always matches the
// installed library version.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'node_modules', 'maplibre-gl', 'dist');
const out = join(root, 'public', 'vendor', 'maplibre');

mkdirSync(out, { recursive: true });
for (const f of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) {
  copyFileSync(join(src, f), join(out, f));
}
console.log('maplibre worker copied to public/vendor/maplibre');
