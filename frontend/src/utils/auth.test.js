import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authenticate, clearSession, getSession, registerUser, setSession, ADMIN_ID } from './auth';
import { getPosts, getUsers, savePosts, saveUsers } from './storage';

beforeEach(() => window.localStorage.clear());

describe('local storage helpers', () => {
  it('returns empty arrays for missing and corrupted records', () => {
    window.localStorage.setItem('writespace_posts', '{broken');
    window.localStorage.setItem('writespace_users', JSON.stringify({ users: [] }));
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
  });

  it('persists and reads post and user arrays', () => {
    const posts = [{ id: 'p1', title: 'A note' }];
    const users = [{ id: 'u1', username: 'reader' }];
    expect(savePosts(posts)).toBe(true);
    expect(saveUsers(users)).toBe(true);
    expect(getPosts()).toEqual(posts);
    expect(getUsers()).toEqual(users);
  });

  it('returns false when a non-array is passed to a save helper', () => {
    expect(savePosts({ id: 'p1' })).toBe(false);
    expect(saveUsers(null)).toBe(false);
  });

  it('falls back safely when localStorage throws', () => {
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(getPosts()).toEqual([]);
    expect(getUsers()).toEqual([]);
    getItem.mockRestore();
  });
});

describe('local identity operations', () => {
  it('authenticates the hard-coded admin before stored users', () => {
    expect(authenticate('admin', 'admin')).toEqual({ userId: ADMIN_ID, username: 'admin', displayName: 'Admin', role: 'admin' });
    expect(authenticate('admin', 'wrong')).toBeNull();
  });

  it('authenticates a registered user and rejects invalid credentials', () => {
    saveUsers([{ id: 'u1', username: 'reader', displayName: 'Reader', password: 'secret', role: 'user' }]);
    expect(authenticate('reader', 'secret')).toEqual({ userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' });
    expect(authenticate('reader', 'bad')).toBeNull();
  });

  it('registers a user and persists the complete user record', () => {
    vi.stubGlobal('crypto', { randomUUID: () => 'new-user-id' });
    vi.setSystemTime(new Date('2025-02-03T04:05:06.000Z'));
    const result = registerUser({ displayName: '  Rowan  ', username: 'rowan', password: 'secret', confirmPassword: 'secret' });
    const expectedUser = { id: 'new-user-id', displayName: 'Rowan', username: 'rowan', password: 'secret', role: 'user', createdAt: '2025-02-03T04:05:06.000Z' };
    expect(result.user).toEqual(expectedUser);
    expect(getUsers()).toEqual([expectedUser]);
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('rejects whitespace-only fields, invalid field types, mismatched passwords, and duplicate admin/usernames', () => {
    expect(registerUser({ displayName: '   ', username: 'x', password: 'a', confirmPassword: 'a' }).error).toBe('All fields are required.');
    expect(registerUser({ displayName: 'X', username: '   ', password: 'a', confirmPassword: 'a' }).error).toBe('All fields are required.');
    expect(registerUser({ displayName: 42, username: 'x', password: 'a', confirmPassword: 'a' }).error).toBe('All fields are required.');
    expect(registerUser({ displayName: 'X', username: null, password: 'a', confirmPassword: 'a' }).error).toBe('All fields are required.');
    expect(registerUser({ displayName: 'X', username: 'x', password: '', confirmPassword: 'a' }).error).toBe('All fields are required.');
    expect(registerUser({ displayName: 'X', username: 'x', password: 'a', confirmPassword: 'b' }).error).toBe('Passwords do not match.');
    expect(registerUser({ displayName: 'X', username: 'ADMIN', password: 'a', confirmPassword: 'a' }).error).toBe('That username is already taken.');
    saveUsers([{ id: 'u1', username: 'reader', password: 'x' }]);
    expect(registerUser({ displayName: 'X', username: 'READER', password: 'a', confirmPassword: 'a' }).error).toBe('That username is already taken.');
  });

  it('saves, validates, and clears the session', () => {
    const session = { userId: 'u1', username: 'reader', displayName: 'Reader', role: 'user' };
    expect(setSession(session)).toBe(true);
    expect(getSession()).toEqual(session);
    expect(clearSession()).toBe(true);
    expect(getSession()).toBeNull();
  });

  it('rejects malformed session data and handles storage exceptions', () => {
    window.localStorage.setItem('writespace_session', '{broken');
    expect(getSession()).toBeNull();
    window.localStorage.setItem('writespace_session', JSON.stringify({ username: 'reader' }));
    expect(getSession()).toBeNull();
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    expect(setSession({ userId: 'u1' })).toBe(false);
    setItem.mockRestore();
  });
});
