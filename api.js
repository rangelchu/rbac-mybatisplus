// api.js - Axios service and endpoint helpers
// Using ESM axios from CDN to keep the setup pure HTML + JS
import axios from 'https://cdn.jsdelivr.net/npm/axios@1.7.7/dist/axios.esm.min.js';

const API_HOST = 'http://localhost:8080';

// We will NOT prepend a fixed basePath because the swagger file mixes paths
// with and without /api/v1. We'll call each path as authored.
const http = axios.create({
  baseURL: API_HOST,
  timeout: 15000,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' }
});

// Token management helpers
let authToken = localStorage.getItem('mt_token') || '';
export function setAuthToken(token) {
  authToken = token || '';
  if (authToken) {
    localStorage.setItem('mt_token', authToken);
  } else {
    localStorage.removeItem('mt_token');
  }
}

http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${authToken}`;
  }
  return config;
});

http.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // Bubble up 401; UI can redirect to login
    }
    return Promise.reject(error);
  }
);

function post(path, payload = {}) {
  return http.post(path, payload).then(r => r.data);
}

export const api = {
  auth: {
    login: (body) => post('/auth/login', { request: body }),
    webCertLogin: (body) => post('/auth/cert/web-login', { request: body }),
    x509Login: (body) => post('/auth/cert/x509-login', { request: body }),
    logout: () => post('/auth/logout', {}),
    me: () => post('/auth/me', {}),
    refresh: () => post('/auth/refresh', {})
  },

  languages: {
    list: () => post('/api/v1/languages/list', {}),
    create: (body) => post('/api/v1/languages/create', { request: body }),
    update: (body) => post('/api/v1/languages/update', { request: body }),
    remove: (language_code) => post('/api/v1/languages/delete', { request: { language_code } }),
    setDefault: (language_code) => post('/api/v1/languages/set-default', { request: { language_code } })
  },

  dict: {
    list: (group_key, language_code) => post('/api/v1/dictionary/list', { request: { group_key, language_code } }),
    create: (body) => post('/api/v1/dictionary/create', { request: body }),
    update: (body) => post('/api/v1/dictionary/update', { request: body }),
    remove: (id) => post('/api/v1/dictionary/delete', { request: { id } })
  },

  users: {
    list: (body = {}) => post('/users/list', { request: body }),
    create: (body) => post('/users/create', { request: body }),
    get: (id) => post('/users/get', { request: { id } }),
    update: (id, updates) => post('/users/update', { request: { id, ...updates } }),
    remove: (id) => post('/users/delete', { request: { id } }),
    changePassword: (id, old_password, new_password) => post('/users/password', { request: { id, old_password, new_password } }),
    langGet: () => post('/users/language/get', {}),
    langSet: (language_code) => post('/users/language/set', { request: { language_code } })
  },

  roles: {
    list: (body = {}) => post('/roles/list', { request: body }),
    create: (body) => post('/roles/create', { request: body }),
    get: (id) => post('/roles/get', { request: { id } }),
    update: (body) => post('/roles/update', { request: body }),
    remove: (id) => post('/roles/delete', { request: { id } }),
    assignPermissions: (role_id, permission_codes) => post('/roles/permissions/assign', { request: { role_id, permission_codes } }),
    getPermissions: (id) => post('/roles/permissions/get', { request: { id } }),
    removePermission: (role_id, permission_code) => post('/roles/permissions/remove', { request: { role_id, permission_code } })
  },

  permissions: {
    list: (body = {}) => post('/permissions/list', { request: body }),
    create: (body) => post('/permissions/create', { request: body }),
    get: (id) => post('/permissions/get', { request: { id } }),
    update: (body) => post('/permissions/update', { request: body }),
    remove: (id) => post('/permissions/delete', { request: { id } }),
    menu: (body = {}) => post('/permissions/menu', { request: body })
  },

  tenants: {
    list: (body = {}) => post('/tenants/list', { request: body }),
    create: (body) => post('/tenants/create', { request: body }),
    get: (id) => post('/tenants/get', { request: { id } }),
    update: (body) => post('/tenants/update', { request: body }),
    remove: (id) => post('/tenants/delete', { request: { id } })
  },

  certificates: {
    list: (body = {}) => post('/certificates/list', { request: body }),
    create: (body) => post('/certificates/create', { request: body }),
    remove: (certificate_id) => post('/certificates/delete', { request: { certificate_id } }),
    activate: (certificate_id, active) => post('/certificates/activate', { request: { certificate_id, active } })
  },

  images: {
    create: (image_metadata) => post('/image-metadatas/create', { image_metadata }),
    get: (id) => post('/image-metadatas/get', { request: { id } }),
    update: (id, updates) => post('/image-metadatas/update', { request: { id, updates } }),
    remove: (id) => post('/image-metadatas/delete', { request: { id } }),
    stats: () => post('/image-metadatas/stats', {})
  },

  i18n: {
    languages: () => post('/i18n/languages', {}),
    dictionary: (group_key, language_code) => post('/i18n/dictionary', { request: { group_key, language_code } }),
    message: (key, language_code) => post('/i18n/message', { request: { key, language_code } })
  }
};

export default api;

