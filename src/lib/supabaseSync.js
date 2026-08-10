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

const syncKeyToCloud = async (key, userId = currentUserId) => {
  if (!supabase || !userId || hydrating) return;

  const value = readLocal(key);
  if (value === null) {
    const { error } = await supabase
      .from('user_app_data')
      .delete()
      .eq('user_id', userId)
      .eq('data_key', key);
    if (error) console.warn('[Supabase] Data sync delete failed:', error.message);
    return;
  }

  const { error } = await supabase.from('user_app_data').upsert({
    user_id: userId,
    data_key: key,
    data: value,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,data_key' });

  if (error) console.warn('[Supabase] Data sync write failed:', error.message);
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

const uploadMissingLocalData = async (rows) => {
  const existingKeys = new Set(rows.map((row) => row.data_key));
  for (const key of SYNC_KEYS) {
    if (!existingKeys.has(key) && readLocal(key) !== null) {
      await syncKeyToCloud(key);
    }
  }
};

const hydrateFromCloud = async (rows) => {
  hydrating = true;
  try {
    for (const key of SYNC_KEYS) {
      const row = rows.find((item) => item.data_key === key);
      if (row) writeLocal(key, row.data);
      // Missing cloud keys are intentionally left untouched. They are migrated
      // after hydration so partial cloud datasets never erase local data.
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

  const { data: rows, error } = await supabase
    .from('user_app_data')
    .select('data_key,data,updated_at')
    .eq('user_id', userId);

  if (generation !== syncGeneration || userId !== currentUserId) return;

  if (error) {
    console.warn('[Supabase] Data sync read failed:', error.message);
    // Keep the current localStorage data usable and allow a later retry.
    return;
  }

  if (!rows?.length) {
    // First login: preserve the existing localStorage data by migrating it to Supabase.
    await uploadMissingLocalData([]);
  } else {
    // Existing cloud rows are authoritative for those keys on login/new device.
    await hydrateFromCloud(rows);
    // If the cloud has a partial dataset, migrate only missing local keys.
    await uploadMissingLocalData(rows);
  }

  if (generation === syncGeneration && userId === currentUserId) {
    initialized = true;
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
    if (active && data.session?.user?.id) return initializeForUser(data.session.user.id);
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
