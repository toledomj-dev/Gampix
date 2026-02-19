using Microsoft.AspNetCore.Mvc;
using System.Collections.Concurrent;

var builder = WebApplication.CreateBuilder(args);


// 1. Definir una política de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.AllowAnyOrigin() // En producción, especificar el dominio real
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        });
});

var app = builder.Build();

// 2. Habilitar la política de CORS antes de los endpoints
app.UseCors("AllowReactApp");

// Almacenamiento en memoria (Thread-safe) 
ConcurrentBag<Bet> bets = new ConcurrentBag<Bet>();

// --- Endpoints ---

// POST /bets: Registrar una apuesta [cite: 17, 18]
app.MapPost("/bets", ([FromBody] Bet newBet) =>
{
    // Validación: El stake debe ser mayor a 0 
    if (newBet.Stake <= 0)
    {
        return Results.BadRequest("El stake debe ser mayor a 0.");
    }

    bets.Add(newBet);
    return Results.Ok(new { message = "Apuesta registrada con éxito" });
});

// GET /stats: Obtener estadísticas agregadas [cite: 32, 33]
app.MapGet("/stats", () =>
{
    // Cálculo de RTP por Juego [cite: 31, 47]
    // Fórmula RTP: (Total Ganado / Total Apostado) * 100
    var gameStats = bets
        .GroupBy(b => b.Game)
        .Select(g => new {
            Game = g.Key,
            Rtp = g.Sum(x => x.Stake) > 0
                  ? g.Sum(x => x.WinAmount) / g.Sum(x => x.Stake) * 100
                  : 0
        });

    // Estadísticas por Usuario [cite: 48, 49]
    var userStats = bets
        .GroupBy(b => b.UserId)
        .Select(u => new {
            UserId = u.Key,
            TotalStake = u.Sum(x => x.Stake),
            TotalWin = u.Sum(x => x.WinAmount)
        });

    return Results.Ok(new
    {
        games = gameStats,
        users = userStats
    });
});

app.Run();

// --- Modelos --- [cite: 13, 19]
public record Bet(int UserId, string Game, decimal Stake, decimal WinAmount);