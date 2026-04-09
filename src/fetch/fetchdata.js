// --- SKYCRYPT CATACOMBS XP TABLE ---
const CATA_XP_TABLE = [
    0, 50, 125, 235, 395, 625, 955, 1425, 2095, 3045, 4385, 6275, 8940, 12700, 17960, 25340, 35640, 50040, 70040, 97640,
    135640, 188140, 259640, 356640, 488640, 668640, 911640, 1239640, 1684640, 2284640, 3084640, 4149640, 5559640, 7459640,
    9959640, 13259640, 17559640, 23159640, 30359640, 39559640, 51559640, 66559640, 85559640, 109559640, 139559640,
    177559640, 225559640, 285559640, 360559640, 453055964, 569805596
];

/**
 * Calculates Level, Progress, and XP remaining based on cumulative XP
 */
function getLevelInfo(cumulativeXp) {
    const xp = cumulativeXp || 0;
    let level = 0;

    for (let i = 0; i < CATA_XP_TABLE.length; i++) {
        if (xp >= CATA_XP_TABLE[i]) level = i;
        else break;
    }

    if (level >= 50) return { level: 50, progress: 1, xpToNext: 0, currentXp: xp };

    const currentLevelThreshold = CATA_XP_TABLE[level];
    const nextLevelThreshold = CATA_XP_TABLE[level + 1];
    const xpInLevel = xp - currentLevelThreshold;
    const xpNeededForNext = nextLevelThreshold - currentLevelThreshold;

    return {
        level,
        progress: xpInLevel / xpNeededForNext,
        xpToNext: nextLevelThreshold - xp,
        currentXp: xp
    };
}

/**
 * The Parser: Transforms Raw Hypixel API data into the SkyCrypt-style object
 */
export function parseDungeonData(profilesResponse, uuid) {
    if (!profilesResponse?.profiles) return null;

    const activeProfile = profilesResponse.profiles.find(p => p.selected) || profilesResponse.profiles[0];
    const member = activeProfile?.members?.[uuid];
    if (!member?.dungeons) return null;

    const d = member.dungeons;
    const classNames = ["healer", "mage", "berserk", "archer", "tank"];
    const classes = {};

    classNames.forEach(name => {
        const xp = d.player_classes?.[name]?.experience || 0;
        classes[name] = getLevelInfo(xp);
    });

    return {
        catacombs: getLevelInfo(d.dungeon_types?.catacombs?.experience || 0),
        selected_class: d.selected_dungeon_class || "None",
        classes: classes
    };
}