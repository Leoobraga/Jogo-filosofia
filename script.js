/* script.js
 - Quiz responsivo com trava de seleção, progresso, ajuda flutuante e boneco no progresso animado.
*/

(() => {
  const OBFUSCATION_OFFSET = 7;

  const QUESTIONS = [
    { q: "Se voce tivesse que entrar escondido na biblioteca de noite, como faria pra nao ser ouvindo andando pelos corredores escuros?", options: ["Andaria descalço, tenatndo evitar qualquer rangido das tabuas de madeira", "levaria uma vela apagada e usuario so o tato, confiando no sliencio absoluto ", "imitaria o ritmo das patrulhas, adando apenas quando os monges tambem fazem barulho", "arriscando correr rapido no escuro, confiando em chegar antes que notam"], correctObf: btoa(String(1  + OBFUSCATION_OFFSET)), hint: "Racionalista francês do século XVII." },
    { q: "imagina que voce achou um livro estranho sobre alquimia.. voce abriria e estudaria, mesmo sabendo que os monges podem te pegar", options: ["Sim, o conhecimento vale qualquer risco.", "Não, melhor deixar onde está e não chamar atenção", "Só daria uma olhada rápida e guardaria de novo.", "Esconderia o livro para estudar depois em segredo."], correctObf: btoa(String(1 + OB'FUSCATION_OFFSET)), hint: "Aluno de Sócrates, idealizou formas de Estado." },
    { q: "Se um monge te flagrasse com um livro proibido, o que voce falaria na hora pra se safar?", options: ["que estava limpando e o livro caiu por acaso em minhas mãos.", "Que apenas estava curioso, mas não entendi nada do conteúdo.", "Que achei o livro perigoso e ia levar ao abade.", "Confessaria, mas diria que o conhecimento também é um dom de Deus"], correctObf: btoa(String(2 + OBFUSCATION_OFFSET)), hint: "Filósofo alemão que criticou a moral tradicional." },
    { q: "NA sua oopiniao, o que é mais arriscado: desafiar a fé dos monges com ideias novas ou ficar na ignorância sem aprender nada?", options: ["Desafiar os monges - o castigo pode ser terrivel", "Ficar na ignorância - a alma fica vazia sem saber.", "Ambos são arriscados, mas o equilibrio entre fe e razao é o caminho", "Não quero arriscar nem um nem outro, prefiro viver obediente e seguro."], correctObf: btoa(String(2 + OBFUSCATION_OFFSET)), hint: "Processo usado por Descartes para buscar certeza." },
    { q: "Se vocẽ descobrisse um segredo cientifico que poderia mudar o futuor, mas teria que guardar pra vocẽ... contaria ou ficaria calado", options: ["Contaria, pois a verdade deve ser compartilhada.", "ficaria calado, para não ser punido e nem colocar ninguem em risco", "Revelaria apenas para alguem de confiança.",
       "Hume"], correctObf: btoa(String(0 + OBFUSCATION_OFFSET)), hint: "Filósofo que abordou o 'eterno retorno' e a 'vontade de poder'." },
    { q: "Quem é considerado o 'pai da filosofia ocidental'?", options: ["Sócrates", "Platão", "Aristóteles", "Heráclito"], correctObf: btoa(String(0 + OBFUSCATION_OFFSET)), hint: "Era mestre de Platão." },
    { q: "Qual filósofo escreveu 'A República'?", options: ["Platão", "Nietzsche", "Descartes", "Epicuro"], correctObf: btoa(String(0 + OBFUSCATION_OFFSET)), hint: "Discípulo de Sócrates, acreditava no mundo das ideias." },
    { q: "Quem disse a frase 'Só sei que nada sei'?", options: ["Aristóteles", "Kant", "Sócrates", "Montaigne"], correctObf: btoa(String(2 + OBFUSCATION_OFFSET)), hint: "Não deixou nada escrito, só conhecemos suas ideias por Platão." },
    { q: "Qual destes filósofos ficou famoso pelo 'contrato social'?", options: ["Rousseau", "Hobbes", "Locke", "Todos os anteriores"], correctObf: btoa(String(3 + OBFUSCATION_OFFSET)), hint: "Na verdade, vários pensaram sobre isso." },
    { q: "Quem escreveu 'Assim falou Zaratustra'?", options: ["Nietzsche", "Hegel", "Comte", "Marx"], correctObf: btoa(String(0 + OBFUSCATION_OFFSET)), hint: "Filósofo alemão que criticou a moral cristã." },
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
