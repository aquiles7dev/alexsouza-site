/* Alex Souza · Imóveis — v2 (JavaScript puro, sem bibliotecas)
   Menu · revelar ao rolar · blocos de imagem · carrosséis · lightbox · formulário → WhatsApp */
(function () {
  'use strict';

  var WHATSAPP = '5562991287785'; // (62) 99128-7785
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function openLink(url) {
    var a = document.createElement('a');
    a.href = url; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- Menu (celular) ---------- */
  var menuBtn = $('.menu-btn'), nav = $('#nav');
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Revelar ao rolar ---------- */
  var reveals = $$('[data-reveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Blocos de imagem ----------
     Para publicar uma imagem autorizada, preencha data-src (e data-alt) no HTML:
       <figure class="shot" data-src="../assets/img/arquivo.jpg" data-alt="Descrição">
     O layout não muda; a legenda "[imagem aguardando autorização]" some sozinha. */
  $$('.shot[data-src]').forEach(function (shot) {
    var src = shot.getAttribute('data-src');
    if (!src) return;
    var img = new Image();
    img.loading = 'lazy'; img.decoding = 'async';
    img.alt = shot.getAttribute('data-alt') || '';
    img.src = src;
    shot.insertBefore(img, shot.firstChild);
    shot.classList.add('has-img');
  });

  /* ---------- Carrosséis (scroll-snap + setas + contador + teclado + arraste) ---------- */
  $$('[data-carousel]').forEach(function (car) {
    var track = $('.track', car), slides = $$('.slide', track);
    var prev = $('[data-prev]', car), next = $('[data-next]', car), count = $('.count', car);
    if (!track || !slides.length) return;
    var total = slides.length, current = 0;

    function pos(i) { return slides[i].offsetLeft - slides[0].offsetLeft; }
    function nearest() {
      var x = track.scrollLeft, best = 0, d = Infinity;
      slides.forEach(function (s, i) { var dd = Math.abs(pos(i) - x); if (dd < d) { d = dd; best = i; } });
      return best;
    }
    function paint() {
      current = nearest();
      var atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      if (count) count.textContent = pad(current + 1) + ' / ' + pad(total);
      if (prev) prev.disabled = current === 0;
      if (next) next.disabled = current === total - 1 || atEnd;
    }
    function go(i) {
      i = Math.max(0, Math.min(total - 1, i));
      track.scrollTo({ left: pos(i), behavior: reduce ? 'auto' : 'smooth' });
    }
    if (prev) prev.addEventListener('click', function () { go(nearest() - 1); });
    if (next) next.addEventListener('click', function () { go(nearest() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(nearest() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(nearest() - 1); }
    });
    var t;
    track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(paint, 60); }, { passive: true });
    window.addEventListener('resize', paint);

    // Arraste com o mouse (no toque, o próprio scroll-snap já resolve)
    var down = false, startX = 0, startLeft = 0, moved = false;
    track.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || e.target.closest('button, a, input, label')) return;
      down = true; moved = false; startX = e.pageX; startLeft = track.scrollLeft;
    });
    window.addEventListener('mousemove', function (e) {
      if (!down) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 5) { moved = true; track.classList.add('drag'); }
      if (moved) track.scrollLeft = startLeft - dx;
    });
    window.addEventListener('mouseup', function () {
      if (!down) return;
      down = false;
      if (moved) { track.classList.remove('drag'); go(nearest()); }
    });
    paint();
  });

  /* ---------- Lightbox (botão "+", teclado e swipe) ---------- */
  var lb, lbStage, lbCap, lbCount, lbItems = [], lbIndex = 0, lbReturn = null;

  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Imagem ampliada'); lb.hidden = true;
    lb.innerHTML =
      '<div class="lb-top"><span class="count" data-lb-count></span>' +
      '<button class="arrow" type="button" data-lb-close aria-label="Fechar">' +
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M2 2l12 12M14 2L2 14"/></svg></button></div>' +
      '<div class="lb-stage" data-lb-stage></div>' +
      '<div class="lb-bot"><span data-lb-cap></span><span class="car-ui">' +
      '<button class="arrow" type="button" data-lb-prev aria-label="Imagem anterior"><svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M17 6H1M6 1L1 6l5 5"/></svg></button>' +
      '<button class="arrow" type="button" data-lb-next aria-label="Próxima imagem"><svg width="18" height="12" viewBox="0 0 18 12" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M1 6h16M12 1l5 5-5 5"/></svg></button></span></div>';
    document.body.appendChild(lb);
    lbStage = $('[data-lb-stage]', lb); lbCap = $('[data-lb-cap]', lb); lbCount = $('[data-lb-count]', lb);
    $('[data-lb-close]', lb).addEventListener('click', closeLb);
    $('[data-lb-prev]', lb).addEventListener('click', function () { showLb(lbIndex - 1); });
    $('[data-lb-next]', lb).addEventListener('click', function () { showLb(lbIndex + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === lbStage) closeLb(); });
    lb.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowRight') showLb(lbIndex + 1);
      if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
      if (e.key === 'Tab') { // mantém o foco dentro do diálogo
        var f = $$('button', lb), first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    var tx = null;
    lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (tx === null) return;
      var dx = e.changedTouches[0].clientX - tx; tx = null;
      if (Math.abs(dx) > 48) showLb(lbIndex + (dx < 0 ? 1 : -1));
    });
  }
  function showLb(i) {
    var n = lbItems.length;
    lbIndex = (i + n) % n;
    var fig = lbItems[lbIndex], shot = $('.shot', fig) || fig;
    var clone = document.createElement('div');
    clone.className = 'shot' + (shot.classList.contains('has-img') ? ' has-img' : '');
    var img = $('img', shot);
    if (img) { var big = new Image(); big.src = img.src; big.alt = img.alt; clone.appendChild(big); }
    else { var w = document.createElement('span'); w.className = 'wait'; w.textContent = '[imagem aguardando autorização]'; clone.appendChild(w); }
    lbStage.innerHTML = ''; lbStage.appendChild(clone);
    lbCap.textContent = fig.getAttribute('data-caption') || '';
    lbCount.textContent = pad(lbIndex + 1) + ' / ' + pad(n);
  }
  function openLb(fig, btn) {
    if (!lb) buildLightbox();
    var group = fig.closest('[data-gallery]');
    lbItems = group ? $$('[data-lb]', group) : [fig];
    lbReturn = btn;
    lb.hidden = false; document.body.style.overflow = 'hidden';
    showLb(lbItems.indexOf(fig));
    $('[data-lb-close]', lb).focus();
  }
  function closeLb() {
    lb.hidden = true; document.body.style.overflow = '';
    if (lbReturn) lbReturn.focus();
  }
  $$('.plus').forEach(function (btn) {
    btn.addEventListener('click', function () { openLb(btn.closest('[data-lb]'), btn); });
  });

  /* ---------- Formulários de captação (v1: somente WhatsApp) ---------- */
  function maskPhone(v) {
    var d = v.replace(/\D/g, '');
    if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2); // remove DDI colado
    d = d.slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }

  $$('form[data-lead]').forEach(function (form) {
    var nome = form.elements.nome, tel = form.elements.whatsapp, consent = form.elements.consentimento;
    var empreendimento = form.getAttribute('data-empreendimento') || '';
    function err(name, msg) { var el = $('[data-err="' + name + '"]', form); if (el) el.textContent = msg || ''; }

    tel.addEventListener('input', function () { tel.value = maskPhone(tel.value); });

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = true, first = null;
      err('nome'); err('whatsapp'); err('consentimento');

      if (!nome.value.trim()) { err('nome', 'Informe seu nome.'); ok = false; first = first || nome; }
      if (tel.value.replace(/\D/g, '').length < 10) { err('whatsapp', 'Informe um WhatsApp com DDD.'); ok = false; first = first || tel; }
      if (!consent.checked) { err('consentimento', 'Para continuar, autorize o contato.'); ok = false; first = first || consent; }
      if (!ok) { first.focus(); return; }

      var perfilEl = form.querySelector('input[name="perfil"]:checked');
      var perfil = perfilEl ? perfilEl.value : '';
      var partes = ['Olá, Alex! Meu nome é ' + nome.value.trim() + '.'];
      partes.push(empreendimento
        ? 'Quero receber as condições do ' + empreendimento + '.'
        : 'Vim pelo seu site e gostaria de conversar sobre imóveis em Goiânia.');
      if (perfil) partes.push('Perfil: ' + perfil + '.');
      partes.push('Meu WhatsApp: ' + tel.value + '.');
      partes.push('Autorizo o contato por WhatsApp (LGPD).');
      var mensagem = partes.join(' ');

      /* ------------------------------------------------------------------
         PONTO DE CONEXÃO — DESTINO DE CONTATOS (ainda não implementado)
         Antes de abrir o WhatsApp, o lead pode ser enviado a um destino:
         Google Sheets (Apps Script), CRM, Make/Zapier ou uma função da
         Vercel (/api/lead). Exemplo:

           fetch('/api/lead', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
               nome: nome.value.trim(), whatsapp: tel.value, perfil: perfil,
               empreendimento: empreendimento, consentimento: true,
               data: new Date().toISOString()
             })
           });

         Ao ligar isso, atualizar o aviso de privacidade (quem recebe os
         dados, por quanto tempo e como pedir a exclusão).
         ------------------------------------------------------------------ */

      openLink('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(mensagem));
    });
  });
})();
