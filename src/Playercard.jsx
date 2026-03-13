import { useEffect, useRef, useState } from "react";
import * as skinview3d from "skinview3d";
import { fetchSkyblockData } from "./fetchSkyblock";
import { getSkyblockSkillIcon, itemIconFallback } from "./fetch/GetIcons";
import cardTexture from "./assets/backgroundcard.png"; // Importing your texture

const card = "bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl";
const CARD_HEIGHT = 750;
const MIN_GRAY = 180;
const EXPAND_SENSITIVITY = 600;

// Add this to your CSS or use style tags:
// .image-pixelated { image-rendering: pixelated; image-rendering: crisp-edges; }

function SkillBar({ skill }) {
  const maxLevel = skill.name === "taming" ? 60 : (skill.maxLevel || 50);
  const isMaxed = skill.level >= maxLevel;
  const isCatacombs = skill.name === "catacombs";
  
  const fillColor = isCatacombs 
    ? "linear-gradient(90deg, #7B2FBE, #9b3fde)" 
    : (isMaxed ? "linear-gradient(90deg, #A855F7, #7B2FBE)" : "linear-gradient(90deg, #4c1d95, #7c3aed)");

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
          {skill.name}
        </span>
        <span className="tabular-nums text-xs font-black text-white">
          {skill.level}<span className="text-white/20 ml-1">/ {maxLevel}</span>
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-black/70 overflow-hidden border border-white/5 shadow-inner">
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

  const canvasRef = useRef(null);
  const viewerRef = useRef(null);
  const dragRef = useRef({ dragging: false, lastX: 0, lastY: 0 });
  const grayBoxRef = useRef(null);
  const expandAccRef = useRef(0);

  const isFullyExpanded = expandProgress >= 1;
  const grayHeight = MIN_GRAY + expandProgress * (CARD_HEIGHT - MIN_GRAY);
  const skinScale = 1 - expandProgress * 0.3;
  const skinOpacity = 1 - expandProgress;

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

  useEffect(() => {
    setExpandProgress(0);
    expandAccRef.current = 0;
    if (grayBoxRef.current) grayBoxRef.current.scrollTop = 0;
  }, [player]);

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

  const allSkills = skyblock ? [
    { name: "catacombs", ...skyblock.catacombs, maxLevel: 50 },
    ...skyblock.skills,
  ] : [];

  return (
    <div className={`relative flex flex-col overflow-hidden ${card}`} style={{ height: player ? `${CARD_HEIGHT}px` : "300px" }}>
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
            <canvas ref={canvasRef} className="cursor-grab active:cursor-grabbing drop-shadow-[0_0_30px_rgba(123,47,190,0.2)]" />
          </div>

          {/* Bottom Panel with Blur and Custom Texture */}
          <div
            ref={grayBoxRef}
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl overflow-hidden border-t border-white/10 shadow-[0_-20px_50px_rgba(0,0,0,0.8)]"
            style={{
              height: `${grayHeight}px`,
              zIndex: 10,
              overflowY: isFullyExpanded ? "auto" : "hidden",
              scrollbarWidth: "none",
              transition: "height 0.1s ease-out",
            }}
          >
            {/* Texture Layer */}
            <div 
              className="absolute inset-0 z-0 bg-cover bg-center"
              style={{ 
                backgroundImage: `url(${cardTexture})`,
                opacity: 0.1, // Adjust this opacity if the texture is too strong
              }}
            />
            {/* Blur/Tint Overlay Layer */}
            <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-xl" />

            {/* Sticky Header */}
            <div className="sticky top-0 z-30 px-10 py-8 flex items-center justify-between border-b border-white/5 bg-gradient-to-b from-black/60 to-transparent">
              <div>
                <h2 className="text-white text-3xl font-black tracking-tighter">{player.username}</h2>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500/80 mt-1">
                  {skyblock?.profileName || "SkyBlock Statistics"}
                </p>
              </div>
            </div>

            {/* Wireframe Layout Section (Z-indexed above blur/texture) */}
            <div className="relative z-20 px-10 pb-10 flex pt-6">
              {sbLoading ? (
                <div className="py-20 flex justify-center w-full"><div className="w-8 h-8 border-4 border-t-purple-600 border-white/10 rounded-full animate-spin" /></div>
              ) : skyblock && (
                <>
                  {/* Left Column: Icons (Wireframe) */}
                  <div className="w-16 flex flex-col items-center gap-6 shrink-0">
                    {allSkills.map((skill) => (
                      <div key={skill.name + '_icon'} className="w-12 h-12 flex items-center justify-center bg-black/40 rounded-xl p-1.5 border border-white/5 shadow-inner">
                        <img 
                          src={getSkyblockSkillIcon(skill.name)} 
                          onError={itemIconFallback}
                          alt={skill.name} 
                          className="w-9 h-9 object-contain image-pixelated" // KEY: Fixed quality issue
                        />
                      </div>
                    ))}
                  </div>

                  {/* Vertical Divider */}
                  <div className="w-px bg-white/5 mx-6 shrink-0" />

                  {/* Right Column: Skill Bars (Wireframe, smaller) */}
                  <div className="flex-1 flex flex-col gap-6 pt-1">
                    {allSkills.map((skill) => (
                      <SkillBar key={skill.name + '_bar'} skill={skill} />
                    ))}
                  </div>
                </>
              )}
              {sbError && <p className="text-red-400 font-bold">{sbError}</p>}
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/20 font-bold uppercase tracking-widest text-center px-4">
           Search for a player to begin
        </div>
      )}
    </div>
  );
}