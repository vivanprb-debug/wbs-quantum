function dayKey(date = new Date()) {
  const d = date instanceof Date ? new Date(date) : new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function buildTaskInsights(tasks = [], today = dayKey()) {
  const safe = Array.isArray(tasks) ? tasks : [];
  const completed = safe.filter(task => Boolean(task.completed)).length;
  const open = safe.length - completed;
  const overdue = safe.filter(task => !task.completed && task.dueDate && task.dueDate < today).length;
  const dueToday = safe.filter(task => !task.completed && task.dueDate === today).length;
  const completionRate = safe.length ? Math.round((completed / safe.length) * 100) : 0;
  return { total:safe.length, completed, open, overdue, dueToday, completionRate };
}

export function buildRevisionInsights(sessions = []) {
  const safe = Array.isArray(sessions) ? sessions : [];
  const completed = safe.filter(session => Boolean(session.completed));
  const plannedMinutes = safe.reduce((sum, session) => sum + Math.max(0, Number(session.minutes) || 0), 0);
  const completedMinutes = completed.reduce((sum, session) => sum + Math.max(0, Number(session.minutes) || 0), 0);
  return { total:safe.length, completed:completed.length, plannedMinutes, completedMinutes, completionRate:safe.length ? Math.round((completed.length/safe.length)*100) : 0 };
}

export function buildExamInsights(exams = [], today = dayKey()) {
  const safe = (Array.isArray(exams) ? exams : []).filter(exam => exam.date);
  const upcoming = safe.filter(exam => exam.date >= today).sort((a,b) => a.date.localeCompare(b.date));
  return { total:safe.length, upcoming:upcoming.length, next:upcoming[0] || null, subjects:new Set(safe.map(exam => String(exam.subject || 'General'))).size };
}

export function buildSubjectLoad(profile) {
  const counts = new Map();
  const add = subject => { const name=String(subject||'').trim(); if(!name || /^registration$/i.test(name)) return; counts.set(name,(counts.get(name)||0)+1); };
  for(const week of [profile?.weekA,profile?.weekB]) for(const day of Object.values(week||{})) for(const lesson of Array.isArray(day)?day:[]) add(lesson?.subject);
  return [...counts.entries()].map(([subject,count])=>({subject,count})).sort((a,b)=>b.count-a.count||a.subject.localeCompare(b.subject));
}

export function buildWeeklyReview(tasks = [], sessions = [], exams = [], today = new Date()) {
  const d=today instanceof Date?new Date(today):new Date(today); d.setHours(0,0,0,0);
  const monday=new Date(d); monday.setDate(d.getDate()-((d.getDay()+6)%7));
  const days=Array.from({length:7},(_,i)=>{const date=new Date(monday);date.setDate(monday.getDate()+i);const k=dayKey(date);return {key:k,label:new Intl.DateTimeFormat('en-GB',{weekday:'short'}).format(date),tasks:(Array.isArray(tasks)?tasks:[]).filter(t=>t.dueDate===k).length,revision:(Array.isArray(sessions)?sessions:[]).filter(s=>s.date===k).length,exams:(Array.isArray(exams)?exams:[]).filter(e=>e.date===k).length};});
  return days;
}
