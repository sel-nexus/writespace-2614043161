import { getUsers, saveUsers } from './storage';

const SESSION_KEY = 'writespace_session';
export const ADMIN_ID = 'writespace-default-admin';
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = 'admin';

/**
 * Read and validate the current browser session.
 * @returns {Object|null} Valid session data, or null when absent or malformed.
 */
export function getSession() {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || typeof session !== 'object') return null;
    const validRole = session.role === 'admin' || session.role === 'user';
    if (!session.userId || !session.username || !session.displayName || !validRole) return null;
    return session;
  } catch (error) {
    console.warn('Unable to read the local session.', error);
    return null;
  }
}

/**
 * Persist a session object in the browser.
 * @param {Object} session Session fields for the signed-in account.
 * @returns {boolean} Whether the session was saved.
 */
export function setSession(session) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return true;
  } catch (error) {
    console.warn('Unable to save the local session.', error);
    return false;
  }
}

/**
 * Remove the current browser session.
 * @returns {boolean} Whether the session was cleared.
 */
export function clearSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY);
    return true;
  } catch (error) {
    console.warn('Unable to clear the local session.', error);
    return false;
  }
}

/**
 * Authenticate the default admin or a locally registered account.
 * @param {string} username Account username.
 * @param {string} password Plain-text demo password.
 * @returns {Object|null} Session data on success, otherwise null.
 */
export function authenticate(username, password) {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    return {
      userId: ADMIN_ID,
      username: ADMIN_USERNAME,
      displayName: 'Admin',
      role: 'admin',
    };
  }
  const user = getUsers().find((entry) => entry.username === username && entry.password === password);
  if (!user) return null;
  return {
    userId: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role,
  };
}

/**
 * Register a local account after validating required fields and username uniqueness.
 * @param {Object} fields Registration form values.
 * @returns {{user?: Object, error?: string}} Created user or a user-facing validation error.
 */
export function registerUser({ displayName, username, password, confirmPassword }) {
  const cleanName = typeof displayName === 'string' ? displayName.trim() : '';
  const cleanUsername = typeof username === 'string' ? username.trim() : '';
  if (!cleanName || !cleanUsername || !password || !confirmPassword) {
    return { error: 'All fields are required.' };
  }
  if (password !== confirmPassword) return { error: 'Passwords do not match.' };
  if (cleanUsername.toLowerCase() === ADMIN_USERNAME || getUsers().some((user) => user.username.toLowerCase() === cleanUsername.toLowerCase())) {
    return { error: 'That username is already taken.' };
  }
  const user = {
    id: crypto.randomUUID(),
    displayName: cleanName,
    username: cleanUsername,
    password,
    role: 'user',
    createdAt: new Date().toISOString(),
  };
  if (!saveUsers([...getUsers(), user])) return { error: 'Unable to save your account in this browser.' };
  return { user };
}
