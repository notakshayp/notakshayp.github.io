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
    let width, height, lastTime = null, simulationTime = 0, frameId = 0;
    const smallDevice = innerWidth < 700 || navigator.hardwareConcurrency <= 4;
    let resizePending = false, layoutPending = false, pointerPending = false, pointerX = 0, pointerY = 0;
    const hero = {left:0, right:0, top:0, bottom:0, width:0, height:0};
    let heroOriginX = 0, heroOriginY = 0;
    let previousScrollX = scrollX, previousScrollY = scrollY;
    let nextZoom = 2 + Math.random() * 3;
    const accentCompanions = new Map(), positionedParents = new Map();
    const accentSelector = '.accent-word, .case-side img, .project-card .anu-mark span, .project-card svg';
    function measureContent() {
      const site = document.querySelector('.field-guide');
      const siteRect = site?.getBoundingClientRect();
      if (siteRect) { heroOriginX=siteRect.left+scrollX; heroOriginY=siteRect.top+scrollY; }
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
        hero.flightLeft = Math.max(heroOriginX+25,hero.left-110);
        hero.flightRight = Math.min(heroOriginX+(siteRect?.width||width)-25,hero.right+110);
        hero.flightTop = Math.max(r.top+scrollY+70,hero.top-140);
        hero.flightBottom = Math.min(r.bottom+scrollY-50,hero.bottom+140);
        // Hero layers scroll natively with the document, rather than tracking scroll in JS.
        const layerWidth = siteRect?.width || width, layerHeight = r.bottom + scrollY - heroOriginY + 50;
        const dpr = Math.min(devicePixelRatio || 1, smallDevice ? 1.5 : 2, Math.sqrt(2000000/(layerWidth*layerHeight)));
        for (const layer of [canvas,frontCanvas]) {
          layer.style.height = `${layerHeight}px`;
          const pixelWidth=Math.round(layerWidth*dpr), pixelHeight=Math.round(layerHeight*dpr);
          if (layer.width!==pixelWidth || layer.height!==pixelHeight) {
            layer.width=pixelWidth; layer.height=pixelHeight;
            layer.getContext('2d').setTransform(dpr,0,0,dpr,0,0);
          }
        }
      }
      measureAccentCompanions();
    }
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, lastMove: -Infinity, active: false, touch: false, expiresAt: Infinity };
    const palettes = ['#d8c5e8', '#edc7cf', '#f1c6af', '#e9d7aa', '#bccfe7', '#2f7d5a'];
    const bodyColors = ['#c1a0dc', '#dfa4b3', '#dfa78b', '#d8bd80', '#98b5da', '#286b4e'];
    const butterflies = Array.from({ length: smallDevice ? 5 : 8 }, (_, i) => ({
      shape: 1, travel: 0, checkAt: 0, detourUntil: 0,
      role: 'hero', entranceAt: i*.22+Math.random()*.12, arrived: false,
      front: i % 2 === 0, initialized: false,
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
      direction: i % 2 ? 1 : -1, size: 8 + Math.random() * 4,
      opacity: .85,
      color: palettes[i % 5],
      bodyColor: bodyColors[i % 5],
      heading: 0, fleeUntil: 0, fleeX: 0, fleeY: 0
    }));
    function resize() {
      // CSS uses the stable large viewport, unaffected by the mobile toolbar.
      const nextWidth = innerWidth;
      const nextHeight = innerHeight;
      const dimensionsChanged = nextWidth !== width || nextHeight !== height;
      width = nextWidth; height = nextHeight;
      if (!pointer.active) { pointer.x = width * .64; pointer.y = height * .55; }
      pointer.x = Math.min(width, pointer.x); pointer.y = Math.min(height, pointer.y);
      if (dimensionsChanged) measureContent();
      for (const b of butterflies) if (b.role === 'hero' && !b.initialized) {
        const edge=b.element%3;
        b.x=edge===0?-65:edge===1?width+65:hero.left+Math.random()*hero.width;
        b.y=edge===2?heroOriginY-65:hero.top+Math.random()*hero.height;
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
    function measureAccentCompanions() {
      for (const [element, companion] of accentCompanions) {
        if (!element.isConnected) { companion.canvas.remove(); accentCompanions.delete(element); }
      }
      for (const element of document.querySelectorAll(accentSelector)) {
        const rect = element.getBoundingClientRect();
        if (rect.width < 1 || rect.height < 1) continue;
        let companion = accentCompanions.get(element);
        if (!companion) {
          // Anchor to the element's parent, so browser scrolling carries it natively.
          const parent = element.parentElement;
          if (!parent) continue;
          if (getComputedStyle(parent).position === 'static' && !positionedParents.has(parent)) {
            positionedParents.set(parent,parent.style.position); parent.style.position='relative';
          }
          const localCanvas=document.createElement('canvas');
          localCanvas.setAttribute('aria-hidden','true');
          Object.assign(localCanvas.style,{position:'absolute',pointerEvents:'none',zIndex:'5'});
          parent.appendChild(localCanvas);
          companion={canvas:localCanvas,context:localCanvas.getContext('2d'),parent,
            phase:Math.random()*TAU,rate:.45+Math.random()*.3,flapRate:8+Math.random()*5,
            heading:0,left:0,top:0,bottom:0,width:0,height:0,startledUntil:0,startleCooldown:0,
            x:null,y:null,vx:0,vy:0,targetX:0,targetY:0,nextTarget:0,flapPhase:Math.random()*TAU};
          accentCompanions.set(element,companion);
        }
        const parentRect=companion.parent.getBoundingClientRect(), margin=90;
        companion.width=rect.width+margin*2; companion.height=rect.height+margin*2;
        companion.left=rect.left+scrollX-margin;
        if(companion.x===null) { companion.x=margin+rect.width/2; companion.y=margin-15; }
        companion.top=rect.top+scrollY-margin; companion.bottom=rect.bottom+scrollY+margin;
        const style=companion.canvas.style;
        style.left=`${rect.left-parentRect.left-companion.parent.clientLeft-margin}px`;
        style.top=`${rect.top-parentRect.top-companion.parent.clientTop-margin}px`;
        style.width=`${companion.width}px`; style.height=`${companion.height}px`;
        const dpr=Math.min(devicePixelRatio||1,smallDevice?1:1.5);
        const pixelWidth=Math.round(companion.width*dpr),pixelHeight=Math.round(companion.height*dpr);
        if(companion.canvas.width!==pixelWidth || companion.canvas.height!==pixelHeight) {
          companion.canvas.width=pixelWidth; companion.canvas.height=pixelHeight;
          companion.context?.setTransform(dpr,0,0,dpr,0,0);
        }
      }
    }
    function drawAccentCompanions(now, dt) {
      const sprite=wingSprites.get('#2f7d5a');
      for(const c of accentCompanions.values()) {
        const paint=c.context;
        if(!paint || c.bottom-scrollY<0 || c.top-scrollY>height) continue;
        if(now>c.nextTarget || Math.hypot(c.targetX-c.x,c.targetY-c.y)<18) {
          // Choose a new nearby destination; no repeating orbit or prescribed loop.
          c.targetX=24+Math.random()*Math.max(1,c.width-48);
          c.targetY=24+Math.random()*Math.max(1,c.height-48);
          c.nextTarget=now+1.4+Math.random()*2.8;
        }
        let dx=c.targetX-c.x,dy=c.targetY-c.y,distance=Math.max(1,Math.hypot(dx,dy));
        let desiredX=dx/distance*(28+10*Math.sin(now*.7+c.phase));
        let desiredY=dy/distance*(28+10*Math.sin(now*.7+c.phase));
        let fleeing=now<c.startledUntil;
        if(fleeing) {
          desiredX=Math.cos(c.phase+now*.4)*75;desiredY=Math.sin(c.phase+now*.4)*75;
        }
        if(pointer.active) {
          const px=pointer.x+scrollX-c.left,py=pointer.y+scrollY-c.top;
          dx=c.x-px;dy=c.y-py;distance=Math.hypot(dx,dy);
          if(distance<110) {
            fleeing=true;
            const nx=distance>.01?dx/distance:Math.cos(c.phase);
            const ny=distance>.01?dy/distance:Math.sin(c.phase);
            const urgency=1-distance/110;
            desiredX=nx*(65+95*urgency); desiredY=ny*(65+95*urgency);
            // Slight sideways steering lets it escape along a nearby edge.
            desiredX-=ny*25;desiredY+=nx*25;
            c.nextTarget=now;
          }
        }
        desiredX+=Math.max(0,30-c.x)*7-Math.max(0,c.x-c.width+30)*7;
        desiredY+=Math.max(0,30-c.y)*7-Math.max(0,c.y-c.height+30)*7;
        const blend=1-Math.exp(-(fleeing?6:2.4)*dt);
        c.vx+=(desiredX-c.vx)*blend;c.vy+=(desiredY-c.vy)*blend;
        c.x+=c.vx*dt;c.y+=c.vy*dt;
        const heading=Math.atan2(c.vy,c.vx)+Math.PI/2;
        c.heading+=Math.atan2(Math.sin(heading-c.heading),Math.cos(heading-c.heading))*Math.min(1,dt*6);
        c.flapPhase=(c.flapPhase+dt*c.flapRate*(1+.12*Math.sin(now*.8+c.phase))*(fleeing?1.6:1))%TAU;
        const fold=.46+.48*Math.pow((1+Math.cos(c.flapPhase))/2,.7);
        clearLayer(paint,c.canvas);
        paint.save();paint.translate(c.x,c.y);paint.rotate(c.heading);paint.globalAlpha=.65;
        for(const side of [-1,1]) {
          paint.save();paint.scale(side*fold*5.5,5.5);
          paint.drawImage(sprite,-.1,-2,2.4,3.8);paint.restore();
        }
        paint.fillStyle='#286b4e';paint.beginPath();paint.ellipse(0,.66,.385,2.2,0,0,TAU);paint.fill();
        paint.restore();
      }
    }
    function flightTarget(b, now) {
      const target=b.target;
      if (!b.arrived) {
        target.x=(hero.left+hero.right)/2+Math.cos(b.phase)*hero.width*.16;
        target.y=(hero.top+hero.bottom)/2+Math.sin(b.phase)*hero.height*.18;
        if(Math.hypot(b.x-target.x,b.y-target.y)>55) return target;
        b.arrived=true;
      }
      {
        // Slowly changing excursions leave breathing room around the lettering.
        const roam = .5+.5*Math.sin(now*.19+b.phase);
        const orbitX = (hero.flightRight-hero.flightLeft)*(.24+.23*roam);
        const orbitY = (hero.flightBottom-hero.flightTop)*(.2+.27*(.5+.5*Math.sin(now*.23+b.phase*2)));
        const turn = b.angle+Math.sin(now*.27+b.phase)*.3;
        target.x = (hero.flightLeft+hero.flightRight)/2+Math.cos(turn)*orbitX;
        target.y = (hero.flightTop+hero.flightBottom)/2+Math.sin(turn)*orbitY;

        return target;
      }
    }
    function frame(ms) {
      frameId = 0;
      if (disposed || document.hidden) return;
      // Render at the display cadence; flight and wing rhythms use elapsed seconds.
      const dt = lastTime === null ? 0 : Math.max(0, Math.min((ms-lastTime)/1000,.06));
      lastTime = ms; simulationTime += dt; const now = simulationTime;
      if (resizePending) { resize(); resizePending = false; }
      if (layoutPending) { measureContent(); layoutPending = false; }
      if (scrollPending) {
        if (pointer.touch) { pointer.active=false; pointerPending=false; }
        if(smallDevice && Math.abs(scrollY-previousScrollY)>3) {
          for(const c of accentCompanions.values()) if(now>=c.startleCooldown && c.bottom-scrollY>0 && c.top-scrollY<height) {
            c.startledUntil=now+.4;c.startleCooldown=now+1.8;
          }
        }
        previousScrollX=scrollX; previousScrollY=scrollY;
        scrollPending = false;
      }
      if (pointerPending) { move(); pointerPending = false; }
      if (pointer.touch && now >= pointer.expiresAt) pointer.active = false;
      clearLayer(backCtx,canvas); clearLayer(frontCtx,frontCanvas);
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
        if(now<b.entranceAt) continue;
        if (now < b.zoomUntil && Math.hypot(b.x-b.zoomX, b.y-b.zoomY) < 65) b.zoomUntil = now;
        const zooming = now < b.zoomUntil;
        const heroVisible = hero.flightBottom-scrollY > -60 && hero.flightTop-scrollY < height+60;
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
        const baseCruise = b.arrived ? 78 : Math.min(220,80+targetDistance*.25);
        const cruise = baseCruise + 250 * zoom;
        const avoidance = b.avoidance;
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
        if (b.arrived) {
          desiredX += Math.max(0,hero.flightLeft-b.x)*4-Math.max(0,b.x-hero.flightRight)*4;
          desiredY += Math.max(0,hero.flightTop-b.y)*4-Math.max(0,b.y-hero.flightBottom)*4;
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
        const desiredLimit = (b.arrived?145:230)+250*zoom;
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
        const screenX = b.x-(b.role==='hero'?heroOriginX:0), screenY = b.y-(b.role==='hero'?heroOriginY:0);
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
      drawAccentCompanions(now,dt);
      scheduleFrame();
    }
    function clearLayer(context,layer) {
      context.save(); context.setTransform(1,0,0,1,0,0);
      context.clearRect(0,0,layer.width,layer.height); context.restore();
    }
    function scheduleFrame() {
      if (!disposed && !frameId && !document.hidden) frameId = requestAnimationFrame(frame);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { cancelAnimationFrame(frameId); frameId = 0; }
      else { previousScrollX=scrollX; previousScrollY=scrollY; lastTime = null; scrollPending = true; resizePending = true; scheduleFrame(); }
    }, {signal:controller.signal});
    const observer = new ResizeObserver(() => { layoutPending = true; });
    const content = document.querySelector('.field-guide');
    if (content) observer.observe(content);
    const mutations = new MutationObserver(records => {
      for(const record of records) for(const node of record.addedNodes) {
        if(node.nodeType===1 && (node.matches?.(accentSelector+', .sarvam-case') || node.querySelector?.(accentSelector))) {
          layoutPending=true; return;
        }
      }
    });
    if(content) mutations.observe(content,{childList:true,subtree:true});
    resize(); prepareWings();
    document.fonts.ready.then(() => { if (!disposed) layoutPending = true; });
    scheduleFrame();
    return () => {
      disposed = true; controller.abort(); observer.disconnect(); mutations.disconnect();
      for(const companion of accentCompanions.values()) companion.canvas.remove();
      accentCompanions.clear();
      for(const [parent,position] of positionedParents) if(parent.style.position==='relative') parent.style.position=position;
      positionedParents.clear();
      cancelAnimationFrame(frameId); frameId = 0;
      watercolorTextures.clear(); wingSprites.clear();
      clearLayer(backCtx,canvas); clearLayer(frontCtx,frontCanvas);
    };

}
