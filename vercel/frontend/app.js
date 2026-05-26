const LOCAL_API_DEFAULT = 'http://localhost:8080/api';
const PRODUCTION_API_DEFAULT = '/api';
const API_DEFAULT = isLocalRuntime() ? LOCAL_API_DEFAULT : PRODUCTION_API_DEFAULT;
const app = document.querySelector('#app');
const toastRegion = document.querySelector('#toast-region');

const state = {
  apiBase: getInitialApiBase(),
  token: localStorage.getItem('token') || '',
  user: readJson(localStorage.getItem('user')),
  view: localStorage.getItem('view') || 'dashboard',
  loading: 0,
  menuOpen: false,
  data: {
    dashboard: null,
    colaboradores: [],
    carros: [],
    carrosConsulta: [],
    relatorios: [],
    relatorioContadores: null,
    financeiro: [],
    financeiroResumo: null
  },
  filters: {
    colaboradoresBusca: '',
    colaboradoresAtivo: '',
    carrosBusca: '',
    carrosStatus: '',
    relatoriosStatus: 'PENDENTE',
    relatoriosApagado: false,
    financeiroTipo: '',
    financeiroApagado: false
  },
  photoIndex: {},
  modal: null,
  confirm: null
};

window.state = state;

const roles = {
  COLABORADOR: 1,
  GERENTE: 2,
  GERENTE_FINANCEIRO: 3,
  DONO: 4
};

const labels = {
  COLABORADOR: 'Colaborador',
  GERENTE: 'Gerente',
  GERENTE_FINANCEIRO: 'Gerente Financeiro',
  DONO: 'Dono',
  DISPONIVEL: 'Disponível',
  VENDIDO: 'Vendido',
  MANUTENCAO: 'Manutenção',
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  URGENTE: 'Urgente',
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em Análise',
  RESOLVIDO: 'Resolvido',
  ARQUIVADO: 'Arquivado',
  ENTRADA: 'Entrada',
  SAIDA: 'Saída'
};

const financeCategories = [
  ['Venda de veículo', 'Venda de veículo'],
  ['Sinal ou reserva', 'Sinal ou reserva'],
  ['Financiamento', 'Financiamento'],
  ['Comissão recebida', 'Comissão recebida'],
  ['Reembolso', 'Reembolso'],
  ['Compra de veículo', 'Compra de veículo'],
  ['Manutenção', 'Manutenção'],
  ['Documentação', 'Documentação'],
  ['Impostos e taxas', 'Impostos e taxas'],
  ['Salários', 'Salários'],
  ['Comissão paga', 'Comissão paga'],
  ['Marketing', 'Marketing'],
  ['Aluguel e contas', 'Aluguel e contas'],
  ['Outros', 'Outros']
];

const icons = {
  car: '<svg viewBox="0 0 24 24"><path d="M5 17h14l-1.4-5.6A3 3 0 0 0 14.7 9H9.3a3 3 0 0 0-2.9 2.4L5 17Z"/><path d="M7 17v2M17 17v2M6 13h12M8 9l1-3h6l1 3"/></svg>',
  user: '<svg viewBox="0 0 24 24"><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M4 20a8 8 0 0 1 16 0"/></svg>',
  users: '<svg viewBox="0 0 24 24"><path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M17 11a3 3 0 1 0 0-6"/><path d="M17 14a6 6 0 0 1 5 7"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24"><path d="M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Z"/></svg>',
  report: '<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7V3Z"/><path d="M14 3v5h5M9 13h6M9 17h6M9 9h2"/></svg>',
  money: '<svg viewBox="0 0 24 24"><path d="M4 7h16v10H4V7Z"/><path d="M8 7a4 4 0 0 1-4 4M20 11a4 4 0 0 1-4-4M8 17a4 4 0 0 0-4-4M20 13a4 4 0 0 0-4 4"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
  edit: '<svg viewBox="0 0 24 24"><path d="m4 20 4.5-1 10-10a2.1 2.1 0 0 0-3-3l-10 10L4 20Z"/><path d="m14 7 3 3"/></svg>',
  trash: '<svg viewBox="0 0 24 24"><path d="M5 7h14M9 7V5h6v2M8 7l1 13h6l1-13"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>',
  alert: '<svg viewBox="0 0 24 24"><path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 18h.01"/></svg>',
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  logout: '<svg viewBox="0 0 24 24"><path d="M10 4H5v16h5"/><path d="M14 8l4 4-4 4M8 12h10"/></svg>',
  search: '<svg viewBox="0 0 24 24"><path d="M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z"/><path d="m21 21-4.3-4.3"/></svg>',
  image: '<svg viewBox="0 0 24 24"><path d="M4 5h16v14H4V5Z"/><path d="m4 16 4-4 4 4 3-3 5 5"/><path d="M15 9h.01"/></svg>',
  save: '<svg viewBox="0 0 24 24"><path d="M5 3h12l2 2v16H5V3Z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/></svg>',
  archive: '<svg viewBox="0 0 24 24"><path d="M4 7h16v13H4V7Z"/><path d="M3 4h18v3H3V4ZM9 11h6"/></svg>',
  pdf: '<svg viewBox="0 0 24 24"><path d="M7 3h7l4 4v14H7V3Z"/><path d="M14 3v5h5"/><path d="M9 15h1.5a1.5 1.5 0 0 0 0-3H9v5M14 17v-5h3M14 14h2.5"/></svg>',
  arrowLeft: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>',
  arrowRight: '<svg viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>',
  restore: '<svg viewBox="0 0 24 24"><path d="M4 7v5h5"/><path d="M20 17a8 8 0 0 1-14.7-4.4L4 12"/><path d="M20 7v5h-5"/><path d="M4 17a8 8 0 0 1 14.7-4.4L20 12"/></svg>',
  chart: '<svg viewBox="0 0 24 24"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M8 16v-5M12 16V8M16 16v-8"/></svg>'
};

init();

function init() {
  render();
  if (state.token) {
    loadMe().then(() => loadCurrentView()).catch(() => logout(false));
  }
}

document.addEventListener('submit', (event) => {
  const form = event.target.closest('form[data-form]');
  if (!form) return;
  event.preventDefault();
  handleForm(form);
});

document.addEventListener('click', (event) => {
  const action = event.target.closest('[data-action]');
  if (!action) return;
  if ((action.classList.contains('modal-backdrop') || action.classList.contains('confirm-backdrop')) && event.target !== action) {
    return;
  }
  event.preventDefault();
  handleAction(action);
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') return;
  if (state.modal) closeModal();
  if (state.confirm) closeConfirm();
  if (state.menuOpen) {
    state.menuOpen = false;
    render();
  }
});

document.addEventListener('change', (event) => {
  const field = event.target.closest('[data-change]');
  if (!field) return;
  handleChange(field);
});

async function handleForm(form) {
  const name = form.dataset.form;
  try {
    if (name === 'login') await submitLogin(form);
    if (name === 'colaborador') await submitColaborador(form);
    if (name === 'carro') await submitCarro(form);
    if (name === 'relatorio') await submitRelatorio(form);
    if (name === 'resposta') await submitResposta(form);
    if (name === 'financeiro') await submitFinanceiro(form);
  } catch (error) {
    notify(error.message, 'error');
  }
}

async function handleAction(element) {
  const action = element.dataset.action;
  const id = element.dataset.id ? Number(element.dataset.id) : null;

  try {
    if (action === 'navigate') {
      state.view = element.dataset.view;
      localStorage.setItem('view', state.view);
      state.menuOpen = false;
      render();
      await loadCurrentView();
    }

    if (action === 'toggle-menu') {
      state.menuOpen = !state.menuOpen;
      render();
    }

    if (action === 'close-menu') {
      state.menuOpen = false;
      render();
    }

    if (action === 'logout') logout(true);
    if (action === 'close-modal') closeModal();
    if (action === 'cancel-confirm') closeConfirm();
    if (action === 'confirm') await runConfirm();
    if (action === 'reload') await loadCurrentView();

    if (action === 'filter-colaboradores') await loadColaboradores();
    if (action === 'new-colaborador') openColaboradorModal();
    if (action === 'edit-colaborador') openColaboradorModal(findById(state.data.colaboradores, id));
    if (action === 'delete-colaborador') askDeleteColaborador(id);

    if (action === 'filter-carros') await loadCarros();
    if (action === 'new-carro') await openCarroModal();
    if (action === 'edit-carro') await openCarroModal(await request(`/carros/${id}`));
    if (action === 'view-carro') openCarroDetails(await request(`/carros/${id}`));
    if (action === 'download-carro') await downloadCarroPdf(id);
    if (action === 'car-photo-prev') changeCarPhoto(id, -1);
    if (action === 'car-photo-next') changeCarPhoto(id, 1);
    if (action === 'delete-carro') askDeleteCarro(id);
    if (action === 'remove-existing-photo') markExistingPhoto(id);
    if (action === 'remove-selected-photo') removeSelectedPhoto(Number(element.dataset.index));

    if (action === 'relatorio-tab') {
      state.filters.relatoriosApagado = element.dataset.apagado === 'true';
      state.filters.relatoriosStatus = state.filters.relatoriosApagado ? '' : element.dataset.status;
      render();
      await loadRelatorios();
    }
    if (action === 'new-relatorio') await openRelatorioModal();
    if (action === 'edit-relatorio') await openRelatorioModal(findById(state.data.relatorios, id));
    if (action === 'view-relatorio') openRelatorioDetails(findById(state.data.relatorios, id));
    if (action === 'delete-relatorio') askDeleteRelatorio(id);
    if (action === 'status-relatorio') await updateRelatorioStatus(id, element.dataset.status);
    if (action === 'responder-relatorio') openRespostaModal(id);
    if (action === 'arquivar-relatorio') askArchiveRelatorio(id);

    if (action === 'financeiro-tab') {
      state.filters.financeiroApagado = element.dataset.apagado === 'true';
      state.filters.financeiroTipo = state.filters.financeiroApagado ? '' : element.dataset.tipo || '';
      render();
      await loadFinanceiro();
    }
    if (action === 'new-financeiro') await openFinanceiroModal();
    if (action === 'edit-financeiro') await openFinanceiroModal(findById(state.data.financeiro, id));
    if (action === 'delete-financeiro') askDeleteFinanceiro(id);
    if (action === 'restore-financeiro') askRestoreFinanceiro(id);
  } catch (error) {
    notify(error.message, 'error');
  }
}

function handleChange(field) {
  if (field.dataset.change === 'car-files') {
    captureCarFormDraft();
    const files = Array.from(field.files || []);
    state.modal.files = [...(state.modal.files || []), ...files];
    render();
  }
}

function render() {
  app.innerHTML = `${state.loading ? '<div class="loading-bar"></div>' : ''}${state.token && state.user ? renderShell() : renderLogin()}`;
}

function renderLogin() {
  return `
    <main class="login-page">
      <section class="login-panel">
        <div class="login-head">
          <div class="brand-mark">${icon('car')}</div>
          <div>
            <h1 class="login-title">Concessionária</h1>
            <div class="page-subtitle">Sistema interno de seminovos</div>
          </div>
        </div>
        <form class="form-grid" data-form="login">
          <div class="field">
            <label for="cpf">CPF</label>
            <input id="cpf" name="cpf" inputmode="numeric" autocomplete="username" required>
          </div>
          <div class="field">
            <label for="senha">Senha</label>
            <input id="senha" name="senha" type="password" autocomplete="current-password" required>
          </div>
          <button class="button primary" type="submit">${icon('check')}Entrar</button>
        </form>
      </section>
    </main>
  `;
}

function renderShell() {
  const view = currentView();
  return `
    <div class="app-shell ${state.menuOpen ? 'menu-open' : ''}">
      <button class="overlay" data-action="close-menu" aria-label="Fechar menu"></button>
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">${icon('car')}</div>
          <div>
            <div class="brand-title">Concessionária</div>
            <div class="brand-subtitle">Seminovos</div>
          </div>
          <button class="button icon-only ghost mobile-close" data-action="close-menu" title="Fechar menu" aria-label="Fechar menu">${icon('close')}</button>
        </div>
        <div class="user-block">
          <div class="avatar">${initials(state.user.nome)}</div>
          <div>
            <div class="user-name" title="${escapeAttr(state.user.nome)}">${escapeHtml(state.user.nome)}</div>
            <div class="user-role">${roleLabel(state.user.cargo)}</div>
          </div>
        </div>
        <nav class="nav" aria-label="Menu principal">
          ${navButton('dashboard', 'Dashboard', 'dashboard')}
          ${canManage() ? navButton('colaboradores', 'Colaboradores', 'users') : ''}
          ${navButton('carros', 'Carros', 'car')}
          ${navButton('relatorios', 'Relatórios', 'report')}
          ${canFinance() ? navButton('financeiro', 'Financeiro', 'money') : ''}
        </nav>
        <div class="logout-wrap">
          <button class="logout-button" data-action="logout">${icon('logout')}Sair</button>
        </div>
      </aside>
      <section class="content">
        <header class="topbar">
          <button class="button icon-only mobile-menu-button" data-action="toggle-menu" title="Abrir menu" aria-label="Abrir menu">${icon('menu')}</button>
          <div>
            <h1 class="page-title">${view.title}</h1>
            <div class="page-subtitle">${view.subtitle}</div>
          </div>
          <div class="status-chip"><span class="status-dot"></span>API conectada</div>
        </header>
        <main class="main">
          ${renderView()}
        </main>
      </section>
      ${state.modal ? renderModal() : ''}
      ${state.confirm ? renderConfirm() : ''}
    </div>
  `;
}

function renderView() {
  if (state.view === 'dashboard') return renderDashboard();
  if (state.view === 'colaboradores') return renderColaboradores();
  if (state.view === 'carros') return renderCarros();
  if (state.view === 'relatorios') return renderRelatorios();
  if (state.view === 'financeiro') return renderFinanceiro();
  return renderDashboard();
}

function renderDashboard() {
  const data = state.data.dashboard;
  if (!data) return empty('Carregando dashboard');

  const cards = [
    stat('Meus relatórios', data.meusRelatorios, 'report'),
    stat('Pendentes', data.meusRelatoriosPendentes, 'alert'),
    stat('Carros cadastrados', data.carrosCadastrados, 'car')
  ];

  if (data.colaboradoresAtivos !== null && data.colaboradoresAtivos !== undefined) {
    cards.push(stat('Colaboradores ativos', data.colaboradoresAtivos, 'users'));
    cards.push(stat('Carros disponíveis', data.carrosDisponiveis, 'car'));
  }

  if (data.totalEntradas !== null && data.totalEntradas !== undefined) {
    cards.push(stat('Entradas', money(data.totalEntradas), 'money', 'success'));
    cards.push(stat('Saídas', money(data.totalSaidas), 'money', 'danger'));
    cards.push(stat('Saldo', money(data.saldoTotal), 'money', Number(data.saldoTotal) >= 0 ? 'success' : 'danger'));
  }

  return `
    <section class="stats-grid">${cards.join('')}</section>
    <section class="panel">
      <div class="panel-head">
        <h2 class="panel-title">Atalhos</h2>
        <button class="button icon-only" data-action="reload" title="Atualizar" aria-label="Atualizar">${icon('search')}</button>
      </div>
      <div class="modal-body">
        <div class="actions left">
          <button class="button" data-action="navigate" data-view="carros">${icon('car')}Carros</button>
          <button class="button" data-action="navigate" data-view="relatorios">${icon('report')}Relatórios</button>
          ${canManage() ? `<button class="button" data-action="navigate" data-view="colaboradores">${icon('users')}Colaboradores</button>` : ''}
          ${canFinance() ? `<button class="button" data-action="navigate" data-view="financeiro">${icon('money')}Financeiro</button>` : ''}
        </div>
      </div>
    </section>
  `;
}

function renderColaboradores() {
  if (!canManage()) return empty('Acesso indisponível para este cargo');
  const rows = state.data.colaboradores.map((item) => `
    <tr>
      <td><strong>${escapeHtml(item.nome)}</strong></td>
      <td>${escapeHtml(item.cpf)}</td>
      <td>${roleLabel(item.cargo)}</td>
      <td>${escapeHtml(item.email || '-')}</td>
      <td>${escapeHtml(item.telefone || '-')}</td>
      <td>${money(item.salario)}</td>
      <td>${statusBadge(item.ativo ? 'Ativo' : 'Inativo', item.ativo ? 'success' : 'danger')}</td>
      <td>
        <div class="row-actions">
          <button class="button icon-only" data-action="edit-colaborador" data-id="${item.id}" title="Editar" aria-label="Editar">${icon('edit')}</button>
          <button class="button icon-only danger" data-action="delete-colaborador" data-id="${item.id}" title="Excluir" aria-label="Excluir">${icon('trash')}</button>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <section class="toolbar">
      <div class="toolbar-fields">
        <div class="field">
          <label for="colBusca">Buscar por nome</label>
          <input id="colBusca" value="${escapeAttr(state.filters.colaboradoresBusca)}" oninput="state.filters.colaboradoresBusca=this.value">
        </div>
        <div class="field">
          <label for="colAtivo">Status</label>
          <select id="colAtivo" onchange="state.filters.colaboradoresAtivo=this.value">
            ${option('', 'Todos', state.filters.colaboradoresAtivo)}
            ${option('true', 'Ativos', state.filters.colaboradoresAtivo)}
            ${option('false', 'Inativos', state.filters.colaboradoresAtivo)}
          </select>
        </div>
        <button class="button" data-action="filter-colaboradores">${icon('search')}Buscar</button>
      </div>
      <button class="button primary" data-action="new-colaborador">${icon('plus')}Novo Colaborador</button>
    </section>
    <section class="panel">
      <div class="panel-head"><h2 class="panel-title">Colaboradores</h2></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Nome</th><th>CPF</th><th>Cargo</th><th>Email</th><th>Telefone</th><th>Salário</th><th>Status</th><th></th></tr></thead>
          <tbody>${rows || `<tr><td colspan="8">${emptyInline('Nenhum colaborador encontrado')}</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderCarros() {
  const cars = state.data.carros.map((carro) => renderCarCard(carro)).join('');

  return `
    <section class="toolbar">
      <div class="toolbar-fields">
        <div class="field">
          <label for="carBusca">Marca, modelo ou placa</label>
          <input id="carBusca" value="${escapeAttr(state.filters.carrosBusca)}" oninput="state.filters.carrosBusca=this.value">
        </div>
        <div class="field">
          <label for="carStatus">Status</label>
          <select id="carStatus" onchange="state.filters.carrosStatus=this.value">
            ${option('', 'Todos', state.filters.carrosStatus)}
            ${option('DISPONIVEL', 'Disponível', state.filters.carrosStatus)}
            ${option('VENDIDO', 'Vendido', state.filters.carrosStatus)}
            ${option('MANUTENCAO', 'Manutenção', state.filters.carrosStatus)}
          </select>
        </div>
        <button class="button" data-action="filter-carros">${icon('search')}Buscar</button>
      </div>
      ${canManage() ? `<button class="button primary" data-action="new-carro">${icon('plus')}Novo Carro</button>` : ''}
    </section>
    ${renderCarStats()}
    <section class="cars-grid">${cars || empty('Nenhum carro encontrado')}</section>
  `;
}

function renderCarCard(carro) {
  const photos = carro.fotos?.length ? carro.fotos : (carro.fotoPrincipal ? [carro.fotoPrincipal] : []);
  const currentPhoto = currentCarPhoto(carro);
  const photo = currentPhoto?.url
    ? `<img src="${escapeAttr(assetUrl(currentPhoto.url))}" alt="${escapeAttr(carro.marca + ' ' + carro.modelo)}">`
    : icon('car');

  return `
    <article class="car-card">
      <div class="car-media">
        ${photo}
        ${photos.length > 1 ? renderPhotoControls(carro.id, photos.length) : ''}
      </div>
      <div class="car-body">
        <div class="car-title-line">
          <h2 class="car-title">${escapeHtml(carro.marca)} ${escapeHtml(carro.modelo)}</h2>
          ${carStatusBadge(carro.status)}
        </div>
        <div class="meta-grid">
          <div class="meta-item"><span>Ano</span><strong>${carro.ano || '-'}</strong></div>
          <div class="meta-item"><span>Categoria</span><strong>${escapeHtml(carro.categoria || '-')}</strong></div>
          <div class="meta-item"><span>Placa</span><strong>${escapeHtml(carro.placa || '-')}</strong></div>
          <div class="meta-item"><span>Cor</span><strong>${escapeHtml(carro.cor || '-')}</strong></div>
          <div class="meta-item"><span>KM</span><strong>${number(carro.quilometragem)}</strong></div>
          ${carro.valorVenda !== null && carro.valorVenda !== undefined ? `<div class="meta-item"><span>Valor</span><strong>${money(carro.valorVenda)}</strong></div>` : ''}
        </div>
        <div class="actions">
          <button class="button" data-action="view-carro" data-id="${carro.id}">${icon('eye')}Detalhes</button>
          <button class="button" data-action="download-carro" data-id="${carro.id}">${icon('pdf')}PDF</button>
          ${canManage() ? `<button class="button" data-action="edit-carro" data-id="${carro.id}">${icon('edit')}Editar</button>` : ''}
          ${canManage() ? `<button class="button icon-only danger" data-action="delete-carro" data-id="${carro.id}" title="Excluir" aria-label="Excluir">${icon('trash')}</button>` : ''}
        </div>
      </div>
    </article>
  `;
}

function renderCarStats() {
  const cars = state.data.carrosConsulta?.length ? state.data.carrosConsulta : state.data.carros || [];
  const sold = cars.filter((carro) => carro.status === 'VENDIDO');
  return `
    <section class="panel">
      <div class="panel-head">
        <h2 class="panel-title">${icon('chart')}Consulta de vendidos</h2>
      </div>
      <div class="sales-summary">
        ${stat('Vendidos', sold.length, 'car')}
        ${stat('Cor mais vendida', mostFrequent(sold, 'cor'), 'chart')}
        ${stat('Marca mais vendida', mostFrequent(sold, 'marca'), 'chart')}
        ${stat('Categoria mais vendida', mostFrequent(sold, 'categoria'), 'chart')}
      </div>
    </section>
  `;
}

function renderRelatorios() {
  const statuses = ['PENDENTE', 'EM_ANALISE', 'RESOLVIDO', 'ARQUIVADO'];
  const counters = state.data.relatorioContadores?.porStatus || {};
  const tabs = statuses.map((status) => `
    <button class="tab-button ${!state.filters.relatoriosApagado && state.filters.relatoriosStatus === status ? 'active' : ''}" data-action="relatorio-tab" data-status="${status}">
      ${labels[status]} <span class="badge neutral">${counters[status] || 0}</span>
    </button>
  `).join('') + (canManage() ? `
    <button class="tab-button ${state.filters.relatoriosApagado ? 'active' : ''}" data-action="relatorio-tab" data-apagado="true">
      Apagados
    </button>
  ` : '');

  const reports = state.data.relatorios.map((item) => `
    <article class="report-item">
      <div class="report-head">
        <div>
          <h2 class="report-title">${escapeHtml(item.titulo)}</h2>
          <div class="page-subtitle">${escapeHtml(item.categoria || '-')} · ${escapeHtml(item.autorNome || '-')} · ${formatDateTime(item.criadoEm)}</div>
        </div>
        <div class="report-meta">
          ${priorityBadge(item.prioridade)}
          ${reportStatusBadge(item.status)}
        </div>
      </div>
      <p>${escapeHtml(item.descricao)}</p>
      ${item.carroResumo ? `<div class="badge neutral">${escapeHtml(item.carroResumo)}</div>` : ''}
      ${item.resposta ? `<div class="detail"><span>Resposta</span><strong>${escapeHtml(item.resposta)}</strong><span>${formatDateTime(item.respondidoEm)}</span></div>` : ''}
      ${item.apagado ? `<div class="detail"><span>Apagado por</span><strong>${escapeHtml(item.apagadoPorNome || '-')}</strong><span>${formatDateTime(item.apagadoEm)}</span></div>` : ''}
      <div class="actions">
        <button class="button" data-action="view-relatorio" data-id="${item.id}">${icon('eye')}Detalhes</button>
        ${canManage() && !item.apagado ? `<button class="button" data-action="edit-relatorio" data-id="${item.id}">${icon('edit')}Editar</button>` : ''}
        ${canManage() && !item.apagado && item.status === 'PENDENTE' ? `<button class="button" data-action="status-relatorio" data-id="${item.id}" data-status="EM_ANALISE">${icon('check')}Análise</button>` : ''}
        ${canManage() && !item.apagado && item.status !== 'ARQUIVADO' ? `<button class="button" data-action="responder-relatorio" data-id="${item.id}">${icon('edit')}Responder</button>` : ''}
        ${isOwner() && !item.apagado && item.status !== 'ARQUIVADO' ? `<button class="button" data-action="arquivar-relatorio" data-id="${item.id}">${icon('archive')}Arquivar</button>` : ''}
        ${canDeleteRelatorio(item) ? `<button class="button danger" data-action="delete-relatorio" data-id="${item.id}">${icon('trash')}Apagar</button>` : ''}
      </div>
    </article>
  `).join('');

  return `
    <section class="toolbar">
      <div class="toolbar-fields">
        <button class="button primary" data-action="new-relatorio">${icon('plus')}Novo Relatório</button>
      </div>
      <button class="button icon-only" data-action="reload" title="Atualizar" aria-label="Atualizar">${icon('search')}</button>
    </section>
    <section class="tabs">${tabs}</section>
    <section class="report-list">${reports || empty('Nenhum relatório nesta aba')}</section>
  `;
}

function renderFinanceiro() {
  if (!canFinance()) return empty('Acesso indisponível para este cargo');
  const resumo = state.data.financeiroResumo;
  const rows = state.data.financeiro.map((item) => `
    <tr>
      <td>${financeBadge(item.tipo)}</td>
      <td>${escapeHtml(item.categoria)}</td>
      <td class="wrap">${escapeHtml(item.descricao)}</td>
      <td>${item.tipo === 'ENTRADA' ? `<span class="stat-value success value-inline">${money(item.valor)}</span>` : `<span class="stat-value danger value-inline">${money(item.valor)}</span>`}</td>
      <td>${formatDate(item.dataMovimento)}</td>
      <td>${escapeHtml(item.responsavelNome || '-')}</td>
      <td>${escapeHtml(item.carroResumo || '-')}</td>
      <td>${item.apagado ? `${escapeHtml(item.apagadoPorNome || '-')}<br><span class="page-subtitle">${formatDateTime(item.apagadoEm)}</span>` : statusBadge('Ativo', 'success')}</td>
      <td>
        <div class="row-actions">
          ${item.apagado ? `<button class="button icon-only" data-action="restore-financeiro" data-id="${item.id}" title="Restaurar" aria-label="Restaurar">${icon('restore')}</button>` : `
            <button class="button icon-only" data-action="edit-financeiro" data-id="${item.id}" title="Editar" aria-label="Editar">${icon('edit')}</button>
            <button class="button icon-only danger" data-action="delete-financeiro" data-id="${item.id}" title="Apagar" aria-label="Apagar">${icon('trash')}</button>
          `}
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <section class="stats-grid">
      ${stat('Entradas', money(resumo?.totalEntradas || 0), 'money', 'success')}
      ${stat('Saídas', money(resumo?.totalSaidas || 0), 'money', 'danger')}
      ${stat('Saldo', money(resumo?.saldoTotal || 0), 'money', Number(resumo?.saldoTotal || 0) >= 0 ? 'success' : 'danger')}
    </section>
    <section class="toolbar">
      <div class="tabs">
        <button class="tab-button ${!state.filters.financeiroApagado && state.filters.financeiroTipo === '' ? 'active' : ''}" data-action="financeiro-tab" data-tipo="">Resumo</button>
        <button class="tab-button ${!state.filters.financeiroApagado && state.filters.financeiroTipo === 'ENTRADA' ? 'active' : ''}" data-action="financeiro-tab" data-tipo="ENTRADA">Entradas</button>
        <button class="tab-button ${!state.filters.financeiroApagado && state.filters.financeiroTipo === 'SAIDA' ? 'active' : ''}" data-action="financeiro-tab" data-tipo="SAIDA">Saídas</button>
        <button class="tab-button ${state.filters.financeiroApagado ? 'active' : ''}" data-action="financeiro-tab" data-apagado="true">Apagados</button>
      </div>
      <button class="button primary" data-action="new-financeiro">${icon('plus')}Novo Registro</button>
    </section>
    <section class="panel">
      <div class="panel-head"><h2 class="panel-title">Histórico financeiro</h2></div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Tipo</th><th>Categoria</th><th>Descrição</th><th>Valor</th><th>Data</th><th>Responsável</th><th>Carro</th><th>Situação</th><th></th></tr></thead>
          <tbody>${rows || `<tr><td colspan="9">${emptyInline('Nenhum registro financeiro encontrado')}</td></tr>`}</tbody>
        </table>
      </div>
    </section>
  `;
}

function renderModal() {
  if (state.modal.type === 'colaborador') return colaboradorModal();
  if (state.modal.type === 'carro') return carroModal();
  if (state.modal.type === 'carro-details') return carroDetailsModal();
  if (state.modal.type === 'relatorio') return relatorioModal();
  if (state.modal.type === 'relatorio-details') return relatorioDetailsModal();
  if (state.modal.type === 'resposta') return respostaModal();
  if (state.modal.type === 'financeiro') return financeiroModal();
  return '';
}

function colaboradorModal() {
  const item = state.modal.item || {};
  const editing = Boolean(item.id);
  return modalShell(editing ? 'Editar Colaborador' : 'Novo Colaborador', `
    <form id="modalForm" class="form-grid two" data-form="colaborador">
      ${hidden('id', item.id)}
      ${input('nome', 'Nome', item.nome, 'text', true)}
      ${input('cpf', 'CPF', item.cpf, 'text', true)}
      ${input('senha', editing ? 'Senha nova' : 'Senha', '', 'password', !editing)}
      ${select('cargo', 'Cargo', item.cargo || 'COLABORADOR', [
        ['COLABORADOR', 'Colaborador'],
        ['GERENTE', 'Gerente'],
        ['GERENTE_FINANCEIRO', 'Gerente Financeiro'],
        ['DONO', 'Dono']
      ])}
      ${input('email', 'Email', item.email, 'email', true)}
      ${input('telefone', 'Telefone', item.telefone)}
      ${input('dataNascimento', 'Nascimento', item.dataNascimento, 'date')}
      ${input('dataAdmissao', 'Admissão', item.dataAdmissao || today(), 'date', true)}
      ${input('salario', 'Salário', item.salario || 0, 'number', true, '0.01')}
      ${editing ? select('ativo', 'Status', String(item.ativo), [['true', 'Ativo'], ['false', 'Inativo']]) : ''}
    </form>
  `, `<button class="button" data-action="close-modal">Cancelar</button><button class="button primary" form="modalForm">${icon('save')}Salvar</button>`);
}

function carroModal() {
  const item = state.modal.item || {};
  const values = { ...item, ...(state.modal.draft || {}) };
  const creating = !item.id;
  const needsPhoto = creating && !(state.modal.files || []).length;
  const existingPhotos = (item.fotos || []).filter((foto) => !(state.modal.removeIds || []).includes(foto.id));
  const existing = existingPhotos.map((foto) => `
    <div class="photo-tile">
      <img src="${escapeAttr(assetUrl(foto.url))}" alt="Foto do veículo">
      <button type="button" class="button icon-only danger remove-photo" data-action="remove-existing-photo" data-id="${foto.id}" title="Remover foto" aria-label="Remover foto">${icon('close')}</button>
    </div>
  `).join('');
  const previews = (state.modal.files || []).map((file, index) => `
    <div class="preview-tile">
      <img src="${escapeAttr(URL.createObjectURL(file))}" alt="${escapeAttr(file.name)}">
      <button type="button" class="button icon-only danger remove-photo" data-action="remove-selected-photo" data-index="${index}" title="Remover foto" aria-label="Remover foto">${icon('close')}</button>
    </div>
  `).join('');

  return modalShell(item.id ? 'Editar Carro' : 'Novo Carro', `
    <form id="modalForm" class="form-grid two" data-form="carro">
      ${hidden('id', item.id)}
      ${input('marca', 'Marca', values.marca, 'text', true)}
      ${input('modelo', 'Modelo', values.modelo, 'text', true)}
      ${input('ano', 'Ano', values.ano, 'number', true, '1')}
      ${input('placa', 'Placa', values.placa, 'text', true)}
      ${input('cor', 'Cor', values.cor, 'text', true)}
      ${input('categoria', 'Categoria', values.categoria, 'text', true)}
      ${input('chassi', 'Chassi', values.chassi, 'text', true)}
      ${input('renavam', 'Renavam', values.renavam, 'text', true)}
      ${input('quilometragem', 'Quilometragem', values.quilometragem || 0, 'number', true, '1')}
      ${select('status', 'Status', values.status || 'DISPONIVEL', [
        ['DISPONIVEL', 'Disponível'],
        ['VENDIDO', 'Vendido'],
        ['MANUTENCAO', 'Manutenção']
      ])}
      ${input('valorCompra', 'Valor de compra', values.valorCompra || 0, 'number', true, '0.01')}
      ${input('valorVenda', 'Valor de venda', values.valorVenda || '', 'number', false, '0.01')}
      ${input('dataCompra', 'Data de compra', values.dataCompra || today(), 'date', true)}
      ${input('dataVenda', 'Data de venda', values.dataVenda, 'date')}
      <div class="field full-span">
        <label for="fotos">Fotos</label>
        <input id="fotos" type="file" accept="image/*" multiple data-change="car-files" ${needsPhoto ? 'required' : ''}>
      </div>
      <div class="preview-grid full-span">${existing}${previews}</div>
      <div class="field full-span">
        <label for="observacoes">Observações</label>
        <textarea id="observacoes" name="observacoes">${escapeHtml(values.observacoes || '')}</textarea>
      </div>
    </form>
  `, `<button class="button" data-action="close-modal">Cancelar</button><button class="button primary" form="modalForm">${icon('save')}Salvar</button>`);
}

function carroDetailsModal() {
  const item = state.modal.item;
  const photos = item.fotos || [];
  const currentPhoto = currentCarPhoto(item);
  const mainPhoto = currentPhoto?.url
    ? `<img src="${escapeAttr(assetUrl(currentPhoto.url))}" alt="${escapeAttr(item.marca + ' ' + item.modelo)}">`
    : icon('car');
  const strip = photos.map((foto) => `<div class="photo-tile"><img src="${escapeAttr(assetUrl(foto.url))}" alt="Foto do veículo"></div>`).join('');
  return modalShell(`${escapeHtml(item.marca)} ${escapeHtml(item.modelo)}`, `
    <div class="car-media details-media">
      ${mainPhoto}
      ${photos.length > 1 ? renderPhotoControls(item.id, photos.length) : ''}
    </div>
    <div class="details-grid">
      ${detail('Marca', item.marca)}
      ${detail('Modelo', item.modelo)}
      ${detail('Ano', item.ano)}
      ${detail('Categoria', item.categoria)}
      ${detail('Placa', item.placa)}
      ${detail('Cor', item.cor)}
      ${detail('Quilometragem', number(item.quilometragem))}
      ${detail('Status', labels[item.status] || item.status)}
      ${detail('Chassi', item.chassi)}
      ${detail('Renavam', item.renavam)}
      ${item.valorCompra !== null && item.valorCompra !== undefined ? detail('Valor de compra', money(item.valorCompra)) : ''}
      ${item.valorVenda !== null && item.valorVenda !== undefined ? detail('Valor de venda', money(item.valorVenda)) : ''}
      ${detail('Data de compra', formatDate(item.dataCompra))}
      ${detail('Data de venda', formatDate(item.dataVenda))}
    </div>
    <div class="detail mt-10"><span>Observações</span><strong>${escapeHtml(item.observacoes || '-')}</strong></div>
    <div class="photo-strip mt-12">${strip || emptyInline('Nenhuma foto cadastrada')}</div>
  `, `<button class="button" data-action="download-carro" data-id="${item.id}">${icon('pdf')}PDF</button><button class="button primary" data-action="close-modal">Fechar</button>`);
}

function relatorioModal() {
  const item = state.modal.item || {};
  const editing = Boolean(item.id);
  const carOptions = [['', 'Nenhum carro']].concat(state.data.carros.map((car) => [car.id, `${car.marca} ${car.modelo} - ${car.placa}`]));
  return modalShell(editing ? 'Editar Relatório' : 'Novo Relatório', `
    <form id="modalForm" class="form-grid" data-form="relatorio">
      ${hidden('id', item.id)}
      ${input('titulo', 'Título', item.titulo || '', 'text', true)}
      <div class="field">
        <label for="descricao">Descrição</label>
        <textarea id="descricao" name="descricao" required>${escapeHtml(item.descricao || '')}</textarea>
      </div>
      ${input('categoria', 'Categoria', item.categoria || '', 'text', true)}
      ${select('prioridade', 'Prioridade', item.prioridade || 'MEDIA', [
        ['BAIXA', 'Baixa'],
        ['MEDIA', 'Média'],
        ['ALTA', 'Alta'],
        ['URGENTE', 'Urgente']
      ])}
      ${editing ? select('status', 'Status', item.status || 'PENDENTE', [
        ['PENDENTE', 'Pendente'],
        ['EM_ANALISE', 'Em Análise'],
        ['RESOLVIDO', 'Resolvido'],
        ['ARQUIVADO', 'Arquivado']
      ]) : ''}
      ${select('carroId', 'Carro relacionado', item.carroId || '', carOptions)}
    </form>
  `, `<button class="button" data-action="close-modal">Cancelar</button><button class="button primary" form="modalForm">${icon(editing ? 'save' : 'check')}${editing ? 'Salvar' : 'Enviar'}</button>`);
}

function relatorioDetailsModal() {
  const item = state.modal.item;
  return modalShell('Detalhes do Relatório', `
    <div class="details-grid">
      ${detail('Título', item.titulo)}
      ${detail('Categoria', item.categoria)}
      ${detail('Prioridade', labels[item.prioridade] || item.prioridade)}
      ${detail('Status', labels[item.status] || item.status)}
      ${detail('Autor', item.autorNome)}
      ${detail('Criado em', formatDateTime(item.criadoEm))}
      ${detail('Carro', item.carroResumo || '-')}
      ${detail('Respondido em', formatDateTime(item.respondidoEm))}
    </div>
    <div class="detail mt-10"><span>Descrição</span><strong>${escapeHtml(item.descricao)}</strong></div>
    <div class="detail mt-10"><span>Resposta</span><strong>${escapeHtml(item.resposta || '-')}</strong></div>
  `, `<button class="button primary" data-action="close-modal">Fechar</button>`);
}

function respostaModal() {
  return modalShell('Responder Relatório', `
    <form id="modalForm" class="form-grid" data-form="resposta">
      ${hidden('id', state.modal.id)}
      <div class="field">
        <label for="resposta">Resposta</label>
        <textarea id="resposta" name="resposta" required></textarea>
      </div>
    </form>
  `, `<button class="button" data-action="close-modal">Cancelar</button><button class="button primary" form="modalForm">${icon('check')}Enviar Resposta</button>`);
}

function financeiroModal() {
  const item = state.modal.item || {};
  const editing = Boolean(item.id);
  const carOptions = [['', 'Nenhum carro']].concat(state.data.carros.map((car) => [car.id, `${car.marca} ${car.modelo} - ${car.placa}`]));
  return modalShell(editing ? 'Editar Registro Financeiro' : 'Novo Registro Financeiro', `
    <form id="modalForm" class="form-grid two" data-form="financeiro">
      ${hidden('id', item.id)}
      ${select('tipo', 'Tipo', item.tipo || 'ENTRADA', [['ENTRADA', 'Entrada'], ['SAIDA', 'Saída']])}
      ${selectWithCustom('categoria', 'Categoria', item.categoria || '', financeCategories, true)}
      ${input('descricao', 'Descrição', item.descricao || '', 'text', true)}
      ${input('valor', 'Valor', item.valor || '', 'number', true, '0.01')}
      ${input('dataMovimento', 'Data', item.dataMovimento || today(), 'date', true)}
      ${select('carroId', 'Carro relacionado', item.carroId || '', carOptions)}
    </form>
  `, `<button class="button" data-action="close-modal">Cancelar</button><button class="button primary" form="modalForm">${icon('save')}${editing ? 'Salvar' : 'Cadastrar'}</button>`);
}

function modalShell(title, body, footer) {
  return `
    <div class="modal-backdrop" data-action="close-modal">
      <section class="modal" role="dialog" aria-modal="true">
        <header class="modal-head">
          <h2 class="modal-title">${title}</h2>
          <button class="button icon-only" data-action="close-modal" title="Fechar" aria-label="Fechar">${icon('close')}</button>
        </header>
        <div class="modal-body">${body}</div>
        <footer class="modal-foot">${footer}</footer>
      </section>
    </div>
  `;
}

function renderConfirm() {
  return `
    <div class="confirm-backdrop" data-action="cancel-confirm">
      <section class="confirm" role="dialog" aria-modal="true">
        <header class="confirm-head"><h2 class="confirm-title">${escapeHtml(state.confirm.title)}</h2></header>
        <div class="confirm-body">${escapeHtml(state.confirm.message)}</div>
        <footer class="confirm-foot">
          <button class="button" data-action="cancel-confirm">Cancelar</button>
          <button class="button danger" data-action="confirm">${icon('trash')}Confirmar</button>
        </footer>
      </section>
    </div>
  `;
}

async function submitLogin(form) {
  const data = formData(form);
  state.apiBase = normalizeApiBase(state.apiBase || API_DEFAULT);
  localStorage.setItem('apiBase', state.apiBase);
  const response = await request('/auth/login', {
    method: 'POST',
    body: { cpf: data.cpf, senha: data.senha },
    auth: false
  });
  state.token = response.token;
  state.user = response.usuario;
  localStorage.setItem('token', response.token);
  localStorage.setItem('user', JSON.stringify(response.usuario));
  state.view = 'dashboard';
  localStorage.setItem('view', state.view);
  notify('Login realizado com sucesso.', 'success');
  render();
  await loadCurrentView();
}

async function submitColaborador(form) {
  const data = formData(form);
  const payload = {
    nome: data.nome,
    cpf: data.cpf,
    senha: data.senha,
    cargo: data.cargo,
    email: data.email,
    telefone: data.telefone,
    dataNascimento: data.dataNascimento || null,
    dataAdmissao: data.dataAdmissao,
    salario: toNumber(data.salario)
  };

  if (data.id) {
    payload.ativo = data.ativo === 'true';
    await request(`/colaboradores/${data.id}`, { method: 'PUT', body: payload });
    notify('Colaborador atualizado com sucesso.', 'success');
  } else {
    await request('/colaboradores', { method: 'POST', body: payload });
    notify('Colaborador cadastrado com sucesso.', 'success');
  }

  closeModal();
  await loadColaboradores();
}

async function submitCarro(form) {
  const data = formData(form);
  if (!data.id && !(state.modal.files || []).length) {
    throw new Error('Adicione pelo menos uma imagem antes de cadastrar o veículo.');
  }

  const payload = {
    marca: data.marca,
    modelo: data.modelo,
    ano: toNumber(data.ano),
    placa: data.placa,
    cor: data.cor,
    categoria: data.categoria,
    chassi: data.chassi,
    renavam: data.renavam,
    quilometragem: toNumber(data.quilometragem),
    status: data.status,
    valorCompra: toNumber(data.valorCompra),
    valorVenda: data.valorVenda ? toNumber(data.valorVenda) : null,
    dataCompra: data.dataCompra,
    dataVenda: data.dataVenda || null,
    observacoes: data.observacoes || null,
    removerFotoIds: state.modal.removeIds || []
  };

  const multipart = new FormData();
  multipart.append('dados', JSON.stringify(payload));
  (state.modal.files || []).forEach((file) => multipart.append('fotos', file));

  if (data.id) {
    await request(`/carros/${data.id}`, { method: 'PUT', body: multipart });
    notify('Carro atualizado com sucesso.', 'success');
  } else {
    await request('/carros', { method: 'POST', body: multipart });
    notify('Carro cadastrado com sucesso.', 'success');
  }

  closeModal();
  await loadCarros();
}

async function submitRelatorio(form) {
  const data = formData(form);
  const payload = {
    titulo: data.titulo,
    descricao: data.descricao,
    categoria: data.categoria,
    prioridade: data.prioridade,
    carroId: data.carroId ? Number(data.carroId) : null
  };

  if (data.id) {
    payload.status = data.status;
    await request(`/relatorios/${data.id}`, { method: 'PUT', body: payload });
    notify('Relatório atualizado com sucesso.', 'success');
  } else {
    await request('/relatorios', { method: 'POST', body: payload });
    notify('Relatório enviado com sucesso.', 'success');
  }

  closeModal();
  await loadRelatorios();
}

async function submitResposta(form) {
  const data = formData(form);
  await request(`/relatorios/${data.id}/resposta`, {
    method: 'POST',
    body: { resposta: data.resposta }
  });
  notify('Resposta enviada com sucesso.', 'success');
  closeModal();
  await loadRelatorios();
}

async function submitFinanceiro(form) {
  const data = formData(form);
  const payload = {
    tipo: data.tipo,
    categoria: data.categoria,
    descricao: data.descricao,
    valor: toNumber(data.valor),
    dataMovimento: data.dataMovimento,
    carroId: data.carroId ? Number(data.carroId) : null
  };

  if (data.id) {
    await request(`/financeiro/${data.id}`, { method: 'PUT', body: payload });
    notify('Registro financeiro atualizado com sucesso.', 'success');
  } else {
    await request('/financeiro', { method: 'POST', body: payload });
    notify('Registro financeiro cadastrado com sucesso.', 'success');
  }

  closeModal();
  await loadFinanceiro();
}

async function loadMe() {
  state.user = await request('/auth/me');
  localStorage.setItem('user', JSON.stringify(state.user));
}

async function loadCurrentView() {
  if (!state.token || !state.user) return;
  if (state.view === 'dashboard') await loadDashboard();
  if (state.view === 'colaboradores') await loadColaboradores();
  if (state.view === 'carros') await loadCarros();
  if (state.view === 'relatorios') await loadRelatorios();
  if (state.view === 'financeiro') await loadFinanceiro();
}

async function loadDashboard() {
  state.data.dashboard = await request('/dashboard');
  render();
}

async function loadColaboradores() {
  if (!canManage()) return;
  const params = new URLSearchParams();
  if (state.filters.colaboradoresBusca) params.set('busca', state.filters.colaboradoresBusca);
  if (state.filters.colaboradoresAtivo) params.set('ativo', state.filters.colaboradoresAtivo);
  state.data.colaboradores = await request(`/colaboradores${qs(params)}`);
  render();
}

async function loadCarros() {
  const params = new URLSearchParams();
  if (state.filters.carrosBusca) params.set('busca', state.filters.carrosBusca);
  if (state.filters.carrosStatus) params.set('status', state.filters.carrosStatus);
  const hasFilters = Boolean(params.toString());
  if (hasFilters) {
    const [carros, consulta] = await Promise.all([
      request(`/carros${qs(params)}`),
      request('/carros')
    ]);
    state.data.carros = carros;
    state.data.carrosConsulta = consulta;
  } else {
    state.data.carros = await request('/carros');
    state.data.carrosConsulta = state.data.carros;
  }
  render();
}

async function loadRelatorios() {
  const params = new URLSearchParams();
  if (state.filters.relatoriosStatus && !state.filters.relatoriosApagado) params.set('status', state.filters.relatoriosStatus);
  if (state.filters.relatoriosApagado) params.set('apagado', 'true');
  const [contadores, relatorios] = await Promise.all([
    request('/relatorios/contadores'),
    request(`/relatorios${qs(params)}`)
  ]);
  state.data.relatorioContadores = contadores;
  state.data.relatorios = relatorios;
  render();
}

async function loadFinanceiro() {
  if (!canFinance()) return;
  const params = new URLSearchParams();
  if (state.filters.financeiroTipo && !state.filters.financeiroApagado) params.set('tipo', state.filters.financeiroTipo);
  if (state.filters.financeiroApagado) params.set('apagado', 'true');
  const [resumo, registros] = await Promise.all([
    request('/financeiro/resumo'),
    request(`/financeiro${qs(params)}`)
  ]);
  state.data.financeiroResumo = resumo;
  state.data.financeiro = registros;
  render();
}

function openColaboradorModal(item = null) {
  state.modal = { type: 'colaborador', item };
  render();
}

async function openCarroModal(item = null) {
  state.modal = { type: 'carro', item: item || {}, files: [], removeIds: [] };
  render();
}

function openCarroDetails(item) {
  state.modal = { type: 'carro-details', item };
  render();
}

async function openRelatorioModal(item = null) {
  if (!state.data.carros.length) await loadCarrosWithoutRender();
  state.modal = { type: 'relatorio', item };
  render();
}

function openRelatorioDetails(item) {
  state.modal = { type: 'relatorio-details', item };
  render();
}

function openRespostaModal(id) {
  state.modal = { type: 'resposta', id };
  render();
}

async function openFinanceiroModal(item = null) {
  if (!state.data.carros.length) await loadCarrosWithoutRender();
  state.modal = { type: 'financeiro', item };
  render();
}

async function loadCarrosWithoutRender() {
  const params = new URLSearchParams();
  state.data.carros = await request(`/carros${qs(params)}`);
  state.data.carrosConsulta = state.data.carros;
}

function askDeleteColaborador(id) {
  state.confirm = {
    title: 'Excluir colaborador',
    message: 'Confirma a exclusão deste colaborador?',
    onConfirm: async () => {
      await request(`/colaboradores/${id}`, { method: 'DELETE' });
      notify('Colaborador excluído com sucesso.', 'success');
      await loadColaboradores();
    }
  };
  render();
}

function askDeleteCarro(id) {
  state.confirm = {
    title: 'Excluir carro',
    message: 'Confirma a exclusão deste carro?',
    onConfirm: async () => {
      await request(`/carros/${id}`, { method: 'DELETE' });
      notify('Carro excluído com sucesso.', 'success');
      await loadCarros();
    }
  };
  render();
}

function askArchiveRelatorio(id) {
  state.confirm = {
    title: 'Arquivar relatório',
    message: 'Confirma o arquivamento deste relatório?',
    onConfirm: async () => {
      await request(`/relatorios/${id}/arquivar`, { method: 'POST' });
      notify('Relatório arquivado com sucesso.', 'success');
      await loadRelatorios();
    }
  };
  render();
}

function askDeleteRelatorio(id) {
  state.confirm = {
    title: 'Apagar relatório',
    message: 'Confirma apagar este relatório? Esta ação só é permitida para o autor antes de existir resposta.',
    onConfirm: async () => {
      await request(`/relatorios/${id}`, { method: 'DELETE' });
      notify('Relatório apagado com sucesso.', 'success');
      await loadRelatorios();
    }
  };
  render();
}

function askDeleteFinanceiro(id) {
  state.confirm = {
    title: 'Apagar registro financeiro',
    message: 'Confirma apagar este registro do histórico financeiro?',
    onConfirm: async () => {
      await request(`/financeiro/${id}`, { method: 'DELETE' });
      notify('Registro financeiro apagado com sucesso.', 'success');
      await loadFinanceiro();
      if (state.view === 'dashboard') await loadDashboard();
    }
  };
  render();
}

function askRestoreFinanceiro(id) {
  state.confirm = {
    title: 'Restaurar registro financeiro',
    message: 'Confirma restaurar este registro no histórico financeiro?',
    onConfirm: async () => {
      await request(`/financeiro/${id}/restaurar`, { method: 'PATCH' });
      notify('Registro financeiro restaurado com sucesso.', 'success');
      await loadFinanceiro();
    }
  };
  render();
}

async function updateRelatorioStatus(id, status) {
  await request(`/relatorios/${id}/status`, {
    method: 'PATCH',
    body: { status }
  });
  notify('Status atualizado com sucesso.', 'success');
  await loadRelatorios();
}

function changeCarPhoto(id, direction) {
  const item = findById(state.data.carros, id) || (Number(state.modal?.item?.id) === Number(id) ? state.modal.item : null);
  const photos = item?.fotos || [];
  if (!photos.length) return;
  const current = Number(state.photoIndex[id] || 0);
  state.photoIndex[id] = (current + direction + photos.length) % photos.length;
  render();
}

function currentCarPhoto(carro) {
  const photos = carro?.fotos?.length ? carro.fotos : (carro?.fotoPrincipal ? [carro.fotoPrincipal] : []);
  if (!photos.length) return null;
  const index = Math.min(Number(state.photoIndex[carro.id] || 0), photos.length - 1);
  return photos[index];
}

function renderPhotoControls(id, total) {
  return `
    <div class="media-controls">
      <button class="button icon-only" data-action="car-photo-prev" data-id="${id}" title="Foto anterior" aria-label="Foto anterior">${icon('arrowLeft')}</button>
      <span class="photo-counter">${(Number(state.photoIndex[id] || 0) % total) + 1}/${total}</span>
      <button class="button icon-only" data-action="car-photo-next" data-id="${id}" title="Próxima foto" aria-label="Próxima foto">${icon('arrowRight')}</button>
    </div>
  `;
}

async function downloadCarroPdf(id) {
  const popup = window.open('', '_blank');
  if (!popup) {
    throw new Error('Autorize popups para gerar o PDF do veículo.');
  }
  popup.document.write('<!doctype html><title>Gerando PDF</title><body>Gerando documentação...</body>');
  const carro = Number(state.modal?.item?.id) === Number(id) ? state.modal.item : await request(`/carros/${id}`);
  const photo = currentCarPhoto(carro);

  popup.document.open();
  popup.document.write(`
    <!doctype html>
    <html lang="pt-BR">
      <head>
        <meta charset="utf-8">
        <title>Documentação - ${escapeHtml(carro.marca)} ${escapeHtml(carro.modelo)}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 28px; color: #17202a; }
          h1 { margin: 0 0 4px; font-size: 22px; }
          .muted { color: #647286; font-size: 12px; margin-bottom: 18px; }
          .hero { width: 100%; aspect-ratio: 16 / 9; border: 1px solid #d8dee8; display: grid; place-items: center; margin-bottom: 18px; overflow: hidden; }
          .hero img { width: 100%; height: 100%; object-fit: cover; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .item { border: 1px solid #d8dee8; padding: 10px; border-radius: 6px; }
          .item span { display: block; color: #647286; font-size: 11px; font-weight: 700; }
          .item strong { display: block; margin-top: 4px; font-size: 14px; }
          .full { grid-column: 1 / -1; }
          @media print { button { display: none; } body { margin: 18mm; } }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(carro.marca)} ${escapeHtml(carro.modelo)}</h1>
        <div class="muted">Documentação do veículo para impressão ou salvamento em PDF</div>
        <div class="hero">${photo?.url ? `<img src="${escapeAttr(assetUrl(photo.url))}" alt="Foto do veículo">` : 'Sem foto disponível'}</div>
        <div class="grid">
          ${pdfItem('Marca', carro.marca)}
          ${pdfItem('Modelo', carro.modelo)}
          ${pdfItem('Ano', carro.ano)}
          ${pdfItem('Categoria', carro.categoria)}
          ${pdfItem('Placa', carro.placa)}
          ${pdfItem('Cor', carro.cor)}
          ${pdfItem('Quilometragem', number(carro.quilometragem))}
          ${pdfItem('Status', labels[carro.status] || carro.status)}
          ${pdfItem('Chassi', carro.chassi)}
          ${pdfItem('Renavam', carro.renavam)}
          ${pdfItem('Data de compra', formatDate(carro.dataCompra))}
          ${pdfItem('Data de venda', formatDate(carro.dataVenda))}
          ${carro.valorVenda !== null && carro.valorVenda !== undefined ? pdfItem('Valor de venda', money(carro.valorVenda)) : ''}
          ${pdfItem('Observações', carro.observacoes || '-', 'full')}
        </div>
        <script>window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 200); });<\/script>
      </body>
    </html>
  `);
  popup.document.close();
  notify('Documento do veículo aberto para salvar em PDF ou imprimir.', 'success');
}

function markExistingPhoto(id) {
  captureCarFormDraft();
  state.modal.removeIds = [...(state.modal.removeIds || []), id];
  render();
}

function removeSelectedPhoto(index) {
  captureCarFormDraft();
  state.modal.files = (state.modal.files || []).filter((_, itemIndex) => itemIndex !== index);
  render();
}

function captureCarFormDraft() {
  if (state.modal?.type !== 'carro') return;
  const form = document.querySelector('#modalForm');
  if (!form) return;
  state.modal.draft = {
    ...(state.modal.draft || {}),
    ...formData(form)
  };
}

function closeModal() {
  state.modal = null;
  render();
}

function closeConfirm() {
  state.confirm = null;
  render();
}

async function runConfirm() {
  const confirm = state.confirm;
  state.confirm = null;
  render();
  await confirm.onConfirm();
}

function logout(message) {
  state.token = '';
  state.user = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  if (message) notify('Sessão encerrada.', 'success');
  render();
}

async function request(path, options = {}) {
  startLoading();
  try {
    const headers = options.headers ? { ...options.headers } : {};
    let body = options.body;

    if (body && !(body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(body);
    }

    if (options.auth !== false && state.token) {
      headers.Authorization = `Bearer ${state.token}`;
    }

    const response = await fetch(`${state.apiBase}${path}`, {
      method: options.method || 'GET',
      headers,
      body
    });

    const text = await response.text();
    const data = text ? readJson(text) : null;

    if (!response.ok) {
      if (response.status === 401 && options.auth !== false) logout(false);
      throw new Error(extractError(data, response.status));
    }

    return data;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Não foi possível conectar à API.');
    }
    throw error;
  } finally {
    stopLoading();
  }
}

function startLoading() {
  state.loading += 1;
  render();
}

function stopLoading() {
  state.loading = Math.max(0, state.loading - 1);
  render();
}

function notify(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icon(type === 'success' ? 'check' : 'alert')}<div>${escapeHtml(message)}</div>`;
  toastRegion.appendChild(toast);
  setTimeout(() => toast.remove(), 4200);
}

function currentView() {
  const map = {
    dashboard: { title: 'Dashboard', subtitle: 'Resumo operacional' },
    colaboradores: { title: 'Colaboradores', subtitle: 'Equipe, cargos e status' },
    carros: { title: 'Carros', subtitle: 'Estoque de seminovos' },
    relatorios: { title: 'Relatórios', subtitle: 'Ocorrências internas' },
    financeiro: { title: 'Financeiro', subtitle: 'Entradas, saídas e saldo' }
  };
  return map[state.view] || map.dashboard;
}

function navButton(view, label, iconName) {
  return `<button class="nav-button ${state.view === view ? 'active' : ''}" data-action="navigate" data-view="${view}">${icon(iconName)}${label}</button>`;
}

function stat(label, value, iconName, tone = '') {
  return `
    <article class="stat-card">
      <div class="stat-top"><span>${label}</span>${icon(iconName)}</div>
      <div class="stat-value ${tone}">${value ?? '-'}</div>
    </article>
  `;
}

function input(name, label, value = '', type = 'text', required = false, step = '') {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" value="${escapeAttr(value ?? '')}" ${required ? 'required' : ''} ${step ? `step="${step}"` : ''}>
    </div>
  `;
}

function hidden(name, value) {
  return value ? `<input type="hidden" name="${name}" value="${escapeAttr(value)}">` : '';
}

function select(name, label, value, items) {
  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}">
        ${items.map(([itemValue, itemLabel]) => option(itemValue, itemLabel, value)).join('')}
      </select>
    </div>
  `;
}

function selectWithCustom(name, label, value, items, required = false) {
  const knownValue = items.some(([itemValue]) => String(itemValue) === String(value));
  const options = knownValue || !value
    ? items
    : [[value, `${value} (atual)`]].concat(items);

  return `
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}" ${required ? 'required' : ''}>
        ${option('', 'Selecione uma categoria', value)}
        ${options.map(([itemValue, itemLabel]) => option(itemValue, itemLabel, value)).join('')}
      </select>
    </div>
  `;
}

function option(value, label, selected) {
  return `<option value="${escapeAttr(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${escapeHtml(label)}</option>`;
}

function detail(label, value) {
  return `<div class="detail"><span>${label}</span><strong>${escapeHtml(value ?? '-')}</strong></div>`;
}

function pdfItem(label, value, extraClass = '') {
  return `<div class="item ${extraClass}"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value ?? '-')}</strong></div>`;
}

function empty(message) {
  return `<div class="empty-state">${escapeHtml(message)}</div>`;
}

function emptyInline(message) {
  return `<div class="empty-inline">${escapeHtml(message)}</div>`;
}

function statusBadge(text, tone) {
  return `<span class="badge ${tone}">${escapeHtml(text)}</span>`;
}

function carStatusBadge(status) {
  const tone = status === 'DISPONIVEL' ? 'success' : status === 'VENDIDO' ? 'info' : 'warning';
  return statusBadge(labels[status] || status, tone);
}

function priorityBadge(priority) {
  const tone = priority === 'URGENTE' || priority === 'ALTA' ? 'danger' : priority === 'MEDIA' ? 'warning' : 'neutral';
  return statusBadge(labels[priority] || priority, tone);
}

function reportStatusBadge(status) {
  const tone = status === 'RESOLVIDO' ? 'success' : status === 'ARQUIVADO' ? 'neutral' : status === 'EM_ANALISE' ? 'info' : 'warning';
  return statusBadge(labels[status] || status, tone);
}

function financeBadge(type) {
  return statusBadge(labels[type] || type, type === 'ENTRADA' ? 'success' : 'danger');
}

function canManage() {
  return roleLevel() >= roles.GERENTE;
}

function canFinance() {
  return roleLevel() >= roles.GERENTE_FINANCEIRO;
}

function isOwner() {
  return roleLevel() >= roles.DONO;
}

function canDeleteRelatorio(item) {
  return !item.apagado
    && Number(item.autorId) === Number(state.user?.id)
    && !(item.resposta || '').trim();
}

function mostFrequent(items, field) {
  const counts = new Map();
  for (const item of items) {
    const value = String(item[field] || '').trim();
    if (!value) continue;
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  let winner = '';
  let winnerCount = 0;
  for (const [value, count] of counts.entries()) {
    if (count > winnerCount) {
      winner = value;
      winnerCount = count;
    }
  }

  return winner ? `${winner} (${winnerCount})` : '-';
}

function roleLevel() {
  return roles[state.user?.cargo] || 0;
}

function roleLabel(role) {
  return labels[role] || role || '-';
}

function formData(form) {
  return Object.fromEntries(new FormData(form).entries());
}

function findById(items, id) {
  return (items || []).find((item) => Number(item.id) === Number(id));
}

function qs(params) {
  const value = params.toString();
  return value ? `?${value}` : '';
}

function icon(name) {
  return `<span class="icon" aria-hidden="true">${icons[name] || ''}</span>`;
}

function money(value) {
  const numberValue = Number(value || 0);
  return numberValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function number(value) {
  return Number(value || 0).toLocaleString('pt-BR');
}

function toNumber(value) {
  return value === '' || value === null || value === undefined ? null : Number(value);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value) {
  if (!value) return '-';
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
}

function assetUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  try {
    return `${new URL(state.apiBase).origin}${url}`;
  } catch {
    return url;
  }
}

function getInitialApiBase() {
  const saved = localStorage.getItem('apiBase');
  if (!saved) return API_DEFAULT;
  if (!isLocalRuntime() && /localhost|127\.0\.0\.1/.test(saved)) return API_DEFAULT;
  return saved;
}

function isLocalRuntime() {
  const hostname = window.location.hostname;
  return window.location.protocol === 'file:'
    || hostname === 'localhost'
    || hostname === '127.0.0.1';
}

function normalizeApiBase(value) {
  const clean = String(value || API_DEFAULT).trim().replace(/\/+$/, '');
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

function initials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] || 'U').toUpperCase();
}

function readJson(value) {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractError(data, status) {
  if (data?.fields) {
    return Object.values(data.fields).join(' ');
  }
  if (data?.message) return data.message;
  return `Erro na requisição (${status}).`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}
