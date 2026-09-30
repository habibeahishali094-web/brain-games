import React, { useState, useEffect, useRef } from 'react';

export default function NumberChainGame({ onEnd }) {
  const [gameState, setGameState] = useState('start'); // start, showNumber, showOp, input, done
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [chain, setChain] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [options, setOptions] = useState([]);
  const [startTime, setStartTime] = useState(null);
  
  const MAX_ROUNDS = 3;
  
  const generateChain = (difficulty) => {
    let startNum = Math.floor(Math.random() * 10) + 1;
    let current = startNum;
    const ops = [];
    const numOps = 2 + difficulty; // 3, 4, 5 ops
    
    for (let i = 0; i < numOps; i++) {
      const type = Math.floor(Math.random() * 3); // 0: +, 1: -, 2: *
      let val;
      if (type === 0) {
        val = Math.floor(Math.random() * 10) + 1;
        current += val;
        ops.push(`+ ${val}`);
      } else if (type === 1) {
        val = Math.floor(Math.random() * 10) + 1;
        current -= val;
        ops.push(`- ${val}`);
      } else {
        val = Math.floor(Math.random() * 3) + 2;
        current *= val;
        ops.push(`× ${val}`);
      }
    }
    
    return { startNum, ops, result: current };
  };

  const generateOptions = (correct) => {
    const opts = new Set([correct]);
    while (opts.size < 4) {
      const diff = Math.floor(Math.random() * 10) - 5;
      if (diff !== 0) opts.add(correct + diff);
    }
    return Array.from(opts).sort(() => Math.random() - 0.5);
  };

  const startRound = () => {
    const newChain = generateChain(round);
    setChain(newChain);
    setCurrentStep(-1); // -1 means show startNum
    setOptions(generateOptions(newChain.result));
    setGameState('showNumber');
  };

  useEffect(() => {
    if (gameState === 'start' && round === 1) {
      // Waiting for user to click start
    } else if (gameState === 'showNumber') {
      const t = setTimeout(() => {
        setGameState('showOp');
        setCurrentStep(0);
      }, 1500);
      return () => clearTimeout(t);
    } else if (gameState === 'showOp') {
      if (currentStep < chain.ops.length) {
        const t = setTimeout(() => {
          setCurrentStep(s => s + 1);
        }, 1500);
        return () => clearTimeout(t);
      } else {
        setGameState('input');
        setStartTime(Date.now());
      }
    }
  }, [gameState, currentStep, chain.ops, round]);

  const handleOptionClick = (opt) => {
    const timeTaken = (Date.now() - startTime) / 1000;
    let points = 0;
    if (opt === chain.result) {
      points = Math.max(10, 100 - Math.floor(timeTaken * 10));
    }
    
    const newScore = score + points;
    setScore(newScore);

    if (round < MAX_ROUNDS) {
      setRound(r => r + 1);
      setGameState('showNumber'); // Next round starts automatically or we could have a brief pause
      const newChain = generateChain(round + 1);
      setChain(newChain);
      setCurrentStep(-1);
      setOptions(generateOptions(newChain.result));
    } else {
      setGameState('done');
      onEnd(newScore, timeTaken + (round * 5)); // rough total time
    }
  };

  if (gameState === 'start') {
    return (
      <div className="game-area" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h3 style={{ marginBottom: '1rem' }}>Sayı Zinciri</h3>
        <p style={{ textAlign: 'center', marginBottom: '2rem', maxWidth: '400px' }}>Ekranda belirecek sayıyı ve ardından gelen işlemleri aklınızda tutun. Sonucu hesaplayıp doğru seçeneği işaretleyin.</p>
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
      
      {gameState === 'showNumber' && (
        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          {chain.startNum}
        </div>
      )}

      {gameState === 'showOp' && currentStep < chain.ops.length && (
        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--accent-4)' }}>
          {chain.ops[currentStep]}
        </div>
      )}

      {gameState === 'input' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3 style={{ marginBottom: '2rem' }}>Sonuç Kaç?</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {options.map((opt, i) => (
              <button 
                key={i} 
                className="btn btn-outline" 
                style={{ fontSize: '1.5rem', padding: '1rem 2rem' }}
                onClick={() => handleOptionClick(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
