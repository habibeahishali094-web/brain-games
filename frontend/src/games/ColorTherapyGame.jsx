import React, { useState, useEffect, useRef } from 'react';
import { Palette } from 'lucide-react';

export default function ColorTherapyGame({ onEnd }) {
  const [gameState, setGameState] = useState('start');
  const [targetColor, setTargetColor] = useState({ r: 0, g: 0, b: 0 });
  const [currentColor, setCurrentColor] = useState({ r: 0, g: 0, b: 0 });
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [matchPercentage, setMatchPercentage] = useState(null);
  const animationRef = useRef(null);
  
  const MAX_ROUNDS = 3;

  const generateRandomColor = () => ({
    r: Math.floor(Math.random() * 156) + 100, // Keep colors pastel/bright
    g: Math.floor(Math.random() * 156) + 100,
    b: Math.floor(Math.random() * 156) + 100,
  });

  const startRound = () => {
    setTargetColor(generateRandomColor());
    setCurrentColor({ r: 255, g: 255, b: 255 });
    setMatchPercentage(null);
    setGameState('playing');
    
    // Animation logic
    let startTime = Date.now();
    const duration = 5000; // 5 seconds to transition
    const startC = { r: 255, g: 255, b: 255 };
    // Create a path that passes near the target color
    const endC = {
      r: Math.max(0, targetColor.r + (Math.random() * 100 - 50)),
      g: Math.max(0, targetColor.g + (Math.random() * 100 - 50)),
      b: Math.max(0, targetColor.b + (Math.random() * 100 - 50)),
    };

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Simple linear interpolation
      const r = Math.round(startC.r + (targetColor.r - startC.r) * progress * 1.5);
      const g = Math.round(startC.g + (targetColor.g - startC.g) * progress * 1.5);
      const b = Math.round(startC.b + (targetColor.b - startC.b) * progress * 1.5);

      setCurrentColor({ 
        r: Math.min(255, Math.max(0, r)), 
        g: Math.min(255, Math.max(0, g)), 
        b: Math.min(255, Math.max(0, b)) 
      });

      if (progress < 1 && gameState !== 'result') {
        animationRef.current = requestAnimationFrame(animate);
      } else if (progress >= 1) {
        // Auto end if not clicked
        handleMatch(targetColor, currentColor);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  const handleMatch = (target, current) => {
    cancelAnimationFrame(animationRef.current);
    
    // Calculate distance between RGB
    const dist = Math.sqrt(
      Math.pow(target.r - current.r, 2) + 
      Math.pow(target.g - current.g, 2) + 
      Math.pow(target.b - current.b, 2)
    );
    
    // Max distance is roughly 441 (sqrt(255^2 * 3)), but since we use pastel it's smaller
    const match = Math.max(0, 100 - (dist / 2));
    const roundScore = Math.round(match * 10);
    
    setMatchPercentage(match.toFixed(1));
    setScore(prev => prev + roundScore);
    setGameState('result');
  };

  const handleClick = () => {
    if (gameState === 'playing') {
      handleMatch(targetColor, currentColor);
    }
  };

  const nextRound = () => {
    if (round < MAX_ROUNDS) {
      setRound(r => r + 1);
      startRound();
    } else {
      setGameState('done');
      onEnd(score, MAX_ROUNDS * 5);
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  if (gameState === 'start') {
    return (
      <div className="game-area" style={{ textAlign: 'center' }}>
        <Palette size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} strokeWidth={1.5} />
        <h3 style={{ marginBottom: '1rem' }}>Renk Terapisi</h3>
        <p style={{ maxWidth: '400px', marginBottom: '2rem', color: 'var(--text-muted)' }}>
          Yukarıdaki hedef renge odaklanın. Alttaki renk yavaşça değişecek; hedef renge en çok benzediği anda tıklayın. Sakin olun ve renkleri hissedin.
        </p>
        <button className="btn" onClick={startRound}>Oyuna Başla</button>
      </div>
    );
  }

  if (gameState === 'done') {
    return (
      <div className="game-area" style={{ textAlign: 'center' }}>
        <h3>Terapiniz Tamamlandı</h3>
        <p style={{ fontSize: '1.5rem', marginTop: '1rem', color: 'var(--primary)' }}>Toplam Uyum Puanı: {score}</p>
      </div>
    );
  }

  return (
    <div className="game-area" style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', top: 0, left: '1rem', fontWeight: 'bold' }}>Tur: {round}/{MAX_ROUNDS}</div>
      <div style={{ position: 'absolute', top: 0, right: '1rem', fontWeight: 'bold' }}>Puan: {score}</div>
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hedef Renk</span>
          <div style={{ 
            width: '80px', height: '80px', borderRadius: '50%', 
            backgroundColor: `rgb(${targetColor.r}, ${targetColor.g}, ${targetColor.b})`,
            boxShadow: 'var(--shadow-diffuse)'
          }} />
        </div>

        <div 
          onClick={handleClick}
          style={{ 
            width: '200px', height: '200px', borderRadius: '50%', 
            backgroundColor: `rgb(${currentColor.r}, ${currentColor.g}, ${currentColor.b})`,
            cursor: gameState === 'playing' ? 'pointer' : 'default',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            transition: gameState === 'playing' ? 'none' : 'transform 0.5s',
            transform: gameState === 'result' ? 'scale(1.05)' : 'scale(1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          {gameState === 'result' && (
            <div style={{ background: 'rgba(255,255,255,0.8)', padding: '0.5rem 1rem', borderRadius: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
              % {matchPercentage} Uyum
            </div>
          )}
        </div>

        {gameState === 'result' && (
          <button className="btn" onClick={nextRound} style={{ marginTop: '1rem' }}>
            {round < MAX_ROUNDS ? 'Sıradaki Renk' : 'Sonucu Gör'}
          </button>
        )}
      </div>
    </div>
  );
}
