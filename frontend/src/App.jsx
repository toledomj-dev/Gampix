/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';

const App = () => {
    // Estado para el formulario
    const [formData, setFormData] = useState({ userId: '', game: '', stake: '', winAmount: '' });
    // Estado para las estadísticas
    const [stats, setStats] = useState({ games: [], users: [] });

    // Función para obtener estadísticas (GET /stats)
    const fetchStats = async () => {
        try {
            const response = await fetch('http://localhost:5280/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error("Error al obtener estadísticas:", error);
        }
    };

    // Carga inicial de datos
    useEffect(() => {
        fetchStats();
    }, []);

    // Manejador del formulario (POST /bets)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5280/bets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: parseInt(formData.userId),
                    game: formData.game,
                    stake: parseFloat(formData.stake),
                    winAmount: parseFloat(formData.winAmount)
                }),
            });

            if (response.ok) {
                alert("Apuesta registrada");
                setFormData({ userId: '', game: '', stake: '', winAmount: '' });
                fetchStats(); // Actualización automática tras registro
            }
        } catch (error) {
            alert("Error al registrar apuesta");
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <h2>Registrar Apuesta</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px' }}>
                <input type="number" placeholder="User ID" value={formData.userId} onChange={e => setFormData({ ...formData, userId: e.target.value })} required />
                <input type="text" placeholder="Juego (e.g. Roulette)" value={formData.game} onChange={e => setFormData({ ...formData, game: e.target.value })} required />
                <input type="number" placeholder="Stake" value={formData.stake} onChange={e => setFormData({ ...formData, stake: e.target.value })} required />
                <input type="number" placeholder="Win Amount" value={formData.winAmount} onChange={e => setFormData({ ...formData, winAmount: e.target.value })} required />
                <button type="submit">Registrar Apuesta</button>
            </form>

            <hr />

            <h2>Estadísticas <button onClick={fetchStats}>Actualizar</button></h2>

            <h3>Juegos (RTP)</h3>
            <table border="1" cellPadding="5">
                <thead>
                    <tr><th>Juego</th><th>RTP (%)</th></tr>
                </thead>
                <tbody>
                    {stats.games.map((g, i) => (
                        <tr key={i}><td>{g.game}</td><td>{g.rtp.toFixed(2)}%</td></tr>
                    ))}
                </tbody>
            </table>

            <h3>Usuarios</h3>
            <table border="1" cellPadding="5">
                <thead>
                    <tr><th>User ID</th><th>Total Stake</th><th>Total Win</th></tr>
                </thead>
                <tbody>
                    {stats.users.map((u, i) => (
                        <tr key={i}><td>{u.userId}</td><td>{u.totalStake}</td><td>{u.totalWin}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default App;