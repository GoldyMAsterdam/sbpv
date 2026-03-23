/**
 * GetIcons.js
 * Uses Minecraft Wiki inventory icons.
 */

function wikiIcon(name) {
  // 1. Replace underscores with spaces for the display name
  // 2. Title Case every word
  // 3. Join back with underscores for the URL
  const titleCase = name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("_");

  return `https://minecraft.wiki/w/Special:FilePath/Invicon_${titleCase}.png`;
}

export function getItemIconSrc(itemId) {
  if (!itemId) return wikiIcon("barrier");
  // Clean the ID
  const id = itemId.toLowerCase().trim().replace(/\s+/g, "_").replace(/^minecraft:/, "");
  return wikiIcon(id);
}

export function itemIconFallback(e) {
  e.target.onerror = null;
  // Fallback to a block that definitely exists if the specific icon fails
  e.target.src = "https://minecraft.wiki/w/Special:FilePath/Invicon_Stone.png";
}

/**
 * Verified Skill Map
 */
const SKYBLOCK_SKILL_MAP = {
  farming:      "wheat",
  mining:       "diamond_pickaxe",
  combat:       "diamond_sword",
  foraging:     "iron_axe",
  fishing:      "fishing_rod",
  enchanting:   "enchanting_table",
  alchemy:      "brewing_stand",
  taming:       "bone",
  // FIX: Carpentry often works better as "Crafting_Table" 
  // but ensure the function handles the casing correctly.
  carpentry:    "crafting_table", 
  // FIX: Runecrafting
  runecrafting: "magma_cream",
  catacombs:    "wither_skeleton_skull",
  social:       "emerald",
};

export function getSkyblockSkillIcon(skillName) {
  const mapped = SKYBLOCK_SKILL_MAP[skillName.toLowerCase()];
  return getItemIconSrc(mapped ?? skillName);
}