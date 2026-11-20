/* Ferramentas Supera - Helpers & Navegação */

const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const mk = (t, a, p) => {
  const e = document.createElementNS(NS, t);
  for (const k in a) e.setAttribute(k, a[k]);
  if (p) p.appendChild(e);
  return e;
};
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Troca de Abas */
const tabs = document.querySelectorAll('nav button');
tabs.forEach(b => b.onclick = () => {
  tabs.forEach(x => x.classList.toggle('on', x === b));
  document.querySelectorAll('section').forEach(s => s.hidden = s.id !== b.dataset.t);
  if (b.dataset.t === 'tangram' && window.viewTangram) window.viewTangram();
});
