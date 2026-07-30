const RARITY = Object.freeze({
  common: 1,
  uncommon: 2,
  rare: 3,
  veryRare: 4,
});

const ENCHANTMENT_RARITY = new Map([
  ["aqua_affinity", RARITY.rare],
  ["bane_of_arthropods", RARITY.uncommon],
  ["binding", RARITY.veryRare],
  ["binding_curse", RARITY.veryRare],
  ["blast_protection", RARITY.rare],
  ["breach", RARITY.rare],
  ["channeling", RARITY.veryRare],
  ["density", RARITY.common],
  ["depth_strider", RARITY.rare],
  ["efficiency", RARITY.common],
  ["feather_falling", RARITY.uncommon],
  ["fire_aspect", RARITY.rare],
  ["fire_protection", RARITY.uncommon],
  ["flame", RARITY.rare],
  ["fortune", RARITY.rare],
  ["frost_walker", RARITY.rare],
  ["impaling", RARITY.rare],
  ["infinity", RARITY.veryRare],
  ["knockback", RARITY.uncommon],
  ["looting", RARITY.rare],
  ["loyalty", RARITY.uncommon],
  ["luck_of_the_sea", RARITY.rare],
  ["lure", RARITY.rare],
  ["mending", RARITY.veryRare],
  ["multishot", RARITY.rare],
  ["piercing", RARITY.common],
  ["power", RARITY.common],
  ["projectile_protection", RARITY.uncommon],
  ["protection", RARITY.common],
  ["punch", RARITY.rare],
  ["quick_charge", RARITY.uncommon],
  ["respiration", RARITY.rare],
  ["riptide", RARITY.rare],
  ["sharpness", RARITY.common],
  ["silk_touch", RARITY.veryRare],
  ["smite", RARITY.uncommon],
  ["soul_speed", RARITY.veryRare],
  ["swift_sneak", RARITY.veryRare],
  ["thorns", RARITY.veryRare],
  ["unbreaking", RARITY.uncommon],
  ["vanishing", RARITY.veryRare],
  ["vanishing_curse", RARITY.veryRare],
  ["wind_burst", RARITY.veryRare],
]);

const DISPLAY_NAMES = new Map([
  ["aqua_affinity", "Aqua Affinity"],
  ["bane_of_arthropods", "Bane of Arthropods"],
  ["binding", "Curse of Binding"],
  ["binding_curse", "Curse of Binding"],
  ["blast_protection", "Blast Protection"],
  ["breach", "Breach"],
  ["channeling", "Channeling"],
  ["density", "Density"],
  ["depth_strider", "Depth Strider"],
  ["efficiency", "Efficiency"],
  ["feather_falling", "Feather Falling"],
  ["fire_aspect", "Fire Aspect"],
  ["fire_protection", "Fire Protection"],
  ["flame", "Flame"],
  ["fortune", "Fortune"],
  ["frost_walker", "Frost Walker"],
  ["impaling", "Impaling"],
  ["infinity", "Infinity"],
  ["knockback", "Knockback"],
  ["looting", "Looting"],
  ["loyalty", "Loyalty"],
  ["luck_of_the_sea", "Luck of the Sea"],
  ["lure", "Lure"],
  ["mending", "Mending"],
  ["multishot", "Multishot"],
  ["piercing", "Piercing"],
  ["power", "Power"],
  ["projectile_protection", "Projectile Protection"],
  ["protection", "Protection"],
  ["punch", "Punch"],
  ["quick_charge", "Quick Charge"],
  ["respiration", "Respiration"],
  ["riptide", "Riptide"],
  ["sharpness", "Sharpness"],
  ["silk_touch", "Silk Touch"],
  ["smite", "Smite"],
  ["soul_speed", "Soul Speed"],
  ["swift_sneak", "Swift Sneak"],
  ["thorns", "Thorns"],
  ["unbreaking", "Unbreaking"],
  ["vanishing", "Curse of Vanishing"],
  ["vanishing_curse", "Curse of Vanishing"],
  ["wind_burst", "Wind Burst"],
]);

export function shortEnchantmentId(id) {
  return String(id ?? "unknown").replace(/^minecraft:/, "");
}

export function isCurse(id) {
  const shortId = shortEnchantmentId(id);
  return shortId === "binding" || shortId === "binding_curse" || shortId === "vanishing" || shortId === "vanishing_curse";
}

export function getRarity(id) {
  return ENCHANTMENT_RARITY.get(shortEnchantmentId(id)) ?? RARITY.rare;
}

export function getEnchantmentName(id) {
  const shortId = shortEnchantmentId(id);
  return DISPLAY_NAMES.get(shortId) ?? shortId
    .split("_")
    .map((part) => part.length ? part[0].toUpperCase() + part.slice(1) : part)
    .join(" ");
}

export function romanNumeral(level) {
  const values = [
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"],
  ];
  let remaining = Math.max(1, Math.round(Number(level) || 1));
  let output = "";
  for (const [value, numeral] of values) {
    while (remaining >= value) {
      output += numeral;
      remaining -= value;
    }
  }
  return output;
}

export function describeEnchantment(enchantment) {
  return `${getEnchantmentName(enchantment.type.id)} ${romanNumeral(enchantment.level)}`;
}

export function calculateCost(enchantment, settings) {
  const id = shortEnchantmentId(enchantment.type.id);
  const rarity = getRarity(id);
  const baseByRarity = {
    [RARITY.common]: settings.commonBase,
    [RARITY.uncommon]: settings.uncommonBase,
    [RARITY.rare]: settings.rareBase,
    [RARITY.veryRare]: settings.veryRareBase,
  };
  const unbounded = baseByRarity[rarity] + (Math.max(1, enchantment.level) - 1) * settings.perLevel;
  const baseLevels = Math.max(settings.minimum, Math.min(settings.maximum, unbounded));
  const surchargeLevels = (id === "mending" ? settings.mendingExtraLevels : 0) + (isCurse(id) ? settings.curseExtraLevels : 0);
  return { levels: baseLevels + surchargeLevels, baseLevels, surchargeLevels, rarity };
}

export function formatCost(cost) {
  const levelWord = cost.levels === 1 ? "level" : "levels";
  return `${cost.levels} XP ${levelWord}`;
}
