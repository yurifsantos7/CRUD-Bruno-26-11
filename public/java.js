
const API_URL = '/usuarios';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

// Recuperar usuário logado
function obterUsuarioLogado() {
  try {
    return JSON.parse(localStorage.getItem('usuarioLogado'));
  } catch (error) {
    return null;
  }
}

// Verificar se é administrador
function ehAdmin(usuario) {
  if (!usuario) return false;

  return (
    usuario.perfil === 'admin' ||
    usuario.categoria === 'admin' ||
    usuario.email?.toLowerCase() === 'admin@senai.com'
  );
}

// ============================================
// LOGIN
// ============================================

const loginForm = document.getElementById('loginForm');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value.trim();

    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('Erro ao consultar usuários.');
      }

      const usuarios = await response.json();

      const usuarioEncontrado = usuarios.find((u) =>
        u.email?.toLowerCase() === email.toLowerCase() &&
        u.senha === senha
      );

      if (!usuarioEncontrado) {
        alert('E-mail ou senha incorretos.');
        return;
      }

      // Salvar usuário logado
      localStorage.setItem(
        'usuarioLogado',
        JSON.stringify(usuarioEncontrado)
      );

      alert(
        `Login efetuado com sucesso! Bem-vindo(a), ${usuarioEncontrado.nome}.`
      );

      // Redirecionar conforme o perfil
      if (ehAdmin(usuarioEncontrado)) {
        window.location.href = 'admin.html';
      } else {
        window.location.href = 'boas_vindas.html';
      }

    } catch (error) {
      console.error('Erro no login:', error);

      alert(
        'Erro de conexão com a API. Verifique se o servidor está rodando.'
      );
    }
  });
}


// ============================================
// CADASTRO
// ============================================

const cadastroForm = document.getElementById('cadastroForm');

if (cadastroForm) {
  cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const novoUsuario = {
      nome: document.getElementById('nome').value.trim(),
      sobrenome: document.getElementById('sobrenome').value.trim(),
      cpf: document.getElementById('cpf').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
      email: document.getElementById('email').value.trim(),
      senha: document.getElementById('senha').value.trim(),
      cep: document.getElementById('cep').value.trim(),
      rua: document.getElementById('rua').value.trim(),
      cidade: document.getElementById('cidade').value.trim(),
      estado: document.getElementById('estado').value.trim().toUpperCase(),
      perfil: 'user'
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(novoUsuario)
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar usuário.');
      }

      alert('Cadastro realizado com sucesso! Faça login para continuar.');

      window.location.href = 'index.html';

    } catch (error) {
      console.error('Erro no cadastro:', error);
      alert('Erro ao cadastrar usuário na API.');
    }
  });
}


// ============================================
// VERIFICAR ACESSO ADMINISTRADOR
// ============================================

function verificarAcessoAdmin() {
  const usuarioLogado = obterUsuarioLogado();

  if (!usuarioLogado) {
    alert('Você precisa fazer login para acessar esta página!');
    window.location.href = 'index.html';
    return false;
  }

  if (!ehAdmin(usuarioLogado)) {
    alert('Acesso restrito para administradores!');
    window.location.href = 'boas_vindas.html';
    return false;
  }

  return true;
}


// ============================================
// ACESSAR PAINEL ADMIN
// ============================================

function admin() {
  const usuarioLogado = obterUsuarioLogado();

  if (!usuarioLogado) {
    alert('Você precisa fazer login!');
    window.location.href = 'index.html';
    return;
  }

  if (ehAdmin(usuarioLogado)) {
    window.location.href = 'admin.html';
  } else {
    alert('Você não tem acesso de administrador!');
  }
}


// ============================================
// CARREGAR USUÁRIOS
// ============================================

async function carregarUsuarios() {
  const tabela = document.getElementById('tabelaUsuarios');

  if (!tabela) return;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error('Erro ao carregar usuários.');
    }

    const usuarios = await response.json();

    renderizarTabela(usuarios);

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    alert('Erro ao carregar usuários.');
  }
}


// ============================================
// RENDERIZAR TABELA
// ============================================

function renderizarTabela(usuarios) {
  const tabela = document.getElementById('tabelaUsuarios');

  if (!tabela) return;

  tabela.innerHTML = '';

  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    tabela.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center;">
          Nenhum usuário encontrado.
        </td>
      </tr>
    `;
    return;
  }

  usuarios.forEach((user) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${user.nome || ''} ${user.sobrenome || ''}</td>
      <td>${user.cpf || ''}</td>
      <td>${user.email || ''}</td>
      <td>${user.cidade || ''}/${user.estado || ''}</td>
      <td>${user.telefone || ''}</td>

      <td class="actions-cell">
        <button
          class="btn-warning"
          onclick="abrirEdicao('${user.id}')">
          Editar
        </button>

        <button
          class="btn-danger"
          onclick="deletarUsuario('${user.id}')">
          Excluir
        </button>
      </td>
    `;

    tabela.appendChild(tr);
  });
}


// ============================================
// BUSCAR POR CPF
// ============================================

async function buscarPorCpf() {
  const campoBusca = document.getElementById('searchCpf');

  if (!campoBusca) return;

  const cpfBusca = campoBusca.value.trim();

  if (!cpfBusca) {
    carregarUsuarios();
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}?cpf=${encodeURIComponent(cpfBusca)}`
    );

    if (!response.ok) {
      throw new Error('Erro na pesquisa.');
    }

    const usuarios = await response.json();

    renderizarTabela(usuarios);

  } catch (error) {
    console.error('Erro ao buscar CPF:', error);
    alert('Erro ao buscar CPF.');
  }
}


// ============================================
// ABRIR EDIÇÃO
// ============================================

async function abrirEdicao(id) {
  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`
    );

    if (!response.ok) {
      throw new Error('Usuário não encontrado.');
    }

    const user = await response.json();

    document.getElementById('editId').value = user.id;
    document.getElementById('editNome').value = user.nome || '';
    document.getElementById('editSobrenome').value = user.sobrenome || '';
    document.getElementById('editCpf').value = user.cpf || '';
    document.getElementById('editTelefone').value = user.telefone || '';
    document.getElementById('editEmail').value = user.email || '';
    document.getElementById('editSenha').value = user.senha || '';
    document.getElementById('editCep').value = user.cep || '';
    document.getElementById('editRua').value = user.rua || '';
    document.getElementById('editCidade').value = user.cidade || '';
    document.getElementById('editEstado').value = user.estado || '';

    const editCategoria = document.getElementById('editCategoria');

    if (editCategoria) {
      editCategoria.value = user.perfil || user.categoria || 'user';
    }

    const form = document.getElementById('editForm');

    if (form) {
      form.dataset.perfil = user.perfil || user.categoria || 'user';
    }

    const editCard = document.getElementById('editCard');

    if (editCard) {
      editCard.style.display = 'block';

      editCard.scrollIntoView({
        behavior: 'smooth'
      });
    }

  } catch (error) {
    console.error('Erro ao abrir edição:', error);
    alert('Erro ao carregar dados do usuário.');
  }
}


// ============================================
// FECHAR EDIÇÃO
// ============================================

function fecharEdicao() {
  const editCard = document.getElementById('editCard');

  if (editCard) {
    editCard.style.display = 'none';
  }
}


// ============================================
// ATUALIZAR USUÁRIO
// ============================================

const editForm = document.getElementById('editForm');

if (editForm) {
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('editId').value;

    if (!id) {
      alert('ID do usuário não encontrado.');
      return;
    }

    const usuarioAtualizado = {
      nome: document.getElementById('editNome').value.trim(),
      sobrenome: document.getElementById('editSobrenome').value.trim(),
      cpf: document.getElementById('editCpf').value.trim(),
      telefone: document.getElementById('editTelefone').value.trim(),
      email: document.getElementById('editEmail').value.trim(),
      senha: document.getElementById('editSenha').value.trim(),
      cep: document.getElementById('editCep').value.trim(),
      rua: document.getElementById('editRua').value.trim(),
      cidade: document.getElementById('editCidade').value.trim(),
      estado: document.getElementById('editEstado').value.trim().toUpperCase(),
      perfil:
        document.getElementById('editCategoria')?.value.trim() ||
        editForm.dataset.perfil ||
        'user'
    };

    try {
      const response = await fetch(
        `${API_URL}/${encodeURIComponent(id)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(usuarioAtualizado)
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar usuário.');
      }

      alert('Usuário atualizado com sucesso!');

      fecharEdicao();

      carregarUsuarios();

    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar usuário.');
    }
  });
}


// ============================================
// EXCLUIR USUÁRIO
// ============================================

async function deletarUsuario(id) {
  const confirmar = confirm(
    'Tem certeza que deseja excluir este usuário?'
  );

  if (!confirmar) return;

  try {
    const response = await fetch(
      `${API_URL}/${encodeURIComponent(id)}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      throw new Error('Erro ao excluir usuário.');
    }

    alert('Usuário excluído com sucesso!');

    carregarUsuarios();

  } catch (error) {
    console.error('Erro ao excluir:', error);
    alert('Erro ao excluir usuário.');
  }
}


// ============================================
// LOGOUT
// ============================================

function fazerLogout() {
  localStorage.removeItem('usuarioLogado');

  window.location.href = 'index.html';
}


// ============================================
// INICIALIZAÇÃO DA PÁGINA
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // Atualizar nome do usuário na página de boas-vindas
  const welcomeHeading = document.getElementById('welcomeHeading');

  if (welcomeHeading) {
    const usuarioLogado = obterUsuarioLogado();

    if (usuarioLogado) {
      welcomeHeading.textContent =
        `Bem-vindo ao SENAI, ${usuarioLogado.nome}!`;
    }
  }

  // Proteger painel administrativo
  if (document.getElementById('tabelaUsuarios')) {
    if (verificarAcessoAdmin()) {
      carregarUsuarios();
    }
  }

});
