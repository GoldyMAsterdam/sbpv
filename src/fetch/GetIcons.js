/**
 * GetIcons.js
 * Handles fetching sharp Minecraft icons from the Wiki
 */

function wikiIcon(name) {
  // Format name to Title_Case for the Wiki (e.g., diamond_sword -> Diamond_Sword)
  const titleCase = name
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("_");

  // We request width=32. Using a small, clean integer multiple 
  // makes the "pixelated" CSS rendering work much better.
  return `https://minecraft.wiki/w/Special:FilePath/Invicon_${titleCase}.png?width=32`;
}

export function getItemIconSrc(itemId) {
  if (!itemId) return wikiIcon("barrier");
  const id = itemId.toLowerCase().trim().replace(/\s+/g, "_").replace(/^minecraft:/, "");
  return wikiIcon(id);
}

export function itemIconFallback(e) {
  e.target.onerror = null;
  // Fallback to a standard stone block if the icon is missing
  e.target.src = "https://minecraft.wiki/w/Special:FilePath/Invicon_Stone.png?width=32";
}

const ICON_MAP = {
  farming: "wheat",
  mining: "diamond_pickaxe",
  combat: "diamond_sword",
  foraging: "oak_log",
  fishing: "fishing_rod",
  enchanting: "enchanting_table",
  alchemy: "brewing_stand",
  taming: "bone",
  carpentry: "crafting_table",
  runecrafting: "magma_cream",
  catacombs: "wither_skeleton_skull",
  social: "emerald",
  // Dungeon Classes
  archer: "bow",
  berserk: "diamond_sword",
  mage: "blaze_rod",
  healer: "health_potion", 
  tank: "iron_chestplate"
};

export function getSkyblockSkillIcon(name) {
  const key = name.toLowerCase();
  const mapped = ICON_MAP[key];
  return getItemIconSrc(mapped ?? key);
}