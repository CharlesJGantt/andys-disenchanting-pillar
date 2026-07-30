import { world } from "@minecraft/server";

const SETTINGS_KEY = "adp:cost_settings_v1";

export const DEFAULT_SETTINGS = Object.freeze({
  commonBase: 1,
  uncommonBase: 2,
  rareBase: 3,
  veryRareBase: 4,
  perLevel: 1,
  minimum: 1,
  maximum: 4,
  mendingExtraLevels: 5,
  curseExtraLevels: 30,
  amethystCost: 8,
});

function integer(value, fallback, min = 0, max = 100) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.round(number)));
}

export function sanitizeSettings(candidate = {}) {
  const settings = {
    commonBase: integer(candidate.commonBase, DEFAULT_SETTINGS.commonBase, 0, 10),
    uncommonBase: integer(candidate.uncommonBase, DEFAULT_SETTINGS.uncommonBase, 0, 10),
    rareBase: integer(candidate.rareBase, DEFAULT_SETTINGS.rareBase, 0, 10),
    veryRareBase: integer(candidate.veryRareBase, DEFAULT_SETTINGS.veryRareBase, 0, 10),
    perLevel: integer(candidate.perLevel, DEFAULT_SETTINGS.perLevel, 0, 4),
    minimum: integer(candidate.minimum, DEFAULT_SETTINGS.minimum, 0, 10),
    maximum: integer(candidate.maximum, DEFAULT_SETTINGS.maximum, 1, 10),
    mendingExtraLevels: integer(candidate.mendingExtraLevels ?? candidate.mendingExtraXp, DEFAULT_SETTINGS.mendingExtraLevels, 0, 100),
    curseExtraLevels: integer(candidate.curseExtraLevels ?? candidate.curseExtraXp, DEFAULT_SETTINGS.curseExtraLevels, 0, 100),
    amethystCost: integer(candidate.amethystCost, DEFAULT_SETTINGS.amethystCost, 0, 64),
  };

  if (settings.maximum < settings.minimum) settings.maximum = settings.minimum;
  return settings;
}

export function getSettings() {
  try {
    const raw = world.getDynamicProperty(SETTINGS_KEY);
    if (typeof raw !== "string") return { ...DEFAULT_SETTINGS };
    return sanitizeSettings(JSON.parse(raw));
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(settings) {
  const safe = sanitizeSettings(settings);
  world.setDynamicProperty(SETTINGS_KEY, JSON.stringify(safe));
  return safe;
}

export function resetSettings() {
  return saveSettings(DEFAULT_SETTINGS);
}
