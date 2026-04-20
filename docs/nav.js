/* Shared deck navigation — GitHub-Pages friendly (relative paths only) */
(function(){
  const slides = document.querySelectorAll('.slide');
  const progress = document.getElementById('progress');
  let i = 0;

  function show(n){
    slides[i].classList.remove('active');
    i = Math.max(0, Math.min(slides.length-1, n));
    slides[i].classList.add('active');
    if(progress) progress.style.width = ((i+1)/slides.length*100) + '%';
    slides[i].scrollTop = 0;
    history.replaceState(null,'','#'+(i+1));
  }

  // Custom in-page confirmation modal — always visible, styled, branded.
  function customConfirm(opts, onYes){
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box" role="dialog" aria-modal="true" aria-labelledby="cnf-title">
        <span class="badge">${opts.badge || 'Heads up'}</span>
        <h3 id="cnf-title">${opts.title}</h3>
        <p>${opts.message}</p>
        <div class="confirm-actions">
          <button class="confirm-cancel">${opts.cancelLabel || 'Stay here'}</button>
          <button class="confirm-ok">${opts.okLabel || 'Continue'}</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    const cancel = overlay.querySelector('.confirm-cancel');
    const ok = overlay.querySelector('.confirm-ok');
    function close(){ overlay.remove(); document.removeEventListener('keydown', escClose); }
    function escClose(e){
      if(e.key === 'Escape'){ close(); e.preventDefault(); }
      else if(e.key === 'Enter'){ close(); onYes(); e.preventDefault(); }
    }
    cancel.onclick = close;
    ok.onclick = () => { close(); onYes(); };
    overlay.addEventListener('click', e => { if(e.target === overlay) close(); });
    document.addEventListener('keydown', escClose);
    setTimeout(() => ok.focus(), 50);
  }

  // Confirmed navigations — always show the modal, even if already on first slide.
  function goHome(){
    if(i === 0){
      customConfirm({
        badge: 'Already here',
        title: "You're already on the first slide",
        message: 'Nothing to jump back to. Use → or Space to advance through the deck.',
        cancelLabel: 'Got it',
        okLabel: 'OK'
      }, () => {});
      return;
    }
    customConfirm({
      badge: 'First slide',
      title: 'Jump to the first slide?',
      message: 'This will take you to slide 1 of this deck. You can come back to slide ' + (i+1) + ' using your browser back button.',
      cancelLabel: 'Stay on slide ' + (i+1),
      okLabel: 'Go to slide 1'
    }, () => show(0));
  }

  function goIndex(){
    customConfirm({
      badge: 'Leaving deck',
      title: 'Return to the index page?',
      message: 'This will close this deck and take you back to the welcome page where you can pick another deck.',
      cancelLabel: 'Stay in this deck',
      okLabel: 'Go to index'
    }, () => { window.location.href = 'index.html'; });
  }

  // Glossary modal
  function openGlossary(){
    const m = document.getElementById('glossary-modal');
    if(m) m.classList.add('open');
  }
  function closeGlossary(){
    const m = document.getElementById('glossary-modal');
    if(m) m.classList.remove('open');
  }

  document.addEventListener('keydown', e => {
    if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA') return;
    // If glossary or confirm overlay is open, Esc closes it (handled inside)
    const m = document.getElementById('glossary-modal');
    if(m && m.classList.contains('open')){
      if(e.key==='Escape'){ closeGlossary(); e.preventDefault(); return; }
    }
    if(document.querySelector('.confirm-overlay')) return; // confirm modal owns the keyboard
    if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){ show(i+1); e.preventDefault(); }
    else if(e.key==='ArrowLeft'||e.key==='PageUp'){ show(i-1); e.preventDefault(); }
    else if(e.key==='Home'||e.key==='1') goHome();
    else if(e.key==='End') show(slides.length-1);
    else if(e.key==='g'||e.key==='G'||e.key==='?') openGlossary();
    else if(e.key==='i'||e.key==='I') goIndex();
  });

  // Wire buttons
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');
  const homeBtn = document.getElementById('home');
  const indexBtn = document.getElementById('to-index');
  const glossBtn = document.getElementById('glossary-btn');
  const glossClose = document.getElementById('glossary-close');
  if(nextBtn) nextBtn.onclick = () => show(i+1);
  if(prevBtn) prevBtn.onclick = () => show(i-1);
  if(homeBtn) homeBtn.onclick = goHome;
  if(indexBtn) indexBtn.onclick = goIndex;
  if(glossBtn) glossBtn.onclick = openGlossary;
  if(glossClose) glossClose.onclick = closeGlossary;

  // click outside glossary box closes it
  const gm = document.getElementById('glossary-modal');
  if(gm){
    gm.addEventListener('click', e => {
      if(e.target === gm) closeGlossary();
    });
  }

  // honor hash on load
  const startHash = parseInt(location.hash.replace('#',''),10);
  if(startHash && startHash > 1 && startHash <= slides.length){
    slides[0].classList.remove('active');
    i = startHash - 1;
    slides[i].classList.add('active');
    if(progress) progress.style.width = ((i+1)/slides.length*100) + '%';
  } else {
    show(0);
  }
})();
