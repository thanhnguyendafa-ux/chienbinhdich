import { global7Unit1Set1 as set } from './data/global7-unit1-set1.js';
import { validateSet } from './data/contentValidator.js';
import { localSessionRepository as sessions } from './repositories/localSessionRepository.js';
import { createSession, submitAnswer } from './core/sessionMachine.js';

const root = document.querySelector('#app');
const contentErrors = validateSet(set);
if (contentErrors.length) throw new Error(`Invalid lesson content: ${contentErrors.join('; ')}`);
let currentStudentName = sessions.getLastStudentName();
let session = sessions.loadActive();
let feedback = null;

const screens = {
  entry: () => import('./features/entry/renderEntry.js'),
  library: () => import('./features/library/renderLibrary.js'),
  drill: () => import('./features/drill/renderDrill.js'),
  report: () => import('./features/report/renderReport.js')
};

async function showEntry() {
  const { renderEntry } = await screens.entry();
  renderEntry({ root, lastName: currentStudentName, resumeSession: session?.status === 'in_progress' ? session : null,
    onStart: async name => { currentStudentName = name; session = null; await showLibrary(); },
    onResume: showDrill });
}
async function showLibrary() {
  const { renderLibrary } = await screens.library();
  renderLibrary({ root, studentName: currentStudentName, set,
    onBegin: async () => { session = createSession({ studentName: currentStudentName, set }); sessions.saveActive(session); await showDrill(); },
    onBack: showEntry });
}
async function showDrill() {
  if (!session) return showEntry();
  if (session.status === 'completed') return showReport();
  const { renderDrill, showSuccess } = await screens.drill();
  renderDrill({ root, session, set, feedback,
    onSubmit: answer => {
      const currentItem = set.items[session.currentIndex];
      const result = submitAnswer({ session, set, answer });
      session = result.session;
      sessions.saveActive(session);
      if (result.event.type === 'incorrect') { feedback = result.event; return showDrill(); }
      feedback = null;
      showSuccess({ root, type: result.event.type, answer: currentItem.en, score: result.event.score,
        onContinue: async () => {
          if (result.event.completed) { sessions.saveReport(session); await showReport(); }
          else await showDrill();
        }
      });
    }
  });
}
async function showReport() {
  if (!session) return showEntry();
  const { renderReport } = await screens.report();
  renderReport({ root, session, set,
    onRetry: async () => { session = createSession({ studentName: session.studentName, set }); sessions.saveActive(session); await showDrill(); },
    onHome: async () => { currentStudentName = session.studentName; session = null; await showEntry(); }
  });
}
showEntry();
