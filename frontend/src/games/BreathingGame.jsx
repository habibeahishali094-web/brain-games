import React, { useState, useEffect, useRef } from 'react';
import { Wind } from 'lucide-react';

export default function BreathingGame({ onEnd }) {
  const [gameState, setGameState] = useState('start');
  const [phase, setPhase] = useState('inhale'); // inhale, hold, exhale, hold
  const [scale, setScale] = useState(1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [isHoldingClick, setIsHoldingClick] = useState(false);
  const [message, setMessage] = useState('');
  const MAX_ROUNDS = 4; // 4 breath cycles
  
  const INHALE_TIME = 4000;
  const EXHALE_TIME = 4000;
  
  const startTimeRef = useRef(null);
  const animationRef = useRef(null);
  const cycleStateRef = useRef('inhale');

  const startRound = () => {
    setGameState('playing');
    setRound(1);
    setScore(0);
    setMessage('Tıklayıp basılı tutun ve nefes alın...');
    cycleStateRef.current = 'inhale';
    setPhase('inhale');
    startTimeRef.current = Date.now();
    animate();
  };

  const animate = () => {
    if (gameState === 'done') return;
    
    const now = Date.now();
    const elapsed = now - startTimeRef.current;
    
    if (cycleStateRef.current === 'inhale') {
      const progress = Math.min(elapsed / INHALE_TIME, 1);
      // easeInOutSine
      const eased = -(Math.cos(Math.PI * progress) - 1) / 2;
      setScale(1 + eased * 1.5); // scales from 1 to 2.5
      
      if (progress >= 1) {
        cycleStateRef.current = 'exhale';
        setPhase('exhale');
        setMessage('Şimdi bırakın ve nefes verin...');
        startTimeRef.current = now;
      }
    } else if (cycleStateRef.current === 'exhale') {
      const progress = Math.min(elapsed / EXHALE_TIME, 1);
      const eased = -(Math.cos(Math.PI * progress) - 1) / 2;
      setScale(2.5 - eased * 1.5); // scales from 2.5 back to 1
      
      if (progress >= 1) {
        setRound(r => {
          if (r >= MAX_ROUNDS) {
            setGameState('done');
            return r;
          }
          cycleStateRef.current = 'inhale';
          setPhase('inhale');
          setMessage('Tekrar tıklayıp basılı tutun...');
          startTimeRef.current = now;
          return r + 1;
        });
      }
    }
    
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (gameState === 'done') {
      cancelAnimationFrame(animationRef.current);
      onEnd(score, MAX_ROUNDS * 8);
    }
  }, [gameState]);

  useEffect(() => {
    return () => cancelAnimationFrame(animationRef.current);
  }, []);

  // Simple scoring mechanism based on click holding timing
  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        if (cycleStateRef.current === 'inhale' && isHoldingClick) {
          setScore(s => s + 5);
        } else if (cycleStateRef.current === 'exhale' && !isHoldingClick) {
          setScore(s => s + 5);
        } else {
          // Penalty for being out of sync
          setScore(s => Math.max(0, s - 2));
        }
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameState, isHoldingClick]);

  if (gameState === 'start') {
    return (
      <div className="game-area" style={{ textAlign: 'center' }}>
        <Wind size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} strokeWidth={1.5} />
        <h3 style={{ marginBottom: '1rem' }}>Nefes Ritmi</h3>
        <p style={{ maxWidth: '400px', marginBottom: '2rem', color: 'var(--text-muted)' }}>
          Daire genişlerken (nefes alırken) farenin tuşuna <b>basılı tutun</b>. Daire daralırken (nefes verirken) tuşu <b>bırakın</b>. Hem senkronize olun hem de rahatlayın.
        </p>
        <button className="btn" onClick={startRound}>Ritme Başla</button>
      </div>
    );
  }

  if (gameState === 'done') {
    return (
      <div className="game-area" style={{ textAlign: 'center' }}>
        <h3>Egzersiz Bitti</h3>
        <p style={{ fontSize: '1.5rem', marginTop: '1rem', color: 'var(--primary)' }}>Senkronizasyon Puanı: {score}</p>
      </div>
    );
  }

  return (
    <div 
      className="game-area" 
      style={{ position: 'relative', minHeight: '500px', userSelect: 'none' }}
      onMouseDown={() => setIsHoldingClick(true)}
      onMouseUp={() => setIsHoldingClick(false)}
      onMouseLeave={() => setIsHoldingClick(false)}
      onTouchStart={() => setIsHoldingClick(true)}
      onTouchEnd={() => setIsHoldingClick(false)}
    >
      <div style={{ position: 'absolute', top: 0, left: '1rem', fontWeight: 'bold' }}>Döngü: {round}/{MAX_ROUNDS}</div>
      <div style={{ position: 'absolute', top: 0, right: '1rem', fontWeight: 'bold' }}>Puan: {score}</div>
      
      <p style={{ position: 'absolute', top: '3rem', fontSize: '1.2rem', color: 'var(--text-card)', opacity: 0.8 }}>
        {message}
      </p>

      <div style={{ 
        width: '100px', height: '100px', 
        borderRadius: '50%', 
        backgroundColor: phase === 'inhale' ? 'var(--accent-2)' : 'var(--accent-3)',
        transform: `scale(${scale})`,
        transition: 'background-color 1s ease',
        boxShadow: '0 0 40px rgba(134, 239, 172, 0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Wind size={24} color="var(--text-main)" style={{ opacity: scale > 1.5 ? 1 : 0, transition: 'opacity 0.5s' }} />
      </div>
      
      <div style={{ position: 'absolute', bottom: '2rem', fontSize: '0.9rem', color: isHoldingClick ? 'var(--primary)' : 'var(--text-muted)' }}>
        {isHoldingClick ? 'Basılı Tutuluyor...' : 'Serbest'}
      </div>
    </div>
  );
}
