import React, { useState, useRef } from 'react';

export default function ReactionGame({ onEnd }) {
  const [state, setState] = useState('waiting'); // waiting | ready | active | early | done
  const [reactionTime, setReactionTime] = useState(null);
  const timeoutRef = useRef(null);
  const startTimeRef = useRef(null);

  const handleClick = () => {
    if (state === 'waiting') {
      startGame();
    } else if (state === 'ready') {
      clearTimeout(timeoutRef.current);
      setState('early');
    } else if (state === 'active') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setState('done');
      
      const score = Math.max(0, 1000 - time);
      onEnd(score, time / 1000);
    } else if (state === 'early' || state === 'done') {
      startGame();
    }
  };

  const startGame = () => {
    setState('ready');
    setReactionTime(null);
    const delay = 1000 + Math.random() * 3000;
    
    timeoutRef.current = setTimeout(() => {
      setState('active');
      startTimeRef.current = Date.now();
    }, delay);
  };

  let bg = 'var(--bg-card)';
  let text = 'Başlamak için tıkla';
  
  if (state === 'ready') {
    bg = 'var(--accent-2)';
    text = 'Yeşili bekle...';
  } else if (state === 'active') {
    bg = 'var(--accent-4)';
    text = 'ŞİMDİ TIKLA!';
  } else if (state === 'early') {
    bg = 'var(--bg-card)';
    text = 'Çok erken! Tekrar dene.';
  } else if (state === 'done') {
    bg = 'var(--primary)';
    text = `${reactionTime} ms! Tekrar oyna.`;
  }

  return (
    <div className="game-area">
      <div 
        className="reaction-box"
        style={{ backgroundColor: bg }}
        onMouseDown={handleClick}
      >
        {text}
      </div>
    </div>
  );
}
