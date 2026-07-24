// =========================================
// LÓGICA DE LOGIN (E-mail/Senha e Google)
// =========================================
const loginForm = document.getElementById('loginForm');
const btnGoogleLogin = document.getElementById('btnGoogleLogin');
const appLogin = document.getElementById('app-login');
const appDashboard = document.getElementById('app-dashboard');
const btnSair = document.getElementById('btnSair');

if(loginForm) {
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        entrarNoSistema();
    });
}

if(btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', function() {
        mostrarAviso('Autenticando via Google Workspace...', 'success');
        setTimeout(() => {
            entrarNoSistema();
        }, 800);
    });
}

function entrarNoSistema() {
    appLogin.style.display = 'none';
    appDashboard.style.display = 'flex';
    mostrarAviso('Sessão iniciada com sucesso!', 'success');
}

if(btnSair) {
    btnSair.addEventListener('click', function() {
        const senhaEl = document.getElementById('senha');
        if(senhaEl) senhaEl.value = '';
        appDashboard.style.display = 'none';
        appLogin.style.display = 'flex';
        mostrarAviso('Desconectado do sistema.', 'success');
    });
}

// =========================================
// MODAL DOS POSTOS DE SAÚDE
// =========================================
const modalPostos = document.getElementById('modalPostos');
const btnSidebarPostos = document.getElementById('btnSidebarPostos');
const btnFecharPostos = document.getElementById('fecharModalPostos');

if(btnSidebarPostos) btnSidebarPostos.addEventListener('click', () => { modalPostos.classList.add('active'); });
if(btnFecharPostos) btnFecharPostos.addEventListener('click', () => { modalPostos.classList.remove('active'); });
if(modalPostos) modalPostos.addEventListener('click', (e) => { if (e.target === modalPostos) modalPostos.classList.remove('active'); });

// =========================================
// NAVEGAÇÃO DE TELAS DINÂMICA
// =========================================
const botoesNavegacao = document.querySelectorAll('.open-view, .nav-link');
const todasAsTelas = document.querySelectorAll('.page-view');
const itensMenuLateral = document.querySelectorAll('.nav-link');

botoesNavegacao.forEach(botao => {
    botao.addEventListener('click', (e) => {
        e.preventDefault(); 
        const telaAlvoId = botao.getAttribute('data-target');
        if(!telaAlvoId) return;

        todasAsTelas.forEach(tela => {
            tela.style.display = 'none';
        });

        const telaAlvo = document.getElementById(telaAlvoId);
        if(telaAlvo) {
            telaAlvo.style.display = 'flex';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        itensMenuLateral.forEach(item => item.classList.remove('active'));
        
        const menuCorrespondente = document.querySelector(`.nav-link[data-target="${telaAlvoId}"]`);
        if(menuCorrespondente) {
            menuCorrespondente.classList.add('active');
        } else if(telaAlvoId !== 'view-dashboard') {
            const menuDash = document.getElementById('menuDashboard');
            if(menuDash) menuDash.classList.add('active');
        }
    });
});

// =========================================
// SISTEMA DE AVISOS (TOASTS) E BANCO LOCAL
// =========================================
function mostrarAviso(mensagem, tipo = 'success') {
    const container = document.getElementById('toast-container');
    if(!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerText = mensagem;
    
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 350);
    }, 3000);
}

// Salvar Nova Consulta com a Profissional responsável
const formNovaConsulta = document.getElementById('formNovaConsulta');

if(formNovaConsulta) {
    formNovaConsulta.addEventListener('submit', function(e) {
        e.preventDefault(); 
        
        const selectCrianca = document.getElementById('selectCrianca');
        const nomeCrianca = selectCrianca.options[selectCrianca.selectedIndex].text;
        const dataConsulta = document.getElementById('dataConsulta').value;
        const queixa = document.getElementById('queixaPrincipal').value;
        const profissional = document.getElementById('nomeProfissional').value; // Captura o nome da profissional

        let listaConsultas = JSON.parse(localStorage.getItem('consultas_puericultura')) || [];
        listaConsultas.push({ nome: nomeCrianca, data: dataConsulta, queixa: queixa, profissional: profissional });
        localStorage.setItem('consultas_puericultura', JSON.stringify(listaConsultas));

        mostrarAviso('Consulta salva e registrada com sucesso!', 'success');
        formNovaConsulta.reset();
        
        atualizarCadernetaDigital();

        setTimeout(() => {
            const menuDash = document.getElementById('menuDashboard');
            if(menuDash) menuDash.click();
        }, 1200);
    });
}

// Atualizar listagem na Caderneta Digital exibindo a Profissional
function atualizarCadernetaDigital() {
    const containerCaderneta = document.getElementById('listaCriancasCadastradas');
    if(!containerCaderneta) return;

    let listaConsultas = JSON.parse(localStorage.getItem('consultas_puericultura')) || [];

    let html = `
        <div style="font-weight: 800; font-size: 16px; margin-bottom: 16px; color: var(--text-main);">Registros Ativos e Histórico de Consultas</div>
        <div class="child-row">
            <div class="child-info">
                <h4>Sofia Costa Lima</h4>
                <div class="child-meta">
                    <span class="meta-item">📅 09/01/2023</span>
                    <span class="meta-item">👶 3 ano(s)</span>
                    <span class="meta-item">👩‍⚕️ Profissional: Enf. Ana Paula</span>
                    <span class="meta-item">👤 Responsável: Mariana Lima</span>
                </div>
            </div>
            <div class="child-actions">
                <button class="btn-icon btn-edit" title="Editar">✏️</button>
                <button class="btn-icon btn-delete" title="Excluir">🗑️</button>
            </div>
        </div>
    `;

    listaConsultas.forEach((item, index) => {
        html += `
        <div class="child-row" style="border-left: 4px solid var(--primary);">
            <div class="child-info">
                <h4>${item.nome} <span style="font-size: 11px; background: var(--primary-light); color: var(--primary); padding: 2px 8px; border-radius: 6px; margin-left: 8px;">Nova Consulta</span></h4>
                <div class="child-meta">
                    <span class="meta-item">📅 Data: ${item.data}</span>
                    <span class="meta-item">👩‍⚕️ Profissional: ${item.profissional || 'Não informada'}</span>
                    <span class="meta-item">📝 Queixa: ${item.queixa}</span>
                </div>
            </div>
            <div class="child-actions">
                <button class="btn-icon btn-delete" onclick="removerConsulta(${index})" title="Excluir Registro">🗑️</button>
            </div>
        </div>`;
    });

    containerCaderneta.innerHTML = html;
}

function removerConsulta(index) {
    let listaConsultas = JSON.parse(localStorage.getItem('consultas_puericultura')) || [];
    listaConsultas.splice(index, 1);
    localStorage.setItem('consultas_puericultura', JSON.stringify(listaConsultas));
    atualizarCadernetaDigital();
    mostrarAviso('Registro removido do banco local.', 'success');
}

window.addEventListener('DOMContentLoaded', () => {
    atualizarCadernetaDigital();
});