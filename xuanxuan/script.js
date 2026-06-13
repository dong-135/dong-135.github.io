// ============================================================
//  Cosmic Starfield — Multi-layer parallax, nebulae, stardust,
//  Milky Way, shooting stars & sparkle bursts
// ============================================================

const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let width, height;

// ---- Resize handler ----
function resize() {
  width  = canvas.width  = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// ============================================================
//  Star color palettes
// ============================================================
const STAR_COLORS = [
  [255, 245, 220], // warm cream
  [255, 245, 220],
  [255, 245, 220],
  [255, 245, 220],
  [255, 240, 200], // soft gold
  [255, 250, 240], // bright white
  [200, 220, 255], // cool blue-white
  [200, 220, 255],
  [255, 220, 240], // faint pink
  [220, 240, 255], // ice blue
];

// ============================================================
//  Layer 1: Deep background stars (far away, slow drift, small)
// ============================================================
class DeepStar {
  constructor() {
    this.reset(true);
  }
  reset(init) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 1.0 + 0.3;
    this.baseAlpha = Math.random() * 0.3 + 0.15;
    this.twinkleSpeed = Math.random() * 0.006 + 0.002;
    this.twinkleOffset = Math.random() * Math.PI * 2;
    this.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    if (init) this.age = Math.random() * 10000;
    // Very slow drift
    this.driftX = (Math.random() - 0.5) * 0.04;
    this.driftY = (Math.random() - 0.5) * 0.03;
  }
  update() {
    this.age += this.twinkleSpeed;
    this.x += this.driftX;
    this.y += this.driftY;
    if (this.x < -5) this.x = width + 5;
    if (this.x > width + 5) this.x = -5;
    if (this.y < -5) this.y = height + 5;
    if (this.y > height + 5) this.y = -5;
  }
  draw(ctx) {
    const alpha = this.baseAlpha * (0.6 + 0.4 * Math.sin(this.age + this.twinkleOffset));
    const [r, g, b] = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
    ctx.fill();
  }
}

// ============================================================
//  Layer 2: Mid-field stars (main visible stars, moderate twinkle)
// ============================================================
class MidStar {
  constructor() {
    this.reset(true);
  }
  reset(init) {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 2.0 + 0.8;
    this.baseAlpha = Math.random() * 0.55 + 0.45;
    this.twinkleSpeed = Math.random() * 0.014 + 0.005;
    this.twinkleOffset = Math.random() * Math.PI * 2;
    this.color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
    if (init) this.age = Math.random() * 10000;
    this.driftX = (Math.random() - 0.5) * 0.08;
    this.driftY = (Math.random() - 0.5) * 0.06;
    // Sparkle burst
    this.sparkleTimer = Math.random() * 300;
    this.sparkleCooldown = 200 + Math.random() * 400;
  }
  update() {
    this.age += this.twinkleSpeed;
    this.x += this.driftX;
    this.y += this.driftY;
    if (this.x < -5) this.x = width + 5;
    if (this.x > width + 5) this.x = -5;
    if (this.y < -5) this.y = height + 5;
    if (this.y > height + 5) this.y = -5;
    this.sparkleTimer++;
  }
  draw(ctx) {
    const alpha = this.baseAlpha * (0.5 + 0.5 * Math.sin(this.age + this.twinkleOffset));
    const [r, g, b] = this.color;

    // Halo on larger stars
    if (this.radius > 1.6 && alpha > 0.55) {
      const halo = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4);
      halo.addColorStop(0, `rgba(${r},${g},${b},${(alpha * 0.3).toFixed(2)})`);
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();
    }

    // Core
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
    ctx.fill();

    // Sparkle burst
    if (this.radius > 1.5 && this.sparkleTimer > this.sparkleCooldown && Math.random() < 0.002) {
      this.sparkleTimer = 0;
      sparkles.push(new Sparkle(this.x, this.y, this.color));
    }
  }
}

// ============================================================
//  Layer 3: Milky Way band (dense soft stars along a diagonal)
// ============================================================
class MilkyWayStar {
  constructor() {
    this.reset(true);
  }
  reset(init) {
    // Place along a diagonal band from top-left to bottom-right
    const t = Math.random(); // 0..1 along the band
    const bandCenterY = height * 0.35 + t * height * 0.5;
    const bandCenterX = t * width;
    // Scatter perpendicular to the band
    const spread = 80 + Math.random() * 200;
    const perpAngle = Math.PI / 2 + Math.atan2(height * 0.5, width);
    this.x = bandCenterX + Math.cos(perpAngle) * (Math.random() - 0.5) * spread;
    this.y = bandCenterY + Math.sin(perpAngle) * (Math.random() - 0.5) * spread;
    this.radius = Math.random() * 1.2 + 0.2;
    this.baseAlpha = Math.random() * 0.18 + 0.04;
    this.twinkleSpeed = Math.random() * 0.004 + 0.001;
    this.twinkleOffset = Math.random() * Math.PI * 2;
    if (init) this.age = Math.random() * 10000;
    this.driftX = (Math.random() - 0.5) * 0.03;
    this.driftY = (Math.random() - 0.5) * 0.02;
  }
  update() {
    this.age += this.twinkleSpeed;
    this.x += this.driftX;
    this.y += this.driftY;
    if (this.x < -5) this.x = width + 5;
    if (this.x > width + 5) this.x = -5;
    if (this.y < -5) this.y = height + 5;
    if (this.y > height + 5) this.y = -5;
  }
  draw(ctx) {
    const alpha = this.baseAlpha * (0.5 + 0.5 * Math.sin(this.age + this.twinkleOffset));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,200,255,${alpha.toFixed(2)})`;
    ctx.fill();
  }
}

// ============================================================
//  Sparkle burst (momentary cross/sparkle on bright stars)
// ============================================================
class Sparkle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.life = 1.0;
    this.decay = 0.025 + Math.random() * 0.03;
    this.size = 4 + Math.random() * 6;
    this.angle = Math.random() * Math.PI;
  }
  get dead() { return this.life <= 0; }
  update() { this.life -= this.decay; }
  draw(ctx) {
    const [r, g, b] = this.color;
    const alpha = this.life;
    const s = this.size * (1 + (1 - this.life) * 1.5); // expand as it fades
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    // 4-point cross sparkle
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, s);
    grad.addColorStop(0, `rgba(255,255,255,${alpha.toFixed(2)})`);
    grad.addColorStop(0.3, `rgba(${r},${g},${b},${(alpha * 0.5).toFixed(2)})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    // Horizontal bar
    ctx.fillRect(-s * 2.5, -0.6, s * 5, 1.2);
    // Vertical bar
    ctx.fillRect(-0.6, -s * 2.5, 1.2, s * 5);
    ctx.restore();
  }
}

// ============================================================
//  Stardust — tiny floating particles
// ============================================================
class Stardust {
  constructor() {
    this.reset();
    // Start at random life so they don't all pop in at once
    this.life = Math.random();
  }
  reset() {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.radius = Math.random() * 0.6 + 0.2;
    this.alpha = Math.random() * 0.25 + 0.05;
    // Float gently upward and sideways
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = -(Math.random() * 0.2 + 0.05);
    this.life = 0;
    this.lifeSpan = 300 + Math.random() * 700;
    this.oscAmp = Math.random() * 0.15;
    this.oscFreq = Math.random() * 0.03 + 0.01;
    this.oscOffset = Math.random() * Math.PI * 2;
  }
  update(frame) {
    this.life++;
    this.x += this.vx + Math.sin(frame * this.oscFreq + this.oscOffset) * this.oscAmp;
    this.y += this.vy;
    if (this.life > this.lifeSpan || this.x < -10 || this.x > width + 10 || this.y < -10 || this.y > height + 10) {
      this.reset();
      this.x = Math.random() * width;
      this.y = height + 10;
      this.life = 0;
    }
  }
  draw(ctx) {
    const fadeIn = Math.min(1, this.life / 40);
    const fadeOut = Math.min(1, (this.lifeSpan - this.life) / 40);
    const alpha = this.alpha * fadeIn * fadeOut;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(200,220,255,${alpha.toFixed(3)})`;
    ctx.fill();
  }
}

// ============================================================
//  Nebula — large, slow, colored cloud in background
// ============================================================
class Nebula {
  constructor(cx, cy, radius, color) {
    this.cx = cx;
    this.cy = cy;
    this.radius = radius;
    this.color = color; // [r, g, b]
    this.phaseX = Math.random() * Math.PI * 2;
    this.phaseY = Math.random() * Math.PI * 2;
    this.speedX = Math.random() * 0.0003 + 0.0001;
    this.speedY = Math.random() * 0.0002 + 0.0001;
    this.ampX = Math.random() * 60 + 20;
    this.ampY = Math.random() * 40 + 15;
    this.alphaBase = Math.random() * 0.04 + 0.02;
  }
  update(frame) {
    const ox = Math.sin(frame * this.speedX + this.phaseX) * this.ampX;
    const oy = Math.cos(frame * this.speedY + this.phaseY) * this.ampY;
    this.drawX = this.cx + ox;
    this.drawY = this.cy + oy;
  }
  draw(ctx) {
    const [r, g, b] = this.color;
    const grad = ctx.createRadialGradient(this.drawX, this.drawY, 0, this.drawX, this.drawY, this.radius);
    grad.addColorStop(0, `rgba(${r},${g},${b},${this.alphaBase.toFixed(3)})`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},${(this.alphaBase * 0.4).toFixed(4)})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(this.drawX - this.radius, this.drawY - this.radius, this.radius * 2, this.radius * 2);
  }
}

// ============================================================
//  Meteor — shooting star (brighter, faster)
// ============================================================
class Meteor {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * width * 0.9;
    this.y = Math.random() * height * 0.35;
    this.length = Math.random() * 120 + 60;
    this.speed = Math.random() * 14 + 10;
    this.angle = (Math.PI / 3.5) + (Math.random() - 0.5) * 0.4;
    this.vx = Math.cos(this.angle) * this.speed;
    this.vy = Math.sin(this.angle) * this.speed;
    this.life = 1.0;
    this.decay = Math.random() * 0.015 + 0.01;
    // Sometimes spawn a burst of sparkles at the head
    this.sparkleTimer = 0;
  }
  get dead() {
    return this.life <= 0 || this.x > width + 60 || this.y > height + 60;
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life -= this.decay;
    this.sparkleTimer++;
    // Emit sparkle trail particles
    if (this.sparkleTimer % 3 === 0 && this.life > 0.2) {
      meteorSparks.push(new MeteorSpark(this.x, this.y));
    }
  }
  draw(ctx) {
    const tipX = this.x;
    const tipY = this.y;
    const tailX = tipX - Math.cos(this.angle) * this.length;
    const tailY = tipY - Math.sin(this.angle) * this.length;

    // Outer glow
    const glow = ctx.createLinearGradient(tipX, tipY, tailX, tailY);
    glow.addColorStop(0, `rgba(255,255,250,${(this.life * 0.6).toFixed(2)})`);
    glow.addColorStop(1, 'rgba(255,240,220,0)');
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tailX, tailY);
    ctx.strokeStyle = glow;
    ctx.lineWidth = 5;
    ctx.stroke();

    // Core trail
    const core = ctx.createLinearGradient(tipX, tipY, tailX, tailY);
    core.addColorStop(0, `rgba(255,255,255,${this.life.toFixed(2)})`);
    core.addColorStop(0.4, `rgba(255,245,230,${(this.life * 0.7).toFixed(2)})`);
    core.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tailX, tailY);
    ctx.strokeStyle = core;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Head
    const headGrad = ctx.createRadialGradient(tipX, tipY, 0, tipX, tipY, 4);
    headGrad.addColorStop(0, `rgba(255,255,255,${this.life.toFixed(2)})`);
    headGrad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.beginPath();
    ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
    ctx.fillStyle = headGrad;
    ctx.fill();
  }
}

// ---- Meteor trail spark ----
class MeteorSpark {
  constructor(x, y) {
    this.x = x + (Math.random() - 0.5) * 6;
    this.y = y + (Math.random() - 0.5) * 6;
    this.life = 1.0;
    this.decay = 0.04 + Math.random() * 0.06;
    this.radius = Math.random() * 1.5 + 0.5;
  }
  get dead() { return this.life <= 0; }
  update() { this.life -= this.decay; }
  draw(ctx) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,250,240,${this.life.toFixed(2)})`;
    ctx.fill();
  }
}

// ============================================================
//  Initialize all collections
// ============================================================
const deepStars   = Array.from({ length: 150 }, () => new DeepStar());
const midStars    = Array.from({ length: 200 }, () => new MidStar());
const milkyWay    = Array.from({ length: 350 }, () => new MilkyWayStar());
const stardusts   = Array.from({ length: 80  }, () => new Stardust());
const sparkles    = [];
const meteorSparks = [];
const meteors     = [];

// Nebulae — placed around the canvas
const nebulae = [
  new Nebula(width * 0.25, height * 0.3, 350, [60, 20, 100]),    // purple
  new Nebula(width * 0.7,  height * 0.25, 400, [20, 40, 100]),   // deep blue
  new Nebula(width * 0.5,  height * 0.6, 300, [20, 60, 80]),     // teal
  new Nebula(width * 0.15, height * 0.7, 280, [80, 20, 60]),     // magenta
];

// ---- Resize also repositions nebulae ----
const origResize = resize;
resize = function() {
  origResize();
  nebulae[0].cx = width * 0.25; nebulae[0].cy = height * 0.3;
  nebulae[1].cx = width * 0.7;  nebulae[1].cy = height * 0.25;
  nebulae[2].cx = width * 0.5;  nebulae[2].cy = height * 0.6;
  nebulae[3].cx = width * 0.15; nebulae[3].cy = height * 0.7;
};

// ============================================================
//  Animation loop
// ============================================================
let frame = 0;
let meteorTimer = 0;
const METEOR_INTERVAL = 40; // frames between spawn attempts

function animate() {
  frame++;
  ctx.clearRect(0, 0, width, height);

  // Deep space background
  const bg = ctx.createRadialGradient(width / 2, height * 0.35, 0, width / 2, height, height * 1.1);
  bg.addColorStop(0, '#0c0c22');
  bg.addColorStop(0.4, '#08081a');
  bg.addColorStop(0.8, '#040410');
  bg.addColorStop(1, '#010108');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Nebulae (drawn before stars so they sit behind)
  for (const neb of nebulae) {
    neb.update(frame);
    neb.draw(ctx);
  }

  // Milky Way
  for (const mw of milkyWay) {
    mw.update();
    mw.draw(ctx);
  }

  // Deep stars (far layer)
  for (const ds of deepStars) {
    ds.update();
    ds.draw(ctx);
  }

  // Mid stars (main layer)
  for (const ms of midStars) {
    ms.update();
    ms.draw(ctx);
  }

  // Sparkles
  for (let i = sparkles.length - 1; i >= 0; i--) {
    sparkles[i].update();
    sparkles[i].draw(ctx);
    if (sparkles[i].dead) sparkles.splice(i, 1);
  }

  // Meteor sparks (trail particles)
  for (let i = meteorSparks.length - 1; i >= 0; i--) {
    meteorSparks[i].update();
    meteorSparks[i].draw(ctx);
    if (meteorSparks[i].dead) meteorSparks.splice(i, 1);
  }

  // Meteors
  meteorTimer++;
  if (meteorTimer > METEOR_INTERVAL && Math.random() < 0.45) {
    meteors.push(new Meteor());
    meteorTimer = 0;
  }
  for (let i = meteors.length - 1; i >= 0; i--) {
    meteors[i].update();
    meteors[i].draw(ctx);
    if (meteors[i].dead) meteors.splice(i, 1);
  }

  // Stardust (foreground floaters)
  for (const dust of stardusts) {
    dust.update(frame);
    dust.draw(ctx);
  }

  requestAnimationFrame(animate);
}

animate();

// ============================================================
//  Typewriter Effect
// ============================================================

const typewriterEl = document.getElementById('typewriter');
const fullText = '我爱你，萱萱';

let charIndex = 0;
const TYPE_SPEED = 110;
const PAUSE_AFTER_COMMA = 450;

function typeNext() {
  if (charIndex < fullText.length) {
    const char = fullText[charIndex];
    const displayed = fullText.slice(0, charIndex + 1);
    typewriterEl.textContent = displayed;
    charIndex++;

    let delay = TYPE_SPEED;
    if (char === ',') delay = PAUSE_AFTER_COMMA;
    if (char === '\n') delay = PAUSE_AFTER_COMMA + 120;
    delay += (Math.random() - 0.5) * 55;

    typewriterEl.classList.add('typing');
    typewriterEl.classList.remove('done');

    setTimeout(typeNext, delay);
  } else {
    typewriterEl.classList.remove('typing');
    typewriterEl.classList.add('done');
  }
}

setTimeout(typeNext, 800);
