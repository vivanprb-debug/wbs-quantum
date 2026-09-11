import { loadTasks } from '../tasks/task-service.js';
import { loadExams } from '../exams/exam-service.js';
import { getStreak } from '../streaks/streak-service.js';
import { getPreferences } from '../preferences/preferences-service.js';

export function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function dayDiff(fromKey, toKey) {
  if (!fromKey || !toKey) return null;
  const a = new Date(`${fromKey}T00:00:00`);
  const b = new Date(`${toKey}T00:00:00`);
  return Math.round((b - a) / 86400000);
}

export function buildNotifications({ tasks = [], exams = [], streak = {}, preferences = {}, today = localDateKey() } = {}) {
  const items = [];
  for (const task of tasks) {
    if (task?.completed || !task?.dueDate) continue;
    const diff = dayDiff(today, String(task.dueDate).slice(0, 10));
    if (diff === 0) items.push({ id: `task-today-${task.id}`, type: 'task', icon: '✓', title: 'Task due today', text: task.title, tone: 'urgent', target: 'productivity' });
    else if (diff === 1) items.push({ id: `task-tomorrow-${task.id}`, type: 'task', icon: '✓', title: 'Task due tomorrow', text: task.title, tone: 'soon', target: 'productivity' });
    else if (diff !== null && diff < 0) items.push({ id: `task-overdue-${task.id}`, type: 'task', icon: '!', title: 'Overdue task', text: task.title, tone: 'urgent', target: 'productivity' });
  }
  for (const exam of exams) {
    if (!exam?.date) continue;
    const diff = dayDiff(today, String(exam.date).slice(0, 10));
    if (diff === 0) items.push({ id: `exam-today-${exam.id}`, type: 'exam', icon: '📚', title: 'Exam today', text: exam.title, tone: 'urgent', target: 'productivity' });
    else if (diff === 1) items.push({ id: `exam-tomorrow-${exam.id}`, type: 'exam', icon: '📚', title: 'Exam tomorrow', text: exam.title, tone: 'soon', target: 'productivity' });
    else if (diff !== null && diff >= 0 && diff <= 7) items.push({ id: `exam-week-${exam.id}`, type: 'exam', icon: '📚', title: 'Exam this week', text: `${exam.title}${exam.subject ? ` • ${exam.subject}` : ''}`, tone: 'info', target: 'productivity' });
  }
  if (preferences?.streakReminders && !streak?.claimedToday) {
    items.push({ id: `streak-${today}`, type: 'streak', icon: '🔥', title: 'Keep your streak alive', text: 'Claim today in Streaks.', tone: 'info', target: 'streaks' });
  }
  return items.slice(0, 25);
}

export async function loadNotificationSnapshot(uid) {
  if (!uid) throw new Error('A signed-in user is required.');
  const [tasks, exams, streak, preferences] = await Promise.all([
    loadTasks(uid), loadExams(uid), getStreak(uid).catch(() => ({})), getPreferences(uid).catch(() => ({}))
  ]);
  return buildNotifications({
    tasks: tasks.data || [],
    exams: exams.data || [],
    streak: streak || {},
    preferences: preferences || {}
  });
}

export function browserNotificationsSupported() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export async function requestBrowserNotificationPermission() {
  if (!browserNotificationsSupported()) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  try { return await Notification.requestPermission(); } catch { return 'denied'; }
}

export function sendBrowserNotification(title, options = {}) {
  if (!browserNotificationsSupported() || Notification.permission !== 'granted') return false;
  try { new Notification(title, { icon: 'assets/icon-192.png', ...options }); return true; } catch { return false; }
}
