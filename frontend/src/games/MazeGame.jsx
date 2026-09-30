import React, { useRef, useEffect, useState } from 'react';

// 0: Dot, 1: Wall, 2: Empty
const LEVELS = [
  { // Level 1 (8x8)
    cols: 8, rows: 8,
    map: [
      1,1,1,1,1,1,1,1,
      1,0,0,0,1,0,0,1,
      1,0,1,0,1,0,1,1,
      1,0,1,0,0,0,0,1,
      1,0,1,1,1,1,0,1,
      1,0,0,0,0,1,0,1,
      1,1,1,1,0,0,0,1,
      1,1,1,1,1,1,1,1,
    ],
    time: 30, enemies: 1, speed: 2
  },
  { // Level 2 (10x10)
    cols: 10, rows: 10,
    map: [
      1,1,1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,0,0,1,
      1,0,1,1,1,0,1,1,0,1,
      1,0,1,0,0,0,0,1,0,1,
      1,0,1,0,1,1,0,1,0,1,
      1,0,0,0,1,1,0,0,0,1,
      1,0,1,0,0,0,0,1,0,1,
      1,0,1,1,1,0,1,1,0,1,
      1,0,0,0,0,0,0,0,0,1,
      1,1,1,1,1,1,1,1,1,1,
    ],
    time: 40, enemies: 2, speed: 2.5
  },
  { // Level 3 (12x12)
    cols: 12, rows: 12,
    map: [
      1,1,1,1,1,1,1,1,1,1,1,1,
      1,0,0,0,0,0,0,0,0,0,0,1,
      1,0,1,1,1,1,0,1,1,1,0,1,
      1,0,1,0,0,0,0,0,0,1,0,1,
      1,0,1,0,1,1,1,1,0,1,0,1,
      1,0,0,0,1,0,0,1,0,0,0,1,
      1,0,1,0,1,0,0,1,0,1,0,1,
      1,0,1,0,1,1,1,1,0,1,0,1,
      1,0,1,0,0,0,0,0,0,1,0,1,
      1,0,1,1,1,1,0,1,1,1,0,1,
      1,0,0,0,0,0,0,0,0,0,0,1,
      1,1,1,1,1,1,1,1,1,1,1,1,
    ],
    time: 50, enemies: 2, speed: 3
  }
];

export default function MazeGame({ onEnd }) {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('start'); // start, playing, gameover, win
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const stateRef = useRef({
    map: [],
    dots: 0,
    player: { x: 0, y: 0, vx: 0, vy: 0, nextVx: 0, nextVy: 0, size: 10 },
    enemies: [],
    tileSize: 30,
    powerModeTime: 0, // > 0 means player is empowered
    keys: {},
    levelData: null,
    isShaking: false
  });

  const animRef = useRef();
  const timerRef = useRef();

  // Load level
  const loadLevel = (lvlIndex) => {
    const data = LEVELS[lvlIndex - 1] || LEVELS[LEVELS.length - 1]; // fallback to last
    const s = stateRef.current;
    s.levelData = data;
    s.map = [...data.map];
    
    // Calculate dots and plant power-ups
    s.dots = 0;
    const powerUpIndices = [];
    s.map.forEach((tile, i) => {
      if (tile === 0) s.dots++;
    });
    
    // Make 2 random dots power-ups (represented by 3)
    let planted = 0;
    while(planted < 2 && s.dots > 2) {
      const r = Math.floor(Math.random() * s.map.length);
      if (s.map[r] === 0 && r > 20) { // avoid start area
        s.map[r] = 3;
        planted++;
      }
    }

    s.tileSize = 400 / data.cols;
    
    // Player start pos (grid 1,1)
    s.player.x = 1 * s.tileSize + s.tileSize/2;
    s.player.y = 1 * s.tileSize + s.tileSize/2;
    s.player.vx = 0; s.player.vy = 0; s.player.nextVx = 0; s.player.nextVy = 0;
    s.player.size = s.tileSize * 0.35;
    
    // Enemies
    s.enemies = [];
    for(let i=0; i<data.enemies; i++) {
      // Spawn near bottom right
      let ex = data.cols - 2 - i;
      let ey = data.rows - 2;
      s.enemies.push({
        x: ex * s.tileSize + s.tileSize/2,
        y: ey * s.tileSize + s.tileSize/2,
        vx: 0, vy: 0,
        speed: data.speed,
        size: s.tileSize * 0.35,
        color: '#ef4444' // red
      });
    }
    
    s.powerModeTime = 0;
    setTimeLeft(data.time);
  };

  const startGame = () => {
    setLevel(1);
    setLives(3);
    setScore(0);
    loadLevel(1);
    setGameState('playing');
  };

  // Input handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      const s = stateRef.current;
      s.keys[e.key] = true;
      if(e.key === 'ArrowUp' || e.key === 'w') { s.player.nextVx = 0; s.player.nextVy = -1; }
      if(e.key === 'ArrowDown' || e.key === 's') { s.player.nextVx = 0; s.player.nextVy = 1; }
      if(e.key === 'ArrowLeft' || e.key === 'a') { s.player.nextVx = -1; s.player.nextVy = 0; }
      if(e.key === 'ArrowRight' || e.key === 'd') { s.player.nextVx = 1; s.player.nextVy = 0; }
    };
    const handleKeyUp = (e) => {
      stateRef.current.keys[e.key] = false;
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Timer interval
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            handleLifeLost(); // Timeout equals life lost
            return 0;
          }
          return t - 1;
        });
        
        // Power mode tick
        if(stateRef.current.powerModeTime > 0) {
          stateRef.current.powerModeTime -= 1;
        }
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameState]);

  const handleLifeLost = () => {
    setLives(l => {
      const newLives = l - 1;
      if (newLives <= 0) {
        setGameState('gameover');
      } else {
        // Reset positions
        const s = stateRef.current;
        s.player.x = 1 * s.tileSize + s.tileSize/2;
        s.player.y = 1 * s.tileSize + s.tileSize/2;
        s.isShaking = true;
        setTimeout(() => s.isShaking = false, 300);
        // Reset timer to full for simplicity
        setTimeLeft(s.levelData.time);
      }
      return newLives;
    });
  };

  // Game Loop
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    let lastTime = performance.now();
    
    const getTile = (x, y) => {
      const s = stateRef.current;
      const c = Math.floor(x / s.tileSize);
      const r = Math.floor(y / s.tileSize);
      if (c<0 || c>=s.levelData.cols || r<0 || r>=s.levelData.rows) return 1; // wall
      return s.map[r * s.levelData.cols + c];
    };
    
    const setTile = (x, y, val) => {
      const s = stateRef.current;
      const c = Math.floor(x / s.tileSize);
      const r = Math.floor(y / s.tileSize);
      if (c>=0 && c<s.levelData.cols && r>=0 && r<s.levelData.rows) {
        s.map[r * s.levelData.cols + c] = val;
      }
    };

    const loop = (time) => {
      const s = stateRef.current;
      
      // Update logic
      // 1. Move Player
      const pSpeed = 3;
      
      // Try next direction if centered
      const centerDistX = Math.abs((s.player.x % s.tileSize) - s.tileSize/2);
      const centerDistY = Math.abs((s.player.y % s.tileSize) - s.tileSize/2);
      const isCentered = centerDistX < pSpeed && centerDistY < pSpeed;
      
      if (isCentered) {
        // Snap to center
        if (s.player.nextVx !== 0 || s.player.nextVy !== 0) {
          const nextTileX = s.player.x + s.player.nextVx * s.tileSize;
          const nextTileY = s.player.y + s.player.nextVy * s.tileSize;
          if (getTile(nextTileX, nextTileY) !== 1) { // not a wall
            s.player.vx = s.player.nextVx;
            s.player.vy = s.player.nextVy;
            // Snap to center for smooth turning
            s.player.x = Math.floor(s.player.x / s.tileSize) * s.tileSize + s.tileSize/2;
            s.player.y = Math.floor(s.player.y / s.tileSize) * s.tileSize + s.tileSize/2;
          }
        }
        
        // Check current direction for wall
        const currTileX = s.player.x + s.player.vx * s.tileSize;
        const currTileY = s.player.y + s.player.vy * s.tileSize;
        if (getTile(currTileX, currTileY) === 1) {
          s.player.vx = 0; s.player.vy = 0;
        }
      }
      
      s.player.x += s.player.vx * pSpeed;
      s.player.y += s.player.vy * pSpeed;

      // 2. Collection
      const currentTile = getTile(s.player.x, s.player.y);
      if (currentTile === 0) {
        setTile(s.player.x, s.player.y, 2); // set to empty
        s.dots--;
        setScore(sc => sc + 10);
      } else if (currentTile === 3) {
        setTile(s.player.x, s.player.y, 2);
        s.dots--;
        s.powerModeTime = 5; // 5 seconds
        setScore(sc => sc + 50);
      }
      
      // 3. Move Enemies
      s.enemies.forEach(e => {
        const eDistX = Math.abs((e.x % s.tileSize) - s.tileSize/2);
        const eDistY = Math.abs((e.y % s.tileSize) - s.tileSize/2);
        const eCentered = eDistX < e.speed && eDistY < e.speed;
        
        if (eCentered || (e.vx===0 && e.vy===0)) {
          // Pick a random valid direction
          const dirs = [
            {vx: 0, vy: -1}, {vx: 0, vy: 1}, {vx: -1, vy: 0}, {vx: 1, vy: 0}
          ];
          const validDirs = dirs.filter(d => {
            // don't reverse unless dead end
            if (d.vx === -e.vx && d.vy === -e.vy && (e.vx!==0 || e.vy!==0)) return false;
            return getTile(e.x + d.vx * s.tileSize, e.y + d.vy * s.tileSize) !== 1;
          });
          
          if (validDirs.length > 0) {
            const chosen = validDirs[Math.floor(Math.random() * validDirs.length)];
            e.vx = chosen.vx;
            e.vy = chosen.vy;
            e.x = Math.floor(e.x / s.tileSize) * s.tileSize + s.tileSize/2;
            e.y = Math.floor(e.y / s.tileSize) * s.tileSize + s.tileSize/2;
          } else {
            // dead end, reverse
            e.vx *= -1; e.vy *= -1;
          }
        }
        
        e.x += e.vx * e.speed;
        e.y += e.vy * e.speed;
        
        // Collision with player
        const dist = Math.hypot(e.x - s.player.x, e.y - s.player.y);
        if (dist < s.tileSize * 0.7) {
          if (s.powerModeTime > 0) {
            // Eat enemy
            e.x = (s.levelData.cols - 2) * s.tileSize + s.tileSize/2;
            e.y = (s.levelData.rows - 2) * s.tileSize + s.tileSize/2;
            setScore(sc => sc + 200);
          } else {
            handleLifeLost();
          }
        }
      });
      
      // Check Win Level
      if (s.dots <= 0) {
        setScore(sc => sc + (timeLeft * 10) + (level * 100));
        setLevel(l => {
          const next = l + 1;
          loadLevel(next);
          return next;
        });
        return; // wait for next frame
      }
      
      // Rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (s.isShaking) {
        ctx.save();
        ctx.translate(Math.random()*10 - 5, Math.random()*10 - 5);
      }
      
      // Draw Map
      for(let r=0; r<s.levelData.rows; r++) {
        for(let c=0; c<s.levelData.cols; c++) {
          const val = s.map[r*s.levelData.cols + c];
          const tx = c * s.tileSize;
          const ty = r * s.tileSize;
          
          if (val === 1) { // Wall
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(tx, ty, s.tileSize, s.tileSize);
            ctx.strokeStyle = '#334155';
            ctx.strokeRect(tx, ty, s.tileSize, s.tileSize);
          } else if (val === 0) { // Dot
            ctx.fillStyle = '#fde047';
            ctx.beginPath();
            ctx.arc(tx + s.tileSize/2, ty + s.tileSize/2, s.tileSize*0.1, 0, Math.PI*2);
            ctx.fill();
          } else if (val === 3) { // Power-up
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(tx + s.tileSize/2, ty + s.tileSize/2, s.tileSize*0.25, 0, Math.PI*2);
            ctx.fill();
            // Glow effect
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#10b981';
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }
      
      // Draw Player
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(s.player.x, s.player.y, s.player.size, 0, Math.PI*2);
      ctx.fill();
      
      if (s.powerModeTime > 0) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#eab308';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Draw Enemies
      s.enemies.forEach(e => {
        ctx.fillStyle = s.powerModeTime > 0 ? '#3b82f6' : e.color; // turn blue if vulnerable
        ctx.beginPath();
        // Pulse effect
        const pulse = s.powerModeTime > 0 ? 0 : Math.sin(time / 100) * 2;
        ctx.arc(e.x, e.y, e.size + pulse, 0, Math.PI*2);
        ctx.fill();
      });

      if (s.isShaking) ctx.restore();

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, [gameState, level, timeLeft]);

  // Handle Game Over
  useEffect(() => {
    if (gameState === 'gameover') {
      onEnd(score, 0); // Need to calculate total duration in future if tracking strictly
    }
  }, [gameState]);

  if (gameState === 'start') {
    return (
      <div className="game-area">
        <button className="btn" onClick={startGame} style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>Başla</button>
      </div>
    );
  }

  return (
    <div className="game-area">
      <div className="game-header">
        <div className="stat-box">
          <div className="stat-label">Skor</div>
          <div className="stat-value">{score}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Can</div>
          <div className="stat-value" style={{ color: 'var(--accent-2)' }}>{'❤️'.repeat(lives)}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Seviye</div>
          <div className="stat-value">{level}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Süre</div>
          <div className={`stat-value ${timeLeft <= 10 ? 'time-warning' : ''}`}>{timeLeft}s</div>
        </div>
      </div>
      
      {gameState === 'gameover' ? (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-2)', marginBottom: '1rem' }}>Oyun Bitti!</h2>
          <button className="btn" onClick={startGame}>Tekrar Oyna</button>
        </div>
      ) : (
        <div style={{ position: 'relative', border: '2px solid var(--border)', borderRadius: '0.5rem', overflow: 'hidden' }}>
          <canvas 
            ref={canvasRef} 
            width={400} 
            height={400} 
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.3)' }}
          />
        </div>
      )}
      <p className="text-muted" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>Ok tuşları veya W,A,S,D ile hareket et.</p>
    </div>
  );
}
