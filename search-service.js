import { searchTimetable } from './timetable-service.js';
import { loadTasks } from './task-service.js';
import { loadExams } from './exam-service.js';
import { loadNotes } from './note-service.js';

function text(value) { return String(value ?? '').trim(); }
function hit(type, title, subtitle, extra = {}) { return { type, title: text(title), subtitle: text(subtitle), ...extra }; }

export async function globalSearch({ profile, uid, query }) {
  const needle = text(query).toLowerCase();
  if (!profile || !uid || !needle) return [];

  const [taskResult, examResult, noteResult] = await Promise.all([
    loadTasks(uid), loadExams(uid), loadNotes(uid)
  ]);

  const results = [];
  for (const item of searchTimetable(profile, needle).slice(0, 30)) {
    results.push(hit('schedule', item.subject, `Week ${item.week} • P${item.period} • ${item.teacher} • ${item.room}`, {
      query: needle,
      week: item.week,
      day: item.day,
      period: item.period
    }));
  }

  for (const item of (taskResult.data || [])) {
    const hay = `${item.title} ${item.subject} ${item.priority}`.toLowerCase();
    if (hay.includes(needle)) results.push(hit('task', item.title, `${item.subject || 'General'} • ${item.completed ? 'Done' : 'Open'}${item.dueDate ? ` • Due ${item.dueDate}` : ''}`, { id: item.id }));
  }

  for (const item of (examResult.data || [])) {
    const hay = `${item.title} ${item.subject} ${item.room} ${item.notes}`.toLowerCase();
    if (hay.includes(needle)) results.push(hit('exam', item.title, `${item.subject || 'Exam'}${item.date ? ` • ${item.date}` : ''}${item.room ? ` • Room ${item.room}` : ''}`, { id: item.id }));
  }

  for (const item of (noteResult.data || [])) {
    const hay = `${item.title} ${item.body}`.toLowerCase();
    if (hay.includes(needle)) results.push(hit('note', item.title || 'Untitled note', text(item.body).slice(0, 100), { id: item.id }));
  }

  const order = { schedule: 0, task: 1, exam: 2, note: 3 };
  return results.sort((a, b) => order[a.type] - order[b.type] || a.title.localeCompare(b.title)).slice(0, 40);
}
