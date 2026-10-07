/** Start the cached watercolor canvas animation; return its complete teardown. */
export function startButterflies(canvas, frontCanvas) {

    const backCtx = canvas.getContext('2d'), frontCtx = frontCanvas.getContext('2d');
    if (!backCtx || !frontCtx) return () => {};
    let ctx = backCtx;
    let disposed = false;
    const controller = new AbortController();
    const addEventListener = (name, callback, options = {}) =>
      window.addEventListener(name, callback, {...options, signal: controller.signal});
    const TAU = Math.PI * 2;
    let width, height, lastTime = 0, simulationTime = 0, frameId = 0, nextFrameAt = 0;
    const smallDevice = innerWidth < 700 || navigator.hardwareConcurrency <= 4;
    const frameInterval = 1000 / (smallDevice ? 45 : 60);
    let resizePending = false, pointerPending = false, pointerX = 0, pointerY = 0;
    const contentSelector = '.rail-copy, .rail nav, .hero-guide h1, .hero-detail p, .manifesto p, .section-title h2, .case-side img, .case-main h3, .case-main > p, .results, .tool-area h2, .tool-intro, .tool-list span, .project-card, .contact-guide h2, .contact-guide p, .contact-list, .field-guide footer';
    const contentBounds = [], visibleObstacles = [];
    const hero = {left:0, right:0, top:0, bottom:0, width:0, height:0};
    let scrollWind = 0;
    let previousScrollX = scrollX, previousScrollY = scrollY;
    let nextZoom = 2 + Math.random() * 3;
    let obstacles = [];
    function measureContent() {
      const rail = document.querySelector('.rail');
      if (rail) {
        const r = rail.getBoundingClientRect(), style = getComputedStyle(rail, '::before');
        const fontSize = parseFloat(style.fontSize) || width*.24;
        backCtx.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        const spacing = parseFloat(style.letterSpacing) || 0;
        const wordWidth = Math.min(width*.94, backCtx.measureText('akshay').width + spacing*5);
        hero.width = Math.max(100,wordWidth); hero.height = fontSize;
        hero.left = r.left+scrollX+(r.width-hero.width)/2; hero.right = hero.left+hero.width;
        hero.top = r.top+scrollY+r.height/2-fontSize*.5; hero.bottom = hero.top+hero.height;
      }
      contentBounds.length = 0;
      for (const element of document.querySelectorAll(contentSelector)) {
        const r = element.getBoundingClientRect();
        contentBounds.push({left:r.left + scrollX, right:r.right + scrollX,
          top:r.top + scrollY, bottom:r.bottom + scrollY, width:r.width, height:r.height});
      }
      obstacles = contentBounds.map(r => ({...r}));
      updateScrollBounds();
    }
    function updateScrollBounds() {
      visibleObstacles.length = 0;
      for (let i = 0; i < obstacles.length; i++) {
        const r = obstacles[i], source = contentBounds[i];
        r.left = source.left - scrollX; r.right = source.right - scrollX;
        r.top = source.top - scrollY; r.bottom = source.bottom - scrollY;
        if (r.bottom > 55 && r.top < height - 55) visibleObstacles.push(r);
      }
    }
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, lastMove: -Infinity, active: false, touch: false, expiresAt: Infinity };
    const palettes = ['#d8c5e8', '#edc7cf', '#f1c6af', '#e9d7aa', '#bccfe7', '#2f7d5a'];
    const bodyColors = ['#c1a0dc', '#dfa4b3', '#dfa78b', '#d8bd80', '#98b5da', '#286b4e'];
    const butterflies = Array.from({ length: smallDevice ? 7 : 10 }, (_, i) => ({
      shape: 1, travel: 0, checkAt: 0, detourUntil: 0,
      role: i === 0 ? 'cursor' : i === 1 ? 'shy' : 'hero',
      front: i >= 2 && i % 2 === 0, initialized: false,
      target: {x:0, y:0}, avoidance: {x:0, y:0},
      element: i, anchorIndex: -1, anchorUntil: 0,
      drift: .45 + Math.random() * .35,
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      wanderX: Math.random() * innerWidth, wanderY: Math.random() * innerHeight,
      nextWander: 0,
      zoomStart: 0, zoomUntil: 0, zoomX: 0, zoomY: 0,
      vx: 0, vy: 0, angle: i * 2.39996, phase: Math.random() * TAU,
      flapPhase: Math.random() * TAU, flapRate: 7 + Math.random() * 7,
      rhythmRate: .35 + Math.random() * .7, wingDepth: .65 + Math.random() * .3,
      nextGlide: 2 + Math.random() * 8, glideStart: 0, glideUntil: 0,
      radius: 95 + (i % 4) * 27, speed: .35 + Math.random() * .4,
      direction: i % 2 ? 1 : -1, size: i === 0 ? (smallDevice ? 22 : 28) : i === 1 ? (smallDevice ? 16 : 20) : 8 + Math.random() * 4,
      opacity: i === 0 ? .48 : i === 1 ? .36 : .85,
      color: i < 2 ? palettes[5] : palettes[(i-2) % 5],
      bodyColor: i < 2 ? bodyColors[5] : bodyColors[(i-2) % 5],
      heading: 0, fleeUntil: 0, fleeX: 0, fleeY: 0
    }));
    function resize() {
      width = innerWidth; height = innerHeight;
      const dpr = Math.min(devicePixelRatio || 1, smallDevice ? 1.5 : 2, Math.sqrt(2000000 / (width * height)));
      for (const layer of [canvas, frontCanvas]) {
        layer.width = Math.round(width*dpr); layer.height = Math.round(height*dpr);
        layer.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
      }
      if (!pointer.active) { pointer.x = width * .64; pointer.y = height * .55; }
      pointer.x = Math.min(width, pointer.x); pointer.y = Math.min(height, pointer.y);
      measureContent();
      for (const b of butterflies) if (b.role === 'hero' && !b.initialized) {
        b.x=hero.left+Math.random()*hero.width; b.y=hero.top+Math.random()*hero.height;
        b.initialized=true;
      }
    }
    addEventListener('resize', () => { resizePending = true; }, {passive:true});
    addEventListener('pointermove', queuePointer, {passive:true});
    addEventListener('pointerdown', queuePointer, {passive:true});
    addEventListener('pointercancel', () => { if (pointer.touch) { pointer.active=false; pointerPending=false; } }, {passive:true});
    let scrollPending = false;
    addEventListener('scroll', () => { scrollPending = true; }, {passive: true});
    function queuePointer(event) {
      const touch = event.pointerType === 'touch' || event.pointerType === 'pen';
      if (touch && event.type !== 'pointerdown') return;
      pointer.touch = touch;
      pointerX = event.clientX; pointerY = event.clientY; pointerPending = true;
    }
    function move() {
      const now = simulationTime;
      const elapsed = Math.max(.016, now - pointer.lastMove);
      pointer.vx = pointer.active ? (pointerX - pointer.x) / elapsed : 0;
      pointer.vy = pointer.active ? (pointerY - pointer.y) / elapsed : 0;
      pointer.x = pointerX; pointer.y = pointerY;
      pointer.lastMove = now; pointer.active = true;
      pointer.expiresAt = pointer.touch ? now + 3 : Infinity;
      for (const b of butterflies) {
        const dx = b.x - (b.role==='hero' ? scrollX : 0) - pointer.x;
        const dy = b.y - (b.role==='hero' ? scrollY : 0) - pointer.y;
        const distance = Math.hypot(dx, dy);
        const approach = (pointer.vx * dx + pointer.vy * dy) / Math.max(distance, 1);
        if (distance < 70 && approach > 140) {
          b.fleeUntil = now + .4 + Math.random() * .35;
          b.fleeX = dx / Math.max(distance, 1); b.fleeY = dy / Math.max(distance, 1);
        }
      }
    }
    const watercolorTextures = new Map();
    function watercolorTexture(color, shape) {
      const key = color + shape;
      if (watercolorTextures.has(key)) return watercolorTextures.get(key);
      const paper = document.createElement('canvas'); paper.width = 128; paper.height = 192;
      const paint = paper.getContext('2d');
      let seed = parseInt(color.slice(1), 16) + shape * 7919;
      const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
      const pigment = bodyColors[palettes.indexOf(color)];
      // Fixed pigment blooms: the texture moves with the wings, never flickers.
      for (let i = 0; i < 24; i++) {
        const x = random() * 128, y = random() * 192, radius = 10 + random() * 35;
        const bloom = paint.createRadialGradient(x, y, radius * .08, x, y, radius);
        bloom.addColorStop(0, (i % 3 ? pigment : '#ffffff') + '70');
        bloom.addColorStop(.55, (i % 3 ? pigment : '#ffffff') + '35');
        bloom.addColorStop(1, (i % 3 ? pigment : '#ffffff') + '00');
        paint.fillStyle = bloom; paint.fillRect(x-radius, y-radius, radius*2, radius*2);
      }
      // Fine light and colored grain suggests pigment caught in paper fibers.
      for (let i = 0; i < 2400; i++) {
        paint.fillStyle = i % 3 ? '#ffffff38' : pigment + '30';
        const size = .4 + random() * 1.3;
        paint.fillRect(random()*128, random()*192, size, size);
      }
      watercolorTextures.set(key, paper); return paper;
    }
    function paintTexture(ctx, color, shape) {
      ctx.save(); ctx.clip(); ctx.globalAlpha = .7;
      ctx.drawImage(watercolorTexture(color, shape), 0, -2, 2.2, 3.7);
      // A faint pigment rim, rather than a sharp outline.
      ctx.globalAlpha = .16; ctx.strokeStyle = color; ctx.lineWidth = .035; ctx.stroke();
      ctx.restore();
    }
    function renderWing(ctx, side, size, color, fold, shape) {
      ctx.save(); ctx.scale(side * fold * size, size);
      ctx.globalAlpha = .72;
      const wash = ctx.createLinearGradient(0, .2, 1.8, -1.5);
      wash.addColorStop(0, color + 'd9'); wash.addColorStop(.65, color + 'a6');
      wash.addColorStop(1, color + '40');
      ctx.fillStyle = wash;
      // Wide, tapered upper wings and soft teardrop lower wings.
      ctx.beginPath(); ctx.moveTo(0, .12);
      if (shape === 1) {
        ctx.bezierCurveTo(.3, -.8, .85, -1.7, 1.45, -1.65);
        ctx.bezierCurveTo(2, -1.45, 1.98, -.8, 1.76, -.45);
      } else if (shape === 2) {
        ctx.bezierCurveTo(.4, -.65, 1.35, -1.4, 1.86, -1.72);
        ctx.quadraticCurveTo(2.12, -1.6, 1.91, -1.14);
        ctx.quadraticCurveTo(2.05, -.96, 1.84, -.78);
        ctx.quadraticCurveTo(1.96, -.62, 1.76, -.45);
      } else {
        ctx.bezierCurveTo(.24, -.65, 1.2, -1.65, 1.88, -1.85);
        ctx.quadraticCurveTo(2.1, -1.96, 1.76, -.45);
      }
      ctx.bezierCurveTo(1.62, .13, .76, .18, 0, .12);
      ctx.closePath(); ctx.fill(); paintTexture(ctx, color, shape);
      ctx.beginPath(); ctx.moveTo(0, .13);
      ctx.bezierCurveTo(.58, .04, 1.55, .02, 1.52, .7);
      ctx.bezierCurveTo(1.47, 1.17, 1.06, 1.66, .77, 1.48);
      ctx.bezierCurveTo(.37, 1.22, .14, .53, 0, .13);
      ctx.closePath(); ctx.fill(); paintTexture(ctx, color, shape);
      // A second translucent wash gives depth without intricate markings.
      ctx.globalAlpha = .24; ctx.fillStyle = color;
      ctx.beginPath(); ctx.moveTo(.06, .1);
      ctx.bezierCurveTo(.5, -.72, 1.49, -1.54, 1.73, -1.36);
      ctx.bezierCurveTo(1.91, -.9, 1.58, -.17, 1.1, -.02);
      ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(.06, .17);
      ctx.bezierCurveTo(.84, .12, 1.6, .51, 1.18, 1.05);
      ctx.bezierCurveTo(.85, 1.4, .42, .76, .06, .17);
      ctx.fill(); ctx.restore();
    }
    // Bake all watercolor work once. Each animation frame draws two small sprites.
    const wingSprites = new Map();
    function prepareWings() {
      for (const color of palettes) {
        const sprite = document.createElement('canvas'); sprite.width = 96; sprite.height = 152;
        const paint = sprite.getContext('2d'); paint.translate(4, 80);
        renderWing(paint, 1, 40, color, 1, 1);
        wingSprites.set(color, sprite);
      }
    }
    function wing(side, size, color, fold) {
      ctx.save(); ctx.scale(side * fold * size, size);
      ctx.drawImage(wingSprites.get(color), -.1, -2, 2.4, 3.8); ctx.restore();
    }
    function flightTarget(b, now, idle) {
      const target = b.target;
      if (b.role === 'hero') {
        const orbitX = hero.width * (.3 + .1*Math.sin(b.phase));
        const orbitY = hero.height * (.42 + .2*Math.cos(b.phase));
        target.x = (hero.left+hero.right)/2+Math.cos(b.angle)*orbitX;
        target.y = (hero.top+hero.bottom)/2+Math.sin(b.angle)*orbitY + Math.sin(now*.9+b.phase)*18;
        return target;
      }
      if (b.role === 'shy' && pointer.active) {
        const comfort = Math.min(230, width * .48);
        if (now > b.nextWander || Math.hypot(b.x-b.wanderX,b.y-b.wanderY)<50 ||
          Math.hypot(b.wanderX-pointer.x,b.wanderY-pointer.y)<comfort) {
          let best = -Infinity;
          for (let i=0; i<20; i++) {
            const x = 60+Math.random()*Math.max(0,width-120);
            const y = 60+Math.random()*Math.max(0,height-120);
            const fromMouse = Math.hypot(x-pointer.x,y-pointer.y);
            const travel = Math.hypot(x-b.x,y-b.y);
            const score = Math.min(fromMouse, comfort*1.8)+Math.min(travel,150)*.3;
            if (score>best) { best=score; b.wanderX=x; b.wanderY=y; }
          }
          b.nextWander = now+3+Math.random()*3;
        }
        target.x=b.wanderX; target.y=b.wanderY; return target;
      }
      if (now < b.zoomUntil) { target.x = b.zoomX; target.y = b.zoomY; return target; }
      if (now < b.detourUntil) { target.x = b.wanderX; target.y = b.wanderY; return target; }
      if (b.role === 'cursor' && pointer.active) {
        const radius = Math.min(b.radius * (idle ? .65 : .55), Math.min(width, height) * .38);
        target.x = pointer.x + Math.cos(b.angle) * radius;
        target.y = pointer.y + Math.sin(b.angle) * radius * .75; return target;
      }
      const visible = visibleObstacles;
      if (b.role === 'content' && visible.length) {
        let r = obstacles[b.anchorIndex];
        if (!r || r.bottom < 0 || r.top > height || now > b.anchorUntil) {
          // Keep one element as a companion, rather than switching with every scroll.
          let best = Infinity;
          for (let i = 0; i < visible.length; i++) {
            const candidate = visible[(i+b.element) % visible.length];
            const dx = b.x-(candidate.left+candidate.right)/2;
            const dy = b.y-(candidate.top+candidate.bottom)/2;
            const score = dx*dx+dy*dy + i*700;
            if (score < best) { best=score; r=candidate; }
          }
          b.anchorIndex = obstacles.indexOf(r); b.anchorUntil = now+8+Math.random()*8;
        }
        const padding = 26 + b.size;
        const c = Math.cos(b.angle), t = Math.sin(b.angle);
        target.x = (r.left + r.right) / 2 + Math.sign(c) * Math.sqrt(Math.abs(c)) * (Math.min(r.width / 2, width * .32) + padding);
        target.y = (r.top + r.bottom) / 2 + Math.sign(t) * Math.sqrt(Math.abs(t)) * (Math.min(r.height / 2, height * .3) + padding); return target;
      }
      if (now > b.nextWander || Math.hypot(b.x - b.wanderX, b.y - b.wanderY) < 45) {
        b.wanderX = 30 + Math.random() * Math.max(0, width - 60);
        b.wanderY = 30 + Math.random() * Math.max(0, height - 60);
        b.nextWander = now + 4 + Math.random() * 6;
      }
      target.x = b.wanderX; target.y = b.wanderY; return target;
    }
    function avoidContent(b) {
      let x = 0, y = 0;
      const reach = b.size * 2.4 + 36;
      for (const r of obstacles) {
        if (r.bottom < -reach || r.top > height + reach) continue;
        const px = Math.max(r.left, Math.min(r.right, b.x));
        const py = Math.max(r.top, Math.min(r.bottom, b.y));
        let dx = b.x - px, dy = b.y - py, distance = Math.hypot(dx, dy);
        if (distance === 0) {
          // If scrolling carries a panel over a butterfly, glide to its nearest edge.
          const left = b.x-r.left, right = r.right-b.x, top = b.y-r.top, bottom = r.bottom-b.y;
          let best = Infinity;
          if (r.left>35 && left<best) { best=left; dx=-1; dy=0; }
          if (r.right<width-35 && right<best) { best=right; dx=1; dy=0; }
          if (r.top>35 && top<best) { best=top; dx=0; dy=-1; }
          if (r.bottom<height-35 && bottom<best) { best=bottom; dx=0; dy=1; }
          const fallback = Math.min(left,right,top,bottom);
          const fx = fallback===left ? -1 : fallback===right ? 1 : 0;
          const fy = fallback===top ? -1 : fallback===bottom ? 1 : 0;
          if (best === Infinity) { dx = fx; dy = fy; } distance = 1;
        }
        if (distance >= reach) continue;
        const nx = dx / distance, ny = dy / distance;
        const strength = (1 - distance / reach) ** 2;
        // A tangential component carries them along edges instead of pinning them there.
        x += (nx * 210 - ny * b.direction * 135) * strength;
        y += (ny * 210 + nx * b.direction * 135) * strength;
      }
      b.avoidance.x = x; b.avoidance.y = y; return b.avoidance;
    }
    function frame(ms) {
      frameId = 0;
      if (disposed || document.hidden) return;
      if (ms + .5 < nextFrameAt) { scheduleFrame(); return; }
      nextFrameAt = ms + frameInterval - Math.max(0, (ms-nextFrameAt) % frameInterval);
      const dt = Math.min(lastTime ? (ms-lastTime)/1000 : frameInterval/1000, .06);
      lastTime = ms; simulationTime += dt; const now = simulationTime;
      if (resizePending) { resize(); resizePending = false; }
      if (scrollPending) {
        if (pointer.touch) { pointer.active=false; pointerPending=false; }
        const delta=scrollY-previousScrollY;
        scrollWind = Math.max(-50,Math.min(50,delta*.18));
        previousScrollX=scrollX; previousScrollY=scrollY;
        updateScrollBounds(); scrollPending = false;
      }
      scrollWind *= Math.exp(-3*dt);
      if (pointerPending) { move(); pointerPending = false; }
      if (pointer.touch && now >= pointer.expiresAt) pointer.active = false;
      backCtx.clearRect(0,0,width,height); frontCtx.clearRect(0,0,width,height);
      const idle = now - pointer.lastMove > .45;
      if (now >= nextZoom) {
        const candidates = [];
        for (const b of butterflies) {
          if (b.role !== 'hero' || now < b.fleeUntil || now < b.zoomUntil) continue;
          candidates.push(b);
        }
        if (candidates.length) {
          const b = candidates[Math.floor(Math.random() * candidates.length)];
          const target = {x:hero.left+Math.random()*hero.width, y:hero.top+Math.random()*hero.height};
          if (target) {
            b.zoomX = target.x; b.zoomY = target.y;
            b.zoomStart = now; b.zoomUntil = now + 1.1 + Math.random() * .6;
            b.glideUntil = now;
          }
        }
        nextZoom = now + 2.5 + Math.random() * 4;
      }
      for (const b of butterflies) {
        if (now < b.zoomUntil && Math.hypot(b.x-b.zoomX, b.y-b.zoomY) < 65) b.zoomUntil = now;
        const zooming = now < b.zoomUntil;
        const heroVisible = hero.bottom-scrollY > -60 && hero.top-scrollY < height+60;
        if (b.role === 'hero' && !heroVisible) continue;
        const zoom = zooming ? Math.sin(Math.PI * (now-b.zoomStart) / (b.zoomUntil-b.zoomStart)) : 0;
        b.travel += Math.hypot(b.vx, b.vy) * dt;
        if (now > b.checkAt) {
          if (b.checkAt && b.travel < 18) {
            b.wanderX = 45 + Math.random() * Math.max(0, width - 90);
            b.wanderY = 45 + Math.random() * Math.max(0, height - 90);
            b.detourUntil = now + 3;

          }
          b.travel = 0; b.checkAt = now + 1.5;
        }
        b.angle += dt * b.speed * b.direction * (1+zoom*2);
        const destination = flightTarget(b, now, idle);
        const target = destination;
        if (b.role !== 'hero') { target.x = Math.max(55,Math.min(width-55,target.x)); target.y = Math.max(55,Math.min(height-55,target.y)); }
        const dxTarget = target.x - b.x, dyTarget = target.y - b.y;
        const targetDistance = Math.max(1, Math.hypot(dxTarget, dyTarget));
        const following = b.role === 'cursor' && pointer.active;
        const baseCruise = following ? Math.min(105, 35+targetDistance*.65)
          : b.role === 'content' ? Math.min(155, 65+targetDistance*1.1) : 78;
        const cruise = baseCruise + 250 * zoom;
        const avoidance = b.role === 'hero' ? b.avoidance : avoidContent(b);
        // Cursor companions can drift over words; a strong obstacle force used to repel them.
        const avoidanceWeight = following ? .3 : b.role === 'content' ? .65 : .85;
        let desiredX = dxTarget / targetDistance * cruise + avoidance.x*avoidanceWeight;
        let desiredY = dyTarget / targetDistance * cruise + avoidance.y*avoidanceWeight;
        if (b.role === 'content') {
          desiredX -= Math.sin(b.angle) * 28 * b.direction;
          desiredY += Math.cos(b.angle) * 28 * b.direction;
        }
        if (targetDistance < 28) {
          desiredX += Math.cos(now * 1.2 + b.phase) * 45;
          desiredY += Math.sin(now * 1.2 + b.phase) * 45;
        }
        if (b.role === 'shy' && pointer.active) {
          const dx=b.x-pointer.x, dy=b.y-pointer.y, distance=Math.hypot(dx,dy);
          const comfort=Math.min(230,width*.48);
          if (distance<comfort) {
            const nx=distance>.01 ? dx/distance : Math.cos(b.phase);
            const ny=distance>.01 ? dy/distance : Math.sin(b.phase);
            const urgency=1-distance/comfort;
            desiredX += nx*500*urgency;
            desiredY += ny*500*urgency;
          }
        }
        if (b.role === 'hero') {
          desiredX += Math.max(0,hero.left-20-b.x)*4-Math.max(0,b.x-hero.right-20)*4;
          desiredY += Math.max(0,hero.top-40-b.y)*4-Math.max(0,b.y-hero.bottom-40)*4;
        } else {
          desiredX += Math.max(0,75-b.x)*5-Math.max(0,b.x-width+75)*5;
          desiredY += Math.max(0,75-b.y)*5-Math.max(0,b.y-height+75)*5 + scrollWind;
        }
        // Reserve room for the full wingspan and anticipate approaching neighbors.
        for (const other of butterflies) {
          if (other === b) continue;
          const dx = b.x-(b.role==='hero'?scrollX:0)-other.x+(other.role==='hero'?scrollX:0);
          const dy = b.y-(b.role==='hero'?scrollY:0)-other.y+(other.role==='hero'?scrollY:0);
          const clearance = (b.size + other.size) * 2.2 + 16;
          const predictedX = dx + (b.vx - other.vx) * .25;
          const predictedY = dy + (b.vy - other.vy) * .25;
          const distanceSquared = dx*dx+dy*dy;
          const predictedSquared = predictedX*predictedX+predictedY*predictedY;
          if (distanceSquared < clearance*clearance || predictedSquared < clearance*clearance) {
            const distance = Math.sqrt(distanceSquared), predictedDistance = Math.sqrt(predictedSquared);
            const nx = distance > .01 ? dx/distance : Math.cos(b.phase);
            const ny = distance > .01 ? dy/distance : Math.sin(b.phase);
            const proximity = Math.max(0, 1 - Math.min(distance, predictedDistance) / clearance);
            const push = 210 * proximity * proximity;
            desiredX += nx * push;
            desiredY += ny * push;
          }
        }
        const desiredSpeed = Math.hypot(desiredX,desiredY);
        const desiredLimit = (following ? 115 : b.role === 'shy' ? 210 : 145) + 250 * zoom;
        if (desiredSpeed > desiredLimit) { desiredX *= desiredLimit/desiredSpeed; desiredY *= desiredLimit/desiredSpeed; }
        const response = following ? 2.4 : 3.5;
        let ax = (desiredX - b.vx) * (response + 4 * zoom);
        let ay = (desiredY - b.vy) * (response + 4 * zoom);
        ax += Math.sin(now * 3 + b.phase) * 35;
        ay += Math.cos(now * 2.5 + b.phase) * 35;
        if (now < b.fleeUntil) { ax += b.fleeX * 1200; ay += b.fleeY * 1200; }
        const damping = Math.exp(-.8 * dt);
        b.vx = (b.vx + ax * dt) * damping; b.vy = (b.vy + ay * dt) * damping;
        const speed = Math.hypot(b.vx, b.vy), limit = now < b.fleeUntil ? 360 : 220 + 200 * zoom;
        if (speed > limit) { b.vx *= limit / speed; b.vy *= limit / speed; }
        b.x += b.vx * dt; b.y += b.vy * dt;
        // No collision snapping: positions always follow their continuous velocity.
        const heading = Math.atan2(b.vy, b.vx) + Math.PI / 2;
        b.heading += Math.atan2(Math.sin(heading - b.heading), Math.cos(heading - b.heading)) * Math.min(1, dt * 5);
        const screenX = b.x-(b.role==='hero'?scrollX:0), screenY = b.y-(b.role==='hero'?scrollY:0);
        ctx = b.front ? frontCtx : backCtx;
        ctx.save(); ctx.translate(screenX,screenY); ctx.rotate(b.heading);
        ctx.globalAlpha = b.opacity;
        const fleeing = now < b.fleeUntil;
        if (now > b.nextGlide && !fleeing && !zooming) {
          b.glideStart = now; b.glideUntil = now + .35 + Math.random() * .65;
          b.nextGlide = b.glideUntil + 3 + Math.random() * 7;
        }
        const rhythm = 1 + .16 * Math.sin(now * b.rhythmRate + b.phase)
          + .06 * Math.sin(now * 2.1 + b.phase * 2);
        const flightEffort = Math.min(1, Math.hypot(b.vx, b.vy) / 150);
        b.flapPhase = (b.flapPhase + dt * b.flapRate * rhythm *
          (fleeing ? 1.65 : 1 + flightEffort * .15 + zoom * .7)) % TAU;
        const beat = (1 + Math.cos(b.flapPhase)) / 2;
        // Unequal opening/closing speeds, with occasional open-wing glides.
        const flapping = .42 + b.wingDepth * .58 * Math.pow(beat, .7);
        const glideBlend = !fleeing && !zooming && now < b.glideUntil ? Math.min(1,
          (now - b.glideStart) / .16, (b.glideUntil - now) / .16) : 0;
        const fold = flapping * (1 - glideBlend) + .88 * glideBlend;
        const asymmetry = .025 * Math.sin(now * 1.5 + b.phase);
        wing(-1, b.size, b.color, fold * (1 + asymmetry), b.shape);
        wing(1, b.size, b.color, fold * (1 - asymmetry), b.shape);
        ctx.fillStyle = b.bodyColor;
        ctx.beginPath(); ctx.ellipse(0, b.size * .12, b.size * .07, b.size * .4, 0, 0, TAU); ctx.fill();
        ctx.restore();
      }
      scheduleFrame();
    }
    function scheduleFrame() {
      if (!disposed && !frameId && !document.hidden) frameId = requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; }
      else { previousScrollX=scrollX; previousScrollY=scrollY; lastTime = 0; nextFrameAt = 0; scrollPending = true; resizePending = true; scheduleFrame(); }
    }, {signal:controller.signal});
    const observer = new ResizeObserver(() => { resizePending = true; });
    const content = document.querySelector('.field-guide');
    if (content) observer.observe(content);
    resize(); prepareWings();
    document.fonts.ready.then(() => { if (!disposed) resizePending = true; });
    scheduleFrame();
    return () => {
      disposed = true; controller.abort(); observer.disconnect();
      cancelAnimationFrame(frameId); frameId = 0;
      watercolorTextures.clear(); wingSprites.clear();
      backCtx.clearRect(0,0,width,height); frontCtx.clearRect(0,0,width,height);
    };

}
