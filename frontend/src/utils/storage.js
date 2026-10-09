const POSTS_KEY = 'writespace_posts';
const USERS_KEY = 'writespace_users';

/**
 * Read a JSON array from localStorage without allowing malformed data to break the app.
 * @param {string} key Storage key to read.
 * @returns {Array} Parsed array, or an empty array when storage is unavailable or invalid.
 */
function readArray(key) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.warn(`Unable to read ${key} from local storage.`, error);
    return [];
  }
}

/**
 * Persist a JSON value while keeping storage failures from crashing the interface.
 * @param {string} key Storage key to write.
 * @param {Array} value Array to serialize.
 * @returns {boolean} Whether the value was saved successfully.
 */
function writeArray(key, value) {
  if (!Array.isArray(value)) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Unable to save ${key} to local storage.`, error);
    return false;
  }
}

/**
 * Return locally stored posts, falling back to an empty collection.
 * @returns {Array} Stored post records.
 */
export function getPosts() {
  return readArray(POSTS_KEY);
}

/**
 * Save post records to localStorage.
 * @param {Array} posts Post records to persist.
 * @returns {boolean} Whether the records were saved.
 */
export function savePosts(posts) {
  return writeArray(POSTS_KEY, posts);
}

/**
 * Return locally stored users, falling back to an empty collection.
 * @returns {Array} Stored user records.
 */
export function getUsers() {
  return readArray(USERS_KEY);
}

/**
 * Save user records to localStorage.
 * @param {Array} users User records to persist.
 * @returns {boolean} Whether the records were saved.
 */
export function saveUsers(users) {
  return writeArray(USERS_KEY, users);
}
