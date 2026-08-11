import { supabase } from './supabase';

const SYNC_KEYS = [
  'tp_workouts',
  'tp_body',
  'tp_exercises',
  'tp_routines',
];

let currentUserId = null;
let hydrating = false;
let initialized = false;
let initPromise = Promise.resolve();
let cleanupSync = null;
let syncQueue = Promise.resolve();
let syncGeneration = 0;

const readLocal = (key) => {
  try {
    const value = localStorage.getItem(key);
    return value == null ? null : JSON.parse(value);
  } catch {
    return null;
  }
};

const writeLocal = (key, value) => {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Keep the app usable if localStorage is unavailable.
  }
};

const getCloudRows = async (userId) => {
  const { data, error } = await supabase
    .from('user_app_data')
    .select('data_key,data,updated_at')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
};

const syncKeyToCloud = async (key, userId = currentUserId) => {
  if (!supabase || !userId || hydrating) return false;

  const value = readLocal(key);
  if (value === null) {
    const { error } = await supabase
      .from('user_app_data')
      .delete()
      .eq('user_id', userId)
      .eq('data_key', key);
    if (error) {
      console.warn('[Supabase] Data sync delete failed:', error.message);
      return false;
    }
    return true;
  }

  const { error } = await supabase.from('user_app_data').upsert({
    user_id: userId,
    data_key: key,
    data: value,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,data_key' });

  if (error) {
    console.warn('[Supabase] Data sync write failed:', error.message);
    return false;
  }

  return true;
};

const queueSync = (key) => {
  if (!supabase || !currentUserId || hydrating) return;
  const userId = currentUserId;
  syncQueue = syncQueue
    .then(() => {
      if (userId !== currentUserId) return;
      return syncKeyToCloud(key, userId);
    })
    .catch((error) => {
      console.warn('[Supabase] Data sync queue failed:', error?.message || error);
    });
};

// Import only keys that do not already exist in Supabase. This prevents an
// older browser copy from overwriting newer cloud data on another device.
const uploadMissingLocalData = async (rows, userId = currentUserId) => {
  const existingKeys = new Set(rows.map((row) => row.data_key));
  const importedKeys = [];

  for (const key of SYNC_KEYS) {
    if (!existingKeys.has(key) && readLocal(key) !== null) {
      const ok = await syncKeyToCloud(key, userId);
      if (ok) importedKeys.push(key);
    }
  }

  return importedKeys;
};

const hydrateFromCloud = async (rows) => {
  hydrating = true;
  try {
    for (const key of SYNC_KEYS) {
      const row = rows.find((item) => item.data_key === key);
      if (row) writeLocal(key, row.data);
      // Missing cloud keys are intentionally left untouched and migrated below.
    }
  } finally {
    hydrating = false;
  }
};

const initializeForUser = async (userId) => {
  if (!supabase || !userId) return;
  if (initialized && currentUserId === userId) return;

  const generation = ++syncGeneration;
  currentUserId = userId;
  initialized = false;

  try {
    let rows = await getCloudRows(userId);

    if (generation !== syncGeneration || userId !== currentUserId) return;

    if (rows.length > 0) {
      // Cloud is authoritative for keys that already exist.
      await hydrateFromCloud(rows);
    }

    // First login, or a partially migrated account: import only missing keys.
    const importedKeys = await uploadMissingLocalData(rows, userId);

    if (importedKeys.length > 0) {
      // Re-read so the in-memory sync state reflects what was actually stored.
      rows = await getCloudRows(userId);
      console.info('[Supabase] Imported local data:', importedKeys.join(', '));
    }

    if (generation === syncGeneration && userId === currentUserId) {
      initialized = true;
    }
  } catch (error) {
    console.warn('[Supabase] Initialization failed:', error?.message || error);
    // Keep localStorage usable and allow a later explicit retry.
  }
};

export const syncMissingLocalDataNow = async () => {
  if (!supabase || !currentUserId) {
    return { ok: false, importedKeys: [], reason: 'not-authenticated' };
  }

  try {
    const rows = await getCloudRows(currentUserId);
    const importedKeys = await uploadMissingLocalData(rows, currentUserId);
    return { ok: true, importedKeys };
  } catch (error) {
    console.warn('[Supabase] Manual data import failed:', error?.message || error);
    return { ok: false, importedKeys: [], reason: error?.message || 'unknown-error' };
  }
};

const clearUser = () => {
  currentUserId = null;
  initialized = false;
  syncGeneration += 1;
};

export const waitForSupabaseSync = () => initPromise;

export const initSupabaseSync = () => {
  if (!supabase || typeof window === 'undefined') return () => {};
  if (cleanupSync) return cleanupSync;

  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function(key, value) {
    originalSetItem.call(this, key, value);
    if (this === localStorage && SYNC_KEYS.includes(key)) {
      queueMicrotask(() => queueSync(key));
    }
  };

  Storage.prototype.removeItem = function(key) {
    originalRemoveItem.call(this, key);
    if (this === localStorage && SYNC_KEYS.includes(key)) {
      queueMicrotask(() => queueSync(key));
    }
  };

  let active = true;
  initPromise = supabase.auth.getSession().then(({ data }) => {
    if (active && data.session?.user?.id) {
      return initializeForUser(data.session.user.id);
    }
    return undefined;
  });

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!active) return;
    if (session?.user?.id) {
      initPromise = initializeForUser(session.user.id);
    } else {
      clearUser();
      initPromise = Promise.resolve();
    }
  });

  cleanupSync = () => {
    active = false;
    listener.subscription.unsubscribe();
    Storage.prototype.setItem = originalSetItem;
    Storage.prototype.removeItem = originalRemoveItem;
    cleanupSync = null;
  };

  return cleanupSync;
};
