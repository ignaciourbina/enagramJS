// Storage polyfill — provides window.storage using localStorage
// This bridges the app's window.storage.get/set/delete API
// to the browser's localStorage.

const storage = {
  async get(key) {
    const value = localStorage.getItem(key);
    return value !== null ? { value } : null;
  },

  async set(key, value) {
    localStorage.setItem(key, value);
  },

  async delete(key) {
    localStorage.removeItem(key);
  },
};

if (!window.storage) {
  window.storage = storage;
}

export default storage;
