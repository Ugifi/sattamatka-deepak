import React, { useState, useEffect } from 'react';

export default function ChartPage({ game, apiCall }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!game?.id) return;
    const fetchChart = async () => {
      try {
        console.log('Fetching chart for Game ID:', game.id);
        const res = await apiCall(`/api/games/${game.id}/chart?days=60`);
        console.log('Chart API Response:', res); // <-- YE LINE ADD KI HAI
        
        if (res.success) {
          setChartData(res.data);
        } else {
          console.error('API Error:', res.message);
        }
      } catch (err) {
        console.error('Chart fetch network error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchChart();
  }, [game, apiCall]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#021a14', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#00ffd5', fontWeight: 700 }}>
        Loading Chart...
      </div>
    );
  }

  return (
    <div style={{ background: '#021a14', minHeight: '100vh', paddingBottom: 20, fontFamily: "'Poppins', sans-serif" }}>
      <style>{`
        .chart-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .chart-table th { background: #063d35; color: #00ffd5; padding: 10px 5px; text-align: center; font-weight: 800; border: 1px solid rgba(0,255,213,0.2); font-size: 11px; letter-spacing: 1px; }
        .chart-table td { padding: 10px 5px; text-align: center; border: 1px solid rgba(0,255,213,0.1); color: #fff; font-weight: 600; }
        .chart-table tr:nth-child(even) { background: rgba(0,255,213,0.03); }
        .jodi-cell { color: #FFD700; font-weight: 900; font-size: 16px; background: rgba(255,215,0,0.05); letter-spacing: 2px; }
        .open-cell { color: #00e676; }
        .close-cell { color: #ff5252; }
      `}</style>

      <div style={{ background: 'linear-gradient(135deg, #021a14, #063d35)', padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(0,255,213,0.2)' }}>
        <div style={{ fontSize: 10, color: '#00ffd5', fontWeight: 800, letterSpacing: 2, marginBottom: 4 }}>📊 GAME CHART</div>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: 1 }}>{game?.name || 'GAME'}</div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Last 60 Days Results</div>
      </div>

      {chartData.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 60, fontSize: 15 }}>
          Abhi is game ka koi chart data available nahi hai.
        </div>
      ) : (
        <div style={{ padding: '12px', overflowX: 'auto' }}>
          <table className="chart-table">
            <thead>
              <tr>
                <th>DATE</th>
                <th>DAY</th>
                <th>OPEN</th>
                <th>JODI</th>
                <th>CLOSE</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' })}
                  </td>
                  <td style={{ fontSize: 11, color: '#00ffd5' }}>{item.day}</td>
                  <td className="open-cell">{item.open}</td>
                  <td className="jodi-cell">{item.jodi}</td>
                  <td className="close-cell">{item.close}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}