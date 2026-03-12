import { useState, useEffect, useRef } from "react";
import * as skinview3d from "skinview3d";
import bgImage from "./assets/dark-skyblock-background.png";
import { getUsernameData } from "./fetch/getuuid";

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [recents, setRecents] = useState(() => {
    const stored = localStorage.getItem("recentUsernames");
    return stored ? JSON.parse(stored) : [];
  });
  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });
  const grayBoxRef = useRef(null);

  const handleGrayScroll = () => {
    const el = grayBoxRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    setScrollProgress(maxScroll > 0 ? scrollTop / maxScroll : 0);
  };

  useEffect(() => {
    const el = grayBoxRef.current;
    if (!el) return;
    const onWheel = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = el;
      const atTop = scrollTop === 0 && e.deltaY < 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight && e.deltaY > 0;
      if (!atTop && !atBottom) e.preventDefault();
      el.scrollTop += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [player]);

  useEffect(() => {
    if (!player || !canvasRef.current) return;

    if (viewerRef.current) {
      viewerRef.current.dispose();
      viewerRef.current = null;
    }

    const viewer = new skinview3d.SkinViewer({
      canvas: canvasRef.current,
      width: 200,
      height: 300,
      skin: `https://mc-heads.net/skin/${player.username}`,
    });

    viewer.autoRotate = false;
    viewer.animation = null;
    viewer.zoom = 0.9;
    viewer.playerObject.rotation.set(0, 0, 0);
    viewerRef.current = viewer;

    const canvas = canvasRef.current;

    const onMouseDown = (e) => {
      dragRef.current.dragging = true;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      viewer.playerObject.rotation.y += dx * 0.01;
      const newX = viewer.playerObject.rotation.x + dy * 0.01;
      viewer.playerObject.rotation.x = Math.max(-0.5, Math.min(0.5, newX));
    };

    const onMouseUp = () => { dragRef.current.dragging = false; };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      viewer.dispose();
    };
  }, [player]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setError("");
    setPlayer(null);
    setScrollProgress(0);
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

  const skinScale = 1 - scrollProgress * 0.3;
  const skinOpacity = 1 - scrollProgress * 1;

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm -z-0" />

      <div className="relative z-10 flex flex-col items-center pt-24 pb-32 gap-4">
        <div className="w-[70%] min-w-[300px] flex flex-col gap-4">

          {/* Search card */}
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

          {/* Player result card */}
          <div className={`relative flex flex-col overflow-hidden ${classes.card} ${player ? "h-[600px]" : "min-h-[300px]"}`}>
            {player ? (
              <>
                {/* Skin Viewer Section */}
                <div
                  className="absolute top-0 left-0 right-0 flex flex-col items-center justify-center py-12"
                  style={{
                    transform: `scale(${skinScale})`,
                    opacity: skinOpacity,
                    transformOrigin: "top center",
                    transition: "transform 0.1s ease, opacity 0.1s ease",
                    zIndex: 0,
                  }}
                >
                  <canvas ref={canvasRef} className="rounded-xl cursor-grab active:cursor-grabbing" />
                </div>

                {/* Gray Box Section */}
                <div
                  ref={grayBoxRef}
                  onScroll={handleGrayScroll}
                  className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-3xl w-full overflow-y-scroll border-t border-white/5"
                  style={{
                    height: `${120 + scrollProgress * 480}px`,
                    zIndex: 10,
                    scrollbarWidth: "none",
                    transition: "height 0.1s ease",
                    boxShadow: "0 -20px 40px rgba(0,0,0,0.6)"
                  }}
                >
                  {/* Sticky Header Section */}
                  <div className="sticky top-0 z-20 bg-[#1a1a1a] px-8 py-6 border-b border-white/5">
                    <div className="flex flex-col gap-1">
                      <h2 className="text-white text-3xl font-bold tracking-tight">{player.username}</h2>
                      <p className="text-white/30 text-sm font-medium uppercase tracking-wider">SkyBlock Statistics</p>
                    </div>
                  </div>

                  {/* Scrollable Stats Content */}
                  <div style={{ height: "1200px" }} className="p-8">
                    <p className="text-white/20 text-sm italic">Stats data loading...</p>
                    {/* Just adding some space to demonstrate the sticky effect */}
                    <div className="mt-8 space-y-4">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5" />
                        ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 px-8 py-12 flex-1">
                <div className="w-16 h-16 rounded-2xl bg-[#7B2FBE]/40 flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#9b3fde]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-xl">Search for a player</p>
                  <p className="text-white/40 text-sm mt-1">Enter a Minecraft IGN to view their Hypixel SkyBlock<br />profile, stats, and equipment.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}