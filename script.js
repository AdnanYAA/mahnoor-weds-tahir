// EDIT YOUR INVITATION HERE. Times use Pakistan's UTC+05:00 offset.
const CONFIG = {
  bride: 'Mahnoor',
  eventName: 'Baraat Ceremony',
  groom: 'Tahir',
  eventDateTime: '2026-11-29T11:00:00+05:00', // Explicit Pakistan time; used by countdown and calendar.
  time: '11:00 AM',
  durationHours: 3,
  venueName: 'Divine Marquee',
  mapLink: 'https://share.google/GHPdWz1pF4BmQG1kw',
  songPath: 'R.D. Burman - Hai Mubarak Aaj Ka Din Best Audio Song_Mithun Chakraborty_Hariharan.mp3',
  songStartSeconds: 21, // Start at 21 seconds when opening the invitation.
  songVolume: 0.5
};

(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Keep phones and constrained devices free of continuous canvas/GPU work.
  const lightweight = matchMedia('(max-width: 900px), (pointer: coarse)').matches || navigator.connection?.saveData === true || (navigator.deviceMemory && navigator.deviceMemory <= 4);
  document.documentElement.classList.toggle('lightweight', Boolean(lightweight));
  const start = new Date(CONFIG.eventDateTime);
  document.querySelectorAll('[data-bride]').forEach(el => { el.textContent = CONFIG.bride; });
  document.querySelectorAll('[data-groom]').forEach(el => { el.textContent = CONFIG.groom; });
  document.title = `${CONFIG.bride} & ${CONFIG.groom} | ${CONFIG.eventName}`;
  $('ceremony-title').textContent = CONFIG.eventName;
  $('venue-name').textContent = CONFIG.venueName;
  $('event-time').textContent = CONFIG.time;
  $('map-link').href = CONFIG.mapLink;
  if (Number.isFinite(start.getTime())) {
    // Noon UTC preserves the configured calendar day independently of host time zone.
    $('event-date').textContent = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${CONFIG.eventDateTime.slice(0, 10)}T12:00:00Z`));
  }
  let opened = false, opening = false, context, muted = false, fadeId, musicFailed = false;
  try { muted = localStorage.getItem('baraat-muted') === 'true'; } catch {}
  const music = new Audio();
  music.loop = true; music.preload = 'none'; music.volume = 0;
  music.addEventListener('error', () => { musicFailed = true; cancelAnimationFrame(fadeId); });
  // Assign the source only when the guest opens the invitation.
  function ensureMusicSource() { if (!music.getAttribute('src') && CONFIG.songPath) music.src = CONFIG.songPath; }
  let songStartApplied = false;
  function applySongStart() {
    if (songStartApplied || music.readyState < 1) return;
    const requested = Math.max(0, Number(CONFIG.songStartSeconds) || 0);
    music.currentTime = Number.isFinite(music.duration) && requested >= music.duration ? 0 : requested;
    songStartApplied = true;
  }
  music.addEventListener('loadedmetadata', applySongStart);
  function unlockAudio() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!context && Audio) context = new Audio();
      if (context?.state === 'suspended') context.resume().catch(() => {});
    } catch {}
  }
  function tone(hz, duration, volume, delay = 0, shape = 'sine') {
    if (muted || !context || context.state === 'closed') return;
    const t = context.currentTime + delay;
    const oscillator = context.createOscillator(), gain = context.createGain();
    oscillator.type = shape; oscillator.frequency.setValueAtTime(hz, t);
    gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(volume, t + .004); gain.gain.exponentialRampToValueAtTime(.0001, t + duration);
    oscillator.connect(gain); gain.connect(context.destination); oscillator.start(t); oscillator.stop(t + duration + .01);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }
  function sound(type) {
    if (type === 'door') { tone(65, .8, .08, 0, 'triangle'); tone(90, .7, .04, .1, 'sawtooth'); tone(150, .08, .045, .4, 'triangle'); }
    else if (type === 'type') { tone(240 + Math.random() * 180, .035, .025, 0, 'triangle'); }
    else if (type === 'enter') { tone(784, .3, .055); tone(1175, .4, .035, .08); }
    else { tone(660, .13, .035); tone(990, .15, .018, .035); }
  }
  function startMusic() {
    if (!opened || muted || musicFailed || !CONFIG.songPath || document.hidden) return;
    cancelAnimationFrame(fadeId);
    music.volume = 0;
    // Called synchronously inside the submit/click gesture, before animation or awaits.
    ensureMusicSource();
    applySongStart();
    const attempt = music.play();
    if (attempt) attempt.then(() => {
      const began = performance.now();
      function fade(now) {
        if (muted || document.hidden || music.paused) return;
        music.volume = Math.min(1, Math.max(0, CONFIG.songVolume)) * Math.min(1, (now - began) / 2200);
        if (now - began < 2200) fadeId = requestAnimationFrame(fade);
      }
      fadeId = requestAnimationFrame(fade);
    }).catch(() => { /* Missing song or denied playback: other sounds and invitation continue. */ });
  }
  function syncMute() {
    $('sound-toggle').setAttribute('aria-pressed', String(muted));
    $('sound-toggle').setAttribute('aria-label', muted ? 'Unmute sounds' : 'Mute sounds');
    $('sound-label').textContent = muted ? 'Sound off' : 'Sound on';
  }
  document.addEventListener('pointerdown', unlockAudio, { capture: true });
  document.addEventListener('keydown', unlockAudio, { capture: true });
  let lastTypingKey = -1000;
  $('guest-name').addEventListener('keydown', event => {
    if (event.isComposing || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === 'Enter') { lastTypingKey = performance.now(); return; } // Submit owns the ding.
    if (event.key.length === 1 || ['Backspace', 'Delete'].includes(event.key)) { lastTypingKey = performance.now(); sound('type'); }
  });
  $('guest-name').addEventListener('beforeinput', event => {
    if (event.isComposing || performance.now() - lastTypingKey < 70) return;
    unlockAudio();
    if (!['insertLineBreak', 'insertParagraph'].includes(event.inputType)) sound('type');
  });
  $('guest-name').addEventListener('input', () => { $('guest-name').removeAttribute('aria-invalid'); $('name-error').textContent = ''; });
  document.addEventListener('click', event => {
    const button = event.target.closest('button, a.button');
    if (!button || button.id === 'sound-toggle') return;
    unlockAudio(); sound('click');
    if (!reduced.matches) { const ripple = document.createElement('span'); ripple.className = 'ripple'; ripple.setAttribute('aria-hidden', 'true'); button.append(ripple); setTimeout(() => ripple.remove(), 650); }
  });
  $('sound-toggle').addEventListener('click', () => {
    unlockAudio(); muted = !muted;
    try { localStorage.setItem('baraat-muted', String(muted)); } catch {}
    syncMute();
    if (muted) { cancelAnimationFrame(fadeId); music.pause(); }
    else { sound('click'); startMusic(); }
  });
  syncMute();
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(fadeId); music.pause(); } else startMusic(); });
  $('welcome-form').addEventListener('submit', event => {
    event.preventDefault();
    if (opening) return;
    unlockAudio(); sound('enter');
    const name = $('guest-name').value.trim();
    if (!name) {
      $('name-error').textContent = 'A little introduction first — please enter your name.';
      $('guest-name').setAttribute('aria-invalid', 'true');
      $('guest-name').classList.remove('invalid'); void $('guest-name').offsetWidth; $('guest-name').classList.add('invalid');
      $('guest-name').focus(); return;
    }
    opening = true; opened = true;
    if (!reduced.matches) { sound('door'); launchFireworks(); }
    // textContent treats the guest's name as plain text, never executable HTML.
    $('personal-name').textContent = name; $('message-name').textContent = name;
    startMusic();
    $('welcome').classList.add('leaving');
    const reveal = () => {
      $('welcome').hidden = true; $('invitation-stage').hidden = false;
      document.querySelectorAll('.entrance').forEach((el, i) => el.style.setProperty('--delay', `${Math.min(i * .085, 1.2)}s`));
      $('invitation-card').classList.add('revealed');
      window.scrollTo({ top: 0, behavior: 'instant' });
      $('invitation-card').focus({ preventScroll: true });
    };
    if (reduced.matches) reveal(); else setTimeout(reveal, 1700);
  });
  function updateCountdown() {
    if (!Number.isFinite(start.getTime())) { $('countdown').hidden = true; $('countdown-status').textContent = 'Celebration date to be confirmed.'; return; }
    const seconds = Math.max(0, Math.floor((start - Date.now()) / 1000));
    if (seconds === 0) { $('countdown').hidden = true; $('countdown-status').textContent = 'Alhamdulillah, we celebrated together.'; return; }
    const values = [Math.floor(seconds / 86400), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60];
    ['days', 'hours', 'minutes', 'seconds'].forEach((id, i) => {
      const el = $(id), next = String(values[i]).padStart(2, '0');
      if (el.textContent === next) return;
      el.textContent = next;
      if (!reduced.matches && opened) { el.classList.remove('number-change'); void el.offsetWidth; el.classList.add('number-change'); }
    });
  }
  updateCountdown(); setInterval(() => { if (opened && !document.hidden) updateCountdown(); }, 1000);
  function icsEscape(value) { return String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,'); }
  function utcStamp(date) { return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  // Fold by UTF-8 octets (RFC 5545), including for non-ASCII edited names.
  function fold(line) {
    let output = '', current = '', size = 0;
    for (const character of line) {
      const bytes = new TextEncoder().encode(character).length;
      if (size + bytes > 75) { output += current + '\r\n'; current = ' '; size = 1; }
      current += character; size += bytes;
    }
    return output + current;
  }
  $('calendar-button').addEventListener('click', () => {
    if (!Number.isFinite(start.getTime())) return;
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Mahnoor and Tahir//Baraat Invitation//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT', `UID:baraat-${CONFIG.eventDateTime.slice(0, 10)}@mahnoor-weds-tahir.vercel.app`, `DTSTAMP:${utcStamp(new Date())}`, `DTSTART:${utcStamp(start)}`, `DTEND:${utcStamp(new Date(start.getTime() + CONFIG.durationHours * 3600000))}`, `SUMMARY:${icsEscape(`${CONFIG.eventName} of ${CONFIG.bride} & ${CONFIG.groom}`)}`, `LOCATION:${icsEscape(CONFIG.venueName)}`, `DESCRIPTION:${icsEscape(`Your presence and duas would make our day complete.\n${CONFIG.mapLink}`)}`, `URL:${CONFIG.mapLink}`, 'END:VEVENT', 'END:VCALENDAR'];
    const blob = new Blob([lines.map(fold).join('\r\n') + '\r\n'], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'mahnoor-tahir-baraat.ics'; document.body.append(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  });
  const canvas = $('fireworks'), ctx = canvas.getContext('2d');
  let sparks = [], skyFrame = 0, lastFrame = 0;
  function resizeSky() {
    if (lightweight || reduced.matches) { canvas.width = 1; canvas.height = 1; return; }
    const ratio = 1;
    canvas.width = innerWidth * ratio; canvas.height = innerHeight * ratio;
    ctx?.setTransform(ratio, 0, 0, ratio, 0, 0);
  }
  resizeSky(); window.addEventListener('resize', resizeSky);
  function burst(x, y, count = 30) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2, speed = 35 + Math.random() * 110;
      sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1.5 + Math.random(), color: ['#c9a45c', '#b64a57', '#b42b49'][i % 3] });
    }
  }
  function animateSky(now) {
    skyFrame = 0;
    if (document.hidden || reduced.matches || lightweight || !ctx) return;
    const dt = Math.min((now - (lastFrame || now)) / 1000, .04); lastFrame = now;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    // A brief opening burst only: stop rendering when the particles finish.
    sparks = sparks.filter(p => p.life > 0);
    for (const p of sparks) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 24 * dt; ctx.globalAlpha = Math.max(0, Math.min(1, p.life)); ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 2, 2); }
    ctx.globalAlpha = 1;
    if (sparks.length) skyFrame = requestAnimationFrame(animateSky);
  }
  function launchFireworks() {
    if (reduced.matches || lightweight || !ctx) return;
    burst(innerWidth * .25, innerHeight * .22, 30); burst(innerWidth * .75, innerHeight * .3, 30);
    lastFrame = 0;
    if (!skyFrame) skyFrame = requestAnimationFrame(animateSky);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(skyFrame); skyFrame = 0; }
    else if (opened && !reduced.matches && !lightweight && sparks.length && !skyFrame) { lastFrame = 0; skyFrame = requestAnimationFrame(animateSky); }
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) { cancelAnimationFrame(skyFrame); skyFrame = 0; sparks = []; ctx?.clearRect(0, 0, innerWidth, innerHeight); }
    else if (opened && !document.hidden && !skyFrame) launchFireworks();
  });

  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  $('invitation-card').addEventListener('pointermove', event => {
    if (reduced.matches || lightweight || !finePointer.matches) return;
    const card = event.currentTarget, rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - .5, y = (event.clientY - rect.top) / rect.height - .5;
    card.style.transform = `rotateX(${-y * 1.2}deg) rotateY(${x * 1.2}deg)`;
  });
  $('invitation-card').addEventListener('pointerleave', event => { event.currentTarget.style.transform = ''; });
  document.addEventListener('visibilitychange', () => document.documentElement.classList.toggle('page-hidden', document.hidden));
  if (!reduced.matches && !lightweight) for (let i = 0; i < 6; i++) {
    const particle = document.createElement('span'); particle.className = 'particle';
    particle.style.left = `${Math.random() * 100}%`; particle.style.animationDuration = `${16 + Math.random() * 16}s`; particle.style.animationDelay = `${-Math.random() * 32}s`;
    $('particles').append(particle);
  }
})();
