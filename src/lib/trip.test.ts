import { describe,expect,it } from 'vitest'; import { amenityLabel,budgetTotal,directionsUrl,filteredResources,isStale,navigateDay,parseTripQuery,firstMomentIndexOfDay,stepMoment,advanceMoment,shouldSyncFromDay,zoomForMoment,dateForDay,formatTripDate,normalizeStartDate,DEFAULT_START,latLng,tripDirectionsUrl,directionsThrough } from './trip'; import { itinerary } from '../data/itinerary'; import { resources } from '../data/resources'; import { simulationMoments } from '../data/simulation'; import { routeGeometry } from '../data/routeGeometry';
describe('trip helpers',()=>{it('adds budget ranges',()=>expect(budgetTotal([{min:2,max:3},{min:5,max:9}])).toEqual({min:7,max:12}));it('creates a driving link',()=>expect(directionsUrl('A','B',['C'])).toContain('travelmode=driving'));it('parses safe share parameters',()=>expect(parseTripQuery('?day=4&resource=green-bear')).toEqual({day:4,resource:'green-bear'}));it('filters day resources',()=>expect(filteredResources(resources,4).some(r=>r.id==='green-bear')).toBe(true));it('marks dated records stale',()=>expect(isStale('2025-01-01',90,new Date('2026-01-01'))).toBe(true));it('navigates within day bounds',()=>expect(navigateDay(itinerary,1,-1)).toBe(1));it('has no fake links for a missing source',()=>expect(resources.find(r=>r.id==='naluka')?.links.some(l=>l.kind==='official')).toBe(false));it('labels uncertainty honestly',()=>expect(amenityLabel('unknown')).toBe('Unknown'));it('gives every hotel a Booking.com search link',()=>{const hotels=resources.filter(r=>r.type==='hotel');expect(hotels.length).toBeGreaterThan(0);expect(hotels.every(h=>h.links.some(l=>l.kind==='booking'&&l.url.includes('booking.com')))).toBe(true)})});
describe('trip simulation player',()=>{
  const days=[1,1,1,2,2,3];
  it('finds the first moment index of a day',()=>{expect(firstMomentIndexOfDay(days,2)).toBe(3);expect(firstMomentIndexOfDay(days,1)).toBe(0)});
  it('falls back to the start for an unknown day',()=>expect(firstMomentIndexOfDay(days,9)).toBe(0));
  it('steps by one moment without leaving the timeline',()=>{expect(stepMoment(6,3,-1)).toBe(2);expect(stepMoment(6,0,-1)).toBe(0);expect(stepMoment(6,5,1)).toBe(5)});
  it('advances during playback and loops back to the start at the end',()=>{expect(advanceMoment(6,4)).toBe(5);expect(advanceMoment(6,5)).toBe(0)});
  it('resyncs only on a genuine external day change, not the player echo',()=>{expect(shouldSyncFromDay(7,2)).toBe(true);expect(shouldSyncFromDay(2,2)).toBe(false)});
  it('zooms tight on places and pulls back on borders and long drives',()=>{expect(zoomForMoment('border')).toBeLessThan(zoomForMoment('start'));expect(zoomForMoment('start')).toBeLessThan(zoomForMoment('arrive'));expect(zoomForMoment('drive')).toBe(zoomForMoment('border'));expect(zoomForMoment('arrive')).toBe(zoomForMoment('sleep'))});
  it('gives every simulation moment a coordinate on the map',()=>{expect(simulationMoments.every(m=>Array.isArray(m.coordinates)&&m.coordinates.length===2&&m.coordinates.every(n=>Number.isFinite(n)))).toBe(true)});
});
describe('trip dates',()=>{
  it('maps day numbers to real calendar dates from the start',()=>{const d1=dateForDay('2026-07-22',1);expect([d1.getFullYear(),d1.getMonth(),d1.getDate()]).toEqual([2026,6,22]);const d10=dateForDay('2026-07-22',10);expect([d10.getFullYear(),d10.getMonth(),d10.getDate()]).toEqual([2026,6,31])});
  it('formats a trip date with weekday, optionally with year',()=>{expect(formatTripDate(dateForDay('2026-07-22',1))).toBe('Wed 22 Jul');expect(formatTripDate(dateForDay('2026-07-22',10),true)).toBe('Fri 31 Jul 2026')});
  it('falls back to the default start for missing or invalid input',()=>{expect(normalizeStartDate(undefined)).toBe(DEFAULT_START);expect(normalizeStartDate('not-a-date')).toBe(DEFAULT_START);expect(normalizeStartDate('2026-13-40')).toBe(DEFAULT_START);expect(normalizeStartDate('2026-08-01')).toBe('2026-08-01')});
  it('reads a start date from the share link',()=>{expect(parseTripQuery('?day=2&start=2026-08-01').start).toBe('2026-08-01');expect(parseTripQuery('?day=2').start).toBeUndefined()});
});
describe('baked route geometry',()=>{
  const near=(a:[number,number],b:[number,number])=>Math.hypot(a[0]-b[0],a[1]-b[1])<0.15;
  it('has a road polyline of finite points for every day',()=>{for(let d=1;d<=10;d++){const line=routeGeometry[d];expect(Array.isArray(line)).toBe(true);expect(line.length).toBeGreaterThanOrEqual(2);expect(line.every(p=>p.length===2&&p.every(Number.isFinite))).toBe(true)}});
  it('connects each driving day from its origin checkpoint to its destination',()=>{for(let d=1;d<=10;d++){if(d===4)continue;const line=routeGeometry[d],day=itinerary[d-1];expect(near(line[0],day.routeCoordinates[0])).toBe(true);expect(near(line[line.length-1],day.routeCoordinates[1])).toBe(true)}});
});
describe('full route link',()=>{
  it('orders [lng,lat] as Google\'s "lat,lng"',()=>expect(latLng([26.10,44.43])).toBe('44.43,26.1'));
  it('routes through the real overnight coordinates, deduped, not the internal keys',()=>{
    const url=tripDirectionsUrl(itinerary);
    expect(url).toContain('origin=44.43%2C26.1');        // Bucharest
    expect(url).toContain('destination=39.67%2C20.85');  // Ioannina
    expect(url).not.toMatch(/tara|golubac|blagaj|lukove/i); // no ambiguous name keys
    const wp=decodeURIComponent(url.split('waypoints=')[1].split('&')[0]).split('|');
    expect(wp).toContain('44.68,22.32');                 // Clisura (Day 1 overnight) is included
    expect(wp.filter(p=>p==='43.93,19.56').length).toBe(1); // the two Tara nights collapse to one
    expect(wp.length).toBe(8);
  });
  it('builds directions through an ordered list of points, deduping the middle',()=>{
    const url=directionsThrough([[1,2],[3,4],[3,4],[5,6],[7,8]]);
    expect(url).toContain('origin=2%2C1');
    expect(url).toContain('destination=8%2C7');
    const wp=decodeURIComponent(url.split('waypoints=')[1].split('&')[0]).split('|');
    expect(wp).toEqual(['4,3','6,5']); // duplicate middle point collapsed, endpoints excluded
  });
  it('links a single point straight to its map location',()=>expect(directionsThrough([[22.42,44.71]])).toContain('maps/search'));
});
