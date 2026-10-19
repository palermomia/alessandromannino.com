// Formspree endpoint for the inquiry form (submissions are emailed to Alessandro)
const FORM_ENDPOINT = 'https://formspree.io/f/moejzdbn';

const root = document.documentElement;
root.classList.remove('no-js');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

// ── Local time in the masthead ──────────────────────────────────
const clock = document.getElementById('clock');
const fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
const tick = () => { clock.textContent = fmt.format(new Date()); };
tick();
setInterval(tick, 15000);

// ── Day / Night edition ─────────────────────────────────────────
document.getElementById('edition').addEventListener('click', () => {
  const current = root.dataset.theme
    || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const next = current === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('edition', next); } catch (e) {}
});

// ── Name: letters that swell toward the cursor ──────────────────
const nameEl = document.getElementById('name');
(function splitName() {
  let i = 0;
  const wrap = (text) => [...text].map((c) => `<span class="ch" style="--i:${i++}" aria-hidden="true">${c}</span>`).join('');
  nameEl.innerHTML = wrap('Alessandro') + '<br />' + wrap('Mannino')
    + `<span class="ch period" style="--i:${i}" aria-hidden="true">.</span>`;
})();
const letters = [...nameEl.querySelectorAll('.ch')];
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
if (canHover && !reduceMotion) {
  let mouse = null, frame = 0;
  const paint = () => {
    frame = 0;
    letters.forEach((el) => {
      if (!mouse) { el.style.removeProperty('--w'); el.style.removeProperty('--s'); return; }
      const r = el.getBoundingClientRect();
      const d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
      const t = Math.max(0, 1 - d / 260);
      el.style.setProperty('--w', Math.round(400 + t * 500));
      el.style.setProperty('--s', Math.round(t * 100));
    });
  };
  window.addEventListener('pointermove', (e) => { mouse = { x: e.clientX, y: e.clientY }; if (!frame) frame = requestAnimationFrame(paint); }, { passive: true });
  document.addEventListener('pointerleave', () => { mouse = null; if (!frame) frame = requestAnimationFrame(paint); });
}

// ── Scroll: masthead rule, reading progress, timeline fill, active section ──
const masthead = document.querySelector('.masthead');
const timeline = document.querySelector('.timeline');
const navLinks = [...document.querySelectorAll('.mast-links a')];
const sections = navLinks.map((a) => document.querySelector(a.getAttribute('href')));
let scrollFrame = 0;
const onScroll = () => {
  scrollFrame = 0;
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - innerHeight;
  masthead.classList.toggle('scrolled', y > 8);
  root.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);

  const tr = timeline.getBoundingClientRect();
  const fill = Math.min(1, Math.max(0, (innerHeight * 0.6 - tr.top) / tr.height));
  timeline.style.setProperty('--tl', fill.toFixed(3));

  let active = -1;
  sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.4) active = i; });
  navLinks.forEach((a, i) => a.classList.toggle('active', i === active));
};
window.addEventListener('scroll', () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(onScroll); }, { passive: true });
onScroll();

// ── Reveal on scroll ────────────────────────────────────────────
const observer = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.matches('.figures')) countUp(e.target);
        observer.unobserve(e.target);
      });
    }, { threshold: 0.15 })
  : null;
const watch = (el) => (observer ? observer.observe(el) : el.classList.add('in'));
document.querySelectorAll('.reveal, .footer').forEach(watch);

function countUp(list) {
  if (reduceMotion) return;
  list.querySelectorAll('[data-count]').forEach((el) => {
    const end = +el.dataset.count, start = performance.now(), dur = 1400;
    const step = (now) => {
      const t = Math.min(1, (now - start) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))).toLocaleString("en-US");
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

// ── Press: rendered from press.json (kept fresh by a weekly GitHub Action) ──
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const monthYear = (d) => (d ? new Date(d + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');
const SHOW_FIRST = 6;

const pressLoaded = fetch('press.json')
  .then((r) => r.json())
  .then(({ mentions = [], bylines }) => {
    const clips = document.getElementById('clippings');
    const sorted = [...mentions].sort((a, b) => (b.date || '0').localeCompare(a.date || '0'));
    clips.innerHTML = sorted.map((m, i) => `
      <a class="clip reveal${i >= SHOW_FIRST ? ' extra' : ''}" href="${esc(m.url)}" target="_blank" rel="noopener"
         style="--r:${[-1.2, 0.8, -0.4, 1.1, -0.9, 0.5][i % 6]}deg">
        <div class="clip-top"><span class="clip-outlet">${esc(m.outlet)}</span><span>${monthYear(m.date)}</span></div>
        <h3>${esc(m.title)}</h3>
        <div class="clip-foot"><span class="clip-kind">${esc(m.kind || 'Mention')}</span><span aria-hidden="true">Read ↗</span></div>
      </a>`).join('');
    if (sorted.length > SHOW_FIRST) {
      const more = document.createElement('button');
      more.type = 'button';
      more.className = 'v-link more-press';
      more.style.cssText = 'background:none;border-top:0;border-left:0;border-right:0;cursor:pointer';
      more.innerHTML = `Show all ${sorted.length} mentions <span aria-hidden="true">↓</span>`;
      more.addEventListener('click', () => {
        clips.classList.add('open');
        clips.querySelectorAll('.extra').forEach((el) => el.classList.add('in'));
        more.remove();
      });
      clips.appendChild(more);
    }
    clips.querySelectorAll('.clip:not(.extra)').forEach(watch);

    if (bylines) {
      document.getElementById('bylines').innerHTML = bylines.articles.map((a) => `
        <li><a href="${esc(a.url)}" target="_blank" rel="noopener"><span class="t">${esc(a.title)}</span><time datetime="${esc(a.date)}">${monthYear(a.date)}</time></a></li>`).join('');
    }
  })
  .catch(() => {
    document.getElementById('clippings').innerHTML = '<p>Press mentions are taking a coffee break. Try refreshing.</p>';
  });

// Press cards and web fonts change the page height after load,
// so re-align any #section link the visitor arrived with.
if (location.hash) {
  Promise.all([pressLoaded, document.fonts.ready]).then(() => {
    document.querySelector(location.hash)?.scrollIntoView({ behavior: 'instant' });
  });
}

// ── Contact links pre-select the form topic ─────────────────────
const interest = document.getElementById('interest');
document.querySelectorAll('[data-interest]').forEach((a) => {
  a.addEventListener('click', () => { interest.value = a.dataset.interest; });
});

// ── Inquiry form ────────────────────────────────────────────────
const form = document.getElementById('lead-form');
const status = form.querySelector('.form-status');
const button = form.querySelector('button[type="submit"]');
const buttonLabel = button.firstElementChild;

function setStatus(text, kind) {
  status.textContent = text;
  status.className = 'form-status' + (kind ? ' ' + kind : '');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  let firstInvalid = null;
  form.querySelectorAll('[required]').forEach((field) => {
    const ok = field.checkValidity();
    field.classList.toggle('invalid', !ok);
    if (!ok && !firstInvalid) firstInvalid = field;
  });
  if (firstInvalid) {
    setStatus('A couple of fields still need you.', 'err');
    firstInvalid.focus();
    return;
  }

  button.disabled = true;
  buttonLabel.textContent = 'Sending…';
  setStatus('');

  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const detail = (data.errors || []).map((e) => e.message).join(' ');
      throw new Error(detail || 'Request failed: ' + res.status);
    }
    form.reset();
    setStatus('Got it, grazie! I\'ll be in touch soon.', 'ok');
  } catch (err) {
    const detail = err.message.startsWith('Request failed') ? '' : ' ' + err.message;
    setStatus('That didn\'t send.' + detail + ' Mind trying again in a moment?', 'err');
  } finally {
    button.disabled = false;
    buttonLabel.textContent = 'Send it';
  }
});

form.addEventListener('input', (event) => {
  if (event.target.classList.contains('invalid') && event.target.checkValidity()) {
    event.target.classList.remove('invalid');
  }
});

// For the curious who open dev tools
console.log('%cCiao! 👋', 'font: 600 28px Georgia, serif; color: #d8391b');
console.log('You\'re poking around the source, so you\'re my kind of person. Hand-built, no templates. Say hi: https://alessandromannino.com/#contact');
