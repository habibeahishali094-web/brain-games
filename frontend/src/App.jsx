import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Brain, LogOut, LayoutDashboard, History, Play } from 'lucide-react';
import gamesData from './games.json';

// Games Components
import MemoryGame from './games/MemoryGame';
import ReactionGame from './games/ReactionGame';
import SimonGame from './games/SimonGame';
import TimelineGame from './games/TimelineGame';
import ShadowCityGame from './games/ShadowCityGame';
import MazeGame from './games/MazeGame';
import NumberChainGame from './games/NumberChainGame';
import PatternBreakerGame from './games/PatternBreakerGame';
import ColorTherapyGame from './games/ColorTherapyGame';
import BreathingGame from './games/BreathingGame';
import ResultsScreen from './components/ResultsScreen';

// --- API Service ---
const API_URL = 'http://localhost:3001/api';

const api = {
  login: async (name) => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    return res.json();
  },
  saveScore: async (data) => {
    const res = await fetch(`${API_URL}/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  getStats: async (userId) => {
    const res = await fetch(`${API_URL}/users/${userId}/stats`);
    return res.json();
  }
};

// --- Components ---

function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <Brain size={28} strokeWidth={2.5} />
        BrainTrain
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/" className="nav-link"><LayoutDashboard size={24} strokeWidth={2} /> Oyunlar</Link>
            <Link to="/profile" className="nav-link"><History size={24} strokeWidth={2} /> Profil</Link>
            <button onClick={onLogout} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
              <LogOut size={20} strokeWidth={2} /> Çıkış
            </button>
          </>
        ) : (
          <span className="text-muted">Giriş Yapın</span>
        )}
      </div>
    </nav>
  );
}

function Login({ onLogin }) {
  const [name, setName] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const user = await api.login(name);
    onLogin(user);
  };
  
  return (
    <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <Brain size={64} strokeWidth={2} color="var(--primary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ marginBottom: '1.5rem' }}>Egzersize Başla</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="text" 
            className="input" 
            placeholder="Kullanıcı Adınız" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button type="submit" className="btn">Giriş Yap</button>
        </form>
      </div>
    </div>
  );
}

function Home() {
  const navigate = useNavigate();
  return (
    <div className="app-container">
      <h1 style={{ marginBottom: '2rem' }}>Oyun Kategorileri</h1>
      <div className="game-grid">
        {gamesData.map(game => {
          const IconComponent = LucideIcons[game.icon] || Brain;
          return (
          <div key={game.id} className="card game-card" onClick={() => navigate(`/game/${game.id}`)}>
            <div className="game-icon-wrapper" style={{ background: `${game.color}20`, color: game.color }}>
              <IconComponent size={32} strokeWidth={2} />
            </div>
            <h3 className="game-title">{game.title}</h3>
            <p className="game-desc">{game.description}</p>
            <div style={{ marginTop: '1rem', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Oyna <Play size={20} strokeWidth={2} />
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}

function Profile({ user }) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      api.getStats(user.id).then(data => {
        setStats(data);
        setLoading(false);
      });
    }
  }, [user]);

  if (loading) return <div className="app-container">Yükleniyor...</div>;

  return (
    <div className="app-container">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2>{user.name} Profil & İlerleme</h2>
      </div>
      
      <div className="card">
        <h3>Son Oynanan Oyunlar</h3>
        {stats.length === 0 ? (
          <p className="text-muted" style={{ marginTop: '1rem' }}>Henüz oyun oynamadınız.</p>
        ) : (
          <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {stats.map(s => {
              const game = gamesData.find(g => g.id === s.game_id);
              return (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.5rem' }}>
                  <div>
                    <strong>{game?.title || s.game_id}</strong>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(s.created_at).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Skor: {s.score}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Süre: {s.duration}s</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Game Wrapper
function GameRoute({ user }) {
  const navigate = useNavigate();
  const id = window.location.pathname.split('/').pop();
  const gameInfo = gamesData.find(g => g.id === id);
  const [gameResult, setGameResult] = useState(null);
  const [stats, setStats] = useState(null);
  const [key, setKey] = useState(0);
  
  const handleGameEnd = async (score, duration) => {
    if (user) {
      await api.saveScore({ user_id: user.id, game_id: id, score, duration });
      const newStats = await api.getStats(user.id);
      setStats(newStats);
    }
    setGameResult({ score, duration });
  };

  const handleRestart = () => {
    setGameResult(null);
    setKey(k => k + 1);
  };

  if (!gameInfo) return <div>Oyun bulunamadı.</div>;

  const GameComponent = {
    'memory': MemoryGame,
    'reaction': ReactionGame,
    'simon': SimonGame,
    'timeline': TimelineGame,
    'shadowcity': ShadowCityGame,
    'maze': MazeGame,
    'numberchain': NumberChainGame,
    'patternbreaker': PatternBreakerGame,
    'colortherapy': ColorTherapyGame,
    'breathing': BreathingGame
  }[id];

  if (gameResult) {
    return (
      <div className="app-container">
        <ResultsScreen 
          user={user} 
          currentResult={gameResult} 
          gameId={id} 
          stats={stats} 
          onRestart={handleRestart} 
          onHome={() => navigate('/')} 
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      <button className="btn btn-outline" style={{ marginBottom: '1rem' }} onClick={() => navigate('/')}>
        &larr; Geri Dön
      </button>
      <div className="card">
        <h2>{gameInfo.title}</h2>
        <p className="text-muted">{gameInfo.description}</p>
        <GameComponent key={key} onEnd={handleGameEnd} />
      </div>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const saved = localStorage.getItem('brain_user');
    if (saved) setUser(JSON.parse(saved));
  }, []);
  
  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('brain_user', JSON.stringify(u));
  };
  
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('brain_user');
  };

  return (
    <Router>
      <Navbar user={user} onLogout={handleLogout} />
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/game/:id" element={<GameRoute user={user} />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
