import { getAuth } from '../core/firebase.js';
import { AppError } from '../core/errors.js';

function functionsClient() {
  const firebase = window.firebase;
  if (!firebase?.functions) throw new AppError('Firebase Functions is not loaded.', 'ai/functions-sdk-missing');
  return firebase.functions();
}

export async function askAI({ message, profile, timetableContext = '', tasks = [], exams = [], history = [] }) {
  const auth = getAuth();
  if (!auth.currentUser) throw new AppError('Please sign in before using Ask AI.', 'ai/not-authenticated');
  const cleanMessage = String(message || '').trim();
  if (!cleanMessage) throw new AppError('Type a question first.', 'ai/empty-message');
  if (cleanMessage.length > 4000) throw new AppError('That question is too long. Please keep it under 4,000 characters.', 'ai/message-too-long');

  const callable = functionsClient().httpsCallable('askGemini');
  try {
    const result = await callable({
      message: cleanMessage,
      profile: profile ? { id: profile.id, name: profile.name, email: profile.email, form: profile.form || null } : null,
      timetableContext: String(timetableContext).slice(0, 12000),
      tasks: tasks.slice(0, 30).map(t => ({ title: t.title, subject: t.subject, dueDate: t.dueDate, priority: t.priority, completed: !!t.completed })),
      exams: exams.slice(0, 20).map(e => ({ title: e.title, subject: e.subject, date: e.date, room: e.room })),
      history: history.slice(-12).map(item => ({ role: item.role, text: String(item.text || '').slice(0, 3000) }))
    });
    return result.data;
  } catch (error) {
    const code = error?.code || '';
    if (code.includes('unauthenticated')) throw new AppError('Your sign-in session has expired. Please sign in again.', 'ai/unauthenticated', error);
    if (code.includes('permission-denied')) throw new AppError('Ask AI is not enabled for this account.', 'ai/permission-denied', error);
    if (code.includes('resource-exhausted')) throw new AppError('AI is temporarily busy. Please try again shortly.', 'ai/rate-limited', error);
    if (code.includes('failed-precondition')) throw new AppError('Ask AI is not configured on the server yet.', 'ai/not-configured', error);
    throw new AppError(error?.message || 'Ask AI could not complete the request.', 'ai/request-failed', error);
  }
}
