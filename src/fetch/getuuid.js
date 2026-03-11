/**
 * Converts a Minecraft username to UUID and validates the player exists.
 * Uses the Mojang API.
 */

export async function getUsernameData(username) {
  if (!username || typeof username !== "string") {
    return { valid: false, error: "Invalid username input" };
  }

  try {
    const res = await fetch(
      `https://api.mojang.com/users/profiles/minecraft/${encodeURIComponent(username)}`
    );

    // 404 = player doesn't exist
    if (res.status === 404) {
      return { valid: false, error: "Player not found" };
    }

    // 429 = rate limited
    if (res.status === 429) {
      return { valid: false, error: "Rate limited, try again later" };
    }

    if (!res.ok) {
      return { valid: false, error: `Mojang API error: ${res.status}` };
    }

    const data = await res.json();

    return {
      valid: true,
      uuid: data.id,                          // UUID without dashes
      uuid_formatted: formatUUID(data.id),    // UUID with dashes
      username: data.name,                    // Correct capitalisation from Mojang
    };
  } catch (err) {
    return { valid: false, error: "Network error: " + err.message };
  }
}

/**
 * Formats a raw UUID string (no dashes) to standard format (with dashes)
 * e.g. "069a79f444854a548691d82eb5ee27b4" → "069a79f4-4485-4a54-8691-d82eb5ee27b4"
 */
function formatUUID(raw) {
  return `${raw.slice(0,8)}-${raw.slice(8,12)}-${raw.slice(12,16)}-${raw.slice(16,20)}-${raw.slice(20)}`;
}