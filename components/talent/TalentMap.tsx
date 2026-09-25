'use client';

import { useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import type { GeoJSONSource, Map as MLMap, MapLayerMouseEvent } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { CompanyPoint, MapResponse, Mode, TalentFilters } from '@/lib/talent/types';
import { CLIENT_STATUS_LABEL } from '@/lib/talent/types';
import { STATUS_COLOR } from './colors';

/**
 * The map itself. Zoomed out, a heat layer shows where talent is dense; zoomed
 * in, a bubble per employer site, sized by head count. In Sales mode bubbles
 * take the company's client status as their colour, so white space shows.
 */

// The worker is served from public/ (see scripts/copy-maplibre-worker.mjs).
maplibregl.setWorkerUrl('/vendor/maplibre/maplibre-gl-worker.mjs');

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

function heatGeo(data: MapResponse | null): GeoJSON.FeatureCollection {
  if (!data) return EMPTY;
  return {
    type: 'FeatureCollection',
    features: data.heat.map(c => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [c.lng, c.lat] },
      properties: { count: c.count },
    })),
  };
}

function siteGeo(data: MapResponse | null): GeoJSON.FeatureCollection {
  if (!data) return EMPTY;
  return {
    type: 'FeatureCollection',
    features: data.points.map(p => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
      properties: { key: p.key, siteKey: p.siteKey, count: p.count, status: p.status },
    })),
  };
}

function ringGeo(r: TalentFilters['radius']): GeoJSON.FeatureCollection {
  if (!r) return EMPTY;
  const pts: [number, number][] = [];
  const dLat = r.miles / 69;
  const dLng = r.miles / (69 * Math.cos((r.lat * Math.PI) / 180));
  for (let i = 0; i <= 64; i++) {
    const t = (i / 64) * Math.PI * 2;
    pts.push([r.lng + Math.cos(t) * dLng, r.lat + Math.sin(t) * dLat]);
  }
  return {
    type: 'FeatureCollection',
    features: [{ type: 'Feature', geometry: { type: 'Polygon', coordinates: [pts] }, properties: {} }],
  };
}

function popupHtml(p: CompanyPoint, mode: Mode): string {
  const esc = (s: string) => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  const fam = p.topFamilies.map(f => `${esc(f.name)} (${f.count})`).join(', ');
  const skills = p.topSkills.map(s => esc(s.name)).join(', ');
  return `
    <div class="tm-pop">
      <p class="tm-pop-name">${esc(p.name)}</p>
      <p class="tm-pop-sub">${esc(p.industry)}${p.place ? ` · ${esc(p.place)}` : ''}</p>
      <p class="tm-pop-count"><strong>${p.count}</strong> in this view</p>
      ${fam ? `<p class="tm-pop-row"><span>Titles</span>${fam}</p>` : ''}
      ${skills ? `<p class="tm-pop-row"><span>Skills</span>${skills}</p>` : ''}
      ${mode === 'sales' ? `<p class="tm-pop-row"><span>Status</span>${CLIENT_STATUS_LABEL[p.status]}</p>` : ''}
      <p class="tm-pop-hint">Click to open</p>
    </div>`;
}

export type LayerView = 'both' | 'heat' | 'companies';

/**
 * Where to open the map: the middle 90% of the talent, weighted by head count,
 * so a handful of people abroad do not zoom the first view out to the world.
 * Everyone is still there when the user zooms out.
 */
function coreBounds(points: CompanyPoint[]): maplibregl.LngLatBoundsLike {
  const weighted = points.flatMap(p => Array<[number, number]>(Math.min(p.count, 50)).fill([p.lng, p.lat]));
  const pick = (vals: number[], q: number) => vals[Math.min(vals.length - 1, Math.max(0, Math.floor(q * (vals.length - 1))))];
  const lngs = weighted.map(w => w[0]).sort((a, b) => a - b);
  const lats = weighted.map(w => w[1]).sort((a, b) => a - b);
  const [w, e] = [pick(lngs, 0.05), pick(lngs, 0.95)];
  const [s, n] = [pick(lats, 0.05), pick(lats, 0.95)];
  // A single site (or one city) still gets a sensible frame.
  const pad = 0.5;
  return [
    [w - pad, s - pad],
    [e + pad, n + pad],
  ];
}

function salesColor(): maplibregl.ExpressionSpecification {
  return ['match', ['get', 'status'], 'client', STATUS_COLOR.client, 'target', STATUS_COLOR.target, 'former', STATUS_COLOR.former, STATUS_COLOR.none];
}

/** Add our sources and layers to whatever basemap is loaded. Safe to call after every style change. */
function addLayers(map: MLMap, mode: Mode) {
  if (map.getSource('heat')) return;
  map.addSource('heat', { type: 'geojson', data: EMPTY });
  map.addSource('sites', { type: 'geojson', data: EMPTY });
  map.addSource('ring', { type: 'geojson', data: EMPTY });

  map.addLayer({
    id: 'heat',
    type: 'heatmap',
    source: 'heat',
    maxzoom: 13,
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'count'], 5, 0.35, 25, 0.75, 100, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 3, 0.9, 10, 2.4],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 3, 22, 7, 38, 11, 56],
      'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 8, 0.85, 12, 0.2],
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0, 'rgba(26,163,200,0)',
        0.15, 'rgba(126,211,234,0.55)',
        0.4, '#1AA3C8',
        0.65, '#2A45D8',
        0.85, '#5B2BB5',
        1, '#B4237A',
      ],
    },
  });
  map.addLayer({ id: 'ring-fill', type: 'fill', source: 'ring', paint: { 'fill-color': '#2A45D8', 'fill-opacity': 0.05 } });
  map.addLayer({ id: 'ring', type: 'line', source: 'ring', paint: { 'line-color': '#2A45D8', 'line-width': 1.6, 'line-dasharray': [3, 2] } });
  map.addLayer({
    id: 'sites',
    type: 'circle',
    source: 'sites',
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['sqrt', ['get', 'count']], 2, 7, 5, 14, 10, 24, 20, 38],
      'circle-color': mode === 'sales' ? salesColor() : '#2A45D8',
      'circle-opacity': ['interpolate', ['linear'], ['zoom'], 3, 0.6, 8, 0.88],
      'circle-stroke-color': '#ffffff',
      'circle-stroke-width': 1.5,
    },
  });
  map.addLayer({
    id: 'sites-selected',
    type: 'circle',
    source: 'sites',
    filter: ['==', ['get', 'key'], ''],
    paint: {
      'circle-radius': ['interpolate', ['linear'], ['sqrt', ['get', 'count']], 2, 11, 5, 18, 10, 28, 20, 42],
      'circle-color': 'rgba(0,0,0,0)',
      'circle-stroke-color': '#0C1B33',
      'circle-stroke-width': 2.5,
    },
  });
}

export default function TalentMap({
  styleUrl,
  data,
  mode,
  layers = 'both',
  radius,
  selected,
  onSelect,
  onReady,
}: {
  styleUrl: string;
  data: MapResponse | null;
  mode: Mode;
  layers?: LayerView;
  radius?: TalentFilters['radius'];
  selected: string | null;
  onSelect: (key: string) => void;
  onReady?: (map: MLMap) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const fitted = useRef(false);
  const lastRadius = useRef<string>('');
  const state = useRef({ data, mode, layers, radius, selected, onSelect });
  useEffect(() => {
    state.current = { data, mode, layers, radius, selected, onSelect };
  });

  /** Push the current props into the map, if its layers exist yet. */
  const sync = useRef((map: MLMap) => {
    const s = state.current;
    const heat = map.getSource('heat') as GeoJSONSource | undefined;
    const sites = map.getSource('sites') as GeoJSONSource | undefined;
    const ring = map.getSource('ring') as GeoJSONSource | undefined;
    if (!heat || !sites || !ring) return;

    heat.setData(heatGeo(s.data));
    sites.setData(siteGeo(s.data));
    ring.setData(ringGeo(s.radius));
    map.setPaintProperty('sites', 'circle-color', s.mode === 'sales' ? salesColor() : '#2A45D8');
    map.setLayoutProperty('heat', 'visibility', s.layers === 'companies' ? 'none' : 'visible');
    for (const id of ['sites', 'sites-selected']) {
      map.setLayoutProperty(id, 'visibility', s.layers === 'heat' ? 'none' : 'visible');
    }
    map.setFilter('sites-selected', ['==', ['get', 'key'], s.selected ?? '']);

    if (s.data && s.data.points.length && !fitted.current) {
      map.fitBounds(coreBounds(s.data.points), { padding: 80, maxZoom: 9, duration: 0 });
      fitted.current = true;
    }

    const rk = s.radius ? `${s.radius.lat},${s.radius.lng},${s.radius.miles}` : '';
    if (rk !== lastRadius.current) {
      lastRadius.current = rk;
      if (s.radius) {
        const d = s.radius.miles / 69;
        map.fitBounds(
          [
            [s.radius.lng - d * 1.4, s.radius.lat - d],
            [s.radius.lng + d * 1.4, s.radius.lat + d],
          ],
          { padding: 40, duration: 600 },
        );
      }
    }
  });

  // Create the map once.
  useEffect(() => {
    if (!box.current) return;
    const map = new maplibregl.Map({
      container: box.current,
      style: styleUrl,
      center: [-83.0, 40.0],
      zoom: 4.3,
      attributionControl: { compact: true },
      canvasContextAttributes: { preserveDrawingBuffer: true },
    });
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');

    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 14, maxWidth: '300px' });

    // Fires for the first style and again after every basemap switch.
    map.on('style.load', () => {
      // A flat map reads distances and densities more honestly than a globe.
      map.setProjection({ type: 'mercator' });
      addLayers(map, state.current.mode);
      sync.current(map);
    });

    map.on('mousemove', 'sites', (e: MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = 'pointer';
      const f = e.features?.[0];
      const p = state.current.data?.points.find(x => x.siteKey === f?.properties?.siteKey);
      if (!p) return;
      popup.setLngLat([p.lng, p.lat]).setHTML(popupHtml(p, state.current.mode)).addTo(map);
    });
    map.on('mouseleave', 'sites', () => {
      map.getCanvas().style.cursor = '';
      popup.remove();
    });
    map.on('click', 'sites', (e: MapLayerMouseEvent) => {
      const key = e.features?.[0]?.properties?.key;
      if (typeof key === 'string') state.current.onSelect(key);
    });

    // Redraw when the panel around the map changes size (filters folded, drawer opened).
    const resize = new ResizeObserver(() => map.resize());
    resize.observe(box.current);

    onReady?.(map);

    return () => {
      resize.disconnect();
      popup.remove();
      map.remove();
      mapRef.current = null;
      fitted.current = false;
      lastRadius.current = '';
    };
    // Created once; the basemap is switched below without rebuilding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Switch basemap in place; our layers come back on `style.load`.
  const currentStyle = useRef(styleUrl);
  useEffect(() => {
    const map = mapRef.current;
    if (!map || currentStyle.current === styleUrl) return;
    currentStyle.current = styleUrl;
    map.setStyle(styleUrl);
  }, [styleUrl]);

  useEffect(() => {
    const map = mapRef.current;
    if (map) sync.current(map);
  }, [data, mode, layers, radius, selected]);

  // MapLibre sets `position: relative` on its container, so the container
  // fills a positioned wrapper rather than positioning itself.
  return (
    <div className="absolute inset-0">
      <div ref={box} className="h-full w-full" aria-label="Talent heat map" role="region" />
    </div>
  );
}