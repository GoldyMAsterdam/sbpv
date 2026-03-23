// ============================================================
//  Hypixel SkyBlock — Skill XP Tables
//  XP values = total XP required to REACH that level
// ============================================================

// ----------------------------------------------------------
//  STANDARD SKILLS (max level 50)
//  Applies to: Foraging, Fishing, Alchemy, Carpentry, Taming
// ----------------------------------------------------------
export const STANDARD_SKILL_XP = {
   1:        50,
   2:       125,
   3:       200,
   4:       300,
   5:       500,
   6:       750,
   7:     1_000,
   8:     1_500,
   9:     2_000,
  10:     3_500,
  11:     5_000,
  12:     7_500,
  13:    10_000,
  14:    15_000,
  15:    20_000,
  16:    30_000,
  17:    50_000,
  18:    75_000,
  19:   100_000,
  20:   150_000,
  21:   200_000,
  22:   300_000,
  23:   400_000,
  24:   500_000,
  25:   600_000,
  26:   700_000,
  27:   800_000,
  28:   900_000,
  29: 1_000_000,
  30: 1_100_000,
  31: 1_200_000,
  32: 1_300_000,
  33: 1_400_000,
  34: 1_500_000,
  35: 1_600_000,
  36: 1_700_000,
  37: 1_800_000,
  38: 1_900_000,
  39: 2_000_000,
  40: 2_100_000,
  41: 2_200_000,
  42: 2_300_000,
  43: 2_400_000,
  44: 2_500_000,
  45: 2_600_000,
  46: 2_750_000,
  47: 2_900_000,
  48: 3_100_000,
  49: 3_400_000,
  50: 3_700_000,
};

// ----------------------------------------------------------
//  SKILLS THAT GO TO LEVEL 60
//  Applies to: Farming, Mining, Combat, Enchanting
//  (includes all levels 1-60; levels 1-50 match standard)
// ----------------------------------------------------------
export const SKILL_XP_60 = {
  ...STANDARD_SKILL_XP,
  51: 4_200_000,
  52: 4_700_000,
  53: 5_200_000,
  54: 5_700_000,
  55: 6_200_000,
  56: 6_700_000,
  57: 7_200_000,
  58: 7_700_000,
  59: 8_200_000,
  60: 8_700_000,
};

// ----------------------------------------------------------
//  RUNECRAFTING & SOCIAL (max level 25)
//  Separate, much smaller XP curve
// ----------------------------------------------------------
export const RUNECRAFTING_SOCIAL_XP = {
   1:     50,
   2:    100,
   3:    125,
   4:    160,
   5:    200,
   6:    250,
   7:    315,
   8:    400,
   9:    500,
  10:    625,
  11:    785,
  12:  1_000,
  13:  1_250,
  14:  1_600,
  15:  2_000,
  16:  2_465,
  17:  3_125,
  18:  4_000,
  19:  5_000,
  20:  6_200,
  21:  7_800,
  22:  9_800,
  23: 12_200,
  24: 15_300,
  25: 19_050,
};

// ----------------------------------------------------------
//  DUNGEONEERING (max level 50)
//  Completely separate, exponential curve
// ----------------------------------------------------------
export const DUNGEONEERING_XP = {
   1:          50,
   2:          75,
   3:         110,
   4:         160,
   5:         230,
   6:         330,
   7:         470,
   8:         670,
   9:         950,
  10:       1_340,
  11:       1_890,
  12:       2_650,
  13:       3_730,
  14:       5_260,
  15:       7_380,
  16:      10_300,
  17:      14_400,
  18:      20_000,
  19:      27_600,
  20:      38_000,
  21:      52_500,
  22:      71_500,
  23:      97_000,
  24:     132_000,
  25:     180_000,
  26:     243_000,
  27:     328_000,
  28:     445_000,
  29:     600_000,
  30:     800_000,
  31:   1_065_000,
  32:   1_410_000,
  33:   1_900_000,
  34:   2_500_000,
  35:   3_300_000,
  36:   4_300_000,
  37:   5_600_000,
  38:   7_200_000,
  39:   9_200_000,
  40:  12_000_000,
  41:  15_000_000,
  42:  19_000_000,
  43:  24_000_000,
  44:  30_000_000,
  45:  38_000_000,
  46:  48_000_000,
  47:  60_000_000,
  48:  75_000_000,
  49:  93_000_000,
  50: 116_300_000,
};

// ----------------------------------------------------------
//  Skill → XP table mapping
// ----------------------------------------------------------
export const SKILL_TABLES = {
  // Standard (max 50)
  Foraging:   { table: STANDARD_SKILL_XP, maxLevel: 50 },
  Fishing:    { table: STANDARD_SKILL_XP, maxLevel: 50 },
  Alchemy:    { table: STANDARD_SKILL_XP, maxLevel: 50 },
  Carpentry:  { table: STANDARD_SKILL_XP, maxLevel: 50 },
  Taming:     { table: STANDARD_SKILL_XP, maxLevel: 50 },

  // Extended (max 60)
  Farming:    { table: SKILL_XP_60, maxLevel: 60 },
  Mining:     { table: SKILL_XP_60, maxLevel: 60 },
  Combat:     { table: SKILL_XP_60, maxLevel: 60 },
  Enchanting: { table: SKILL_XP_60, maxLevel: 60 },

  // Cosmetic (max 25)
  Runecrafting: { table: RUNECRAFTING_SOCIAL_XP, maxLevel: 25 },
  Social:       { table: RUNECRAFTING_SOCIAL_XP, maxLevel: 25 },

  // Dungeoneering (max 50, unique curve)
  Dungeoneering: { table: DUNGEONEERING_XP, maxLevel: 50 },
};

// ----------------------------------------------------------
//  Helper: get the level for a given XP amount in a skill
// ----------------------------------------------------------
export function getLevelFromXP(skillName, xp) {
  const entry = SKILL_TABLES[skillName];
  if (!entry) throw new Error(`Unknown skill: ${skillName}`);
  const { table, maxLevel } = entry;
  let level = 0;
  for (let lvl = 1; lvl <= maxLevel; lvl++) {
    if (xp >= table[lvl]) level = lvl;
    else break;
  }
  return level;
}

// ----------------------------------------------------------
//  Helper: get XP required to reach a specific level
// ----------------------------------------------------------
export function getXPForLevel(skillName, level) {
  const entry = SKILL_TABLES[skillName];
  if (!entry) throw new Error(`Unknown skill: ${skillName}`);
  return entry.table[level] ?? null;
}