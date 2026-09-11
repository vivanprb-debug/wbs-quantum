import { loadTasks, saveTask, deleteTask } from '../tasks/task-service.js';
import { loadExams, saveExam, deleteExam } from '../exams/exam-service.js';
import { loadNotes, saveNote, deleteNote } from '../notes/note-service.js';
import { syncAllUserData } from '../data/cloud-repository.js';
import { countPending } from '../core/sync-queue.js';
import { dataErrorMessage } from '../core/errors.js';

const EMPTY = () => ({ uid:null, tasks:[], exams:[], notes:[], sessionGeneration:null, loading:false, syncState:'idle', lastError:null, filter:'all', search:'' });
let state = EMPTY();

const $ = id => document.getElementById(id);
const esc = value => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const today = () => new Date().toISOString().slice(0,10);
const fmtDate = date => date ? new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric'}).format(new Date(`${date}T12:00:00`)) : 'No date';
const countdown = date => { if(!date) return ''; const a=new Date(); a.setHours(0,0,0,0); const b=new Date(`${date}T00:00:00`); const d=Math.round((b-a)/86400000); return d<0?`${Math.abs(d)}d ago`:d===0?'Today':d===1?'Tomorrow':`${d}d`; };

function statusLabel(){
  if(state.syncState==='syncing') return 'Syncing…';
  const pending=countPending(state.uid);
  if(!navigator.onLine) return pending?`Offline • ${pending} pending`:'Offline';
  return pending?`${pending} pending`:'Synced';
}
function filteredTasks(){
  const q=state.search.trim().toLowerCase();
  return state.tasks.filter(t=>{
    const filterOk=state.filter==='all'||(state.filter==='open'&&!t.completed)||(state.filter==='done'&&t.completed);
    const qOk=!q||`${t.title} ${t.subject} ${t.priority}`.toLowerCase().includes(q);
    return filterOk&&qOk;
  });
}
function sortedExams(){
  const q=state.search.trim().toLowerCase();
  return [...state.exams].filter(e=>!q||`${e.title} ${e.subject} ${e.room}`.toLowerCase().includes(q)).sort((a,b)=>String(a.date||'9999').localeCompare(String(b.date||'9999')));
}
function filteredNotes(){
  const q=state.search.trim().toLowerCase();
  return state.notes.filter(n=>!q||`${n.title} ${n.body}`.toLowerCase().includes(q));
}

function render(){
  const wrap=$('productivity-view'); if(!wrap) return;
  const tasks=filteredTasks(); const exams=sortedExams(); const notes=filteredNotes();
  const openCount=state.tasks.filter(t=>!t.completed).length;
  const soon=exams.find(e=>e.date && e.date>=today());
  wrap.innerHTML=`
  <section class="glass-card productivity-hero">
    <div class="section-heading"><div><div class="eyebrow">MY WORKSPACE</div><h3>Tasks, exams & notes</h3><p class="subtle">Your school work stays tied to this account.</p></div><div class="productivity-status"><span class="badge">${esc(statusLabel())}</span><button id="sync-now" class="small-button" type="button" ${state.syncState==='syncing'?'disabled':''}>Sync</button></div></div>
    ${state.lastError?`<div class="inline-error" role="alert">${esc(state.lastError)}</div>`:''}
    <div class="metric-grid productivity-metrics"><div class="metric-tile"><span>Open tasks</span><strong>${openCount}</strong><small>${openCount?'Keep going':'All caught up'}</small></div><div class="metric-tile"><span>Next exam</span><strong>${soon?esc(countdown(soon.date)):'—'}</strong><small>${soon?esc(soon.subject||soon.title):'Nothing scheduled'}</small></div><div class="metric-tile"><span>Notes</span><strong>${state.notes.length}</strong><small>${state.notes.length===1?'Saved note':'Saved notes'}</small></div></div>
  </section>

  <section class="glass-card">
    <div class="section-heading"><div><div class="eyebrow">WORKSPACE TOOLS</div><h3>Quick controls</h3></div></div>
    <div class="productivity-toolbar">
      <button id="add-task" class="primary-button" type="button">+ Task</button>
      <button id="add-exam" class="small-button" type="button">+ Exam</button>
      <button id="add-note" class="small-button" type="button">+ Note</button>
    </div>
    <div class="search-row productivity-search"><input id="productivity-search" type="search" value="${esc(state.search)}" placeholder="Search tasks, exams or notes" aria-label="Search tasks, exams or notes"><button id="clear-search" class="small-button" type="button">Clear</button></div>
  </section>

  <section class="glass-card">
    <div class="section-heading"><div><div class="eyebrow">HOMEWORK</div><h3>Tasks</h3></div><div class="segmented"><button data-task-filter="all" class="segment ${state.filter==='all'?'active':''}" type="button">All</button><button data-task-filter="open" class="segment ${state.filter==='open'?'active':''}" type="button">Open</button><button data-task-filter="done" class="segment ${state.filter==='done'?'active':''}" type="button">Done</button></div></div>
    <div class="item-list">${tasks.length?tasks.map(renderTask).join(''):'<div class="empty-state">No matching tasks. Add your next piece of homework here.</div>'}</div>
  </section>

  <section class="glass-card">
    <div class="section-heading"><div><div class="eyebrow">ASSESSMENTS</div><h3>Exams</h3></div><span class="badge">${state.exams.length} total</span></div>
    <div class="item-list">${exams.length?exams.map(renderExam).join(''):'<div class="empty-state">No exams recorded yet.</div>'}</div>
  </section>

  <section class="glass-card">
    <div class="section-heading"><div><div class="eyebrow">REVISION</div><h3>Quick notes</h3></div><span class="badge">${state.notes.length}</span></div>
    <div class="item-list">${notes.length?notes.map(renderNote).join(''):'<div class="empty-state">Save a short revision note so it is ready when you need it.</div>'}</div>
  </section>
  ${renderModal()}`;
  bindEvents();
}

function renderTask(t){
  const due=t.dueDate?`${fmtDate(t.dueDate)} • ${esc(countdown(t.dueDate))}`:'No due date';
  return `<article class="item-card enhanced-item ${t.completed?'is-complete':''}">
    <button class="check-button ${t.completed?'checked':''}" data-task-toggle="${esc(t.id)}" aria-label="${t.completed?'Mark incomplete':'Mark complete'}" type="button">${t.completed?'✓':'○'}</button>
    <div class="item-main"><strong>${esc(t.title)}</strong><span>${esc(t.subject||'General')} • ${esc(t.priority||'Medium')} • ${due}</span></div>
    <div class="item-actions"><button data-task-edit="${esc(t.id)}" class="mini-button" type="button">Edit</button><button data-task-delete="${esc(t.id)}" class="mini-button danger" type="button">Delete</button></div>
  </article>`;
}
function renderExam(e){
  const date=e.date?`${fmtDate(e.date)} • ${esc(countdown(e.date))}`:'Date not set';
  return `<article class="item-card enhanced-item"><div class="exam-date"><strong>${e.date?esc(new Date(`${e.date}T12:00:00`).getDate()):'—'}</strong><span>${e.date?esc(new Intl.DateTimeFormat('en-GB',{month:'short'}).format(new Date(`${e.date}T12:00:00`))):''}</span></div><div class="item-main"><strong>${esc(e.title)}</strong><span>${esc(e.subject||'Exam')} • ${date}${e.room?` • Room ${esc(e.room)}`:''}</span>${e.notes?`<small class="item-note">${esc(e.notes)}</small>`:''}</div><div class="item-actions"><button data-exam-edit="${esc(e.id)}" class="mini-button" type="button">Edit</button><button data-exam-delete="${esc(e.id)}" class="mini-button danger" type="button">Delete</button></div></article>`;
}
function renderNote(n){
  return `<article class="item-card note-card"><div class="item-main"><strong>${esc(n.title)}</strong><span class="note-body">${esc(n.body)}</span><small>${n.updatedAt?`Updated ${esc(fmtDate(n.updatedAt.slice(0,10)))}`:'Saved note'}</small></div><div class="item-actions"><button data-note-edit="${esc(n.id)}" class="mini-button" type="button">Edit</button><button data-note-delete="${esc(n.id)}" class="mini-button danger" type="button">Delete</button></div></article>`;
}
function renderModal(){
  return `<div id="productivity-modal" class="modal-backdrop hidden" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-card"><div class="section-heading"><div><div class="eyebrow">WBS QUANTUM</div><h3 id="modal-title">Add task</h3></div><button id="modal-close" class="icon-button" type="button" aria-label="Close">×</button></div><form id="productivity-form" class="productivity-form"></form></div></div>`;
}
function openModal(type,item=null){
  const modal=$('productivity-modal'), form=$('productivity-form'), title=$('modal-title'); if(!modal||!form) return;
  let html='';
  if(type==='task'){
    title.textContent=item?'Edit task':'Add task';
    html=`<input type="hidden" name="id" value="${esc(item?.id)}"><label>Task title<input name="taskTitle" maxlength="160" required value="${esc(item?.title||'')}"></label><label>Subject<input name="subject" maxlength="80" value="${esc(item?.subject||'')}"></label><div class="form-grid"><label>Due date<input name="dueDate" type="date" value="${esc(item?.dueDate||'')}"></label><label>Priority<select name="priority"><option ${item?.priority==='High'?'selected':''}>High</option><option ${!item||item.priority==='Medium'?'selected':''}>Medium</option><option ${item?.priority==='Low'?'selected':''}>Low</option></select></label></div><div class="modal-actions"><button class="ghost-button" id="modal-cancel" type="button">Cancel</button><button class="primary-button" type="submit">Save task</button></div>`;
  } else if(type==='exam'){
    title.textContent=item?'Edit exam':'Add exam';
    html=`<input type="hidden" name="id" value="${esc(item?.id)}"><label>Exam name<input name="examTitle" maxlength="160" required value="${esc(item?.title||'')}"></label><label>Subject<input name="subject" maxlength="80" value="${esc(item?.subject||'')}"></label><div class="form-grid"><label>Date<input name="date" type="date" value="${esc(item?.date||'')}"></label><label>Room<input name="room" maxlength="40" value="${esc(item?.room||'')}"></label></div><label>Notes<textarea name="notes" maxlength="500" rows="4">${esc(item?.notes||'')}</textarea></label><div class="modal-actions"><button class="ghost-button" id="modal-cancel" type="button">Cancel</button><button class="primary-button" type="submit">Save exam</button></div>`;
  } else {
    title.textContent=item?'Edit note':'Add note';
    html=`<input type="hidden" name="id" value="${esc(item?.id)}"><label>Title<input name="noteTitle" maxlength="120" value="${esc(item?.title||'Quick note')}"></label><label>Note<textarea name="body" maxlength="5000" rows="7" required>${esc(item?.body||'')}</textarea></label><div class="modal-actions"><button class="ghost-button" id="modal-cancel" type="button">Cancel</button><button class="primary-button" type="submit">Save note</button></div>`;
  }
  form.dataset.type=type; form.innerHTML=html; modal.classList.remove('hidden'); form.querySelector('input:not([type=hidden]), textarea, select')?.focus();
}
function closeModal(){ $('productivity-modal')?.classList.add('hidden'); }

function bindEvents(){
  $('sync-now')?.addEventListener('click', syncNow);
  $('add-task')?.addEventListener('click',()=>openModal('task'));
  $('add-exam')?.addEventListener('click',()=>openModal('exam'));
  $('add-note')?.addEventListener('click',()=>openModal('note'));
  $('modal-close')?.addEventListener('click',closeModal);
  $('modal-cancel')?.addEventListener('click',closeModal);
  $('productivity-modal')?.addEventListener('click',e=>{ if(e.target.id==='productivity-modal') closeModal(); });
  $('clear-search')?.addEventListener('click',()=>{state.search=''; render();});
  $('productivity-search')?.addEventListener('input',e=>{state.search=e.target.value; render(); const input=$('productivity-search'); input?.focus(); input?.setSelectionRange(input.value.length,input.value.length);});
  document.querySelectorAll('[data-task-filter]').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.taskFilter;render();}));
  document.querySelectorAll('[data-task-toggle]').forEach(b=>b.addEventListener('click',async()=>{const x=state.tasks.find(t=>t.id===b.dataset.taskToggle);if(x)await mutate(()=>saveTask(state.uid,{...x,completed:!x.completed}));}));
  document.querySelectorAll('[data-task-edit]').forEach(b=>b.addEventListener('click',()=>openModal('task',state.tasks.find(t=>t.id===b.dataset.taskEdit))));
  document.querySelectorAll('[data-task-delete]').forEach(b=>b.addEventListener('click',()=>confirmAction('Delete this task?',()=>mutate(()=>deleteTask(state.uid,b.dataset.taskDelete)))));
  document.querySelectorAll('[data-exam-edit]').forEach(b=>b.addEventListener('click',()=>openModal('exam',state.exams.find(e=>e.id===b.dataset.examEdit))));
  document.querySelectorAll('[data-exam-delete]').forEach(b=>b.addEventListener('click',()=>confirmAction('Delete this exam?',()=>mutate(()=>deleteExam(state.uid,b.dataset.examDelete)))));
  document.querySelectorAll('[data-note-edit]').forEach(b=>b.addEventListener('click',()=>openModal('note',state.notes.find(n=>n.id===b.dataset.noteEdit))));
  document.querySelectorAll('[data-note-delete]').forEach(b=>b.addEventListener('click',()=>confirmAction('Delete this note?',()=>mutate(()=>deleteNote(state.uid,b.dataset.noteDelete)))));
  $('productivity-form')?.addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget;const fd=new FormData(form);try{if(form.dataset.type==='task')await saveTask(state.uid,{id:fd.get('id')||undefined,title:fd.get('taskTitle'),subject:fd.get('subject'),dueDate:fd.get('dueDate'),priority:fd.get('priority')});else if(form.dataset.type==='exam')await saveExam(state.uid,{id:fd.get('id')||undefined,title:fd.get('examTitle'),subject:fd.get('subject'),date:fd.get('date'),room:fd.get('room'),notes:fd.get('notes')});else await saveNote(state.uid,{id:fd.get('id')||undefined,title:fd.get('noteTitle'),body:fd.get('body')});closeModal();await reload();}catch(err){state.lastError=dataErrorMessage(err);render();$('productivity-modal')?.classList.remove('hidden');}});
}
function confirmAction(message, action){ if(window.confirm(message)) action(); }
async function mutate(operation){ state.lastError=null; try{await operation();await reload();}catch(error){state.lastError=dataErrorMessage(error);render();} }
async function syncNow(){
  if(!state.uid||state.syncState==='syncing') return; state.syncState='syncing';state.lastError=null;render();
  try{await syncAllUserData(state.uid);await reload();}catch(error){state.lastError=dataErrorMessage(error);}finally{state.syncState='idle';render();}
}
export async function reload(){
  if(!state.uid) return; const requestUid=state.uid, requestGeneration=state.sessionGeneration; state.loading=true;
  try{
    const [tasks,exams,notes]=await Promise.all([loadTasks(requestUid),loadExams(requestUid),loadNotes(requestUid)]);
    if(requestUid!==state.uid||requestGeneration!==state.sessionGeneration)return;
    state.tasks=tasks.data||[];state.exams=exams.data||[];state.notes=notes.data||[];state.loading=false;
    const cacheOffline=[tasks,exams,notes].some(r=>r.error&&r.source==='cache'&&!navigator.onLine);
    state.lastError=cacheOffline?'Offline: cached data is shown and pending changes will sync when you reconnect.':null;render();
  }catch(error){
    if(requestUid!==state.uid||requestGeneration!==state.sessionGeneration)return; state.loading=false;state.lastError=dataErrorMessage(error);render();
  }
}
function handleExternalSearch(event){
  state.search = String(event.detail?.query || '');
  state.filter = 'all';
  render();
  window.setTimeout(() => $('productivity-search')?.focus(), 0);
}

export async function mountProductivityUI(uid,{sessionGeneration=null}={}){window.removeEventListener('wbs:productivity-search', handleExternalSearch); window.addEventListener('wbs:productivity-search', handleExternalSearch); state={...EMPTY(),uid,sessionGeneration,loading:true};render();await reload();if(navigator.onLine) await syncNow();}
export function clearProductivityUI(){window.removeEventListener('wbs:productivity-search', handleExternalSearch);state=EMPTY();closeModal();const wrap=$('productivity-view');if(wrap)wrap.innerHTML='';}
window.addEventListener('online',()=>{if(state.uid)syncNow();});
