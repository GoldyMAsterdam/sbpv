import { useState, useEffect, useRef } from "react";
import * as skinview3d from "skinview3d";
import bgImage from "./assets/dark-skyblock-background.png";
import { getUsernameData } from "./fetch/getuuid";
import PlayerCard from "./PlayerCard"; // Ensure this matches your filename

const classes = {
  card: "bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl",
  input: "flex-1 flex items-center gap-3 bg-white/10 border border-white/20 rounded-xl px-5 py-3",
  searchButton: "px-8 py-3 rounded-xl font-semibold text-lg text-white bg-[#7B2FBE] hover:bg-[#9b3fde] disabled:opacity-40 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed whitespace-nowrap",
  recentChip: "flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/30 text-white text-sm hover:bg-white/20 hover:border-white/50 transition-colors duration-150",
  recentLabel: "text-white/50 text-sm flex items-center gap-1 shrink-0",
  icon: "w-5 h-5 text-white/40 shrink-0",
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
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-0" />

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
                  className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-white/30"
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
                        className="w-5 h-5 rounded-sm"
                      />
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Player Result Card - This now renders your PlayerCard.jsx component */}
          <PlayerCard player={player} />

        </div>
      </div>
    </div>
  );
}