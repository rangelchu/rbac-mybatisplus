// app.js - Vue 3 SPA (no build tools)
import { createApp, ref, reactive, computed, onMounted, watch } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import api, { api as namedApi, setAuthToken } from './api.js';

// Simple event bus for toasts
const toasts = ref([]);
function notify(message, type = 'success', timeoutMs = 2400) {
  const id = Math.random().toString(36).slice(2);
  toasts.value.push({ id, message, type });
  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }, timeoutMs);
}

// App state
const state = reactive({
  token: localStorage.getItem('mt_token') || '',
  user: null,
  tenant: null,
  route: 'login',
});

function go(route) {
  window.location.hash = `#/${route}`;
}
function currentRoute() {
  const raw = window.location.hash.replace(/^#\//, '').trim();
  return raw || (state.token ? 'dashboard' : 'login');
}

function requireAuth() {
  if (!state.token && state.route !== 'login') {
    go('login');
  }
}

// Header component
const AppHeader = {
  name: 'AppHeader',
  props: ['user', 'tenant'],
  emits: ['logout'],
  template: `
    <header class="app-header">
      <div class="brand">
        <div class="mark"></div>
        <div class="name">Multi‑Tenant Platform</div>
      </div>
      <div class="actions">
        <div v-if="tenant" class="tag">租户：{{ tenant.tenant_name || tenant.tenant_code || '—' }}</div>
        <div v-if="user" class="tag">用户：{{ user.username }}</div>
        <button v-if="user" class="btn ghost" @click="$emit('logout')">退出</button>
        <div class="avatar" v-if="user"></div>
      </div>
    </header>
  `
};

// Sidebar component
const Sidebar = {
  name: 'Sidebar',
  props: ['active'],
  setup() {
    const items = [
      { key: 'dashboard', name: '仪表盘', icon: '📊' },
      { key: 'languages', name: '语言', icon: '🌐' },
      { key: 'dictionary', name: '数据字典', icon: '📚' },
      { key: 'users', name: '用户', icon: '👤' },
      { key: 'roles', name: '角色', icon: '🧩' },
      { key: 'permissions', name: '权限', icon: '🔐' },
      { key: 'tenants', name: '租户', icon: '🏢' },
      { key: 'certs', name: '证书', icon: '🎫' },
      { key: 'images', name: '图片元数据', icon: '🖼️' },
    ];
    return { items };
  },
  methods: { go },
  template: `
    <aside class="app-sidebar">
      <nav class="nav">
        <a v-for="it in items" :key="it.key" class="nav-item" :class="{ active: active === it.key }" @click.prevent="go(it.key)" href="#">
          <span class="icon">{{ it.icon }}</span>
          <span>{{ it.name }}</span>
        </a>
      </nav>
    </aside>
  `
};

// Login view
const LoginView = {
  name: 'LoginView',
  setup() {
    const form = reactive({ username: '', password: '', tenant_code: '' });
    const loading = ref(false);
    const submit = async () => {
      if (loading.value) return;
      loading.value = true;
      try {
        const data = await api.auth.login({ username: form.username, password: form.password, tenant_code: form.tenant_code });
        const token = data?.token;
        if (!token) throw new Error('未返回令牌');
        setAuthToken(token);
        state.token = token;
        state.user = data?.user || null;
        state.tenant = data?.tenant || null;
        notify('登录成功', 'success');
        go('dashboard');
      } catch (e) {
        console.error(e);
        notify('登录失败，请检查账号信息', 'error');
      } finally {
        loading.value = false;
      }
    };
    return { form, loading, submit };
  },
  template: `
    <div class="app-shell">
      <Sidebar :active="'login'" />
      <AppHeader />
      <main class="app-main">
        <div class="panel" style="max-width:720px;margin:0 auto;">
          <div class="panel-header">
            <div class="panel-title">登录</div>
          </div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-6">
                <label class="field">
                  <span class="label">用户名</span>
                  <input class="input" v-model="form.username" placeholder="请输入用户名" autocomplete="username" />
                </label>
              </div>
              <div class="col-6">
                <label class="field">
                  <span class="label">租户代码</span>
                  <input class="input" v-model="form.tenant_code" placeholder="如: default" />
                </label>
              </div>
              <div class="col-12">
                <label class="field">
                  <span class="label">密码</span>
                  <input class="input" type="password" v-model="form.password" placeholder="请输入密码" autocomplete="current-password" />
                </label>
              </div>
              <div class="col-12 btn-row">
                <button class="btn primary" :disabled="loading" @click="submit">{{ loading? '登录中…' : '登录' }}</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  components: { AppHeader, Sidebar }
};

// Dashboard view
const DashboardView = {
  name: 'DashboardView',
  setup() {
    const cards = [
      { k: 'languages', name: '语言', desc: '系统支持的语言管理', icon: '🌐' },
      { k: 'dictionary', name: '数据字典', desc: '多语言字典项管理', icon: '📚' },
      { k: 'users', name: '用户', desc: '用户与偏好管理', icon: '👤' },
      { k: 'roles', name: '角色', desc: '角色与数据权限', icon: '🧩' },
      { k: 'permissions', name: '权限', desc: '菜单与权限配置', icon: '🔐' },
      { k: 'tenants', name: '租户', desc: '多租户管理', icon: '🏢' },
      { k: 'certs', name: '证书', desc: '客户端证书管理', icon: '🎫' },
      { k: 'images', name: '图片元数据', desc: '影像信息与统计', icon: '🖼️' },
    ];
    return { cards, go };
  },
  template: `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">仪表盘</div>
      </div>
      <div class="panel-body">
        <div class="form-grid">
          <div v-for="c in cards" :key="c.k" class="col-4">
            <div class="panel" style="padding:16px; cursor:pointer;" @click="go(c.k)">
              <div style="display:flex; align-items:center; gap:10px;">
                <div class="tag">{{ c.icon }}</div>
                <div style="font-weight:700;">{{ c.name }}</div>
              </div>
              <div style="color:var(--text-dim); margin-top:6px;">{{ c.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
};

// Languages view
const LanguagesView = {
  name: 'LanguagesView',
  setup() {
    const list = ref([]);
    const loading = ref(false);
    const form = reactive({ language_code: '', language_name: '', is_active: true, is_default: false, sort_order: 0 });
    const editing = ref(null); // store original language_code for update

    const fetchList = async () => {
      loading.value = true;
      try {
        const data = await api.languages.list();
        // the API returns an object; try common shapes
        const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
        list.value = items;
      } catch (e) {
        notify('加载语言失败', 'error');
      } finally { loading.value = false; }
    };

    const resetForm = () => {
      editing.value = null;
      form.language_code = '';
      form.language_name = '';
      form.is_active = true;
      form.is_default = false;
      form.sort_order = 0;
    };

    const submit = async () => {
      try {
        if (editing.value) {
          await api.languages.update({ language_code: editing.value, language_name: form.language_name, is_active: form.is_active, is_default: form.is_default, sort_order: form.sort_order });
          notify('语言已更新');
        } else {
          await api.languages.create({ language_code: form.language_code, language_name: form.language_name, is_active: form.is_active, is_default: form.is_default, sort_order: form.sort_order });
          notify('语言已创建');
        }
        resetForm();
        fetchList();
      } catch (e) {
        notify('保存失败', 'error');
      }
    };

    const editRow = (row) => {
      editing.value = row.language_code;
      form.language_code = row.language_code; // shown disabled
      form.language_name = row.language_name;
      form.is_active = !!row.is_active;
      form.is_default = !!row.is_default;
      form.sort_order = row.sort_order || 0;
    };

    const remove = async (code) => {
      if (!confirm(`确认删除语言 ${code} ?`)) return;
      try { await api.languages.remove(code); notify('已删除'); fetchList(); } catch (e) { notify('删除失败', 'error'); }
    };

    const setDefault = async (code) => {
      try { await api.languages.setDefault(code); notify('已设为默认'); fetchList(); } catch (e) { notify('操作失败', 'error'); }
    };

    onMounted(fetchList);
    return { list, form, editing, loading, submit, editRow, remove, resetForm, setDefault };
  },
  template: `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">语言管理</div>
        <div class="btn-row">
          <button class="btn ghost" @click="resetForm">新建</button>
          <button class="btn" @click="(() => fetchList())()">刷新</button>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid" style="margin-bottom:12px;">
          <div class="col-3">
            <label class="field">
              <span class="label">语言代码</span>
              <input class="input" v-model="form.language_code" :disabled="editing" placeholder="如 zh-CN" />
            </label>
          </div>
          <div class="col-3">
            <label class="field">
              <span class="label">语言名称</span>
              <input class="input" v-model="form.language_name" placeholder="如 简体中文" />
            </label>
          </div>
          <div class="col-3">
            <label class="field"><span class="label">激活</span>
              <select class="select" v-model="form.is_active"><option :value="true">是</option><option :value="false">否</option></select>
            </label>
          </div>
          <div class="col-3">
            <label class="field"><span class="label">默认</span>
              <select class="select" v-model="form.is_default"><option :value="true">是</option><option :value="false">否</option></select>
            </label>
          </div>
          <div class="col-3">
            <label class="field"><span class="label">排序</span>
              <input class="input" type="number" v-model.number="form.sort_order" />
            </label>
          </div>
          <div class="col-12 btn-row">
            <button class="btn primary" @click="submit">{{ editing ? '保存修改' : '创建语言' }}</button>
          </div>
        </div>

        <div class="panel" style="overflow:auto;">
          <table class="table">
            <thead>
              <tr><th>代码</th><th>名称</th><th>激活</th><th>默认</th><th>排序</th><th style="width:220px;">操作</th></tr>
            </thead>
            <tbody>
              <tr v-for="row in list" :key="row.language_code">
                <td>{{ row.language_code }}</td>
                <td>{{ row.language_name }}</td>
                <td>{{ row.is_active ? '是' : '否' }}</td>
                <td>{{ row.is_default ? '是' : '否' }}</td>
                <td>{{ row.sort_order ?? 0 }}</td>
                <td class="btn-row">
                  <button class="btn" @click="editRow(row)">编辑</button>
                  <button class="btn" @click="setDefault(row.language_code)">设为默认</button>
                  <button class="btn danger" @click="remove(row.language_code)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
};

// Dictionary view
const DictionaryView = {
  name: 'DictionaryView',
  setup() {
    const query = reactive({ group_key: '', language_code: '' });
    const items = ref([]);
    const loading = ref(false);
    const form = reactive({ id: null, group_key: '', item_key: '', item_value: '', language_code: '', description: '', sort_order: 0, is_default: false, flag_icon: '' });
    const editing = ref(false);

    const fetchItems = async () => {
      if (!query.group_key) { items.value = []; return; }
      loading.value = true;
      try {
        const data = await api.dict.list(query.group_key, query.language_code || undefined);
        const arr = Array.isArray(data?.items) ? data.items : (Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []));
        items.value = arr;
      } catch (e) {
        notify('获取字典失败', 'error');
      } finally { loading.value = false; }
    };

    const editRow = (row) => {
      editing.value = true;
      form.id = row.id;
      form.group_key = row.group_key;
      form.item_key = row.item_key;
      form.item_value = row.item_value;
      form.language_code = row.language_code;
      form.description = row.description || '';
      form.sort_order = row.sort_order || 0;
      form.is_default = !!row.is_default;
      form.flag_icon = row.flag_icon || '';
    };

    const resetForm = () => {
      editing.value = false;
      form.id = null;
      form.group_key = query.group_key;
      form.item_key = '';
      form.item_value = '';
      form.language_code = query.language_code || '';
      form.description = '';
      form.sort_order = 0;
      form.is_default = false;
      form.flag_icon = '';
    };

    const submit = async () => {
      try {
        if (editing.value && form.id) {
          await api.dict.update({ id: form.id, item_value: form.item_value, description: form.description, is_default: form.is_default, sort_order: form.sort_order, flag_icon: form.flag_icon });
          notify('字典项已更新');
        } else {
          await api.dict.create({ group_key: form.group_key, item_key: form.item_key, item_value: form.item_value, language_code: form.language_code, description: form.description, is_default: form.is_default, sort_order: form.sort_order, flag_icon: form.flag_icon });
          notify('字典项已创建');
        }
        resetForm();
        fetchItems();
      } catch (e) {
        notify('保存失败', 'error');
      }
    };

    const remove = async (id) => {
      if (!confirm('确认删除该字典项？')) return;
      try { await api.dict.remove(id); notify('已删除'); fetchItems(); } catch (e) { notify('删除失败', 'error'); }
    };

    return { query, items, loading, form, editing, fetchItems, editRow, resetForm, submit, remove };
  },
  template: `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">数据字典</div>
        <div class="btn-row">
          <button class="btn" @click="fetchItems">查询</button>
          <button class="btn ghost" @click="resetForm">新建</button>
        </div>
      </div>
      <div class="panel-body">
        <div class="form-grid" style="margin-bottom:12px;">
          <div class="col-4">
            <label class="field"><span class="label">组键 group_key</span>
              <input class="input" v-model="query.group_key" placeholder="如: app.locale" />
            </label>
          </div>
          <div class="col-3">
            <label class="field"><span class="label">语言代码</span>
              <input class="input" v-model="query.language_code" placeholder="可选，如 zh-CN" />
            </label>
          </div>
          <div class="col-12 btn-row">
            <button class="btn" @click="fetchItems">获取字典</button>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">{{ editing ? '编辑字典项' : '新建字典项' }}</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-3">
                <label class="field"><span class="label">组键</span>
                  <input class="input" v-model="form.group_key" :disabled="editing" />
                </label>
              </div>
              <div class="col-3">
                <label class="field"><span class="label">项键</span>
                  <input class="input" v-model="form.item_key" :disabled="editing" />
                </label>
              </div>
              <div class="col-3">
                <label class="field"><span class="label">语言</span>
                  <input class="input" v-model="form.language_code" :disabled="editing" />
                </label>
              </div>
              <div class="col-3">
                <label class="field"><span class="label">排序</span>
                  <input type="number" class="input" v-model.number="form.sort_order" />
                </label>
              </div>
              <div class="col-6">
                <label class="field"><span class="label">值</span>
                  <input class="input" v-model="form.item_value" />
                </label>
              </div>
              <div class="col-6">
                <label class="field"><span class="label">描述</span>
                  <input class="input" v-model="form.description" />
                </label>
              </div>
              <div class="col-3">
                <label class="field"><span class="label">默认</span>
                  <select class="select" v-model="form.is_default"><option :value="true">是</option><option :value="false">否</option></select>
                </label>
              </div>
              <div class="col-3">
                <label class="field"><span class="label">旗帜图标</span>
                  <input class="input" v-model="form.flag_icon" placeholder="可选，如 🇨🇳" />
                </label>
              </div>
              <div class="col-12 btn-row">
                <button class="btn primary" @click="submit">{{ editing ? '保存' : '创建' }}</button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel" style="overflow:auto;">
          <table class="table">
            <thead><tr><th>ID</th><th>组键</th><th>项键</th><th>语言</th><th>值</th><th>默认</th><th>排序</th><th style="width:180px;">操作</th></tr></thead>
            <tbody>
              <tr v-for="row in items" :key="row.id || (row.group_key + row.item_key + (row.language_code||''))">
                <td>{{ row.id ?? '—' }}</td>
                <td>{{ row.group_key }}</td>
                <td>{{ row.item_key }}</td>
                <td>{{ row.language_code || '—' }}</td>
                <td>{{ row.item_value }}</td>
                <td>{{ row.is_default ? '是' : '否' }}</td>
                <td>{{ row.sort_order ?? 0 }}</td>
                <td class="btn-row">
                  <button class="btn" @click="editRow(row)">编辑</button>
                  <button class="btn danger" v-if="row.id" @click="remove(row.id)">删除</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
};

// Helper to parse arrays from various response shapes
function toArray(maybe) {
  if (Array.isArray(maybe)) return maybe;
  if (Array.isArray(maybe?.items)) return maybe.items;
  if (Array.isArray(maybe?.data)) return maybe.data;
  if (maybe && typeof maybe === 'object') {
    // try first array-ish property
    for (const k of Object.keys(maybe)) {
      if (Array.isArray(maybe[k])) return maybe[k];
    }
  }
  return [];
}

// Users Management
const UsersView = {
  name: 'UsersView',
  setup() {
    const list = ref([]);
    const loading = ref(false);
    const filters = reactive({ search: '' });
    const form = reactive({ id: null, username: '', email: '', default_language: '', is_active: true, role_id: null, tenant_id: null, password: '' });
    const changingPwd = reactive({ id: null, old_password: '', new_password: '' });

    const fetchList = async () => {
      loading.value = true;
      try {
        const data = await api.users.list({ search: filters.search || undefined });
        list.value = toArray(data);
      } catch (e) { notify('加载用户失败', 'error'); } finally { loading.value = false; }
    };

    const resetForm = () => {
      form.id = null; form.username = ''; form.email = ''; form.default_language = ''; form.is_active = true; form.role_id = null; form.tenant_id = null; form.password = '';
    };
    const editRow = (row) => {
      form.id = row.id; form.username = row.username; form.email = row.email || ''; form.default_language = row.default_language || ''; form.is_active = !!row.is_active; form.role_id = row.role_id || null; form.tenant_id = row.tenant_id || null; form.password = '';
    };
    const submit = async () => {
      try {
        if (form.id) {
          const { id, password, ...updates } = form;
          await api.users.update(id, updates);
          notify('用户已更新');
        } else {
          if (!form.username || !form.password || !form.tenant_id) { notify('请填写用户名/密码/租户ID', 'error'); return; }
          await api.users.create({ username: form.username, password: form.password, tenant_id: Number(form.tenant_id), email: form.email || undefined, default_language: form.default_language || undefined, role_id: form.role_id ? Number(form.role_id) : undefined });
          notify('用户已创建');
        }
        resetForm(); fetchList();
      } catch (e) { notify('保存失败', 'error'); }
    };
    const remove = async (id) => { if (!confirm('确认删除该用户?')) return; try { await api.users.remove(id); notify('已删除'); fetchList(); } catch { notify('删除失败','error'); } };
    const changePwd = async () => { if (!changingPwd.id || !changingPwd.old_password || !changingPwd.new_password) { notify('请完整填写修改密码表单','error'); return; } try { await api.users.changePassword(Number(changingPwd.id), changingPwd.old_password, changingPwd.new_password); notify('密码已修改'); changingPwd.id=null; changingPwd.old_password=''; changingPwd.new_password=''; } catch { notify('修改失败','error'); } };
    const userLang = ref('');
    const loadUserLang = async () => { try { const data = await api.users.langGet(); userLang.value = (data?.language_code) || JSON.stringify(data); } catch {} };
    const setUserLang = async (code) => { try { await api.users.langSet(code); notify('语言已更新'); loadUserLang(); } catch { notify('设置失败','error'); } };

    onMounted(() => { fetchList(); loadUserLang(); });
    return { list, loading, filters, form, submit, resetForm, editRow, remove, changingPwd, changePwd, userLang, setUserLang };
  },
  template: `
    <div class="panel">
      <div class="panel-header">
        <div class="panel-title">用户管理</div>
        <div class="btn-row">
          <button class="btn" @click="(() => $emit?.('refresh')) && 0;"> </button>
        </div>
      </div>
      <div class="panel-body">
        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">查询</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-6"><label class="field"><span class="label">搜索</span><input class="input" v-model="filters.search" placeholder="用户名/邮箱" /></label></div>
              <div class="col-12 btn-row"><button class="btn" @click="$emit;"> </button><button class="btn" @click="(() => {})()"> </button><button class="btn" @click="()=>{}"> </button><button class="btn" @click="(()=>{})()"> </button><button class="btn" @click="(()=>{})()"> </button><button class="btn" @click="(()=>{})()"> </button><button class="btn" @click="(()=>{})()"> </button></div>
              <div class="col-12 btn-row"><button class="btn" @click="()=>{}"> </button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">{{ form.id ? '编辑用户' : '新建用户' }}</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-3"><label class="field"><span class="label">用户名</span><input class="input" v-model="form.username" :disabled="!!form.id"/></label></div>
              <div class="col-3" v-if="!form.id"><label class="field"><span class="label">密码</span><input class="input" type="password" v-model="form.password"/></label></div>
              <div class="col-3"><label class="field"><span class="label">租户ID</span><input class="input" type="number" v-model.number="form.tenant_id" :disabled="!!form.id"/></label></div>
              <div class="col-3"><label class="field"><span class="label">角色ID</span><input class="input" type="number" v-model.number="form.role_id"/></label></div>
              <div class="col-4"><label class="field"><span class="label">邮箱</span><input class="input" v-model="form.email"/></label></div>
              <div class="col-4"><label class="field"><span class="label">默认语言</span><input class="input" v-model="form.default_language"/></label></div>
              <div class="col-4"><label class="field"><span class="label">激活</span><select class="select" v-model="form.is_active"><option :value="true">是</option><option :value="false">否</option></select></label></div>
              <div class="col-12 btn-row"><button class="btn primary" @click="submit">{{ form.id? '保存' : '创建' }}</button><button class="btn ghost" @click="resetForm">重置</button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">修改密码</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-3"><label class="field"><span class="label">用户ID</span><input class="input" type="number" v-model.number="changingPwd.id"/></label></div>
              <div class="col-4"><label class="field"><span class="label">旧密码</span><input class="input" type="password" v-model="changingPwd.old_password"/></label></div>
              <div class="col-4"><label class="field"><span class="label">新密码</span><input class="input" type="password" v-model="changingPwd.new_password"/></label></div>
              <div class="col-12 btn-row"><button class="btn" @click="changePwd">提交</button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">当前用户语言设置</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-4"><div class="tag">当前：{{ userLang || '未知' }}</div></div>
              <div class="col-4"><label class="field"><span class="label">设置语言代码</span><input class="input" @keyup.enter="setUserLang($event.target.value)" placeholder="如 zh-CN，回车提交"/></label></div>
            </div>
          </div>
        </div>

        <div class="panel" style="overflow:auto;">
          <table class="table">
            <thead><tr><th>ID</th><th>用户名</th><th>邮箱</th><th>语言</th><th>租户</th><th>角色</th><th>激活</th><th style="width:180px;">操作</th></tr></thead>
            <tbody>
              <tr v-for="u in list" :key="u.id">
                <td>{{ u.id }}</td>
                <td>{{ u.username }}</td>
                <td>{{ u.email || '—' }}</td>
                <td>{{ u.default_language || '—' }}</td>
                <td>{{ u.tenant_id || (u.tenant && u.tenant.id) || '—' }}</td>
                <td>{{ u.role_id || (u.role && u.role.id) || '—' }}</td>
                <td>{{ u.is_active ? '是' : '否' }}</td>
                <td class="btn-row"><button class="btn" @click="editRow(u)">编辑</button><button class="btn danger" @click="remove(u.id)">删除</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
};

// Roles Management
const RolesView = {
  name: 'RolesView',
  setup() {
    const list = ref([]);
    const loading = ref(false);
    const filters = reactive({ search: '', tenant_id: null });
    const form = reactive({ id: null, role_name: '', is_active: true, tenant_id: null });
    const selectedRoleId = ref(null);
    const rolePerms = ref([]);
    const allPerms = ref([]);
    const assignCodes = ref('');

    const fetchList = async () => {
      loading.value = true;
      try { const data = await api.roles.list({ search: filters.search || undefined, tenant_id: filters.tenant_id ? Number(filters.tenant_id) : undefined }); list.value = toArray(data); } catch { notify('加载角色失败','error'); } finally { loading.value = false; }
    };
    const resetForm = () => { form.id=null; form.role_name=''; form.is_active=true; form.tenant_id=null; };
    const editRow = (r) => { form.id=r.id; form.role_name=r.role_name; form.is_active=!!r.is_active; form.tenant_id=r.tenant_id || null; };
    const submit = async () => { try { if (form.id) { await api.roles.update({ id: form.id, role_name: form.role_name, is_active: form.is_active }); notify('角色已更新'); } else { if (!form.role_name || !form.tenant_id) { notify('请填写名称与租户ID','error'); return; } await api.roles.create({ role_name: form.role_name, tenant_id: Number(form.tenant_id) }); notify('角色已创建'); } resetForm(); fetchList(); } catch { notify('保存失败','error'); } };
    const remove = async (id) => { if (!confirm('确认删除该角色?')) return; try { await api.roles.remove(id); notify('已删除'); fetchList(); } catch { notify('删除失败','error'); } };

    const fetchAllPerms = async () => { try { const data = await api.permissions.list({ page_size: 1000 }); allPerms.value = toArray(data); } catch { allPerms.value = []; } };
    const loadRolePerms = async (id) => { selectedRoleId.value = id; try { const data = await api.roles.getPermissions(id); rolePerms.value = toArray(data); } catch { rolePerms.value = []; } };
    const assign = async () => { if (!selectedRoleId.value) { notify('请选择角色','error'); return; } const codes = assignCodes.value.split(',').map(s=>s.trim()).filter(Boolean); if (!codes.length) { notify('请输入权限编码','error'); return; } try { await api.roles.assignPermissions(Number(selectedRoleId.value), codes); notify('已分配'); assignCodes.value=''; loadRolePerms(Number(selectedRoleId.value)); } catch { notify('分配失败','error'); } };
    const removePerm = async (code) => { if (!selectedRoleId.value) return; try { await api.roles.removePermission(Number(selectedRoleId.value), code); notify('已移除'); loadRolePerms(Number(selectedRoleId.value)); } catch { notify('操作失败','error'); } };

    onMounted(() => { fetchList(); fetchAllPerms(); });
    return { list, loading, filters, form, editRow, resetForm, submit, remove, selectedRoleId, rolePerms, allPerms, loadRolePerms, assignCodes, assign, removePerm };
  },
  template: `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">角色管理</div></div>
      <div class="panel-body">
        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">查询</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-4"><label class="field"><span class="label">搜索</span><input class="input" v-model="filters.search"/></label></div>
              <div class="col-3"><label class="field"><span class="label">租户ID</span><input class="input" type="number" v-model.number="filters.tenant_id"/></label></div>
              <div class="col-12 btn-row"><button class="btn" @click="(()=>{})()"> </button><button class="btn" @click="(()=>{})()"> </button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">{{ form.id? '编辑角色' : '新建角色' }}</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-4"><label class="field"><span class="label">角色名称</span><input class="input" v-model="form.role_name"/></label></div>
              <div class="col-3"><label class="field"><span class="label">租户ID</span><input class="input" type="number" v-model.number="form.tenant_id" :disabled="!!form.id"/></label></div>
              <div class="col-3"><label class="field"><span class="label">激活</span><select class="select" v-model="form.is_active"><option :value="true">是</option><option :value="false">否</option></select></label></div>
              <div class="col-12 btn-row"><button class="btn primary" @click="submit">{{ form.id? '保存' : '创建' }}</button><button class="btn ghost" @click="resetForm">重置</button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">权限分配</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-3"><label class="field"><span class="label">选择角色ID</span><input class="input" type="number" @change="loadRolePerms($event.target.value)" placeholder="输入ID回车"/></label></div>
              <div class="col-9"><label class="field"><span class="label">权限编码（逗号分隔）</span><input class="input" v-model="assignCodes" placeholder="如: sys.user.view,sys.user.edit"/></label></div>
              <div class="col-12 btn-row"><button class="btn" @click="assign">分配</button></div>
              <div class="col-12">
                <div class="panel" style="overflow:auto;">
                  <table class="table"><thead><tr><th>已分配权限编码</th><th style="width:120px;">操作</th></tr></thead><tbody>
                    <tr v-for="p in rolePerms" :key="p.permission_code"><td>{{ p.permission_code }}</td><td class="btn-row"><button class="btn danger" @click="removePerm(p.permission_code)">移除</button></td></tr>
                  </tbody></table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="panel" style="overflow:auto;">
          <table class="table"><thead><tr><th>ID</th><th>名称</th><th>租户</th><th>激活</th><th style="width:180px;">操作</th></tr></thead><tbody>
            <tr v-for="r in list" :key="r.id"><td>{{ r.id }}</td><td>{{ r.role_name }}</td><td>{{ r.tenant_id || (r.tenant && r.tenant.id) || '—' }}</td><td>{{ r.is_active? '是':'否' }}</td><td class="btn-row"><button class="btn" @click="editRow(r)">编辑</button><button class="btn danger" @click="remove(r.id)">删除</button></td></tr>
          </tbody></table>
        </div>
      </div>
    </div>
  `
};

// Permissions Management
const PermissionsView = {
  name: 'PermissionsView',
  setup() {
    const list = ref([]);
    const loading = ref(false);
    const filters = reactive({ search: '', language_code: '' });
    const form = reactive({ mode: 'create', id: null, permission_code: '', is_menu: false, is_active: true, parent_code: '', route_path: '', component_name: '', sort_order: 0, icon: '', icon_style: '', menu_group: '', translation_language: '', permission_name: '', menu_title: '', description: '' });

    const fetchList = async () => { loading.value = true; try { const data = await api.permissions.list({ search: filters.search || undefined, language_code: filters.language_code || undefined, page_size: 1000 }); list.value = toArray(data); } catch { notify('加载权限失败','error'); } finally { loading.value = false; } };
    const resetForm = () => { form.mode='create'; form.id=null; form.permission_code=''; form.is_menu=false; form.is_active=true; form.parent_code=''; form.route_path=''; form.component_name=''; form.sort_order=0; form.icon=''; form.icon_style=''; form.menu_group=''; form.translation_language=''; form.permission_name=''; form.menu_title=''; form.description=''; };
    const editRow = (r) => { form.mode='update'; form.id=r.id; form.permission_code=r.permission_code; form.is_menu=!!r.is_menu; form.is_active=!!r.is_active; form.parent_code=r.parent_code||''; form.route_path=r.route_path||''; form.component_name=r.component_name||''; form.sort_order=r.sort_order||0; form.icon=r.icon||''; form.icon_style=r.icon_style||''; form.menu_group=r.menu_group||''; form.translation_language=r.language_code||''; form.permission_name=r.permission_name||''; form.menu_title=r.menu_title||''; form.description=r.description||''; };
    const submit = async () => {
      try {
        const translations = form.permission_name ? [{ language_code: form.translation_language || 'zh-CN', permission_name: form.permission_name, menu_title: form.menu_title || undefined, description: form.description || undefined }] : undefined;
        if (form.mode === 'create') {
          if (!form.permission_code || !translations) { notify('请填写编码及名称','error'); return; }
          await api.permissions.create({ permission_code: form.permission_code, is_menu: form.is_menu, is_active: form.is_active, parent_code: form.parent_code || undefined, route_path: form.route_path || undefined, component_name: form.component_name || undefined, icon: form.icon || undefined, icon_style: form.icon_style || undefined, sort_order: form.sort_order || undefined, menu_group: form.menu_group || undefined, translations });
          notify('权限已创建');
        } else {
          await api.permissions.update({ permission_code: form.permission_code, is_menu: form.is_menu, is_active: form.is_active, parent_code: form.parent_code || undefined, route_path: form.route_path || undefined, component_name: form.component_name || undefined, icon: form.icon || undefined, icon_style: form.icon_style || undefined, sort_order: form.sort_order || undefined, menu_group: form.menu_group || undefined, translations });
          notify('权限已更新');
        }
        resetForm(); fetchList();
      } catch { notify('保存失败','error'); }
    };
    const remove = async (id) => { if (!confirm('确认删除该权限?')) return; try { await api.permissions.remove(id); notify('已删除'); fetchList(); } catch { notify('删除失败','error'); } };

    onMounted(fetchList);
    return { list, loading, filters, form, resetForm, editRow, submit, remove, fetchList };
  },
  template: `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">权限管理</div></div>
      <div class="panel-body">
        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">查询</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-4"><label class="field"><span class="label">搜索</span><input class="input" v-model="filters.search"/></label></div>
              <div class="col-3"><label class="field"><span class="label">语言代码</span><input class="input" v-model="filters.language_code"/></label></div>
              <div class="col-12 btn-row"><button class="btn" @click="fetchList">查询</button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">{{ form.mode==='create'? '新建权限' : '编辑权限' }}</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-3"><label class="field"><span class="label">编码</span><input class="input" v-model="form.permission_code" :disabled="form.mode==='update'"/></label></div>
              <div class="col-3"><label class="field"><span class="label">父编码</span><input class="input" v-model="form.parent_code"/></label></div>
              <div class="col-3"><label class="field"><span class="label">是否菜单</span><select class="select" v-model="form.is_menu"><option :value="true">是</option><option :value="false">否</option></select></label></div>
              <div class="col-3"><label class="field"><span class="label">激活</span><select class="select" v-model="form.is_active"><option :value="true">是</option><option :value="false">否</option></select></label></div>
              <div class="col-3"><label class="field"><span class="label">路由路径</span><input class="input" v-model="form.route_path"/></label></div>
              <div class="col-3"><label class="field"><span class="label">组件名</span><input class="input" v-model="form.component_name"/></label></div>
              <div class="col-2"><label class="field"><span class="label">排序</span><input class="input" type="number" v-model.number="form.sort_order"/></label></div>
              <div class="col-2"><label class="field"><span class="label">图标</span><input class="input" v-model="form.icon"/></label></div>
              <div class="col-2"><label class="field"><span class="label">图标样式</span><input class="input" v-model="form.icon_style"/></label></div>
              <div class="col-3"><label class="field"><span class="label">菜单组</span><input class="input" v-model="form.menu_group"/></label></div>
              <div class="col-3"><label class="field"><span class="label">语言代码</span><input class="input" v-model="form.translation_language" placeholder="如 zh-CN"/></label></div>
              <div class="col-3"><label class="field"><span class="label">权限名称</span><input class="input" v-model="form.permission_name"/></label></div>
              <div class="col-3"><label class="field"><span class="label">菜单标题</span><input class="input" v-model="form.menu_title"/></label></div>
              <div class="col-12"><label class="field"><span class="label">描述</span><input class="input" v-model="form.description"/></label></div>
              <div class="col-12 btn-row"><button class="btn primary" @click="submit">{{ form.mode==='create'? '创建' : '保存' }}</button><button class="btn ghost" @click="resetForm">重置</button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="overflow:auto;">
          <table class="table"><thead><tr><th>ID</th><th>编码</th><th>名称</th><th>语言</th><th>菜单</th><th>激活</th><th style="width:180px;">操作</th></tr></thead><tbody>
            <tr v-for="p in list" :key="p.id || p.permission_code"><td>{{ p.id || '—' }}</td><td>{{ p.permission_code }}</td><td>{{ p.permission_name || '—' }}</td><td>{{ p.language_code || '—' }}</td><td>{{ p.is_menu? '是' : '否' }}</td><td>{{ p.is_active? '是' : '否' }}</td><td class="btn-row"><button class="btn" @click="editRow(p)">编辑</button><button class="btn danger" v-if="p.id" @click="remove(p.id)">删除</button></td></tr>
          </tbody></table>
        </div>
      </div>
    </div>
  `
};

// Tenants Management
const TenantsView = {
  name: 'TenantsView',
  setup() {
    const list = ref([]);
    const loading = ref(false);
    const filters = reactive({ search: '' });
    const form = reactive({ id: null, tenant_code: '', tenant_name: '', description: '', is_active: true });

    const fetchList = async () => { loading.value = true; try { const data = await api.tenants.list({ search: filters.search || undefined }); list.value = toArray(data); } catch { notify('加载租户失败','error'); } finally { loading.value = false; } };
    const resetForm = () => { form.id=null; form.tenant_code=''; form.tenant_name=''; form.description=''; form.is_active=true; };
    const editRow = (t) => { form.id=t.id; form.tenant_code=t.tenant_code; form.tenant_name=t.tenant_name; form.description=t.description||''; form.is_active=!!t.is_active; };
    const submit = async () => { try { if (form.id) { await api.tenants.update({ id: form.id, tenant_code: form.tenant_code, tenant_name: form.tenant_name, description: form.description, is_active: form.is_active }); notify('租户已更新'); } else { if (!form.tenant_code || !form.tenant_name) { notify('请填写代码与名称','error'); return; } await api.tenants.create({ tenant_code: form.tenant_code, tenant_name: form.tenant_name, description: form.description || undefined }); notify('租户已创建'); } resetForm(); fetchList(); } catch { notify('保存失败','error'); } };
    const remove = async (id) => { if (!confirm('确认删除该租户?')) return; try { await api.tenants.remove(id); notify('已删除'); fetchList(); } catch { notify('删除失败','error'); } };

    onMounted(fetchList);
    return { list, loading, filters, form, resetForm, editRow, submit, remove, fetchList };
  },
  template: `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">租户管理</div></div>
      <div class="panel-body">
        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">查询</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-6"><label class="field"><span class="label">搜索</span><input class="input" v-model="filters.search"/></label></div>
              <div class="col-12 btn-row"><button class="btn" @click="fetchList">查询</button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">{{ form.id? '编辑租户' : '新建租户' }}</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-3"><label class="field"><span class="label">租户代码</span><input class="input" v-model="form.tenant_code" :disabled="!!form.id"/></label></div>
              <div class="col-4"><label class="field"><span class="label">租户名称</span><input class="input" v-model="form.tenant_name"/></label></div>
              <div class="col-12"><label class="field"><span class="label">描述</span><input class="input" v-model="form.description"/></label></div>
              <div class="col-3"><label class="field"><span class="label">激活</span><select class="select" v-model="form.is_active"><option :value="true">是</option><option :value="false">否</option></select></label></div>
              <div class="col-12 btn-row"><button class="btn primary" @click="submit">{{ form.id? '保存' : '创建' }}</button><button class="btn ghost" @click="resetForm">重置</button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="overflow:auto;">
          <table class="table"><thead><tr><th>ID</th><th>代码</th><th>名称</th><th>激活</th><th style="width:180px;">操作</th></tr></thead><tbody>
            <tr v-for="t in list" :key="t.id"><td>{{ t.id }}</td><td>{{ t.tenant_code }}</td><td>{{ t.tenant_name }}</td><td>{{ t.is_active? '是':'否' }}</td><td class="btn-row"><button class="btn" @click="editRow(t)">编辑</button><button class="btn danger" @click="remove(t.id)">删除</button></td></tr>
          </tbody></table>
        </div>
      </div>
    </div>
  `
};

// Certificates Management
const CertsView = {
  name: 'CertsView',
  setup() {
    const list = ref([]);
    const loading = ref(false);
    const filters = reactive({ tenant_id: null, user_id: null, certificate_type: null, is_active: null });
    const form = reactive({ certificate_id: '', certificate_name: '', certificate_type: 1, tenant_id: null, user_id: null, expires_at: '', description: '', public_key_pem: '', web_certificate_key: '', is_active: true });

    const fetchList = async () => { loading.value = true; try { if (!filters.tenant_id) { list.value = []; loading.value=false; return; } const data = await api.certificates.list({ tenant_id: Number(filters.tenant_id), user_id: filters.user_id ? Number(filters.user_id) : undefined, certificate_type: filters.certificate_type ? Number(filters.certificate_type) : undefined, is_active: typeof filters.is_active === 'boolean' ? filters.is_active : undefined }); list.value = toArray(data); } catch { notify('加载证书失败','error'); } finally { loading.value = false; } };
    const resetForm = () => { form.certificate_id=''; form.certificate_name=''; form.certificate_type=1; form.tenant_id=null; form.user_id=null; form.expires_at=''; form.description=''; form.public_key_pem=''; form.web_certificate_key=''; form.is_active=true; };
    const createOne = async () => { try { if (!form.certificate_id || !form.certificate_name || !form.certificate_type || !form.expires_at || !form.tenant_id || !form.user_id) { notify('请完整填写必填字段','error'); return; } await api.certificates.create({ certificate_id: form.certificate_id, certificate_name: form.certificate_name, certificate_type: Number(form.certificate_type), expires_at: form.expires_at, tenant_id: Number(form.tenant_id), user_id: Number(form.user_id), description: form.description || undefined, public_key_pem: form.public_key_pem || undefined, web_certificate_key: form.web_certificate_key || undefined }); notify('证书已创建'); resetForm(); fetchList(); } catch { notify('创建失败','error'); } };
    const remove = async (certificate_id) => { if (!confirm('确认删除该证书?')) return; try { await api.certificates.remove(certificate_id); notify('已删除'); fetchList(); } catch { notify('删除失败','error'); } };
    const toggleActive = async (row) => { try { await api.certificates.activate(row.certificate_id, !row.is_active); notify('状态已更新'); fetchList(); } catch { notify('操作失败','error'); } };

    return { list, loading, filters, form, fetchList, resetForm, createOne, remove, toggleActive };
  },
  template: `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">证书管理</div></div>
      <div class="panel-body">
        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">查询</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-3"><label class="field"><span class="label">租户ID（必填）</span><input class="input" type="number" v-model.number="filters.tenant_id"/></label></div>
              <div class="col-3"><label class="field"><span class="label">用户ID</span><input class="input" type="number" v-model.number="filters.user_id"/></label></div>
              <div class="col-3"><label class="field"><span class="label">类型</span><input class="input" type="number" v-model.number="filters.certificate_type" placeholder="1=X509 2=Web"/></label></div>
              <div class="col-3"><label class="field"><span class="label">激活状态</span><select class="select" v-model="filters.is_active"><option :value="null">全部</option><option :value="true">激活</option><option :value="false">禁用</option></select></label></div>
              <div class="col-12 btn-row"><button class="btn" @click="fetchList">查询</button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">创建证书</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-3"><label class="field"><span class="label">证书ID</span><input class="input" v-model="form.certificate_id"/></label></div>
              <div class="col-3"><label class="field"><span class="label">证书名称</span><input class="input" v-model="form.certificate_name"/></label></div>
              <div class="col-2"><label class="field"><span class="label">类型</span><input class="input" type="number" v-model.number="form.certificate_type" placeholder="1=X509 2=Web"/></label></div>
              <div class="col-4"><label class="field"><span class="label">过期时间</span><input class="input" v-model="form.expires_at" placeholder="RFC3339 或 2006-01-02 15:04:05"/></label></div>
              <div class="col-3"><label class="field"><span class="label">租户ID</span><input class="input" type="number" v-model.number="form.tenant_id"/></label></div>
              <div class="col-3"><label class="field"><span class="label">用户ID</span><input class="input" type="number" v-model.number="form.user_id"/></label></div>
              <div class="col-6"><label class="field"><span class="label">描述</span><input class="input" v-model="form.description"/></label></div>
              <div class="col-6"><label class="field"><span class="label">公钥PEM</span><input class="input" v-model="form.public_key_pem"/></label></div>
              <div class="col-6"><label class="field"><span class="label">Web证书Key</span><input class="input" v-model="form.web_certificate_key"/></label></div>
              <div class="col-12 btn-row"><button class="btn primary" @click="createOne">创建</button><button class="btn ghost" @click="resetForm">重置</button></div>
            </div>
          </div>
        </div>

        <div class="panel" style="overflow:auto;">
          <table class="table"><thead><tr><th>ID</th><th>名称</th><th>类型</th><th>租户</th><th>用户</th><th>激活</th><th style="width:220px;">操作</th></tr></thead><tbody>
            <tr v-for="c in list" :key="c.certificate_id"><td>{{ c.certificate_id }}</td><td>{{ c.certificate_name }}</td><td>{{ c.certificate_type }}</td><td>{{ c.tenant_id }}</td><td>{{ c.user_id }}</td><td>{{ c.is_active? '是':'否' }}</td><td class="btn-row"><button class="btn" @click="toggleActive(c)">{{ c.is_active? '禁用':'启用' }}</button><button class="btn danger" @click="remove(c.certificate_id)">删除</button></td></tr>
          </tbody></table>
        </div>
      </div>
    </div>
  `
};

// Image Metadata Management
const ImagesView = {
  name: 'ImagesView',
  setup() {
    const created = ref(null);
    const fetched = ref(null);
    const stats = ref(null);
    const createForm = reactive({ file_name: '', file_size: null, image_width: null, image_height: null, sha256: '', tenant_id: null, vector_data: '' });
    const getId = ref(null);
    const updateForm = reactive({ id: null, updatesRaw: '{"file_name":"new_name.jpg"}' });
    const deleteId = ref(null);

    const createOne = async () => { try { const body = { ...createForm }; Object.keys(body).forEach(k=> (body[k]===null||body[k]==='') && delete body[k]); const data = await api.images.create(body); created.value = data; notify('已创建'); } catch { notify('创建失败','error'); } };
    const getOne = async () => { if (!getId.value) return; try { const data = await api.images.get(Number(getId.value)); fetched.value = data; } catch { notify('获取失败','error'); } };
    const updateOne = async () => { if (!updateForm.id) return; try { const updates = JSON.parse(updateForm.updatesRaw || '{}'); const data = await api.images.update(Number(updateForm.id), updates); fetched.value = data; notify('已更新'); } catch { notify('更新失败或JSON无效','error'); } };
    const removeOne = async () => { if (!deleteId.value) return; if (!confirm('确认删除该图片元数据?')) return; try { await api.images.remove(Number(deleteId.value)); notify('已删除'); if (fetched.value && fetched.value.id === Number(deleteId.value)) fetched.value = null; } catch { notify('删除失败','error'); } };
    const loadStats = async () => { try { stats.value = await api.images.stats(); } catch { stats.value = null; } };

    onMounted(loadStats);
    return { created, fetched, stats, createForm, getId, updateForm, deleteId, createOne, getOne, updateOne, removeOne, loadStats };
  },
  template: `
    <div class="panel">
      <div class="panel-header"><div class="panel-title">图片元数据</div></div>
      <div class="panel-body">
        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">创建</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-4"><label class="field"><span class="label">文件名</span><input class="input" v-model="createForm.file_name"/></label></div>
              <div class="col-2"><label class="field"><span class="label">大小</span><input class="input" type="number" v-model.number="createForm.file_size"/></label></div>
              <div class="col-2"><label class="field"><span class="label">宽度</span><input class="input" type="number" v-model.number="createForm.image_width"/></label></div>
              <div class="col-2"><label class="field"><span class="label">高度</span><input class="input" type="number" v-model.number="createForm.image_height"/></label></div>
              <div class="col-4"><label class="field"><span class="label">SHA256</span><input class="input" v-model="createForm.sha256"/></label></div>
              <div class="col-3"><label class="field"><span class="label">租户ID</span><input class="input" type="number" v-model.number="createForm.tenant_id"/></label></div>
              <div class="col-12"><label class="field"><span class="label">向量数据</span><input class="input" v-model="createForm.vector_data"/></label></div>
              <div class="col-12 btn-row"><button class="btn primary" @click="createOne">创建</button></div>
              <div class="col-12"><div class="tag" v-if="created">已创建：{{ created && (created.id || created.file_name) }}</div></div>
            </div>
          </div>
        </div>

        <div class="panel" style="margin-bottom:14px;">
          <div class="panel-header"><div class="panel-title">获取 / 更新 / 删除</div></div>
          <div class="panel-body">
            <div class="form-grid">
              <div class="col-3"><label class="field"><span class="label">获取ID</span><input class="input" type="number" v-model.number="getId"/></label></div>
              <div class="col-2 btn-row"><button class="btn" @click="getOne">获取</button></div>
              <div class="col-3"><label class="field"><span class="label">更新ID</span><input class="input" type="number" v-model.number="updateForm.id"/></label></div>
              <div class="col-4"><label class="field"><span class="label">更新内容(JSON)</span><input class="input" v-model="updateForm.updatesRaw"/></label></div>
              <div class="col-2 btn-row"><button class="btn" @click="updateOne">更新</button></div>
              <div class="col-3"><label class="field"><span class="label">删除ID</span><input class="input" type="number" v-model.number="deleteId"/></label></div>
              <div class="col-2 btn-row"><button class="btn danger" @click="removeOne">删除</button></div>
              <div class="col-12"><div class="tag" v-if="fetched">详情：{{ JSON.stringify(fetched) }}</div></div>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-header"><div class="panel-title">统计</div><div class="btn-row"><button class="btn" @click="loadStats">刷新</button></div></div>
          <div class="panel-body"><div class="tag">{{ stats ? JSON.stringify(stats) : '暂无' }}</div></div>
        </div>
      </div>
    </div>
  `
};

// Root App
const App = {
  name: 'App',
  components: { AppHeader, Sidebar, LoginView, DashboardView, LanguagesView, DictionaryView, UsersView, RolesView, PermissionsView, TenantsView, CertsView, ImagesView },
  setup() {
    const view = computed(() => state.route);

    async function logout() {
      try { await api.auth.logout(); } catch {}
      setAuthToken('');
      state.token = '';
      state.user = null; state.tenant = null;
      notify('已退出', 'success');
      go('login');
    }

    const initAuth = async () => {
      if (!state.token) return;
      try {
        const data = await api.auth.me();
        state.user = data?.user || data || null;
        state.tenant = data?.tenant || null;
      } catch (e) {
        setAuthToken('');
        state.token = '';
        go('login');
      }
    };

    const onHashChange = () => {
      state.route = currentRoute();
      requireAuth();
    };

    onMounted(() => {
      window.addEventListener('hashchange', onHashChange);
      onHashChange();
      initAuth();
    });

    return { state, view, logout, toasts };
  },
  template: `
    <div>
      <div v-if="!state.token && view==='login'">
        <LoginView />
      </div>
      <div v-else class="app-shell">
        <Sidebar :active="view" />
        <AppHeader :user="state.user" :tenant="state.tenant" @logout="logout" />
        <main class="app-main">
          <component :is="
            view==='dashboard'? 'DashboardView' :
            view==='languages'? 'LanguagesView' :
            view==='dictionary'? 'DictionaryView' :
            view==='users'? 'UsersView' :
            view==='roles'? 'RolesView' :
            view==='permissions'? 'PermissionsView' :
            view==='tenants'? 'TenantsView' :
            view==='certs'? 'CertsView' :
            view==='images'? 'ImagesView' : 'DashboardView'" />
        </main>
      </div>

      <div class="toasts">
        <div v-for="t in toasts" :key="t.id" class="toast" :class="t.type">{{ t.message }}</div>
      </div>
    </div>
  `
};

createApp(App).mount('#app-root');

