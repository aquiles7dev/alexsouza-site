/* Alex Souza · Imóveis — captação v1 (somente WhatsApp)
   O formulário não envia dados a nenhum servidor: ele abre o WhatsApp do Alex com uma mensagem pronta.
*/
(function () {
  'use strict';

  var WHATSAPP = '5562991287785'; // (62) 99128-7785

  function waLink(text) {
    return 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text);
  }

  var form = document.getElementById('form-lista');
  if (!form) return;

  var nome = form.querySelector('[name="nome"]');
  var interesse = form.querySelector('[name="interesse"]');
  var consent = form.querySelector('[name="consentimento"]');
  var errNome = document.getElementById('err-nome');
  var errConsent = document.getElementById('err-consent');

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var ok = true;

    errNome.textContent = '';
    errConsent.textContent = '';

    if (!nome.value.trim()) {
      errNome.textContent = 'Informe seu nome.';
      ok = false;
    }
    if (!consent.checked) {
      errConsent.textContent = 'Para continuar, aceite o uso dos seus dados para este contato.';
      ok = false;
    }
    if (!ok) return;

    var partes = [
      'Olá, Alex! Meu nome é ' + nome.value.trim() + '.',
      'Quero entrar na lista de interessados do City Code Ricardo Paranhos (Setor Marista).'
    ];
    if (interesse.value) partes.push('Meu interesse: ' + interesse.value + '.');
    partes.push('Autorizo o contato por WhatsApp (LGPD).');
    var mensagem = partes.join(' ');

    /* ------------------------------------------------------------------
       PONTO DE CONEXÃO — DESTINO DE CONTATOS (v2, ainda não implementado)
       Aqui é onde o lead pode ser enviado a um destino antes de abrir o
       WhatsApp: Google Sheets (Apps Script), CRM, Make/Zapier ou uma
       função serverless da Vercel (/api/lead). Exemplo:

         fetch('/api/lead', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             nome: nome.value.trim(),
             interesse: interesse.value,
             origem: 'city-code-rp',
             consentimento: true,
             data: new Date().toISOString()
           })
         });

       Só ligar isso depois de definir o destino e atualizar o aviso de
       privacidade da página (quem recebe, por quanto tempo e como pedir
       a exclusão dos dados).
       ------------------------------------------------------------------ */

    window.open(waLink(mensagem), '_blank', 'noopener');
  });
})();
