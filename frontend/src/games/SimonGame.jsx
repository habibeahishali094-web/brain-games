import React, { useState, useEffect, useRef } from 'react';

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b']; // red, blue, green, yellow

export default function SimonGame({ onEnd }) {
  const [sequence, setSequence] = useState([]);
  const [playerStep, setPlayerStep] = useState(0);
  const [activeButton, setActiveButton] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const startTimeRef = useRef(null);

  const startGame = () => {
    setSequence([]);
    setPlayerStep(0);
    setGameOver(false);
    setGameStarted(true);
    setIsPlaying(false);
    startTimeRef.current = Date.now();
    nextRound([]);
  };

  const nextRound = (currentSeq) => {
    const nextColor = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, nextColor];
    setSequence(newSeq);
    setPlayerStep(0);
    playSequence(newSeq);
  };

  const playSequence = async (seq) => {
    setIsPlaying(true);
    await new Promise(r => setTimeout(r, 500));
    
    for (let i = 0; i < seq.length; i++) {
      setActiveButton(seq[i]);
      await new Promise(r => setTimeout(r, 500));
      setActiveButton(null);
      await new Promise(r => setTimeout(r, 200));
    }
    
    setIsPlaying(false);
  };

  const handleButtonClick = (index) => {
    if (isPlaying || gameOver || !gameStarted) return;
    
    // Animate click locally
    setActiveButton(index);
    setTimeout(() => setActiveButton(null), 200);

    if (index === sequence[playerStep]) {
      if (playerStep === sequence.length - 1) {
        setIsPlaying(true); // lock inputs
        setTimeout(() => nextRound(sequence), 1000);
      } else {
        setPlayerStep(s => s + 1);
      }
    } else {
      // Wrong! Game Over
      setGameOver(true);
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const score = sequence.length * 100;
      onEnd(score, timeTaken);
    }
  };

  return (
    <div className="game-area">
      <div className="game-header">
        <div className="stat-box">
          <div className="stat-label">Skor / Seviye</div>
          <div className="stat-value">{sequence.length}</div>
        </div>
      </div>
      
      {!gameStarted || gameOver ? (
        <div style={{ textAlign: 'center' }}>
          {gameOver && <h3 style={{ marginBottom: '1rem', color: 'var(--accent-2)' }}>Oyun Bitti!</h3>}
          <button className="btn" onClick={startGame}>
            {gameOver ? 'Tekrar Oyna' : 'Başla'}
          </button>
        </div>
      ) : (
        <div className="simon-grid">
          {COLORS.map((color, i) => (
            <button
              key={i}
              className={`simon-btn ${activeButton === i ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => handleButtonClick(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
