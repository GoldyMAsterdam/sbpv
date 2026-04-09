import { getSkyblockSkillIcon, itemIconFallback } from "../fetch/GetIcons";

const CLASSES = ["healer", "mage", "berserk", "archer", "tank"];

const CLASS_ICON_MAP = {
  healer:  "HEALER",
  mage:    "MAGE",
  berserk: "BERSERK",
  archer:  "ARCHER",
  tank:    "TANK",
};

const FALLBACK_ICON = "https://sky.shiiyu.moe/icon/SKULL";

/**
 * Reads the flat API response shape:
 * {
 *   level, experience, progress, current, needed, maxlevel,
 *   healer_level, healer_exp,
 *   mage_level,   mage_exp,
 *   berserk_level, berserk_exp,
 *   archer_level,  archer_exp,
 *   tank_level,    tank_exp,
 * }
 */
function parseClasses(data) {
  return CLASSES.map((cls) => {
    // Some APIs spell it "berserker" — try both
    const level = data[`${cls}_level`] ?? data[`${cls}er_level`] ?? 0;
    const exp   = data[`${cls}_exp`]   ?? data[`${cls}er_exp`]   ?? 0;
    return { key: cls, level, exp };
  });
}

export default function Catacombs({ data }) {
  const mint           = "#84D7C4";
  const roseGold       = "#E5B2A0";
  const darkGreenTrack = "#0F1F1A";

  if (!data) {
    return (
      <div className="p-10 text-white/20 text-center font-black uppercase">
        No Data Provided
      </div>
    );
  }

  // Flat data shape — all fields are top-level
  const catacombsLevel = data.level      ?? 0;
  const catacombsXp    = data.experience ?? 0;
  const progress       = data.progress   ?? 0;
  const current        = data.current    ?? 0;
  const needed         = data.needed     ?? 0;
  const maxLevel       = data.maxlevel   ?? 50;
  const isMaxed        = catacombsLevel >= maxLevel;
  const selectedClass  = (data.selected_class ?? "").toLowerCase();

  const classes = parseClasses(data);

  return (
    <div className="w-full flex flex-col gap-10">

      {/* HEADER */}
      <div className="flex flex-col gap-2 border-b-2 border-white/5 pb-8">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">
          Dungeons Profile
        </p>
        <div className="flex items-center gap-5">
          <h1 className="text-5xl font-black uppercase tracking-tighter text-white">
            Catacombs
          </h1>
          <div className="h-10 w-px bg-white/10" />
          <span
            style={{ color: isMaxed ? roseGold : mint }}
            className="text-4xl font-black tabular-nums"
          >
            {catacombsLevel}
          </span>
        </div>

        {/* Overall XP progress bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest">
            <span className="text-white/20">
              {catacombsXp.toLocaleString()} Total XP
            </span>
            <span style={{ color: isMaxed ? roseGold : "rgba(255,255,255,0.35)" }}>
              {isMaxed
                ? "MAX LEVEL"
                : `${Math.floor(current).toLocaleString()} / ${Math.floor(needed).toLocaleString()} XP`}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ backgroundColor: darkGreenTrack }}>
            <div
              className="h-full transition-all duration-1000"
              style={{
                width: `${Math.min(1, Math.max(0, isMaxed ? 1 : progress)) * 100}%`,
                background: isMaxed ? roseGold : mint,
              }}
            />
          </div>
        </div>
      </div>

      {/* CLASS CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {classes.map(({ key, level: classLevel, exp: classExp }) => {
          const isActive     = selectedClass === key;
          const isClassMaxed = classLevel >= maxLevel;
          const accentColor  = isClassMaxed ? roseGold : mint;
          const iconKey      = CLASS_ICON_MAP[key] ?? key.toUpperCase();

          return (
            <div
              key={key}
              className={`flex flex-col p-6 rounded-2xl border-2 transition-all duration-300 ${
                isActive ? "bg-white/[0.04]" : "bg-black/20"
              }`}
              style={{
                borderColor: isActive ? accentColor : "rgba(255,255,255,0.05)",
              }}
            >
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center bg-black/60 rounded-xl border-b-4 border-r-4 border-black/50 border-t border-l border-white/10 overflow-hidden">
                  <img
                    src={getSkyblockSkillIcon(iconKey)}
                    onError={(e) => {
                      if (typeof itemIconFallback === "function") {
                        itemIconFallback(e);
                      } else {
                        e.currentTarget.src = FALLBACK_ICON;
                      }
                    }}
                    className="w-10 h-10 object-contain"
                    style={{ imageRendering: "pixelated" }}
                    alt={key}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-white/30">{key}</span>
                    {isActive && (
                      <span
                        className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full"
                        style={{
                          color: accentColor,
                          backgroundColor: isClassMaxed
                            ? "rgba(229,178,160,0.12)"
                            : "rgba(132,215,196,0.12)",
                        }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-mono font-black text-white">{classLevel}</span>
                    <span className="text-[10px] font-black text-white/10 uppercase">Level</span>
                  </div>
                  <p className="text-[9px] text-white/20 font-mono mt-0.5">
                    {Math.floor(classExp).toLocaleString()} XP
                  </p>
                </div>
              </div>

              {/* XP label row */}
              <div className="mt-4 flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                <span className="text-white/20">Experience</span>
                <span style={{ color: isClassMaxed ? roseGold : "rgba(255,255,255,0.4)" }}>
                  {isClassMaxed ? "MAX LEVEL" : `${Math.floor(classExp).toLocaleString()} XP`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}