import { useState, useEffect, useRef } from "react";
import * as skinview3d from "skinview3d";
import bgImage from "./assets/dark-skyblock-background.png";
import { getUsernameData } from "./fetch/getuuid";
import PlayerCard from "./components/Playercard";

const classes = {
  card: "bg-black/60 backdrop-blur-md border border-[#84D7C4]/20 rounded-2xl shadow-xl", // Subtle mint border
  input: "flex-1 flex items-center gap-3 bg-black/40 border border-[#84D7C4]/30 rounded-xl px-5 py-3 focus-within:border-[#84D7C4]/60 transition-all",
  searchButton: "px-8 py-3 rounded-xl font-semibold text-lg text-black bg-[#84D7C4] hover:bg-[#A5E8D9] disabled:opacity-40 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap", // Mint button
  recentChip: "flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-[#84D7C4]/20 text-white/80 text-sm hover:bg-[#84D7C4]/10 hover:border-[#84D7C4]/50 transition-colors duration-150",
  recentLabel: "text-[#84D7C4]/50 text-sm flex items-center gap-1 shrink-0",
  icon: "w-5 h-5 text-[#84D7C4]/40 shrink-0",
};

export default function Home() {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState(null);
  const [recents, setRecents] = useState(() => {
    const stored = localStorage.getItem("recentUsernames");
    return stored ? JSON.parse(stored) : [];
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setError("");
    setLoading(true);
    
    const result = await getUsernameData(trimmed);
    setLoading(false);
    
    if (!result.valid) {
      setError("No profile found for that username.");
      return;
    }
    
    const updated = [result.username, ...recents.filter(r => r !== result.username)].slice(0, 5);
    setRecents(updated);
    localStorage.setItem("recentUsernames", JSON.stringify(updated));
    setPlayer(result);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat fixed inset-0 overflow-y-auto"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm -z-0" /> {/* Darker overlay for better contrast */}

      <div className="relative z-10 flex flex-col items-center pt-24 pb-32 gap-4">
        <div className="w-[70%] min-w-[300px] flex flex-col gap-4">

          {/* Search Card */}
          <div className={`flex flex-col gap-4 px-8 py-6 ${classes.card}`}>
            <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full">
              <div className={classes.input}>
                <svg className={classes.icon} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setError(""); }}
                  placeholder="Enter Minecraft IGN..."
                  className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-[#84D7C4]/20"
                />
              </div>
              <button
                type="submit"
                disabled={!username.trim() || loading}
                className={classes.searchButton}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </form>

            {error && <p className="text-red-400 text-sm font-medium">{error}</p>}

            {recents.length > 0 && (
              <div className="flex items-center gap-3">
                <span className={classes.recentLabel}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                  Recent:
                </span>
                <div className="flex flex-wrap gap-2">
                  {recents.map((name) => (
                    <button
                      key={name}
                      onClick={() => setUsername(name)}
                      className={classes.recentChip}
                    >
                      <img
                        src={`https://mc-heads.net/avatar/${name}/16`}
                        alt={name}
                        className="w-5 h-5 rounded-sm grayscale hover:grayscale-0 transition-all"
                      />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <PlayerCard player={player} />

        </div>
      </div>
    </div>
  );
}