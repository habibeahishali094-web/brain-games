import React, { useState, useEffect, useRef } from 'react';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b'];

export default function ShadowCityGame({ onEnd }) {
  const [phase, setPhase] = useState('start'); // start | preview | transition | guess | result | gameover
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [buildings, setBuildings] = useState([]);
  const [changedBuildings, setChangedBuildings] = useState([]);
  const [targetId, setTargetId] = useState(null);
  const [message, setMessage] = useState('');
  
  const startTimeRef = useRef(null);

  const getBuildingCount = (lvl) => {
    if (lvl === 1) return 5;
    if (lvl === 2) return 8;
    return 12;
  };

  const generateCity = (lvl) => {
    const count = getBuildingCount(lvl);
    const newBuildings = [];
    for (let i = 0; i < count; i++) {
      newBuildings.push({
        id: i,
        width: 30 + Math.random() * 30, // 30-60px
        height: 50 + Math.random() * 150, // 50-200px
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        isTriangle: Math.random() > 0.8
      });
    }
    return newBuildings;
  };

  const startGame = () => {
    setLevel(1);
    setLives(3);
    setScore(0);
    startTimeRef.current = Date.now();
    startRound(1, 3);
  };

  const startRound = (currentLevel, currentLives) => {
    const originalCity = generateCity(currentLevel);
    setBuildings(originalCity);
    setPhase('preview');
    setMessage('Şehri İncele...');

    setTimeout(() => {
      setPhase('transition');
      setMessage('Şehir Değişiyor...');
      
      setTimeout(() => {
        // Apply a random change
        const targetIndex = Math.floor(Math.random() * originalCity.length);
        const changeType = Math.random();
        
        const newCity = [...originalCity];
        const targetBuilding = { ...newCity[targetIndex] };
        
        if (changeType < 0.33) {
          // Missing
          targetBuilding.height = 0;
        } else if (changeType < 0.66) {
          // Resized
          targetBuilding.height = targetBuilding.height > 120 ? targetBuilding.height - 50 : targetBuilding.height + 50;
        } else {
          // Color change (Simulating swap or distinct change)
          targetBuilding.color = COLORS.find(c => c !== targetBuilding.color);
        }
        
        newCity[targetIndex] = targetBuilding;
        setChangedBuildings(newCity);
        setTargetId(targetIndex);
        setPhase('guess');
        setMessage('Hangi bina değişti?');
      }, 1500); // 1.5s blur
    }, 3000); // 3s preview
  };

  const handleBuildingClick = (id) => {
    if (phase !== 'guess') return;

    if (id === targetId) {
      const newScore = score + (level * 100);
      setScore(newScore);
      setMessage('Doğru! +Puan');
      setPhase('result');
      
      setTimeout(() => {
        const nextLevel = level < 3 ? level + 1 : 3; // cap at level 3 but keep generating 12 buildings
        setLevel(nextLevel);
        startRound(nextLevel, lives);
      }, 1500);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setPhase('gameover');
        const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
        onEnd(score, timeTaken);
      } else {
        setMessage('Yanlış! Can Kaybettin.');
        setPhase('result');
        setTimeout(() => {
          startRound(level, newLives);
        }, 1500);
      }
    }
  };

  if (phase === 'start') {
    return (
      <div className="game-area">
        <button className="btn" onClick={startGame} style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>Başla</button>
      </div>
    );
  }

  const currentView = phase === 'preview' ? buildings : changedBuildings;
  const isBlurred = phase === 'transition';

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
      </div>

      <div style={{ textAlign: 'center', marginBottom: '2rem', minHeight: '30px' }}>
        <h3 style={{ color: phase === 'result' ? (message.includes('Doğru') ? 'var(--accent-4)' : 'var(--accent-2)') : 'var(--text-main)' }}>
          {message}
        </h3>
      </div>

      {phase === 'gameover' ? (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-2)', marginBottom: '1rem' }}>Oyun Bitti!</h2>
          <button className="btn" onClick={startGame}>Tekrar Oyna</button>
        </div>
      ) : (
        <div 
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: '5px',
            width: '100%',
            height: '250px',
            borderBottom: '2px solid var(--border)',
            paddingBottom: '10px',
            filter: isBlurred ? 'blur(10px)' : 'none',
            transition: 'filter 0.5s ease',
            pointerEvents: phase === 'guess' ? 'auto' : 'none'
          }}
        >
          {currentView.map((b) => (
            <div
              key={b.id}
              onClick={() => handleBuildingClick(b.id)}
              style={{
                width: `${b.width}px`,
                height: `${b.height}px`,
                backgroundColor: b.isTriangle ? 'transparent' : b.color,
                borderBottom: b.isTriangle ? `${b.height}px solid ${b.color}` : 'none',
                borderLeft: b.isTriangle ? `${b.width/2}px solid transparent` : 'none',
                borderRight: b.isTriangle ? `${b.width/2}px solid transparent` : 'none',
                cursor: phase === 'guess' ? 'pointer' : 'default',
                transition: 'all 0.3s ease',
                opacity: b.height === 0 ? 0 : 1
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
