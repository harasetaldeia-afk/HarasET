// ── HARAS ET · API CLIENT ────────────────────────────────────
// Arquivo compartilhado entre sistema.html e portal.html
// Inclua com: <script src="api.js"></script>

const API_BASE = 'https://haraset-api.onrender.com';

// ── TOKEN ─────────────────────────────────────────────────────
function getToken(){ return sessionStorage.getItem('het_token') || localStorage.getItem('het_token'); }
function setToken(t, lembrar=false){
  sessionStorage.setItem('het_token', t);
  if(lembrar) localStorage.setItem('het_token', t);
}
function clearToken(){
  sessionStorage.removeItem('het_token');
  localStorage.removeItem('het_token');
}
function getPerfil(){ return sessionStorage.getItem('het_perfil') || localStorage.getItem('het_perfil'); }
function setPerfil(p){ sessionStorage.setItem('het_perfil', p); localStorage.setItem('het_perfil', p); }

// ── FETCH COM AUTH ────────────────────────────────────────────
async function apiFetch(method, path, body=null){
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  const token = getToken();
  if(token) opts.headers['Authorization'] = 'Bearer ' + token;
  if(body)  opts.body = JSON.stringify(body);

  const res = await fetch(API_BASE + path, opts);
  const json = await res.json();

  if(res.status === 401){
    clearToken();
    window.location.href = 'acesso.html';
    return;
  }
  if(!json.ok) throw new Error(json.erro || 'Erro na API');
  return json.data !== undefined ? json.data : json;
}

// ── AUTH ──────────────────────────────────────────────────────
const Auth = {
  async loginAdmin(senha){
    const r = await fetch(API_BASE+'/api/auth/admin', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({senha})
    });
    const j = await r.json();
    if(!j.ok) throw new Error(j.erro);
    setToken(j.token, true); setPerfil('admin');
    return j;
  },
  async loginCliente(codigo){
    const r = await fetch(API_BASE+'/api/auth/cliente', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({codigo})
    });
    const j = await r.json();
    if(!j.ok) throw new Error(j.erro);
    setToken(j.token); setPerfil('cliente');
    sessionStorage.setItem('het_clienteId', j.clienteId);
    sessionStorage.setItem('het_nome', j.nome);
    return j;
  },
  async loginColab(senha){
    const r = await fetch(API_BASE+'/api/auth/colab', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({senha})
    });
    const j = await r.json();
    if(!j.ok) throw new Error(j.erro);
    setToken(j.token); setPerfil('colab');
    return j;
  },
  logout(){ clearToken(); window.location.href = 'acesso.html'; }
};

// ── CLIENTES ──────────────────────────────────────────────────
const Clientes = {
  listar:  ()           => apiFetch('GET',  '/api/clientes'),
  buscar:  (id)         => apiFetch('GET',  '/api/clientes/'+id),
  criar:   (dados)      => apiFetch('POST', '/api/clientes', dados),
  atualizar:(id, dados) => apiFetch('PUT',  '/api/clientes/'+id, dados),
  deletar: (id)         => apiFetch('DELETE','/api/clientes/'+id),
};

// ── ANIMAIS ───────────────────────────────────────────────────
const Animais = {
  listar:   (filtro='') => apiFetch('GET',  '/api/animais'+(filtro?'?clienteId='+filtro:'')),
  buscar:   (id)        => apiFetch('GET',  '/api/animais/'+id),
  criar:    (dados)     => apiFetch('POST', '/api/animais', dados),
  atualizar:(id, dados) => apiFetch('PUT',  '/api/animais/'+id, dados),
  deletar:  (id)        => apiFetch('DELETE','/api/animais/'+id),
};

// ── CATEGORIAS ────────────────────────────────────────────────
const Categorias = {
  listar:   ()          => apiFetch('GET',  '/api/categorias'),
  criar:    (dados)     => apiFetch('POST', '/api/categorias', dados),
  atualizar:(id, dados) => apiFetch('PUT',  '/api/categorias/'+id, dados),
  deletar:  (id)        => apiFetch('DELETE','/api/categorias/'+id),
};

// ── FATURAS ───────────────────────────────────────────────────
const Faturas = {
  listar:   (params={}) => {
    const q = new URLSearchParams(params).toString();
    return apiFetch('GET', '/api/faturas'+(q?'?'+q:''));
  },
  buscar:   (id)        => apiFetch('GET',  '/api/faturas/'+id),
  criar:    (dados)     => apiFetch('POST', '/api/faturas', dados),
  lote:     (dados)     => apiFetch('POST', '/api/faturas/lote', dados),
  pagar:    (id, dados) => apiFetch('PATCH','/api/faturas/'+id+'/pagar', dados),
  atualizar:(id, dados) => apiFetch('PUT',  '/api/faturas/'+id, dados),
  deletar:  (id)        => apiFetch('DELETE','/api/faturas/'+id),
  itens:    (id)        => apiFetch('GET',  '/api/faturas/'+id+'/itens'),
};
