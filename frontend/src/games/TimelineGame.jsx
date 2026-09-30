import React, { useState, useRef, useEffect } from 'react';

const SCENARIOS = [
  { id: 1, title: 'Bitkinin Büyümesi', sequence: ['🌱 Tohum', '🌿 Filiz', '🪴 Saksı Bitkisi', '🌳 Ağaç'] },
  { id: 2, title: 'Günün Evreleri', sequence: ['🌅 Gündoğumu', '☀️ Öğle Vakti', '🌇 Günbatımı', '🌙 Gece'] },
  { id: 3, title: 'Tavuğun Yaşamı', sequence: ['🥚 Yumurta', '🐣 Çatlayan Yumurta', '🐥 Civciv', '🐔 Tavuk'] },
  { id: 4, title: 'Bina İnşası', sequence: ['📐 Plan', '🧱 Temel', '🏗️ İnşaat', '🏙️ Gökdelen'] },
  { id: 5, title: 'Kardan Adam', sequence: ['❄️ Kar Yağışı', '⛄ Kardan Adam', '💧 Erime', '🌊 Su Birikintisi'] }
];

export default function TimelineGame({ onEnd }) {
  const [currentScenario, setCurrentScenario] = useState(null);
  const [items, setItems] = useState([]);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [gameOver, setGameOver] = useState(false);
  
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const startGame = () => {
    // Select random scenario
    const randomScen = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setCurrentScenario(randomScen);
    
    // Shuffle the sequence
    const shuffled = [...randomScen.sequence].map((text, index) => ({ id: index, text })).sort(() => Math.random() - 0.5);
    setItems(shuffled);
    
    setMoves(0);
    setLevel(1);
    setIsPlaying(true);
    setGameOver(false);
    setStartTime(Date.now());
  };

  const handleDragStart = (e, position) => {
    dragItem.current = position;
  };

  const handleDragEnter = (e, position) => {
    dragOverItem.current = position;
  };

  const handleDragEnd = () => {
    if (dragItem.current !== null && dragOverItem.current !== null && dragItem.current !== dragOverItem.current) {
      const newItems = [...items];
      const draggedItemContent = newItems.splice(dragItem.current, 1)[0];
      newItems.splice(dragOverItem.current, 0, draggedItemContent);
      setItems(newItems);
      setMoves(m => m + 1);
    }
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const checkOrder = () => {
    // Check if current items match original sequence
    const isCorrect = items.every((item, index) => item.text === currentScenario.sequence[index]);
    
    if (isCorrect) {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const score = Math.max(100, 1000 - (timeTaken * 10) - (moves * 20));
      setIsPlaying(false);
      setGameOver(true);
      onEnd(score, timeTaken);
    } else {
      setMoves(m => m + 1);
    }
  };

  if (!isPlaying && !gameOver) {
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
          <div className="stat-label">Hamle</div>
          <div className="stat-value">{moves}</div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Senaryo</div>
          <div className="stat-value" style={{ fontSize: '1rem', marginTop: '0.5rem' }}>{currentScenario?.title}</div>
        </div>
      </div>

      {gameOver ? (
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: 'var(--accent-4)', marginBottom: '1rem' }}>Tebrikler! Doğru Sıralama.</h2>
          <button className="btn" onClick={startGame}>Tekrar Oyna</button>
        </div>
      ) : (
        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p className="text-muted" style={{ textAlign: 'center', marginBottom: '1rem' }}>
            Kartları sürükleyerek olayları doğru zaman sırasına dizin.
          </p>
          {items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={(e) => handleDragEnter(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              style={{
                padding: '1rem',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '0.5rem',
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                userSelect: 'none',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {item.text}
            </div>
          ))}
          
          <button className="btn" onClick={checkOrder} style={{ marginTop: '1rem', width: '100%' }}>
            Sıralamayı Kontrol Et
          </button>
        </div>
      )}
    </div>
  );
}
