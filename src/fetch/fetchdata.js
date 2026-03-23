import "dotenv/config";

const API_KEY = process.env.HYPIXEL_API_KEY;
const BASE_URL = "https://api.hypixel.net";

if (!API_KEY) {
  throw new Error("Missing HYPIXEL_API_KEY in your .env file.");
}

// --- Helper ---
async function apiFetch(path, params = {}) {
  const url = new URL(path, BASE_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`API error ${res.status}: ${url}`);
  return res.json();
}

// --- Public resource endpoints (no key required) ---
export const getSkyblockItems      = () => apiFetch("/resources/skyblock/items");
export const getSkyblockCollections= () => apiFetch("/resources/skyblock/collections");
export const getSkyblockSkills     = () => apiFetch("/resources/skyblock/skills");
export const getSkyblockElection   = () => apiFetch("/resources/skyblock/election");
export const getSkyblockBingo      = () => apiFetch("/resources/skyblock/bingo");

// --- Authenticated endpoints ---
export const getSkyblockBazaar     = () => apiFetch("/skyblock/bazaar", { key: API_KEY });
export const getSkyblockNews       = () => apiFetch("/skyblock/news",   { key: API_KEY });
export const getSkyblockAuctions   = (page = 0) =>
  apiFetch("/skyblock/auctions", { key: API_KEY, page });
export const getSkyblockProfiles   = (uuid) =>
  apiFetch("/skyblock/profiles", { key: API_KEY, uuid });

// --- Mojang: username → UUID ---
export async function getPlayerUUID(username) {
  const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
  if (!res.ok) throw new Error(`Mojang API error for "${username}"`);
  const data = await res.json();
  return data.id;
}

// --- Main ---
async function main() {
  console.log("=== Fetching Skyblock Data ===\n");

  const [items, collections, skills, election, bingo, bazaar, auctions, news] =
    await Promise.all([
      getSkyblockItems(),
      getSkyblockCollections(),
      getSkyblockSkills(),
      getSkyblockElection(),
      getSkyblockBingo(),
      getSkyblockBazaar(),
      getSkyblockAuctions(0),
      getSkyblockNews(),
    ]);

  console.log(`[1] Items:       ${items.items?.length ?? 0} items`);
  console.log(`[2] Collections: ${Object.keys(collections.collections ?? {}).length} categories`);
  console.log(`[3] Skills:      ${Object.keys(skills.skills ?? {}).length} skills`);
  console.log(`[4] Mayor:       ${election.mayor?.name ?? "Unknown"}`);
  console.log(`[5] Bingo goals: ${bingo.goals?.length ?? 0}`);
  console.log(`[6] Bazaar:      ${Object.keys(bazaar.products ?? {}).length} products`);
  console.log(`[7] Auctions:    ${auctions.totalAuctions ?? "N/A"} total (${auctions.totalPages ?? "N/A"} pages)`);
  console.log(`[8] News:        ${news.items?.[0]?.title ?? "N/A"}`);

  // Uncomment to fetch a specific player's profiles:
  // const uuid = await getPlayerUUID("YourUsername");
  // const profiles = await getSkyblockProfiles(uuid);
  // console.log("Profiles:", profiles.profiles?.map(p => p.cute_name));
}

main().catch(console.error);