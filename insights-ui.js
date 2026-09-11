import { loadTasks } from '../tasks/task-service.js';
import { loadExams } from '../exams/exam-service.js';
import { loadRevisionSessions } from '../revision/revision-service.js';
import { buildTaskInsights, buildRevisionInsights, buildExamInsights, buildSubjectLoad, buildWeeklyReview } from './insights-service.js';

const EMPTY = () => ({ uid:null, sessionGeneration:null, profile:null, tasks:[], exams:[], sessions:[], loading:false, error:null });
let state = EMPTY();
const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const fmtMinutes = minutes => `${Math.floor(minutes/60)}h ${minutes%60}m`;

function barWidth(value, max) { return max ? Math.max(4, Math.round((value / max) * 100)) : 4; }

function render() {
  const wrap = $('insights-view'); if (!wrap) return;
  const task = buildTaskInsights(state.tasks, today());
  const revision = buildRevisionInsights(state.sessions);
  const exams = buildExamInsights(state.exams, today());
  const subjects = buildSubjectLoad(state.profile);
  const week = buildWeeklyReview(state.tasks, state.sessions, state.exams);
  const maxSubject = Math.max(1, ...subjects.map(item => item.count));
  const maxWeek = Math.max(1, ...week.flatMap(day => [day.tasks, day.revision, day.exams]));
  wrap.innerHTML = `
    <div class="insights-page">
      <section class="glass-card insights-hero">
        <div><div class="eyebrow">YOUR PROGRESS</div><h3>Insights</h3><p class="subtle">A quick view of how your school work is building up.</p></div>
        <span class="badge">${state.loading ? 'Updating…' : 'Live from your data'}</span>
      </section>
      ${state.error ? `<section class="glass-card inline-error" role="alert">${esc(state.error)}</section>` : ''}
      <section class="metric-grid insights-metrics">
        <div class="metric-tile"><span>Task completion</span><strong>${task.completionRate}%</strong><small>${task.completed}/${task.total || 0} complete</small></div>
        <div class="metric-tile"><span>Revision done</span><strong>${revision.completionRate}%</strong><small>${revision.completed}/${revision.total || 0} sessions</small></div>
        <div class="metric-tile"><span>Upcoming exams</span><strong>${exams.upcoming}</strong><small>${exams.next ? esc(exams.next.subject || exams.next.title) : 'Nothing scheduled'}</small></div>
      </section>

      <section class="glass-card">
        <div class="section-heading"><div><div class="eyebrow">HOMEWORK</div><h3>Task health</h3></div><span class="badge">${task.open} open</span></div>
        <div class="insight-progress"><div><span>Completion</span><strong>${task.completionRate}%</strong></div><div class="insight-track"><span style="width:${task.completionRate}%"></span></div></div>
        <div class="insight-mini-grid">
          <div><span>Due today</span><strong>${task.dueToday}</strong></div>
          <div><span>Overdue</span><strong>${task.overdue}</strong></div>
          <div><span>Total tasks</span><strong>${task.total}</strong></div>
        </div>
      </section>

      <section class="glass-card">
        <div class="section-heading"><div><div class="eyebrow">REVISION</div><h3>Revision time</h3></div><span class="badge">${fmtMinutes(revision.completedMinutes)} done</span></div>
        <div class="insight-progress"><div><span>Sessions completed</span><strong>${revision.completionRate}%</strong></div><div class="insight-track"><span style="width:${revision.completionRate}%"></span></div></div>
        <div class="insight-mini-grid"><div><span>Planned</span><strong>${fmtMinutes(revision.plannedMinutes)}</strong></div><div><span>Completed</span><strong>${fmtMinutes(revision.completedMinutes)}</strong></div><div><span>Sessions</span><strong>${revision.total}</strong></div></div>
      </section>

      <section class="glass-card">
        <div class="section-heading"><div><div class="eyebrow">TIMETABLE</div><h3>Subject load</h3></div><span class="badge">${subjects.length} subjects</span></div>
        <div class="insight-bars">${subjects.slice(0,8).map(item => `<div class="insight-bar-row"><div><strong>${esc(item.subject)}</strong><span>${item.count} lessons / cycle</span></div><div class="insight-bar-track"><span style="width:${barWidth(item.count,maxSubject)}%"></span></div></div>`).join('') || '<div class="empty-state">Your timetable data is not available.</div>'}</div>
      </section>

      <section class="glass-card">
        <div class="section-heading"><div><div class="eyebrow">THIS WEEK</div><h3>Workload map</h3></div><span class="badge">Tasks + revision + exams</span></div>
        <div class="week-review">${week.map(day => `<div class="week-review-day"><div><strong>${esc(day.label)}</strong><small>${esc(day.key.slice(5))}</small></div><div class="week-bars"><i style="height:${Math.max(5,Math.round(day.tasks/maxWeek*54))}px" title="${day.tasks} tasks"></i><i style="height:${Math.max(5,Math.round(day.revision/maxWeek*54))}px" title="${day.revision} revision"></i><i style="height:${Math.max(5,Math.round(day.exams/maxWeek*54))}px" title="${day.exams} exams"></i></div></div>`).join('')}</div>
        <div class="week-legend"><span><i></i>Tasks</span><span><i></i>Revision</span><span><i></i>Exams</span></div>
      </section>

      <section class="glass-card">
        <div class="section-heading"><div><div class="eyebrow">NEXT STEP</div><h3>Keep the momentum</h3></div></div>
        <p class="subtle insight-advice">${task.overdue ? `Start with your ${task.overdue === 1 ? 'overdue task' : `${task.overdue} overdue tasks`}.` : revision.total && revision.completionRate < 100 ? 'Finish a planned revision session next.' : exams.upcoming ? `Your next exam is ${esc(exams.next.subject || exams.next.title)} — use the Revision tab to prepare.` : 'You are on top of the planner. Keep adding tasks and revision sessions as they arrive.'}</p>
        <div class="productivity-toolbar"><button id="insights-open-tasks" class="primary-button" type="button">Open tasks</button><button id="insights-open-revision" class="small-button" type="button">Open revision</button></div>
      </section>
    </div>`;
  $('insights-open-tasks')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('wbs:navigate',{detail:'productivity'})));
  $('insights-open-revision')?.addEventListener('click',()=>window.dispatchEvent(new CustomEvent('wbs:navigate',{detail:'revision'})));
}

export async function mountInsightsUI({ studentProfile:userProfile, userId, sessionGeneration=null }) {
  state = {...EMPTY(), profile:userProfile, uid:userId, sessionGeneration, loading:true}; render();
  try {
    const [tasks, exams, sessions] = await Promise.all([loadTasks(userId), loadExams(userId), loadRevisionSessions(userId)]);
    if (state.uid !== userId || state.sessionGeneration !== sessionGeneration) return;
    state.tasks = tasks.data || [];
    state.exams = exams.data || [];
    state.sessions = sessions.data || [];
    state.loading = false;
    const cached = [tasks,exams].some(item => item.error && item.source === 'cache');
    state.error = cached ? 'Offline: showing cached dashboard data.' : null;
  } catch (error) {
    if (state.uid !== userId || state.sessionGeneration !== sessionGeneration) return;
    state.loading = false; state.error = error?.message || 'Insights could not load.';
  }
  render();
}

export function clearInsightsUI(){state=EMPTY();const wrap=$('insights-view');if(wrap)wrap.innerHTML='';}
