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

// Placeholder simple list views for other modules
function makePlaceholder(name) {
  return {
    name: `${name}View`,
    setup() { return {}; },
    template: `<div class="panel"><div class="panel-header"><div class="panel-title">${name}（即将提供更完整操作）</div></div><div class="panel-body">基础框架已就绪，可按需扩展 CRUD。</div></div>`
  };
}

const UsersView = makePlaceholder('用户管理');
const RolesView = makePlaceholder('角色管理');
const PermissionsView = makePlaceholder('权限管理');
const TenantsView = makePlaceholder('租户管理');
const CertsView = makePlaceholder('证书管理');
const ImagesView = makePlaceholder('图片元数据');

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

