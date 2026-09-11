import { taskRepository } from '../data/cloud-repository.js';

function cleanText(value, max = 120) { return String(value || '').trim().slice(0, max); }
export function normaliseTask(input) {
  const title = cleanText(input.title, 160);
  if (!title) throw new Error('Task title is required.');
  const task = { id: input.id || undefined, title, subject: cleanText(input.subject, 80), dueDate: cleanText(input.dueDate, 20), priority: ['High','Medium','Low'].includes(input.priority) ? input.priority : 'Medium', completed: Boolean(input.completed), createdAt: input.createdAt || new Date().toISOString() };
  if (!task.id) delete task.id;
  return task;
}
export async function loadTasks(uid) { return taskRepository.list(uid); }
export async function saveTask(uid, input) { return taskRepository.save(uid, normaliseTask(input)); }
export async function deleteTask(uid, id) { return taskRepository.remove(uid, id); }
