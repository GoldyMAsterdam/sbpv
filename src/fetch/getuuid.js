export async function getUsernameData(username) {
  if (!username || typeof username !== "string") {
    return { valid: false, error: "Invalid username input" };
  }
  try {
    const res = await fetch(
      `https://playerdb.co/api/player/minecraft/${encodeURIComponent(username)}`
    );
    if (res.status === 429) {
      return { valid: false, error: "Rate limited, try again later" };
    }
    if (!res.ok) {
      return { valid: false, error: `API error: ${res.status}` };
    }
    const data = await res.json();
    if (!data.success) {
      return { valid: false, error: "Player not found" };
    }
    const player = data.data.player;
    return {
      valid: true,
      uuid: player.raw_id,   
      uuid_formatted: player.id,
      username: player.username,
    };
  } catch (err) {
    return { valid: false, error: "Network error: " + err.message };
  }
}