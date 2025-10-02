/* script.js
 - Quiz responsivo com trava de seleção, progresso, ajuda flutuante e boneco no progresso animado.
*/
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const quizCard = document.getElementById('quiz-card');

startBtn.addEventListener('click', () => {
  startScreen.classList.add('hidden');   // esconde a tela inicial
  quizCard.classList.remove('hidden');   // mostra o quiz
});

(() => {
  const OBFUSCATION_OFFSET = 7;

  const QUESTIONS = [

    { q: "Se você tivesse que entrar escondido na biblioteca de noite, como faria pra não ser ouvido andando pelos corredores escuros? ", options: [" Andaria descalço, tentando evitar qualquer rangido das tábuas de madeira.", "Imitaria o ritmo das patrulhas, andando apenas quando os monges também fazem barulho.",  "Levaria uma vela apagada e usaria só o tato, confiando no silêncio absoluto.", " Arriscaria correr rápido no escuro, confiando em chegar antes que notem."], correctObf: btoa(String(1 + OBFUSCATION_OFFSET)), hint: "Imitar os movimentos dos monges pode ser uma boa ideia." },
    { q: " Imagina que você achou um livro estranho sobre alquimia… você abriria e estudaria, mesmo sabendo que os monges podem te pegar?", options: ["Sim, o conhecimento vale qualquer risco.", " Esconderia o livro para estudar depois em segredo.", "Não, melhor deixar onde está e não chamar atenção.", "Só daria uma olhada rápida e guardaria de novo"], correctObf: btoa(String(1 + OBFUSCATION_OFFSET)), hint: "A melhor opção é esconder o livro" },
    { q: "Se um monge te flagrasse com um livro proibido, o que você falaria na hora pra se safar?", options: ["Que apenas estava curioso, mas não entendi nada do conteúdo.", "Que achei o livro perigoso e ia levar ao abade." , "Que estava limpando e o livro caiu por acaso em minhas mãos.", "Confessaria, mas diria que o conhecimento também é um dom de Deus."], correctObf: btoa(String(2 + OBFUSCATION_OFFSET)), hint: "Fingir algo deve ser a opção certa" },

    { q: "Na sua opinião, o que é mais arriscado: desafiar a fé dos monges com ideias novas ou ficar na ignorância sem aprender nada?", options: ["Ambos são arriscados, mas o equilíbrio entre fé e razão é o caminho", "Desafiar os monges — o castigo pode ser terrível.", " Ficar na ignorância — a alma fica vazia sem saber.", "Não quero arriscar nem um nem outro, prefiro viver obediente e seguro."], correctObf: btoa(String(0 + OBFUSCATION_OFFSET)), hint: "A vida é sobre ter uma filosofia..." },
    { q: " Se você descobrisse um segredo científico que poderia mudar o futuro, mas teria que guardar pra você… contaria ou ficaria calado?", options: ["Guardaria em código secreto, para que apenas os sábios do futuro pudessem decifrar.", "Revelaria apenas para alguém de confiança.", "Ficaria calado, para não ser punido e nem colocar ninguém em risco.", "Contaria, pois a verdade deve ser compartilhada."], correctObf: btoa(String(0 + OBFUSCATION_OFFSET)), hint: "Somente pessoas inteligentes devem saber..." },
    { q: "Você encontra uma passagem escondida atrás de uma estante na biblioteca. O que faz?", options: ["Marcar discretamente o local e voltar depois, quando estiver mais seguro.", "Entrar de imediato", "Ignorar", " Chamar outro monge "], correctObf: btoa(String(0 + OBFUSCATION_OFFSET)), hint: "Há muitos monges no local.." },

    { q: "Um manuscrito fala de uma fórmula para criar fogo sem lenha. O que faz?", options: ["Copiar em partes e esconder em lugares diferentes.", " Decorar tudo", " Guardar inteiro contigo", " Usar imediatamente"], correctObf: btoa(String(0 + OBFUSCATION_OFFSET)), hint: "Ser discreto é a melhor forma" },
    { q: "Você percebe que um monge mais velho também parece saber segredos proibidos. O que faz?", options: ["Evitar totalmente ", "Contar seus segredos ", "Observar primeiro seus hábitos antes de se aproximar.", " Confrontar direto "], correctObf: btoa(String(2 + OBFUSCATION_OFFSET)), hint: "Estudar sempre é a melhor forma." },
    { q: "A biblioteca está em chamas, e você só pode salvar um tipo de livro. Qual?", options: ["Não salvar nenhum", " O de contos", " O de fé", " O de conhecimentos únicos (ciência, alquimia)."], correctObf: btoa(String(3 + OBFUSCATION_OFFSET)), hint: "Todos são importante, mas o conhecimento é unico" },

    { q: "Você encontra um símbolo estranho gravado em uma parede antiga do monastério. O que faz?", options: [" Copiar o símbolo e pesquisar em segredo depois.", "Tocar o símbolo ", " Ignorar", " Mostrar aos monges"], correctObf: btoa(String(0 + OBFUSCATION_OFFSET)), hint: "Nessa epoca tudo deve ser feito em sigilo. " 
      
    },
  ];

  // ---------- DOM ----------
  const qText = document.getElementById('question-text');
  const optionsWrap = document.getElementById('options');
  const progressBar = document.getElementById('progress-bar');
  const progressAvatar = document.getElementById('progress-avatar');
  const nextBtn = document.getElementById('next-btn');
  const helpBtn = document.getElementById('help-btn');
  const resultScreen = document.getElementById('result-screen');
  const quizCard = document.getElementById('quiz-card');
  const restartBtn = document.getElementById('restart-btn');
  const currentScoreSpan = document.getElementById('current-score');
  const totalQuestionsSpan = document.getElementById('total-questions');
  const correctCountSpan = document.getElementById('correct-count');
  const totalSpan = document.getElementById('total');

  let idx = 0;
  let correctCount = 0;
  let locked = false;
  const totalQ = QUESTIONS.length;

  const helpUnlockThreshold = 3; // acertos necessários por dica
  let lastHelpUnlock = 0; // registra acertos na última liberação
  let helpAvailable = false; // se há ajuda disponível para uso

  totalQuestionsSpan.textContent = totalQ;
  totalSpan.textContent = totalQ;
  updateScoreMini();
  renderQuestion();

  function decodeCorrectIndex(obf) {
    try { return parseInt(atob(obf),10) - OBFUSCATION_OFFSET; } catch(e){ return -1; }
  }

  function renderQuestion() {
    locked = false;
    nextBtn.disabled = true;
    const Q = QUESTIONS[idx];
    qText.textContent = `(${idx + 1}/${totalQ}) ${Q.q}`;
    optionsWrap.innerHTML = '';

    Q.options.forEach((opt, i)=>{
      const btn = document.createElement('button');
      btn.className='option';
      btn.type='button';
      btn.dataset.index=i;
      btn.innerHTML=`<span class="opt-text">${opt}</span>`;
      btn.addEventListener('click', onOptionClick);
      optionsWrap.appendChild(btn);
    });

    updateProgress();
    maybeShowHelpButton();
  }

  function onOptionClick(e){
    if(locked) return;
    locked=true;

    const target = e.currentTarget;
    const chosen = Number(target.dataset.index);
    const correctIndex = decodeCorrectIndex(QUESTIONS[idx].correctObf);

    Array.from(optionsWrap.children).forEach(el=>el.classList.add('locked'));

    if(chosen===correctIndex){
      target.classList.add('correct');
      correctCount++;
    }else{
      target.classList.add('wrong');
      const correctBtn = Array.from(optionsWrap.children).find(b=>Number(b.dataset.index)===correctIndex);
      if(correctBtn) correctBtn.classList.add('correct');
    }

    updateScoreMini();
    nextBtn.disabled=false;

    checkHelpUnlock();
  }

  function checkHelpUnlock() {
    // libera nova ajuda a cada 3 acertos adicionais
    if(correctCount - lastHelpUnlock >= helpUnlockThreshold) {
      helpAvailable = true;
      lastHelpUnlock = correctCount; // registra que a ajuda foi liberada
    }
  }

  nextBtn.addEventListener('click', ()=>{
    idx++;
    if(idx>=totalQ){ showResults(); }
    else{ renderQuestion(); }
  });

  function showResults(){
    quizCard.classList.add('hidden');
    resultScreen.classList.remove('hidden');
    correctCountSpan.textContent = correctCount;
  }

  restartBtn.addEventListener('click', ()=>{
    idx=0; correctCount=0; locked=false;
    lastHelpUnlock = 0;
    helpAvailable = false;
    resultScreen.classList.add('hidden');
    quizCard.classList.remove('hidden');
    updateScoreMini();
    progressBar.style.width='0%';
    if(progressAvatar) progressAvatar.style.left='0%';
    renderQuestion();
  });

  helpBtn.addEventListener('click', ()=>{
    if(correctCount < 3) {
      showTemporaryToast(`Necessário acertar pelo menos 3 questões para usar a ajuda`, 3000);
      return;
    }
    if(!helpAvailable){
      showTemporaryToast(`Mais acertos necessários para desbloquear nova dica`, 3000);
      return;
    }

    const correctIndex = decodeCorrectIndex(QUESTIONS[idx].correctObf);
    const optionBtns = Array.from(optionsWrap.children).filter(b=>!b.classList.contains('locked'));
    const wrongBtns = optionBtns.filter(b=>Number(b.dataset.index)!==correctIndex);
    shuffleArray(wrongBtns);
    const toDisable = wrongBtns.slice(0, Math.max(0, wrongBtns.length-1));
    toDisable.forEach(b=>{
      b.setAttribute('disabled','true');
      b.classList.add('locked');
      b.style.opacity='0.45';
      b.style.pointerEvents='none';
    });

    helpAvailable = false; // uso consumido até próximo desbloqueio
    const hint = QUESTIONS[idx].hint || 'Sem dica disponível.';
    showTemporaryToast(`Ajuda usada — dica: ${hint}`, 4000);
  });

  function maybeShowHelpButton() {
    // botão sempre visível
    helpBtn.classList.remove('hidden');
  }

  function updateProgress(){
    const percent = Math.round((idx/totalQ)*100);
    progressBar.style.width=`${percent}%`;
    if(progressAvatar){
      progressAvatar.style.left=`${percent}%`;
      const jump = Math.sin((percent/100) * Math.PI) * 15;
      progressAvatar.style.top = `${-20 - jump}px`;
      progressAvatar.style.transition = 'left 0.4s ease, top 0.4s ease';
    }
  }

  function updateScoreMini(){ currentScoreSpan.textContent = correctCount; }

  function shuffleArray(arr){
    for(let i=arr.length-1;i>0;i--){
      const j=Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]]=[arr[j],arr[i]];
    }
  }

  function showTemporaryToast(msg, time=2500){
    const t=document.createElement('div');
    t.className='card';
    t.style.position='fixed';
    t.style.left='50%';
    t.style.transform='translateX(-50%)';
    t.style.bottom='92px';
    t.style.zIndex=9999;
    t.style.padding='12px 18px';
    t.style.borderRadius='12px';
    t.style.maxWidth='92%';
    t.style.boxShadow='0 10px 30px rgba(2,6,23,0.6)';
    t.innerText=msg;
    document.body.appendChild(t);
    setTimeout(()=>{
      t.style.transition='opacity 400ms';
      t.style.opacity='0';
      setTimeout(()=>t.remove(),450);
    },time);
  }

  function disableShortcuts(){
    window.addEventListener('contextmenu', e=>e.preventDefault());
    window.addEventListener('keydown', e=>{
      if(e.key==='F12') e.preventDefault();
      if(e.ctrlKey && e.shiftKey && (e.key==='I'||e.key==='C')) e.preventDefault();
      if(e.ctrlKey && (e.key==='U'||e.key==='S')) e.preventDefault();
    });
    document.addEventListener('selectstart', e=>e.preventDefault());
    document.addEventListener('dragstart', e=>e.preventDefault());
  }
  disableShortcuts();

})();
