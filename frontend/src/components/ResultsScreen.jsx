import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Radar, Line } from 'react-chartjs-2';
import { Leaf } from 'lucide-react';
import gamesData from '../games.json';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale
);

export default function ResultsScreen({ user, currentResult, gameId, stats, onRestart, onHome }) {
  if (!stats) return <div className="card text-center">Hesaplanıyor...</div>;

  // 1. Calculate Titles based on total score
  const totalScore = stats.reduce((sum, s) => sum + s.score, 0) + (!user ? currentResult.score : 0);
  let title = "Acemi";
  if (totalScore >= 10000) title = "Zihin Ustası";
  else if (totalScore >= 3000) title = "Usta";
  else if (totalScore >= 1000) title = "Gelişen";

  // 2. Prepare Radar Data
  const categories = ["Hafıza", "Hız", "Dikkat", "Mantık"];
  const categoryScores = { "Hafıza": 0, "Hız": 0, "Dikkat": 0, "Mantık": 0 };
  const categoryCounts = { "Hafıza": 0, "Hız": 0, "Dikkat": 0, "Mantık": 0 };

  // If guest, add current score to stats for display
  const displayStats = user ? stats : [{ score: currentResult.score, game_id: gameId, created_at: new Date() }];

  displayStats.forEach(s => {
    const g = gamesData.find(game => game.id === s.game_id);
    if (g && categoryScores[g.category] !== undefined) {
      categoryScores[g.category] += s.score;
      categoryCounts[g.category] += 1;
    }
  });

  const radarData = {
    labels: categories,
    datasets: [
      {
        label: 'Zihin Profili',
        data: categories.map(c => categoryCounts[c] ? (categoryScores[c] / categoryCounts[c]) : 0),
        backgroundColor: 'rgba(139, 92, 246, 0.4)',
        borderColor: 'rgba(139, 92, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
    ],
  };

  const radarOptions = {
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: { color: 'var(--text)', font: { size: 14, family: 'Inter' } },
        ticks: { display: false, min: 0 }
      }
    },
    plugins: {
      legend: { display: false }
    },
    maintainAspectRatio: false
  };

  // 3. Line Chart for progress
  const recentStats = [...displayStats].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).slice(-10);
  
  const lineData = {
    labels: recentStats.map((s, i) => `#${i + 1}`),
    datasets: [
      {
        label: 'Skor Trendi',
        data: recentStats.map(s => s.score),
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'var(--primary)',
        tension: 0.4
      }
    ]
  };

  // 4. Comparison with previous score of the SAME game
  const sameGameStats = displayStats.filter(s => s.game_id === gameId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  let comparisonText = "";
  if (sameGameStats.length >= 2) {
    const current = sameGameStats[0].score;
    const prev = sameGameStats[1].score;
    if (current > prev) {
      const percent = Math.round(((current - prev) / (prev || 1)) * 100);
      comparisonText = `📈 Harika! Önceki skoruna göre %${percent} daha iyisin.`;
    } else if (current < prev) {
      comparisonText = `📉 Biraz yavaşladın. Önceki skorundan ${prev - current} puan geridesin.`;
    } else {
      comparisonText = `⚖️ İstikrarlısın! Önceki skorunla aynı puanı aldın.`;
    }
  } else {
    comparisonText = `🌟 Bu oyundaki ilk skorun!`;
  }

  // 5. Strongest / Weakest
  const avgScores = categories.map(c => ({ cat: c, score: categoryCounts[c] ? categoryScores[c]/categoryCounts[c] : 0 }));
  avgScores.sort((a, b) => b.score - a.score);
  const strongest = avgScores[0];
  const weakest = avgScores[avgScores.length - 1];

  let insightText = "Daha fazla oyun oynayarak zihin profilini oluştur.";
  if (strongest.score > 0) {
    insightText = `Bugün refleksin güçlüydü; en başarılı alanın ${strongest.cat.toUpperCase()}. `;
    if (weakest.score > 0 && weakest.cat !== strongest.cat && weakest.score < strongest.score * 0.8) {
      insightText += `Ancak ${weakest.cat.toLowerCase()} konusunda biraz daha pratiğe ihtiyacın olabilir.`;
    }
  }

  return (
    <div className="results-screen" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'fadeIn 0.5s', position: 'relative' }}>
      
      <div className="falling-leaves">
        {[...Array(12)].map((_, i) => (
          <Leaf key={i} className="leaf" size={32} strokeWidth={1.5} style={{ 
            left: `${Math.random() * 100}%`, 
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`
          }} />
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, rgba(180, 168, 249, 0.1) 0%, rgba(134, 239, 172, 0.1) 100%)', border: '1px solid rgba(180,168,249,0.3)', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Oyun Tamamlandı!</h2>
        <div style={{ fontSize: '5rem', fontWeight: '900', color: 'var(--primary)', textShadow: '0 4px 15px rgba(180,168,249,0.3)', margin: '1rem 0' }}>
          {currentResult.score}
        </div>
        
        <div style={{ display: 'inline-block', padding: '0.5rem 2rem', borderRadius: '2rem', background: 'var(--primary)', color: 'white', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 15px rgba(139,92,246,0.5)', marginBottom: '1rem' }}>
          {title}
        </div>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>{comparisonText}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <h3 style={{ marginBottom: '1rem' }}>Bugünkü Zihin Profili</h3>
          <div style={{ width: '100%', height: '250px', position: 'relative' }}>
            <Radar data={radarData} options={radarOptions} />
          </div>
          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-main)', background: 'rgba(255,255,255,0.4)', padding: '1rem', borderRadius: '0.5rem' }}>
            {insightText}
          </p>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
          <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Son Oyunlar Trendi</h3>
          <div style={{ flex: 1, position: 'relative', minHeight: '200px' }}>
            <Line data={lineData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' } }, x: { grid: { display: false } } } }} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '1rem', position: 'relative', zIndex: 1 }}>
        <button className="btn" onClick={onRestart} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>Tekrar Oyna</button>
        <button className="btn btn-outline" onClick={onHome} style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}>Menüye Dön</button>
      </div>

    </div>
  );
}
