import React, { useState, useEffect } from 'react';

const SYMBOLS = ['🔴', '🔵', '🟢', '🟡', '🟣', '🟠', '🔺', '🟦', '⭐'];

export default function PatternBreakerGame({ onEnd }) {
  const [gameState, setGameState] = useState('start'); // start, play, done
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [pattern, setPattern] = useState([]);
  const [options, setOptions] = useState([]);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [startTime, setStartTime] = useState(null);
  
  const MAX_ROUNDS = 3;

  const generatePattern = (difficulty) => {
    // Select 3 random unique symbols for this round
    const pool = [...SYMBOLS].sort(() => Math.random() - 0.5).slice(0, 3);
    const A = pool[0], B = pool[1], C = pool[2];
    
    let seq = [];
    let next = '';
    
    if (difficulty === 1) {
      // ABAB...
      seq = [A, B, A, B, A];
      next = B;
    } else if (difficulty === 2) {
      // AABB...
      seq = [A, A, B, B, A, A];
      next = B;
    } else {
      // ABCABC...
      seq = [A, B, C, A, B, C, A, B];
      next = C;
    }
    
    return { seq, next, pool };
  };

  const startRound = () => {
    const { seq, next, pool } = generatePattern(round);
    setPattern(seq);
    setCorrectAnswer(next);
    
    // Add one random symbol to options just in case to make it 4 options
    const extra = SYMBOLS.find(s => !pool.includes(s));
    const opts = [...pool, extra].sort(() => Math.random() - 0.5);
    
    setOptions(opts);
    setGameState('play');
    setStartTime(Date.now());
  };

  const handleOptionClick = (opt) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    let points = 0;
    if (opt === correctAnswer) {
      points = Math.max(10, 100 - Math.floor(timeTaken * 15));
    }
    
    const newScore = score + points;
    setScore(newScore);

    if (round < MAX_ROUNDS) {
      setRound(r => r + 1);
      // Brief timeout before next round? Let's just go direct to avoid complexity in states.
      // Wait, we need to generate new pattern with round+1
      const { seq, next, pool } = generatePattern(round + 1);
      setPattern(seq);
      setCorrectAnswer(next);
      const extra = SYMBOLS.find(s => !pool.includes(s));
      setOptions([...pool, extra].sort(() => Math.random() - 0.5));
      setStartTime(Date.now());
    } else {
      setGameState('done');
      onEnd(newScore, timeTaken + (round * 3));
    }
  };

  if (gameState === 'start') {
    return (
      <div className="game-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Örüntü Kırıcı</h3>
        <p style={{ textAlign: 'center', marginBottom: '2rem', maxWidth: '400px' }}>Dizideki mantığı çözün ve soru işaretli yere gelecek şekli seçin.</p>
        <button className="btn" onClick={startRound}>Başla</button>
      </div>
    );
  }

  if (gameState === 'done') {
    return (
      <div className="game-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3>Oyun Bitti!</h3>
        <p style={{ fontSize: '1.5rem', marginTop: '1rem' }}>Skorun: {score}</p>
      </div>
    );
  }

  return (
    <div className="game-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontWeight: 'bold' }}>Round {round}/{MAX_ROUNDS}</div>
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', fontWeight: 'bold' }}>Skor: {score}</div>
      
      <div style={{ display: 'flex', gap: '1rem', fontSize: '3rem', marginBottom: '3rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {pattern.map((item, i) => (
          <span key={i}>{item}</span>
        ))}
        <span>❓</span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {options.map((opt, i) => (
          <button 
            key={i} 
            className="btn btn-outline" 
            style={{ fontSize: '2rem', padding: '1rem' }}
            onClick={() => handleOptionClick(opt)}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
