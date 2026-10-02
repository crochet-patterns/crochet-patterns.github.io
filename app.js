'use strict';
const blogName = 'Häkelideen & Häkelanleitungen';
const app = document.getElementById('app');
const escapeHTML = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const formatDate = post => new Intl.DateTimeFormat('de-DE', {day:'numeric', month:'long', year:'numeric', timeZone:'UTC'}).format(new Date(post.dateISO + 'T12:00:00Z'));
let category = 'Alle', searchTerm = '', saved = new Set(), statusTimer;
try {
  const values = JSON.parse(localStorage.getItem('haekelideen-saved') || '[]');
  if (Array.isArray(values)) saved = new Set(values.filter(id => posts.some(post => post.id === id)));
} catch (_) { /* Saving still works in memory when browser storage is unavailable. */ }
function announce(message) {
  const status = document.getElementById('status');
  clearTimeout(statusTimer); status.textContent = message;
  statusTimer = setTimeout(() => { status.textContent = ''; }, 4500);
}
function saveButton(post) {
  const isSaved = saved.has(post.id);
  return `<button class="save-button" type="button" data-save="${post.id}" aria-pressed="${isSaved}" aria-label="${escapeHTML(post.title)} ${isSaved?'aus Merkliste entfernen':'merken'}" title="${isSaved?'Aus Merkliste entfernen':'Anleitung merken'}">${isSaved?'♥':'♡'}</button>`;
}
function excerptHTML(excerpt) {
  const lines = excerpt.split('\n');
  const intro = lines.filter(line => !line.startsWith('•') && !line.startsWith('#') && !line.startsWith('Speichere'));
  const tips = lines.filter(line => line.startsWith('•')).map(line => line.slice(1).trim());
  const tags = lines.find(line => line.startsWith('#'));
  const cta = lines.find(line => line.startsWith('Speichere'));
  return intro.map(line => `<p>${escapeHTML(line)}</p>`).join('') + (tips.length?`<ul>${tips.map(tip=>`<li>${escapeHTML(tip)}</li>`).join('')}</ul>`:'') + (tags?`<p class="tags">${escapeHTML(tags)}</p>`:'') + (cta?`<p class="cta">${escapeHTML(cta)}</p>`:'');
}
function card(post) {
  return `<article class="card"><a class="card-image-link" href="#${post.id}" aria-label="${escapeHTML(post.title)} lesen"><img class="card-image" src="${post.image}" alt="${escapeHTML(post.alt)}" loading="lazy" width="1536" height="1024"><span class="category">${post.category}</span></a><div class="card-content"><div class="meta"><time datetime="${post.dateISO}">${formatDate(post)}</time><span class="dot"></span><span>${post.readTime} Min. Lesezeit</span></div><h3><a href="#${post.id}">${escapeHTML(post.title)}</a></h3><div class="excerpt">${excerptHTML(post.excerpt)}</div><div class="card-bottom"><a class="read-link" href="#${post.id}">Zur Anleitung <span aria-hidden="true">↗</span></a>${saveButton(post)}</div></div></article>`;
}
function renderCards() {
  const grid = document.getElementById('post-grid');
  if (!grid) return;
  const normalized = searchTerm.toLocaleLowerCase('de-DE');
  const visible = posts.filter(post => (category==='Alle' || (category==='Gemerkt'?saved.has(post.id):post.category===category)) && `${post.title} ${post.category} ${post.excerpt}`.toLocaleLowerCase('de-DE').includes(normalized));
  grid.innerHTML = visible.length ? visible.map(card).join('') : '<p class="empty">Hier ist es noch ganz ruhig. Wähle eine andere Kategorie, ändere deine Suche oder merke dir eine Anleitung mit dem Herz.</p>';
  document.getElementById('result-count').textContent = `${visible.length} ${visible.length===1?'Anleitung':'Anleitungen'}`;
}
function renderHome() {
  app.innerHTML = `<section class="hero" aria-labelledby="welcome-title"><div><p class="eyebrow">Deine kreative Auszeit</p><h1 id="welcome-title">Kleine Maschen.<br>Große <em>Lieblingsstücke.</em></h1><p class="hero-description">Häkelideen für ein gemütliches Zuhause und Dinge, die bleiben. Entdecke schöne Projekte, ruhige Farben und Anleitungen zum Selbermachen.</p><a class="button" href="#ideen">Anleitungen entdecken <span aria-hidden="true">↗</span></a><p class="hero-note"><span aria-hidden="true">♡</span> Für neugierige Hände und kreative Köpfe.</p></div><figure class="hero-visual"><img src="${posts[0].image}" alt="${escapeHTML(posts[0].alt)}" width="1536" height="1024" fetchpriority="high"><figcaption class="photo-note"><span class="icon" aria-hidden="true">✳</span><div><strong>Mit Liebe selbst gemacht</strong><small>Dein nächstes Lieblingsprojekt wartet.</small></div></figcaption></figure></section><div class="values" aria-label="Was dich erwartet"><span><b aria-hidden="true">✳</b> Kreative Ideen</span><span><b aria-hidden="true">↗</b> Schritt für Schritt</span><span><b aria-hidden="true">♡</b> Freude am Selbermachen</span></div><section class="projects" id="ideen" aria-labelledby="projects-title"><div class="section-top"><div><p class="eyebrow">Garn trifft Inspiration</p><h2 id="projects-title">Was möchtest du heute häkeln?</h2></div><p>Ein Projekt für deine nächste Pause.<br>Such dir dein Lieblingsstück aus.</p></div><div class="toolbar"><div class="filters" aria-label="Anleitungen filtern">${['Alle','Wohnen','Dekoration','Accessoires','Gemerkt'].map(item=>`<button class="filter" type="button" data-filter="${item}" aria-pressed="${item===category}">${item==='Alle'?'Alle Ideen':item}</button>`).join('')}</div><label class="search"><span aria-hidden="true">⌕</span><input type="search" id="project-search" aria-label="Anleitungen durchsuchen" placeholder="Deine nächste Idee …" value="${escapeHTML(searchTerm)}"></label></div><p id="result-count" class="meta" role="status" aria-live="polite"></p><div class="grid" id="post-grid"></div></section><aside class="studio"><img src="./assets/blog-avatar.png" width="80" height="80" alt=""><div><h2>Schön, dass du hier bist.</h2><p>Dieser Blog ist ein kleiner Ort für große Häkelträume. Hier sammeln wir Ideen für gemütliche Lieblingsstücke, die du in deinem eigenen Tempo entstehen lässt.</p></div><a class="text-link" href="#about">Über den Blog ↗</a></aside>`;
  renderCards();
  document.getElementById('project-search').addEventListener('input', event => { searchTerm=event.target.value; renderCards(); });
}
const pages = {
  about: {title:'Über den Blog',content:`<p>Willkommen bei <strong>Häkelideen &amp; Häkelanleitungen</strong>, einem Ort für gemütliche Projekte, schöne Farben und Freude am Selbermachen.</p><h2>Masche für Masche zum Lieblingsstück</h2><p>Hier findest du Ideen für gehäkelte Wohnaccessoires, Dekoration und kleine Begleiter für den Alltag. Die Anleitungen erklären den Aufbau und helfen dir, ein Projekt an dein Garn und deine Wünsche anzupassen.</p><p>Wir mögen ruhige Naturfarben, gut erkennbare Maschen und Projekte, die in deinem eigenen Tempo wachsen dürfen. Du musst nicht alles auf einmal können. Ein kleines Probequadrat oder eine erste Blüte ist bereits ein schöner Anfang.</p><h2>Die Bilder und die Anleitungen</h2><p>Die Projektbilder wurden zur Illustration generiert. Die beschriebenen Muster sind eigenständige Varianten, die ihre Farben und Formen aufgreifen. Sie sind keine exakte Rekonstruktion aller abgebildeten Maschen. Arbeite eine Maschenprobe, bevor du Größe und Materialmenge festlegst.</p><p>Viel Freude beim Entdecken und Häkeln!</p>`},
  privacy: {title:'Datenschutz',content:`<p>Stand: 2. Oktober 2026</p><h2>Funktionen dieser Seite</h2><p>Diese statische Seite enthält keine eingebundene Werbung, keine Analyseprogramme, keine externen Schriftarten und kein Kontaktformular. Bilder und Skripte werden aus dem eigenen Projekt geladen.</p><h2>Deine Merkliste</h2><p>Wenn du eine Anleitung mit dem Herz merkst, speichert die Seite deren Kennung im lokalen Speicher deines Browsers. Die Merkliste wird von dieser Funktion nicht an einen Server übertragen. Du kannst die Einträge über das Herz entfernen oder den lokalen Speicher über deine Browsereinstellungen löschen. Ist der lokale Speicher nicht verfügbar, bleibt die Auswahl nur während der geöffneten Sitzung erhalten.</p><h2>Bereitstellung der Website</h2><p>Beim Aufruf einer veröffentlichten Website erhält der jeweilige Hostinganbieter technisch notwendige Verbindungsdaten. Welche Daten dort gespeichert werden und wie lange, hängt von der eingesetzten Bereitstellung ab. Angaben zum konkreten Anbieter und zur verantwortlichen Person sind in dieser Projektvorlage noch zu ergänzen.</p><h2>Kontakt per E-Mail</h2><p>Der Kontaktlink öffnet dein E-Mail-Programm. Erst wenn du dort eine Nachricht sendest, werden die von dir eingegebenen Daten über deinen E-Mail-Dienst übermittelt. Fragen zur Seite kannst du über die <a href="#contact">Kontaktseite</a> stellen.</p>`},
  terms: {title:'Nutzungsbedingungen',content:`<h2>Die Anleitungen verwenden</h2><p>Die Inhalte dieses Blogs sind Anregungen für eigene Häkelprojekte. Garn, Häkelnadel, Fadenspannung und Verarbeitung beeinflussen das Ergebnis. Prüfe deshalb mit einer Maschenprobe, ob Material und Maße zu deinem Vorhaben passen.</p><h2>Ein respektvoller Umgang mit Inhalten</h2><p>Du kannst dir die Anleitungen für deine eigenen Projekte ansehen und ausdrucken. Wenn du auf diese Seite aufmerksam machen möchtest, teile gern einen Link. Für eine vollständige Veröffentlichung der Texte oder Bilder an anderer Stelle kontaktiere bitte die Redaktion.</p><h2>Dekorative Projekte</h2><p>Die beschriebenen Blumen mit festen Stielen sind Dekoration. Bei einem anderen Verwendungszweck solltest du die Konstruktion entsprechend anpassen. Beachte auch die Pflegehinweise deines Garns.</p><h2>Fragen und Rückmeldungen</h2><p>Wenn du eine unklare Stelle oder einen Fehler bemerkst, freuen wir uns über eine Nachricht über die <a href="#contact">Kontaktseite</a>.</p>`},
  contact: {title:'Kontakt',content:`<p>Du hast eine Frage zu einer Anleitung, möchtest eine Idee teilen oder hast einen Hinweis zur Seite? Schreib uns gern.</p><h2>Eine Nachricht senden</h2><p><a href="mailto:contact@carolynadamsulo-creator.github.io">contact@carolynadamsulo-creator.github.io</a></p><p>Wenn du eine Frage zu einem Projekt hast, nenne bitte den Titel der Anleitung und beschreibe kurz, welches Garn und welche Nadel du verwendest. So lässt sich deine Frage leichter einordnen.</p><p>Der Link öffnet dein E-Mail-Programm.</p>`}
};
function renderPage(id) {
  const page=pages[id];
  app.innerHTML=`<div class="detail-wrap"><a class="back" href="#">← Zurück zu den Ideen</a><section class="article-body"><h1 class="legal-title">${page.title}</h1>${page.content}</section></div>`;
  document.title=`${page.title} | ${blogName}`;
}
function renderPost(post) {
  app.innerHTML=`<div class="detail-wrap"><a class="back" href="#ideen">← Alle Anleitungen</a><article><header class="article-heading"><p class="eyebrow">${post.category}</p><h1>${escapeHTML(post.title)}</h1><div class="meta"><time datetime="${post.dateISO}">${formatDate(post)}</time><span class="dot"></span><span>${post.readTime} Min. Lesezeit</span></div><div class="byline"><img src="./assets/blog-avatar.png" width="34" height="34" alt=""><span>${escapeHTML(blogName)}</span></div></header><img class="detail-image" src="${post.image}" alt="${escapeHTML(post.alt)}" width="1536" height="1024"><div class="article-tools"><div>${saveButton(post)}</div><div><button type="button" data-copy>Link kopieren</button> <button type="button" data-print>Drucken</button></div></div><details class="toc"><summary>In dieser Anleitung</summary><ol id="toc-list"></ol></details><div class="article-body">${post.content}</div></article><aside class="next-posts"><h2>Noch mehr Lust auf Maschen?</h2><div class="next-links">${posts.filter(p=>p.id!==post.id).map(p=>`<a href="#${p.id}"><img src="${p.image}" alt="${escapeHTML(p.alt)}" loading="lazy" width="1536" height="1024"><span>${escapeHTML(p.title)} ↗</span></a>`).join('')}</div></aside></div>`;
  const headings=app.querySelectorAll('.article-body h2');
  const list=document.getElementById('toc-list');
  headings.forEach((heading,index)=>{
    heading.id=`section-${index}`;
    const li=document.createElement('li'), link=document.createElement('a');
    link.href=`#${post.id}`; link.textContent=heading.textContent;
    link.addEventListener('click',event=>{event.preventDefault();heading.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
    li.append(link);list.append(li);
  });
  document.title=`${post.title} | ${blogName}`;
}
function route(initial=false) {
  let hash='';
  try { hash=decodeURIComponent(location.hash.slice(1)); } catch (_) { hash='invalid'; }
  document.title=blogName;
  const home=hash===''||hash==='ideen';
  if(home) renderHome();
  else if(Object.hasOwn(pages,hash)) renderPage(hash);
  else {
    const post=posts.find(item=>item.id===hash);
    if(post) renderPost(post);
    else { app.innerHTML='<div class="detail-wrap"><h1 class="legal-title">Diese Seite wurde nicht gefunden.</h1><a class="button" href="#">Zur Startseite ↗</a></div>';document.title=`Seite nicht gefunden | ${blogName}`; }
  }
  document.querySelectorAll('[data-nav]').forEach(link=>{if(link.dataset.nav===(hash||'home'))link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});
  if(!initial) app.focus({preventScroll:true});
  if(hash==='ideen') requestAnimationFrame(()=>document.getElementById('ideen').scrollIntoView());
  else window.scrollTo({top:0,behavior:'instant'});
}
async function copyLink() {
  let copied=false;
  try { await navigator.clipboard.writeText(location.href); copied=true; } catch (_) {
    const field=document.createElement('textarea');field.value=location.href;field.style.cssText='position:fixed;left:-9999px;top:0;';document.body.append(field);field.select();
    try { copied=document.execCommand('copy'); } catch (_) {} finally {field.remove();}
  }
  announce(copied?'Link kopiert. Viel Freude beim Teilen!':'Der Link konnte nicht kopiert werden. Kopiere ihn bitte aus der Adresszeile.');
}
app.addEventListener('click',event=>{
  const filter=event.target.closest('[data-filter]');
  if(filter){category=filter.dataset.filter;app.querySelectorAll('[data-filter]').forEach(button=>button.setAttribute('aria-pressed',button.dataset.filter===category));renderCards();return;}
  const save=event.target.closest('[data-save]');
  if(save){
    const id=save.dataset.save, post=posts.find(item=>item.id===id);if(!post)return;
    if(saved.has(id))saved.delete(id);else saved.add(id);
    let persisted=true;try{localStorage.setItem('haekelideen-saved',JSON.stringify([...saved]));}catch(_){persisted=false;}
    save.outerHTML=saveButton(post);
    if(category==='Gemerkt')renderCards();
    announce(saved.has(id)?(persisted?'Anleitung gemerkt. Du findest sie unter „Gemerkt“.':'Anleitung für diese Sitzung gemerkt. Dein Browser erlaubt keine dauerhafte Speicherung.'):'Anleitung aus der Merkliste entfernt.');return;
  }
  if(event.target.closest('[data-copy]'))copyLink();
  if(event.target.closest('[data-print]'))window.print();
});
window.addEventListener('hashchange',()=>route());
route(true);
