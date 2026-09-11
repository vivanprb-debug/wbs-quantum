import { noteRepository } from './cloud-repository.js';
function cleanText(value, max) { return String(value || '').trim().slice(0, max); }
export function normaliseNote(input) {
  const title = cleanText(input.title, 120) || 'Quick note';
  const body = cleanText(input.body, 5000);
  if (!body) throw new Error('Note text is required.');
  const note = { id: input.id || undefined, title, body, createdAt: input.createdAt || new Date().toISOString() };
  if (!note.id) delete note.id;
  return note;
}
export async function loadNotes(uid) { return noteRepository.list(uid); }
export async function saveNote(uid, input) { return noteRepository.save(uid, normaliseNote(input)); }
export async function deleteNote(uid, id) { return noteRepository.remove(uid, id); }
