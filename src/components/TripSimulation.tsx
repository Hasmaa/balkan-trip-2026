import { useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward, CarFront } from 'lucide-react';
import { simulationMoments, type SimulationMoment } from '../data/simulation';
import { countries } from '../data/countries';
import { firstMomentIndexOfDay, stepMoment, advanceMoment, shouldSyncFromDay, dateForDay, formatTripDate } from '../lib/trip';

const momentDays = simulationMoments.map(m => m.day);
const total = simulationMoments.length;

export function TripSimulation({ selectedDay, start, onStep }: { selectedDay: number; start: string; onStep: (moment: SimulationMoment) => void }) {
  const [index, setIndex] = useState(() => firstMomentIndexOfDay(momentDays, selectedDay));
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const moment = simulationMoments[index];
  // The last day the player itself reported, so external syncs can ignore our own echoes.
  const lastDay = useRef(moment.day);

  // Report the player's current moment to the parent (timeline highlights the day; map flies to the point).
  useEffect(() => {
    lastDay.current = moment.day;
    onStep(moment);
  }, [moment, onStep]);

  // Follow a genuine external day selection; skip echoes so pausing and stepping back never rewind.
  useEffect(() => {
    if (!shouldSyncFromDay(selectedDay, lastDay.current)) return;
    lastDay.current = selectedDay;
    setIndex(firstMomentIndexOfDay(momentDays, selectedDay));
  }, [selectedDay]);

  // Playback timer.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setIndex(i => advanceMoment(total, i)), speed === 1 ? 1450 : 700);
    return () => window.clearInterval(timer);
  }, [playing, speed]);

  const progress = useMemo(() => Math.round((index / (total - 1)) * 100), [index]);
  const step = (by: number) => setIndex(i => stepMoment(total, i, by));

  return <section className="trip-simulation" aria-label="Road trip simulation"><div className="simulation-heading"><div><p className="eyebrow">Play the roadtrip</p><h2>Follow the day as it unfolds.</h2></div><span className="simulation-day">{formatTripDate(dateForDay(start, moment.day))} · {moment.time}</span></div><div className="simulation-scene"><div className={`simulation-icon ${moment.kind}`}><CarFront aria-hidden="true"/></div><div><p className="eyebrow">{countries[moment.country].flag} {countries[moment.country].name} · {moment.kind}</p><h3>{moment.title}</h3><p>{moment.detail}</p></div></div><div className="simulation-track" aria-label={`${progress}% through itinerary`}><span style={{width:`${progress}%`}}/></div><div className="simulation-controls"><button onClick={()=>step(-1)} disabled={index===0} aria-label="Previous moment"><SkipBack/></button><button className="play" onClick={()=>setPlaying(p=>!p)}>{playing?<><Pause/>Pause</>:<><Play/>Play trip</>}</button><button onClick={()=>step(1)} disabled={index===total-1} aria-label="Next moment"><SkipForward/></button><button onClick={()=>{setPlaying(false);setIndex(0)}} aria-label="Restart trip"><RotateCcw/></button><button className={speed===2?'selected':''} onClick={()=>setSpeed(s=>s===1?2:1)}>{speed}×</button></div></section>;
}
