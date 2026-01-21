// lib/localforage-utils.ts
import localforage from 'localforage';

/**
 * Safely get an item from storage with error handling
 */
export async function getStorageItem<T>(
  key: string,
  instance = localforage,
): Promise<T | null> {
  try {
    const item = await instance.getItem<T>(key);
    return item;
  } catch (error) {
    console.error(`Error getting item ${key} from storage:`, error);
    return null;
  }
}

/**
 * Safely set an item in storage with error handling
 */
export async function setStorageItem<T>(
  key: string,
  value: T,
  instance = localforage,
): Promise<boolean> {
  try {
    await instance.setItem(key, value);
    return true;
  } catch (error) {
    console.error(`Error setting item ${key} in storage:`, error);
    return false;
  }
}

/**
 * Safely remove an item from storage
 */
export async function removeStorageItem(
  key: string,
  instance = localforage,
): Promise<boolean> {
  try {
    await instance.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing item ${key} from storage:`, error);
    return false;
  }
}

/**
 * Clear all items from storage
 */
export async function clearStorage(instance = localforage): Promise<boolean> {
  try {
    await instance.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
}

/**
 * Get all keys from storage
 */
export async function getStorageKeys(
  instance = localforage,
): Promise<string[]> {
  try {
    const keys = await instance.keys();
    return keys;
  } catch (error) {
    console.error('Error getting storage keys:', error);
    return [];
  }
}

/**
 * Check if a key exists in storage
 */
export async function hasStorageItem(
  key: string,
  instance = localforage,
): Promise<boolean> {
  try {
    const item = await instance.getItem(key);
    return item !== null;
  } catch (error) {
    console.error(`Error checking if item ${key} exists:`, error);
    return false;
  }
}

/**
 * Migrate data from localStorage to localForage
 */
export async function migrateFromLocalStorage(
  keys: string[],
  instance = localforage,
): Promise<void> {
  for (const key of keys) {
    try {
      const localStorageData = localStorage.getItem(key);
      if (localStorageData) {
        const parsedData = JSON.parse(localStorageData);
        await instance.setItem(key, parsedData);
        localStorage.removeItem(key);
        console.log(`Migrated ${key} from localStorage to localForage`);
      }
    } catch (error) {
      console.error(`Error migrating ${key}:`, error);
    }
  }
}
