import { useEffect, useRef, useState } from "react";
import * as skinview3d from "skinview3d";
import { fetchSkyblockData } from "../fetch/FetchSkyblock";
import { getSkyblockSkillIcon, itemIconFallback } from "../fetch/GetIcons";
import cardTexture from "../assets/backgroundcard.png";
import Catacombs from "../skills/Catacombs"; 

const CARD_HEIGHT = 750;
const MIN_GRAY = 180;
const EXPAND_SENSITIVITY = 600;

function SkillBar({ skill }) {
  const maxLevel = skill.name === "taming" ? 60 : (skill.maxLevel || 50);
  const isMaxed = skill.level >= maxLevel;
  
  const fillColor = isMaxed 
    ? "linear-gradient(90deg, #84D7C4, #489987)" 
    : "linear-gradient(90deg, #10362B, #2D6356)";

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#84D7C4]/60">
          {skill.name}
        </span>
        <span className="tabular-nums text-xs font-black text-white">
          {skill.level}<span className="text-[#84D7C4]/20 ml-1">/ {maxLevel}</span>
        </span>
      </div>
      <div className="h-4 w-[40%] rounded-full bg-black/80 overflow-hidden border border-[#84D7C4]/10 shadow-inner">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ 
            width: `${isMaxed ? 100 : (skill.progress * 100 || 0)}%`, 
            backgroundImage: fillColor 
          }}
        />
      </div>
    </div>
  );
}

export default function PlayerCard({ player }) {
  const [expandProgress, setExpandProgress] = useState(0);
  const [skyblock, setSkyblock] = useState(null);
  const [sbLoading, setSbLoading] = useState(false);
  const [sbError, setSbError] = useState("");
  const [currentView, setCurrentView] = useState("main");

  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });
  const grayBoxRef = useRef(null);
  const expandAccRef = useRef(0);

  const isFullyExpanded = expandProgress >= 1;
  const grayHeight = MIN_GRAY + expandProgress * (CARD_HEIGHT - MIN_GRAY);
  const skinScale = 1 - expandProgress * 0.3;
  const skinOpacity = 1 - expandProgress;

  // Reset progress when player changes
  useEffect(() => {
    setExpandProgress(0);
    expandAccRef.current = 0;
    setCurrentView("main");
    if (grayBoxRef.current) grayBoxRef.current.scrollTop = 0;
  }, [player]);

  // Fetch Data
  useEffect(() => {
    if (!player?.uuid) return;
    setSkyblock(null);
    setSbError("");
    setSbLoading(true);
    fetchSkyblockData(player.uuid)
      .then((data) => { 
        setSkyblock(data); 
        if (!data) setSbError("No SkyBlock profiles found."); 
      })
      .catch(() => setSbError("Failed to load SkyBlock data."))
      .finally(() => setSbLoading(false));
  }, [player]);

  // Scroll Logic (from file 1)
  useEffect(() => {
    const el = grayBoxRef.current;
    if (!el) return;
    const onWheel = (e) => {
      if (!isFullyExpanded) {
        e.preventDefault();
        expandAccRef.current = Math.max(0, expandAccRef.current + e.deltaY);
        setExpandProgress(Math.min(1, expandAccRef.current / EXPAND_SENSITIVITY));
      } else if (el.scrollTop === 0 && e.deltaY < 0) {
        e.preventDefault();
        expandAccRef.current = Math.max(0, expandAccRef.current + e.deltaY);
        setExpandProgress(Math.min(1, expandAccRef.current / EXPAND_SENSITIVITY));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isFullyExpanded, player]);

  // Skin Viewer Logic
  useEffect(() => {
    if (!player || !canvasRef.current) return;
    if (viewerRef.current) { viewerRef.current.dispose(); viewerRef.current = null; }
    
    const viewer = new skinview3d.SkinViewer({
      canvas: canvasRef.current,
      width: 220, height: 320,
      skin: `https://mc-heads.net/skin/${player.username}`,
    });
    viewer.autoRotate = false;
    viewer.zoom = 0.85;
    viewerRef.current = viewer;

    const canvas = canvasRef.current;
    const onMouseDown = (e) => { dragRef.current = { dragging: true, lastX: e.clientX, lastY: e.clientY }; };
    const onMouseMove = (e) => {
      if (!dragRef.current.dragging) return;
      const dx = e.clientX - dragRef.current.lastX;
      const dy = e.clientY - dragRef.current.lastY;
      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      viewer.playerObject.rotation.y += dx * 0.01;
      viewer.playerObject.rotation.x = Math.max(-0.5, Math.min(0.5, viewer.playerObject.rotation.x + dy * 0.01));
    };
    const onMouseUp = () => { dragRef.current = { dragging: false }; };

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

  const allSkills = skyblock ? [
    { name: "catacombs", ...skyblock.catacombs, maxLevel: 50 },
    ...(skyblock.skills || []),
  ] : [];

  const renderContent = () => {
    if (currentView === "catacombs") {
      return <Catacombs data={skyblock?.catacombs} />;
    }
    return (
      <div className="flex-1 flex flex-col gap-6 pt-1">
        {allSkills.map((skill) => (
          <SkillBar key={skill.name + '_bar'} skill={skill} />
        ))}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col overflow-hidden bg-black/60 backdrop-blur-md border border-[#84D7C4]/10 rounded-2xl shadow-xl" style={{ height: player ? `${CARD_HEIGHT}px` : "300px" }}>
      {player ? (
        <>
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-center py-12"
            style={{
              transform: `scale(${skinScale})`,
              opacity: skinOpacity,
              transformOrigin: "top center",
              transition: "transform 0.1s ease, opacity 0.1s ease",
              zIndex: 0,
            }}
          >
            <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing drop-shadow-[0_0_30px_rgba(132,215,196,0.2)]" />
          </div>

          <div
            ref={grayBoxRef}
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl border-t border-[#84D7C4]/20 bg-black"
            style={{
              height: `${grayHeight}px`,
              zIndex: 10,
              overflowY: isFullyExpanded ? "auto" : "hidden",
              scrollbarWidth: "none",
              transition: "height 0.1s ease-out",
            }}
          >
            <div className="absolute inset-0 z-0 bg-black" /> 
            <div 
              className="absolute inset-0 z-1 bg-cover bg-center opacity-5"
              style={{ backgroundImage: `url(${cardTexture})` }}
            />

            <div className="sticky top-0 z-30 px-10 py-8 flex items-center justify-between border-b border-[#84D7C4]/10 bg-black">
              <div>
                <h2 className="text-white text-3xl font-black tracking-tighter">{player.username}</h2>
                <button 
                  onClick={() => setCurrentView("main")}
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-[#84D7C4]/80 mt-1 hover:text-white transition-colors"
                >
                  {currentView === "main" ? (skyblock?.profileName || "SkyBlock Statistics") : "← Back to Overview"}
                </button>
              </div>
            </div>

            <div className="relative z-20 px-10 pb-10 flex pt-6 bg-black">
              {sbLoading ? (
                <div className="py-20 flex justify-center w-full"><div className="w-8 h-8 border-4 border-t-[#84D7C4] border-white/10 rounded-full animate-spin" /></div>
              ) : skyblock && (
                <>
                  <div className="w-16 flex flex-col items-center gap-6 shrink-0">
                    {allSkills.map((skill) => (
                      <button 
                        key={skill.name + '_icon'} 
                        onClick={() => setCurrentView(skill.name)}
                        className={`w-12 h-12 flex items-center justify-center rounded-xl p-1.5 border transition-all ${
                          currentView === skill.name 
                            ? 'bg-[#84D7C4]/20 border-[#84D7C4] shadow-[0_0_15px_rgba(132,215,196,0.3)]' 
                            : 'bg-black/40 border-white/5 hover:border-[#84D7C4]/40'
                        }`}
                      >
                        <img 
                          src={getSkyblockSkillIcon(skill.name)} 
                          onError={itemIconFallback}
                          alt={skill.name} 
                          className="w-9 h-9 object-contain image-pixelated"
                        />
                      </button>
                    ))}
                  </div>

                  <div className="w-px bg-[#84D7C4]/10 mx-6 shrink-0" />
                  {renderContent()}
                </>
              )}
              {sbError && <p className="text-red-400 font-bold">{sbError}</p>}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-[#84D7C4]/10 font-bold uppercase tracking-widest text-center px-4">
            Search for a player to begin
        </div>
      )}
    </div>
  );
}