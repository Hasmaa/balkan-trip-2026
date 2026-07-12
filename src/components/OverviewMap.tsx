import { useEffect, useRef, useState } from 'react';
import maplibregl, { type Map } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Resource, TripDay } from '../types/trip';
import { simulationMoments } from '../data/simulation';
import { zoomForMoment } from '../lib/trip';

const style = import.meta.env.VITE_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';
type Focus = { coordinates: [number, number]; kind: string; seq: number };

export function OverviewMap({ days, resources, selected, focus, onSelectDay, onOpen }: { days: TripDay[]; resources: Resource[]; selected: number; focus?: Focus; onSelectDay: (n: number) => void; onOpen: (r: Resource) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const momentMarkers = useRef<maplibregl.Marker[]>([]);
  const [failed, setFailed] = useState(false);

  // Build the map once. NOT keyed on `selected`/`focus` — those update in place, so the map is never torn down mid-playback.
  useEffect(() => {
    if (!el.current || map.current) return;
    try {
      const instance = new maplibregl.Map({ container: el.current, style, center: [20.3, 42.6], zoom: 5 });
      map.current = instance;
      instance.on('load', () => {
        days.forEach(d => {
          instance.addSource(`route-${d.day}`, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: d.routeCoordinates } } });
          instance.addLayer({ id: `route-${d.day}`, type: 'line', source: `route-${d.day}`, paint: { 'line-color': d.day === selected ? '#e0ad56' : '#5c8f83', 'line-width': d.day === selected ? 5 : 2.5, 'line-opacity': d.day === selected ? 1 : .48 } });
        });
        resources.filter(r => r.type === 'campground').forEach(r => {
          const marker = document.createElement('button');
          marker.className = 'map-marker';
          marker.textContent = String(r.dayIds[0]);
          marker.ariaLabel = `Open ${r.name}`;
          marker.onclick = () => onOpen(r);
          new maplibregl.Marker({ element: marker }).setLngLat(r.coordinates).addTo(instance);
        });
        const bounds = new maplibregl.LngLatBounds();
        days.flatMap(d => d.routeCoordinates).forEach(p => bounds.extend(p));
        instance.fitBounds(bounds, { padding: 48, maxZoom: 7 });
      });
      instance.on('error', () => setFailed(true));
    } catch { setFailed(true); }
    return () => { map.current?.remove(); map.current = null; };
  }, [days, resources, onOpen]);

  // Recolour the route lines to highlight the active day.
  useEffect(() => {
    const instance = map.current;
    if (!instance || !instance.isStyleLoaded()) return;
    days.forEach(d => {
      if (!instance.getLayer(`route-${d.day}`)) return;
      const active = d.day === selected;
      instance.setPaintProperty(`route-${d.day}`, 'line-color', active ? '#e0ad56' : '#5c8f83');
      instance.setPaintProperty(`route-${d.day}`, 'line-width', active ? 5 : 2.5);
      instance.setPaintProperty(`route-${d.day}`, 'line-opacity', active ? 1 : .48);
    });
  }, [selected, days]);

  // Single camera controller: a live player moment flies to its point (adaptive zoom); with no moment focused,
  // a day selection fits that day's extent. Focus takes precedence, so player-driven day changes never fight the fly.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    if (focus) {
      instance.flyTo({ center: focus.coordinates, zoom: zoomForMoment(focus.kind), duration: 900, essential: true });
      return;
    }
    if (!instance.isStyleLoaded()) return;
    const day = days.find(d => d.day === selected);
    if (!day) return;
    const b = new maplibregl.LngLatBounds();
    day.routeCoordinates.forEach(p => b.extend(p));
    instance.fitBounds(b, { padding: 72, maxZoom: 8, duration: 700 });
  }, [selected, focus, days]);

  // A dotted trail of the active day's stops, with the current moment pinned on top.
  useEffect(() => {
    const instance = map.current;
    if (!instance) return;
    momentMarkers.current.forEach(m => m.remove());
    momentMarkers.current = [];
    simulationMoments.filter(m => m.day === selected).forEach(m => {
      const dot = document.createElement('span');
      dot.className = 'map-moment-dot';
      dot.title = `${m.time} · ${m.title}`;
      momentMarkers.current.push(new maplibregl.Marker({ element: dot }).setLngLat(m.coordinates).addTo(instance));
    });
    if (focus) {
      const pin = document.createElement('span');
      pin.className = 'map-moment-current';
      momentMarkers.current.push(new maplibregl.Marker({ element: pin }).setLngLat(focus.coordinates).addTo(instance));
    }
    return () => { momentMarkers.current.forEach(m => m.remove()); momentMarkers.current = []; };
  }, [selected, focus]);

  if (failed) return <div className="map-fallback"><b>Map unavailable</b><p>The planned route is still available:</p><ol>{days.map(d => <li key={d.day}><button onClick={() => onSelectDay(d.day)}>Day {d.day}: {d.title}</button></li>)}</ol></div>;
  return <div className="map-wrap"><div ref={el} className="map" aria-label="Interactive map of the Balkan road trip"/><div className="map-overlay"><b>Route layers</b><span>● Selected day</span><span>● Camps</span><span>● Trip stops</span><small>Map data is planning-only; verify road conditions.</small></div></div>;
}
