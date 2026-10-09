const SESSION_EVENT = 'writespace-session-change';

/**
 * Notify mounted components that the local session changed.
 * @returns {void}
 */
export function notifySessionChange() {
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export { SESSION_EVENT };
