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

const syncKeyToCloud = async (key) => {
  if (!supabase || !currentUserId || hydrating) return;

  const value = readLocal(key);
  if (value === null) {
    await supabase
      .from('user_app_data')
      .delete()
      .eq('user_id', currentUserId)
      .eq('data_key', key);
    return;
  }

  await supabase.from('user_app_data').upsert({
    user_id: currentUserId,
    data_key: key,
    data: value,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,data_key' });
};

const uploadLocalData = async () => {
  for (const key of SYNC_KEYS) await syncKeyToCloud(key);
};

const hydrateFromCloud = async (rows) => {
  hydrating = true;
  try {
    for (const key of SYNC_KEYS) {
      const row = rows.find((item) => item.data_key === key);
      if (row) writeLocal(key, row.data);
    }
  } finally {
    hydrating = false;
  }
};

const initializeForUser = async (userId) => {
  if (!supabase || !userId || initialized && currentUserId === userId) return;

  currentUserId = userId;
  initialized = true;

  const { data: rows, error } = await supabase
    .from('user_app_data')
    .select('data_key,data,updated_at')
    .eq('user_id', userId);

  if (error) {
    console.warn('[Supabase] Data sync read failed:', error.message);
    return;
  }

  if (!rows?.length) {
    // First login: preserve the existing localStorage data by migrating it to Supabase.
    await uploadLocalData();
  } else {
    // Existing cloud data is authoritative when logging in on a new device.
    await hydrateFromCloud(rows);
  }
};

const clearUser = () => {
  currentUserId = null;
  initialized = false;
};

export const initSupabaseSync = () => {
  if (!supabase || typeof window === 'undefined') return () => {};

  const originalSetItem = Storage.prototype.setItem;
  const originalRemoveItem = Storage.prototype.removeItem;

  Storage.prototype.setItem = function(key, value) {
    originalSetItem.call(this, key, value);
    if (this === localStorage && SYNC_KEYS.includes(key)) {
      queueMicrotask(() => syncKeyToCloud(key).catch((error) => {
        console.warn('[Supabase] Data sync write failed:', error.message);
      }));
    }
  };

  Storage.prototype.removeItem = function(key) {
    originalRemoveItem.call(this, key);
    if (this === localStorage && SYNC_KEYS.includes(key)) {
      queueMicrotask(() => syncKeyToCloud(key).catch((error) => {
        console.warn('[Supabase] Data sync delete failed:', error.message);
      }));
    }
  };

  let active = true;
  supabase.auth.getSession().then(({ data }) => {
    if (active && data.session?.user?.id) initializeForUser(data.session.user.id);
  });

  const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
    if (!active) return;
    if (session?.user?.id) initializeForUser(session.user.id);
    else clearUser();
  });

  return () => {
    active = false;
    listener.subscription.unsubscribe();
    Storage.prototype.setItem = originalSetItem;
    Storage.prototype.removeItem = originalRemoveItem;
  };
};
