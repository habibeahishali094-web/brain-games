import React, { useState, useEffect, useRef } from 'react';

const EMOJIS = ['🚀', '🧠', '⚡', '🎮', '💡', '🔥', '🌟', '💎'];

export default function MemoryGame({ onEnd }) {
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState([]);
  const [solved, setSolved] = useState([]);
  const [shakeCards, setShakeCards] = useState([]);
  
  // New State for Time & Combo
  const [timeLeft, setTimeLeft] = useState(60);
  const [combo, setCombo] = useState(0);
  const [multiplier, setMultiplier] = useState(1);
  const [score, setScore] = useState(0);
  
  const [playing, setPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  
  const timerRef = useRef(null);

  const initGame = () => {
    const deck = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((e, id) => ({ id, emoji: e }));
      
    setCards(deck);
    setFlipped([]);
    setSolved([]);
    setShakeCards([]);
    
    setTimeLeft(60);
    setCombo(0);
    setMultiplier(1);
    setScore(0);
    
    setPlaying(true);
    setGameOver(false);
  };

  // Timer Effect
  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setPlaying(false);
            setGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing]);

  // Check Game End Condition (Win)
  useEffect(() => {
    if (playing && solved.length > 0 && solved.length === cards.length) {
      clearInterval(timerRef.current);
      setPlaying(false);
      setGameOver(true);
      // Final Score: current score + bonus for remaining time
      const finalScore = score + (timeLeft * 10);
      onEnd(finalScore, 60 - timeLeft); // Send 60-timeLeft as duration, though it's dynamic now
    } else if (gameOver && timeLeft === 0) {
      onEnd(score, 60);
    }
  }, [solved, cards, playing, gameOver, timeLeft, score]);

  const handleCardClick = (index) => {
    if (!playing || flipped.length >= 2 || flipped.includes(index) || solved.includes(index)) return;
    
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const idx1 = newFlipped[0];
      const idx2 = newFlipped[1];
      const match = cards[idx1].emoji === cards[idx2].emoji;
      
      if (match) {
        // Correct Match
        setSolved(s => [...s, idx1, idx2]);
        setFlipped([]);
        
        // Combo & Score
        setCombo(c => c + 1);
        setMultiplier(m => Math.min(m + 1, 3)); // Max x3
        setScore(s => s + (50 * multiplier));
        setTimeLeft(t => t + 3); // Time bonus
        
      } else {
        // Wrong Match
        setShakeCards([idx1, idx2]);
        setCombo(0);
        setMultiplier(1);
        setTimeLeft(t => Math.max(0, t - 2)); // Time penalty
        
        setTimeout(() => {
          setFlipped([]);
          setShakeCards([]);
        }, 800); // Wait a bit to show shake before flipping back
      }
    }
  };

  return (
    <div className="game-area">
      {!playing && !gameOver ? (
        <button className="btn" onClick={initGame} style={{ padding: '1rem 3rem', fontSize: '1.25rem' }}>Başla</button>
      ) : (
        <>
          <div className="game-header">
            <div className="stat-box">
              <div className="stat-label">Süre</div>
              <div className={`stat-value ${timeLeft <= 10 ? 'time-warning' : ''}`}>
                {timeLeft}s
              </div>
            </div>
            
            <div className="stat-box">
              <div className="stat-label">Combo</div>
              <div className={`stat-value ${combo > 1 ? 'combo-text' : ''}`}>
                x{multiplier}
              </div>
            </div>
            
            <div className="stat-box">
              <div className="stat-label">Skor</div>
              <div className="stat-value">{score}</div>
            </div>
          </div>
          
          <div className="memory-grid">
            {cards.map((c, i) => {
              const isFlipped = flipped.includes(i) || solved.includes(i);
              const isSolved = solved.includes(i);
              const isShaking = shakeCards.includes(i);
              
              return (
                <div 
                  key={c.id} 
                  className={`memory-card ${isFlipped ? 'flipped' : ''} ${isShaking ? 'shake' : ''}`}
                  onClick={() => handleCardClick(i)}
                  style={{
                    opacity: isSolved ? 0 : 1, // Hide when solved (Explosion/particle effect alternative for now)
                    pointerEvents: isSolved ? 'none' : 'auto'
                  }}
                >
                  {isFlipped ? c.emoji : '?'}
                </div>
              );
            })}
          </div>
          
          {gameOver && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <h3 style={{ color: 'var(--accent-4)', marginBottom: '1rem' }}>
                Oyun Bitti! Skorun: {score + (timeLeft > 0 ? timeLeft * 10 : 0)}
              </h3>
              <button className="btn" onClick={initGame}>Tekrar Oyna</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
