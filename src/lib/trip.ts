import type { Resource, TripDay } from '../types/trip';
export const mapsSearchUrl=(query:string)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
export const directionsUrl=(origin:string,destination:string,waypoints:string[]=[])=>(`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}${waypoints.length?`&waypoints=${encodeURIComponent(waypoints.join('|'))}`:''}&travelmode=driving`);
export const weatherUrl=(place:string)=>`https://www.google.com/search?q=${encodeURIComponent(`weather ${place}`)}`;
const isoDate=/^\d{4}-\d{2}-\d{2}$/;
export const parseTripQuery=(search:string)=>{const q=new URLSearchParams(search);const day=Number(q.get('day'));const start=q.get('start');return {day:day>=1&&day<=11?day:undefined,resource:q.get('resource')||undefined,start:start&&isoDate.test(start)?start:undefined};};
export const isStale=(verifiedAt:string|undefined,days=90,now=new Date())=>!verifiedAt||((now.getTime()-new Date(verifiedAt).getTime())/86400000)>days;
export const filteredResources=(resources:Resource[],day:number)=>resources.filter(r=>r.dayIds.includes(day));
export const navigateDay=(days:TripDay[],current:number,delta:number)=>days.find(d=>d.day===Math.min(days.length,Math.max(1,current+delta)))?.day ?? current;
export const amenityLabel=(value: string)=> value === 'reported' ? 'Reported — recheck' : value === 'unknown' ? 'Unknown' : value === 'yes' ? 'Yes' : 'No';
export type BudgetRange={min:number;max:number}; export const budgetTotal=(rows:BudgetRange[])=>rows.reduce((a,r)=>({min:a.min+r.min,max:a.max+r.max}),{min:0,max:0});
// Trip simulation player. `days` is the ordered list of each moment's day.
export const firstMomentIndexOfDay=(days:number[],day:number)=>{const i=days.indexOf(day);return i>=0?i:0;};
export const stepMoment=(total:number,index:number,by:number)=>Math.min(total-1,Math.max(0,index+by));
export const advanceMoment=(total:number,index:number)=>index>=total-1?0:index+1;
// Only resync the player from the parent when the day differs from what the player last emitted;
// otherwise the player would fight its own updates (rewinding on pause and on backward steps).
export const shouldSyncFromDay=(selectedDay:number,lastEmittedDay:number)=>selectedDay!==lastEmittedDay;
// Adaptive map zoom per moment kind: pull back over borders/long drives, medium when leaving a town, tight on a specific place.
export const zoomForMoment=(kind:string)=>kind==='border'||kind==='drive'?8.5:kind==='start'?10:12;
// Trip dates. Day 1 is the start date; each later day is the next calendar day.
export const DEFAULT_START='2026-07-22';
export const normalizeStartDate=(s?:string)=>{if(!s||!isoDate.test(s))return DEFAULT_START;const [y,m,d]=s.split('-').map(Number);const dt=new Date(y,m-1,d);return dt.getFullYear()===y&&dt.getMonth()===m-1&&dt.getDate()===d?s:DEFAULT_START;};
export const dateForDay=(startISO:string,day:number)=>{const [y,m,d]=normalizeStartDate(startISO).split('-').map(Number);const dt=new Date(y,m-1,d);dt.setDate(dt.getDate()+(day-1));return dt;};
const WEEKDAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const formatTripDate=(date:Date,withYear=false)=>`${WEEKDAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}${withYear?` ${date.getFullYear()}`:''}`;
