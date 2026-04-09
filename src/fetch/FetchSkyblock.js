const API_KEY = import.meta.env.VITE_HYPIXEL_API_KEY;

const SKILL_XP_TABLE = [
  0, 50, 175, 375, 675, 1175, 1925, 2925, 4425, 6425, 9925,
  14925, 22425, 32425, 47425, 67425, 97425, 147425, 222425, 322425, 522425,
  822425, 1222425, 1722425, 2322425, 3022425, 3822425, 4722425, 5722425, 6822425, 8022425,
  9322425, 10722425, 12222425, 13822425, 15522425, 17322425, 19222425, 21222425, 23322425, 25522425,
  27822425, 30222425, 32722425, 35322425, 38072425, 40972425, 44072425, 47472425, 51172425, 55172425,
  59472425, 64072425, 68972425, 74172425, 79672425, 85472425, 91572425, 97972425, 104672425, 111672425,
];

const CATA_XP_TABLE = [
  0, 50, 125, 235, 395, 625, 955, 1425, 2095, 3045, 4385,
  6275, 8940, 12700, 17960, 25340, 35640, 50040, 70040, 97640, 135640,
  188140, 259640, 356640, 488640, 668640, 911640, 1239640, 1684640, 2284640, 3084640,
  4149640, 5559640, 7459640, 9959640, 13259640, 17559640, 23159640, 30359640, 39559640, 51559640,
  66559640, 85559640, 109559640, 139559640, 177559640, 225559640, 285559640, 360559640, 453559640, 569559640,
];

function xpToLevel(xp, table, maxLevel) {
  let level = 0;
  for (let i = 1; i < table.length; i++) {
    if (i > maxLevel) break;
    if (xp >= table[i]) level = i;
    else break;
  }
  level = Math.min(level, maxLevel);
  const current = xp - table[level];
  const needed = level < maxLevel ? table[level + 1] - table[level] : null;
  const progress = needed ? Math.min(current / needed, 1) : 1;
  return { level, maxLevel, progress, current, needed };
}

const SKILL_KEYS = {
  farming:      { key: "SKILL_FARMING",      maxLevel: 60 },
  mining:       { key: "SKILL_MINING",       maxLevel: 60 },
  combat:       { key: "SKILL_COMBAT",       maxLevel: 60 },
  enchanting:   { key: "SKILL_ENCHANTING",   maxLevel: 60 },
  foraging:     { key: "SKILL_FORAGING",     maxLevel: 50 },
  fishing:      { key: "SKILL_FISHING",      maxLevel: 50 },
  alchemy:      { key: "SKILL_ALCHEMY",      maxLevel: 50 },
  taming:       { key: "SKILL_TAMING",       maxLevel: 50 },
  carpentry:    { key: "SKILL_CARPENTRY",    maxLevel: 50 },
  runecrafting: { key: "SKILL_RUNECRAFTING", maxLevel: 25 },
};

const CLASS_KEYS = ["healer", "mage", "berserk", "archer", "tank"];

async function hypixelFetch(path, params = {}) {
  const url = new URL(`https://api.hypixel.net/v2${path}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { headers: { "API-Key": API_KEY } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Hypixel API error ${res.status}: ${body}`);
  }
  return res.json();
}

export async function fetchSkyblockData(uuid) {
  const data = await hypixelFetch("/skyblock/profiles", { uuid });
  if (!data.success || !data.profiles?.length) return null;

  const profile =
    data.profiles.find((p) => p.selected) ??
    data.profiles.reduce((a, b) =>
      (b.members?.[uuid]?.last_save ?? 0) > (a.members?.[uuid]?.last_save ?? 0) ? b : a
    );

  const member = profile.members?.[uuid];
  if (!member) return null;

  // ── Skills ───────────────────────────────────────────────────────────────────
  const experience = member.player_data?.experience ?? {};
  const skills = Object.entries(SKILL_KEYS).map(([name, { key, maxLevel }]) => {
    const xp = experience[key] ?? 0;
    return { name, xp, ...xpToLevel(xp, SKILL_XP_TABLE, maxLevel) };
  });

  // ── Catacombs ────────────────────────────────────────────────────────────────
  const dungeons      = member.dungeons ?? {};
  const cataData      = dungeons.dungeon_types?.catacombs ?? {};
  const masterData    = dungeons.dungeon_types?.master_catacombs ?? {};
  const playerClasses = dungeons.player_classes ?? {};

  const cataXP    = cataData.experience ?? 0;
  const cataLevel = xpToLevel(cataXP, CATA_XP_TABLE, 50);

  // Per-class levels — XP lives at dungeons.player_classes.{class}.experience
  const classLevels = {};
  for (const cls of CLASS_KEYS) {
    const clsXP = playerClasses[cls]?.experience ?? 0;
    const { level } = xpToLevel(clsXP, CATA_XP_TABLE, 50);
    classLevels[`${cls}_level`] = level;
    classLevels[`${cls}_exp`]   = clsXP;
  }

  const catacombs = {
    // Level / XP / progress
    experience: cataXP,
    level:      cataLevel.level,
    progress:   cataLevel.progress,
    current:    cataLevel.current,
    needed:     cataLevel.needed,
    maxLevel:   50,

    // Class levels
    ...classLevels,

    // Active class
    selected_class: dungeons.selected_dungeon_class ?? null,

    // Secrets — top-level counter on the dungeons object
    secrets_found: dungeons.secrets ?? 0,

    // Floor completions — tier_completions (NOT times_played)
    // Keys: "0" = entrance, "1"–"7" = floors
    times_completed:             cataData.tier_completions  ?? {},
    master_mode_times_completed: masterData.tier_completions ?? {},
  };

  // ── Slayers ──────────────────────────────────────────────────────────────────
  const slayerData = member.slayer?.slayer_bosses ?? {};
  const slayers = Object.entries(slayerData).map(([name, d]) => ({
    name,
    xp: d.xp ?? 0,
  }));

  return { profileName: profile.cute_name, skills, catacombs, slayers };
}