export function createLessonPreviewController({ loadLesson, onChange }) {
  let requestId = 0;
  let state = Object.freeze({ status: 'idle', setId: null, lesson: null, error: null });

  const publish = next => {
    state = Object.freeze(next);
    onChange?.(state);
  };

  return Object.freeze({
    getState() {
      return state;
    },

    async select(setId) {
      const currentRequest = ++requestId;
      publish({ status: 'loading', setId, lesson: null, error: null });
      try {
        const lesson = await loadLesson(setId);
        if (currentRequest !== requestId) return;
        publish({ status: 'ready', setId, lesson, error: null });
      } catch (error) {
        if (currentRequest !== requestId) return;
        publish({ status: 'error', setId, lesson: null, error });
      }
    },

    clear() {
      requestId += 1;
      publish({ status: 'idle', setId: null, lesson: null, error: null });
    }
  });
}
