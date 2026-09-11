import { examRepository } from './cloud-repository.js';
function cleanText(value, max = 120) { return String(value || '').trim().slice(0, max); }
export function normaliseExam(input) {
  const title = cleanText(input.title, 160);
  if (!title) throw new Error('Exam title is required.');
  const exam = { id: input.id || undefined, title, subject: cleanText(input.subject, 80), date: cleanText(input.date, 20), room: cleanText(input.room, 40), notes: cleanText(input.notes, 500), createdAt: input.createdAt || new Date().toISOString() };
  if (!exam.id) delete exam.id;
  return exam;
}
export async function loadExams(uid) { return examRepository.list(uid); }
export async function saveExam(uid, input) { return examRepository.save(uid, normaliseExam(input)); }
export async function deleteExam(uid, id) { return examRepository.remove(uid, id); }
