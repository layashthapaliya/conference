/* ===================================================
   RR2026 — Microbe Canvas Animation
   Organic, procedurally-drawn microbes swimming
   across the hero background
   =================================================== */

(function () {
  const canvas = document.getElementById('microbe-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  /* ── palette (matches CSS vars) ── */
  const COLORS = [
    { fill: 'rgba(110,190,140,0.22)', stroke: 'rgba(110,190,140,0.55)' }, // mint
    { fill: 'rgba(72,155,185,0.18)', stroke: 'rgba(72,155,185,0.50)' },   // teal
    { fill: 'rgba(195,155,80,0.16)', stroke: 'rgba(195,155,80,0.45)' },   // amber
    { fill: 'rgba(155,105,185,0.16)', stroke: 'rgba(155,105,185,0.48)' }, // violet
    { fill: 'rgba(80,175,165,0.18)', stroke: 'rgba(80,175,165,0.52)' },   // cyan
  ];

  let W, H, microbes = [], ticker = 0;
  const COUNT = 18;

  /* ── resize ── */
  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  window.addEventListener('resize', () => { resize(); });
  resize();

  /* ── helpers ── */
  const rnd  = (a, b) => a + Math.random() * (b - a);
  const rndI = (a, b) => Math.floor(rnd(a, b));

  /* ── Microbe class ── */
  class Microbe {
    constructor(x, y) {
      this.reset(x, y);
    }
    reset(x, y) {
      this.x   = x  ?? rnd(0, W);
      this.y   = y  ?? rnd(0, H);
      this.r   = rnd(18, 54);           // body radius
      this.col = COLORS[rndI(0, COLORS.length)];
      this.vx  = rnd(-0.22, 0.22);
      this.vy  = rnd(-0.18, 0.18);
      this.rot = rnd(0, Math.TAU || Math.PI * 2);
      this.dRot= rnd(-0.003, 0.003);
      this.wobble   = rnd(0, Math.PI * 2); // phase
      this.wobbleSpd= rnd(0.012, 0.03);
      this.wobbleAmp= rnd(0.12, 0.32);     // body squish
      this.type = rndI(0, 4);             // 0=amoeba 1=oval 2=rod 3=coccus
      this.numPseudo = rndI(2, 6);        // pseudopod count for amoeba
      this.pseudoPhase = Array.from({length: 8}, () => rnd(0, Math.PI*2));
      this.pseudoSpd   = Array.from({length: 8}, () => rnd(0.01, 0.03));
      /* flagella */
      this.hasFlagella = Math.random() < 0.5;
      this.nFlag = rndI(1, 3);
      this.flagPhase = rnd(0, Math.PI*2);
      this.flagSpd   = rnd(0.04, 0.09);
      /* cilia ring */
      this.hasCilia = !this.hasFlagella && Math.random() < 0.45;
      this.ciliaCount = rndI(8, 16);
      this.ciliaPhase = rnd(0, Math.PI*2);
      this.opacity = rnd(0.55, 1.0);
      /* nucleus */
      this.hasNucleus = Math.random() < 0.6;
      this.nucleusOffset = { x: rnd(-0.2, 0.2), y: rnd(-0.2, 0.2) };
      /* internal organelle dots */
      this.organelles = Array.from({length: rndI(1, 4)}, () => ({
        ox: rnd(-0.4, 0.4),
        oy: rnd(-0.4, 0.4),
        or: rnd(0.06, 0.14),
      }));
    }

    /* draw a single flagellum as a sine wave path */
    drawFlagellum(angle, len, phase) {
      ctx.save();
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(this.r * 0.85, 0);
      const segs = 28;
      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const fx = this.r * 0.85 + t * len;
        const fy = Math.sin(t * Math.PI * 3 + phase) * this.r * 0.35;
        if (i === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);
      }
      ctx.strokeStyle = this.col.stroke;
      ctx.lineWidth   = 0.9;
      ctx.stroke();
      ctx.restore();
    }

    drawBody() {
      const t = ticker;
      const w  = this.wobble + t * this.wobbleSpd;
      const scX = 1 + Math.sin(w)         * this.wobbleAmp * 0.5;
      const scY = 1 + Math.sin(w + Math.PI) * this.wobbleAmp * 0.5;

      if (this.type === 0) {
        /* amoeba — irregular blob via control-point bulges */
        const pts = [];
        const n = 8;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          this.pseudoPhase[i] += this.pseudoSpd[i];
          const bulge = 1 + Math.sin(this.pseudoPhase[i]) * 0.28;
          pts.push({
            x: Math.cos(a) * this.r * scX * bulge,
            y: Math.sin(a) * this.r * scY * bulge,
          });
        }
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const cur  = pts[i];
          const next = pts[(i + 1) % n];
          const cx   = (cur.x + next.x) / 2;
          const cy   = (cur.y + next.y) / 2;
          if (i === 0) ctx.moveTo(cx, cy);
          else ctx.quadraticCurveTo(cur.x, cur.y, cx, cy);
        }
        ctx.closePath();

      } else if (this.type === 1) {
        /* oval */
        ctx.beginPath();
        ctx.ellipse(0, 0, this.r * scX * 1.35, this.r * scY * 0.8, 0, 0, Math.PI * 2);

      } else if (this.type === 2) {
        /* rod / bacillus */
        const rw = this.r * 1.7 * scX, rh = this.r * 0.65 * scY;
        const cr = rh * 0.9;
        ctx.beginPath();
        ctx.moveTo(-rw + cr, -rh);
        ctx.lineTo( rw - cr, -rh);
        ctx.arcTo(  rw, -rh, rw, rh, cr);
        ctx.lineTo( rw - cr, rh);
        ctx.arcTo( -rw, rh, -rw, -rh, cr);
        ctx.closePath();

      } else {
        /* coccus — sphere */
        ctx.beginPath();
        ctx.arc(0, 0, this.r, 0, Math.PI * 2);
      }

      ctx.fillStyle   = this.col.fill;
      ctx.strokeStyle = this.col.stroke;
      ctx.lineWidth   = 1.2;
      ctx.fill();
      ctx.stroke();
    }

    drawInternals() {
      /* nucleus */
      if (this.hasNucleus) {
        const nx = this.nucleusOffset.x * this.r;
        const ny = this.nucleusOffset.y * this.r;
        const nr = this.r * 0.32;
        ctx.beginPath();
        ctx.arc(nx, ny, nr, 0, Math.PI * 2);
        ctx.strokeStyle = this.col.stroke;
        ctx.lineWidth   = 0.8;
        ctx.stroke();
        /* nucleolus dot */
        ctx.beginPath();
        ctx.arc(nx, ny, nr * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = this.col.stroke;
        ctx.fill();
      }
      /* organelle dots */
      this.organelles.forEach(o => {
        ctx.beginPath();
        ctx.arc(o.ox * this.r, o.oy * this.r, o.or * this.r, 0, Math.PI * 2);
        ctx.fillStyle = this.col.stroke.replace(')', ', 0.55)').replace('rgba', 'rgba');
        ctx.fill();
      });
    }

    drawCilia() {
      if (!this.hasCilia) return;
      this.ciliaPhase += 0.05;
      const n = this.ciliaCount;
      const len = this.r * 0.5;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const phase = this.ciliaPhase + i * 0.6;
        const sx = Math.cos(a) * this.r;
        const sy = Math.sin(a) * this.r;
        const wave = Math.sin(phase) * 0.4;
        const ex = sx + Math.cos(a + wave) * len;
        const ey = sy + Math.sin(a + wave) * len;
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = this.col.stroke;
        ctx.lineWidth   = 0.7;
        ctx.stroke();
      }
    }

    drawFlagella() {
      if (!this.hasFlagella) return;
      this.flagPhase += this.flagSpd;
      for (let i = 0; i < this.nFlag; i++) {
        const angle = (i / this.nFlag) * Math.PI * 0.5 - Math.PI * 0.25;
        this.drawFlagellum(angle + Math.PI, this.r * rnd(2.5, 4.5), this.flagPhase + i * 1.2);
      }
    }

    update() {
      this.x   += this.vx;
      this.y   += this.vy;
      this.rot += this.dRot;
      /* gentle drift */
      this.vx += rnd(-0.003, 0.003);
      this.vy += rnd(-0.003, 0.003);
      this.vx  = Math.max(-0.35, Math.min(0.35, this.vx));
      this.vy  = Math.max(-0.28, Math.min(0.28, this.vy));
      /* wrap */
      const pad = this.r * 4;
      if (this.x < -pad) this.x = W + pad;
      if (this.x > W + pad) this.x = -pad;
      if (this.y < -pad) this.y = H + pad;
      if (this.y > H + pad) this.y = -pad;
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      this.drawCilia();
      this.drawFlagella();
      this.drawBody();
      this.drawInternals();
      ctx.restore();
    }
  }

  /* ── populate ── */
  function init() {
    microbes = [];
    for (let i = 0; i < COUNT; i++) microbes.push(new Microbe());
  }
  init();

  /* ── main loop ── */
  function loop() {
    ctx.clearRect(0, 0, W, H);
    ticker++;
    microbes.forEach(m => { m.update(); m.draw(); });
    requestAnimationFrame(loop);
  }
  loop();

  /* ── re-init on tab focus ── */
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ticker = 0;
  });
})();
