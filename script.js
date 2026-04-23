class GeradorSenhas {
  constructor() {
    this.senhaAtual = '';
    this.tamanhoFixo = 16;
    this.maiusculas = true;
    this.minusculas = true;
    this.numeros = true;
    this.simbolos = true;
    this.historico = [];
    this.gerando = false;
    
    this.iniciar();
  }

  iniciar() {
    this.carregarDados();
    this.configurarEventos();
    this.gerarSenha();
    this.atualizarInterface();
  }

  carregarDados() {
    const historicoSalvo = localStorage.getItem('historicoSenhas');
    if (historicoSalvo) {
      this.historico = JSON.parse(historicoSalvo);
    }
  }

  salvarDados() {
    localStorage.setItem('historicoSenhas', JSON.stringify(this.historico));
  }

  configurarEventos() {
    document.getElementById('generateBtn').addEventListener('click', () => this.gerarSenha());
    document.getElementById('copyBtn').addEventListener('click', () => this.copiarSenha());
    document.getElementById('clearHistoryBtn').addEventListener('click', () => this.limparHistorico());
    
    document.getElementById('uppercaseCheck').addEventListener('change', (e) => {
      this.maiusculas = e.target.checked;
    });
    
    document.getElementById('lowercaseCheck').addEventListener('change', (e) => {
      this.minusculas = e.target.checked;
    });
    
    document.getElementById('numbersCheck').addEventListener('change', (e) => {
      this.numeros = e.target.checked;
    });
    
    document.getElementById('symbolsCheck').addEventListener('change', (e) => {
      this.simbolos = e.target.checked;
    });
  }

  gerarSenha() {
    if (this.gerando) return;
    
    this.gerando = true;
    this.animarGeracao();
    
    setTimeout(() => {
      let caracteres = '';
      
      if (this.maiusculas) caracteres += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if (this.minusculas) caracteres += 'abcdefghijklmnopqrstuvwxyz';
      if (this.numeros) caracteres += '0123456789';
      if (this.simbolos) caracteres += '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      if (caracteres === '') {
        this.mostrarNotificacao('Selecione pelo menos um tipo de caractere', 'erro');
        this.gerando = false;
        return;
      }
      
      let novaSenha = '';
      for (let i = 0; i < this.tamanhoFixo; i++) {
        novaSenha += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }
      
      this.senhaAtual = novaSenha;
      this.calcularForca();
      this.adicionarAoHistorico();
      this.atualizarInterface();
      
      this.gerando = false;
    }, 300);
  }

  calcularForca() {
    let forca = 0;
    
    if (this.senhaAtual.length >= 12) forca += 25;
    if (this.senhaAtual.length >= 16) forca += 25;
    
    if (/[a-z]/.test(this.senhaAtual)) forca += 15;
    if (/[A-Z]/.test(this.senhaAtual)) forca += 15;
    if (/[0-9]/.test(this.senhaAtual)) forca += 15;
    if (/[^a-zA-Z0-9]/.test(this.senhaAtual)) forca += 20;
    
    this.forcaSenha = Math.min(forca, 100);
  }

  adicionarAoHistorico() {
    const entrada = {
      senha: this.senhaAtual,
      data: new Date().toISOString()
    };
    
    this.historico.unshift(entrada);
    if (this.historico.length > 5) {
      this.historico = this.historico.slice(0, 5);
    }
    
    this.salvarDados();
    this.atualizarHistorico();
  }

  async copiarSenha() {
    try {
      await navigator.clipboard.writeText(this.senhaAtual);
      this.mostrarFeedbackCopiar();
      this.mostrarNotificacao('Senha copiada com sucesso!', 'sucesso');
    } catch (erro) {
      this.mostrarNotificacao('Erro ao copiar senha', 'erro');
    }
  }

  mostrarFeedbackCopiar() {
    const botao = document.getElementById('copyBtn');
    const texto = document.getElementById('copyText');
    
    botao.classList.add('copied');
    texto.textContent = 'Copiado!';
    
    setTimeout(() => {
      botao.classList.remove('copied');
      texto.textContent = 'Copiar';
    }, 2000);
  }

  limparHistorico() {
    this.historico = [];
    this.salvarDados();
    this.atualizarHistorico();
    this.mostrarNotificacao('Histórico limpo!', 'sucesso');
  }

  atualizarInterface() {
    document.getElementById('passwordText').textContent = this.senhaAtual;
    this.atualizarForca();
    this.atualizarHistorico();
  }

  atualizarForca() {
    const barra = document.getElementById('strengthBar');
    const nivel = document.getElementById('strengthLevel');
    
    let nivelTexto, classe;
    if (this.forcaSenha <= 30) {
      nivelTexto = 'Fraca';
      classe = 'weak';
    } else if (this.forcaSenha <= 60) {
      nivelTexto = 'Média';
      classe = 'medium';
    } else if (this.forcaSenha <= 80) {
      nivelTexto = 'Forte';
      classe = 'strong';
    } else {
      nivelTexto = 'Muito Forte';
      classe = 'very-strong';
    }
    
    nivel.textContent = nivelTexto;
    nivel.className = classe;
    barra.className = classe;
    
    setTimeout(() => {
      barra.style.width = `${this.forcaSenha}%`;
    }, 100);
  }

  atualizarHistorico() {
    const lista = document.getElementById('historyList');
    lista.innerHTML = '';
    
    if (this.historico.length === 0) {
      lista.innerHTML = '<p class="empty-history">Nenhuma senha gerada ainda</p>';
      return;
    }
    
    this.historico.forEach((item, index) => {
      const elemento = document.createElement('div');
      elemento.className = 'history-item';
      elemento.textContent = item.senha;
      
      elemento.addEventListener('click', () => {
        this.senhaAtual = item.senha;
        this.calcularForca();
        this.atualizarInterface();
        this.mostrarNotificacao('Senha carregada do histórico', 'sucesso');
      });
      
      lista.appendChild(elemento);
    });
  }

  animarGeracao() {
    const display = document.getElementById('passwordText');
    display.style.opacity = '0.3';
    
    setTimeout(() => {
      display.style.opacity = '1';
    }, 250);
  }

  mostrarNotificacao(mensagem, tipo = 'sucesso') {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.className = `toast ${tipo}`;
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new GeradorSenhas();
});
