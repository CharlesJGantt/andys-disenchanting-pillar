import {
  BlockPermutation,
  EquipmentSlot,
  GameMode,
  ItemStack,
  MolangVariableMap,
  PlayerPermissionLevel,
  system,
  world,
} from "@minecraft/server";
import { ModalFormData } from "@minecraft/server-ui";
import { DEFAULT_SETTINGS, getSettings, resetSettings, saveSettings } from "./config.js";
import { calculateCost, describeEnchantment, formatCost } from "./enchantments.js";

const LEGACY_PILLAR_ID = "adp:disenchanting_pillar";
const DEFAULT_PILLAR_ID = "adp:polished_blackstone_bricks_disenchanting_pillar";
const STORAGE_ID = "adp:pillar_storage";
const CHOICE_ITEM_ID = "adp:enchantment_choice";
const SELECTED_ITEM_ID = "adp:enchantment_selected";
const PREVIOUS_PAGE_ITEM_ID = "adp:previous_page";
const NEXT_PAGE_ITEM_ID = "adp:next_page";
const CONTAINER_TITLE = "§r§r§rADP_CONTAINER";
const SOURCE_SLOT = 0;
const BOOK_SLOT = 1;
const OUTPUT_SLOT = 2;
const AMETHYST_SLOT = 9;
const FIRST_CHOICE_SLOT = 3;
const LAST_CHOICE_SLOT = 17;
const LAST_VISIBLE_CHOICE_SLOT = 6;
const PREVIOUS_PAGE_SLOT = 7;
const NEXT_PAGE_SLOT = 8;
const CHOICES_PER_PAGE = LAST_VISIBLE_CHOICE_SLOT - FIRST_CHOICE_SLOT + 1;
const MAX_ENCHANTMENT_CHOICES = LAST_CHOICE_SLOT - FIRST_CHOICE_SLOT + 1;
const STORAGE_SCHEMA = 3;
const RUNE_PARTICLE_VARIANTS = 8;
const SESSION_TIMEOUT_TICKS = 20 * 120;
const activeUsers = new Map();
const stationStates = new Map();
const DYE_COLORS = new Map([
  ["minecraft:white_dye", ["white", "White"]],
  ["minecraft:orange_dye", ["orange", "Orange"]],
  ["minecraft:magenta_dye", ["magenta", "Magenta"]],
  ["minecraft:light_blue_dye", ["light_blue", "Light Blue"]],
  ["minecraft:yellow_dye", ["yellow", "Yellow"]],
  ["minecraft:lime_dye", ["lime", "Lime"]],
  ["minecraft:pink_dye", ["pink", "Pink"]],
  ["minecraft:gray_dye", ["gray", "Gray"]],
  ["minecraft:light_gray_dye", ["light_gray", "Light Gray"]],
  ["minecraft:cyan_dye", ["cyan", "Cyan"]],
  ["minecraft:purple_dye", ["purple", "Purple"]],
  ["minecraft:blue_dye", ["blue", "Blue"]],
  ["minecraft:brown_dye", ["brown", "Brown"]],
  ["minecraft:green_dye", ["green", "Green"]],
  ["minecraft:red_dye", ["red", "Red"]],
  ["minecraft:black_dye", ["black", "Black"]],
]);
const RUNE_PARTICLE_COLORS = {
  cyan: [40, 225, 235],
  white: [245, 250, 250],
  orange: [245, 130, 35],
  magenta: [218, 85, 205],
  light_blue: [85, 195, 240],
  yellow: [250, 220, 55],
  lime: [150, 225, 45],
  pink: [245, 150, 185],
  gray: [105, 120, 130],
  light_gray: [185, 195, 195],
  purple: [165, 80, 220],
  blue: [65, 90, 220],
  brown: [155, 105, 70],
  green: [90, 165, 60],
  red: [220, 65, 55],
  black: [72, 62, 92],
};

function message(player, text, color = "§e") {
  player.sendMessage(`${color}[Disenchanting Pillar]§r ${text}`);
  try {
    player.onScreenDisplay.setActionBar(`${color}[Pillar] §r${text}`);
  } catch {
    // Chat remains available if the action bar is unavailable.
  }
}

function isOperator(player) {
  try {
    return player.playerPermissionLevel === PlayerPermissionLevel.Operator;
  } catch {
    return false;
  }
}

function blockKey(block) {
  const { x, y, z } = block.location;
  return `${block.dimension.id}:${x},${y},${z}`;
}

function storageLocation(block) {
  const { x, y, z } = block.location;
  return { x: x + 0.5, y: y + 0.05, z: z + 0.5 };
}

function blockAtHeight(block, offset) {
  const { x, y, z } = block.location;
  return block.dimension.getBlock({ x, y: y + offset, z });
}

function isPillarId(typeId) {
  return typeof typeId === "string"
    && typeId.startsWith("adp:")
    && typeId.endsWith("_disenchanting_pillar")
    && typeId !== LEGACY_PILLAR_ID;
}

function isAltarId(typeId) {
  return typeof typeId === "string"
    && typeId.startsWith("adp:")
    && typeId.endsWith("_disenchanting_altar");
}

function isWorkstationId(typeId) {
  return isPillarId(typeId) || isAltarId(typeId);
}

function stackPart(block) {
  return isPillarId(block?.typeId) ? block.permutation.getState("adp:stack_part") : undefined;
}

function runeColor(block) {
  return block?.permutation.getState("adp:rune_color") ?? "cyan";
}

function setPillarPart(block, typeId, part, powered = false, color = "cyan") {
  block.setPermutation(BlockPermutation.resolve(typeId, {
    "adp:stack_part": part,
    "adp:powered": powered,
    "adp:rune_color": color,
  }));
}

function migrateLegacyPillar(block) {
  if (!block || block.typeId !== LEGACY_PILLAR_ID) return undefined;
  const legacyPart = block.permutation.getState("adp:part");
  const offset = legacyPart === "top" ? -2 : legacyPart === "middle" ? -1 : 0;
  const base = blockAtHeight(block, offset);
  if (!base || base.typeId !== LEGACY_PILLAR_ID) return undefined;

  const color = runeColor(base);
  const powered = base.permutation.getState("adp:powered") === true;
  const middle = blockAtHeight(base, 1);
  const top = blockAtHeight(base, 2);
  const hasMiddle = middle?.typeId === LEGACY_PILLAR_ID;

  setPillarPart(base, DEFAULT_PILLAR_ID, hasMiddle ? "lower" : "single", powered, color);
  if (hasMiddle) setPillarPart(middle, DEFAULT_PILLAR_ID, "upper", powered, color);
  if (top?.typeId === LEGACY_PILLAR_ID) top.setType("minecraft:air");
  return base;
}

function findWorkstationAnchor(block) {
  if (!block) return undefined;
  if (block.typeId === LEGACY_PILLAR_ID) return migrateLegacyPillar(block);
  if (isAltarId(block.typeId)) return block;
  if (!isPillarId(block.typeId)) return undefined;

  const part = stackPart(block);
  if (part !== "upper") return block;
  const below = blockAtHeight(block, -1);
  if (below?.typeId === block.typeId && stackPart(below) === "lower") return below;
  setPillarPart(block, block.typeId, "single", block.permutation.getState("adp:powered") === true, runeColor(block));
  return block;
}

function workstationSections(anchor) {
  if (!anchor) return [];
  if (isAltarId(anchor.typeId)) return [anchor];
  if (!isPillarId(anchor.typeId)) return [];
  if (stackPart(anchor) !== "lower") return [anchor];
  const upper = blockAtHeight(anchor, 1);
  if (upper?.typeId === anchor.typeId && stackPart(upper) === "upper") return [anchor, upper];
  setPillarPart(anchor, anchor.typeId, "single", anchor.permutation.getState("adp:powered") === true, runeColor(anchor));
  return [anchor];
}

function ensureWorkstation(anchor) {
  return workstationSections(anchor).length > 0;
}

function workstationName(anchor) {
  return isAltarId(anchor?.typeId) ? "altar" : "pillar";
}

function particleLocation(anchor) {
  const { x, y, z } = anchor.location;
  if (isAltarId(anchor.typeId)) return { x: x + 0.5, y: y + 1.0, z: z + 0.5 };
  return { x: x + 0.5, y: y + (workstationSections(anchor).length === 2 ? 2.02 : 1.12), z: z + 0.5 };
}

function floatingRuneParticleId() {
  return `adp:floating_rune_${Math.floor(Math.random() * RUNE_PARTICLE_VARIANTS)}`;
}

function runeParticleVariables(color) {
  const [red, green, blue] = RUNE_PARTICLE_COLORS[color] ?? RUNE_PARTICLE_COLORS.cyan;
  const variables = new MolangVariableMap();
  variables.setColorRGB("variable.rune_color", {
    red: red / 255,
    green: green / 255,
    blue: blue / 255,
  });
  return variables;
}

function spawnFloatingRune(dimension, color, location) {
  dimension.spawnParticle(floatingRuneParticleId(), location, runeParticleVariables(color));
}

function spawnFloatingRuneCluster(dimension, color, location) {
  const bursts = 1 + Math.floor(Math.random() * 2);
  for (let index = 0; index < bursts; index += 1) {
    const delay = Math.floor(Math.random() * 9);
    system.runTimeout(() => {
      try {
        spawnFloatingRune(dimension, color, {
          x: location.x + (Math.random() - 0.5) * 0.28,
          y: location.y + (Math.random() - 0.5) * 0.22,
          z: location.z + (Math.random() - 0.5) * 0.28,
        });
      } catch {
        // Ambient particles may be skipped if the chunk unloads.
      }
    }, delay);
  }
}

function workstationHasNearbyPlayer(storage, dimensionId, radiusSquared = 196) {
  return world.getAllPlayers().some((player) => {
    if (player.dimension.id !== dimensionId) return false;
    const dx = player.location.x - storage.location.x;
    const dy = player.location.y - storage.location.y;
    const dz = player.location.z - storage.location.z;
    return dx * dx + dy * dy + dz * dz <= radiusSquared;
  });
}

function getStorageInventory(storage) {
  return storage.getComponent("minecraft:inventory")?.container;
}

function findStorage(block) {
  const key = blockKey(block);
  const candidates = block.dimension.getEntities({
    type: STORAGE_ID,
    location: storageLocation(block),
    maxDistance: 1.1,
  });
  return candidates.find((entity) => entity.getDynamicProperty("adp:block_key") === key)
    ?? candidates.find((entity) => !entity.getDynamicProperty("adp:block_key"));
}

function replaceLegacyStorage(block, legacyStorage) {
  const legacyContainer = getStorageInventory(legacyStorage);
  const preserved = [];
  if (legacyContainer) {
    for (let slot = 0; slot < legacyContainer.size; slot += 1) {
      const item = legacyContainer.getItem(slot);
      if (item && !isChoiceItem(item) && !isPreviewItem(item)) preserved.push({ slot, item });
    }
  }

  const replacement = block.dimension.spawnEntity(STORAGE_ID, storageLocation(block));
  replacement.setDynamicProperty("adp:block_key", blockKey(block));
  replacement.setDynamicProperty("adp:storage_schema", STORAGE_SCHEMA);
  replacement.nameTag = CONTAINER_TITLE;

  const replacementContainer = getStorageInventory(replacement);
  if (!replacementContainer) {
    replacement.remove();
    throw new Error("The replacement storage entity has no inventory.");
  }

  for (const { slot, item } of preserved) {
    if ((slot <= OUTPUT_SLOT || slot === AMETHYST_SLOT) && !replacementContainer.getItem(slot)) replacementContainer.setItem(slot, item);
    else block.dimension.spawnItem(item, storageLocation(block));
  }

  activeUsers.delete(legacyStorage.id);
  stationStates.delete(legacyStorage.id);
  legacyStorage.remove();
  return replacement;
}

function ensureStorage(block) {
  let storage = findStorage(block);
  if (storage && storage.getDynamicProperty("adp:storage_schema") !== STORAGE_SCHEMA) {
    storage = replaceLegacyStorage(block, storage);
  }
  if (!storage) storage = block.dimension.spawnEntity(STORAGE_ID, storageLocation(block));
  storage.setDynamicProperty("adp:block_key", blockKey(block));
  storage.setDynamicProperty("adp:storage_schema", STORAGE_SCHEMA);
  storage.nameTag = CONTAINER_TITLE;
  return storage;
}

function getState(storage) {
  let state = stationStates.get(storage.id);
  if (!state) {
    state = { sourceFingerprint: undefined, selectedId: undefined, page: 0 };
    stationStates.set(storage.id, state);
  }
  return state;
}

function getEnchantments(item) {
  return item?.getComponent("minecraft:enchantable")?.getEnchantments() ?? [];
}

function sourceFingerprint(item) {
  if (!item) return "empty";
  const enchantments = getEnchantments(item)
    .map((enchantment) => `${enchantment.type.id}:${enchantment.level}`)
    .sort()
    .join(",");
  return `${item.typeId}|${item.nameTag ?? ""}|${enchantments}`;
}

function isChoiceItem(item) {
  return item?.typeId === CHOICE_ITEM_ID
    || item?.typeId === SELECTED_ITEM_ID
    || item?.typeId === PREVIOUS_PAGE_ITEM_ID
    || item?.typeId === NEXT_PAGE_ITEM_ID;
}

function isPreviewItem(item) {
  return item?.getDynamicProperty("adp:preview") === true;
}

function returnToPlayer(player, item) {
  if (!item) return;
  const inventory = player.getComponent("minecraft:inventory")?.container;
  const remainder = inventory?.addItem(item) ?? item;
  if (remainder) player.dimension.spawnItem(remainder, player.location);
}

function getActivePlayer(storage) {
  const session = activeUsers.get(storage.id);
  if (!session || system.currentTick - session.tick > SESSION_TIMEOUT_TICKS) return undefined;
  return world.getAllPlayers().find((player) => player.id === session.playerId);
}

function findStorageById(storageId) {
  for (const dimensionId of ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]) {
    try {
      const storage = world.getDimension(dimensionId).getEntities({ type: STORAGE_ID })
        .find((entity) => entity.id === storageId);
      if (storage) return storage;
    } catch {
      // The dimension may not be available yet.
    }
  }
  return undefined;
}

function resolveGeneratedItemStorage(player, storageId) {
  const session = activeUsers.get(storageId);
  let storage = session?.storage;
  if (!storage) storage = findStorageById(storageId);
  if (!storage || storage.dimension.id !== player.dimension.id) return undefined;
  const dx = storage.location.x - player.location.x;
  const dy = storage.location.y - player.location.y;
  const dz = storage.location.z - player.location.z;
  if (dx * dx + dy * dy + dz * dz > 64) return undefined;
  activeUsers.set(storage.id, { storage, playerId: player.id, tick: system.currentTick });
  return storage;
}

function returnPhysicalItem(storage, item) {
  if (!item) return;
  const player = getActivePlayer(storage);
  if (player) returnToPlayer(player, item);
  else storage.dimension.spawnItem(item, storage.location);
}

function routePhysicalItem(storage, container, item) {
  if (!item || isChoiceItem(item) || isPreviewItem(item)) return;
  if (item.typeId === "minecraft:amethyst_shard") {
    const stored = container.getItem(AMETHYST_SLOT);
    const storedAmount = stored?.typeId === "minecraft:amethyst_shard" ? stored.amount : 0;
    const moved = Math.min(item.amount, 64 - storedAmount);
    if (moved > 0) container.setItem(AMETHYST_SLOT, new ItemStack("minecraft:amethyst_shard", storedAmount + moved));
    if (item.amount > moved) {
      const remainder = item.clone();
      remainder.amount = item.amount - moved;
      returnPhysicalItem(storage, remainder);
    }
    return;
  }
  if (item.typeId === "minecraft:book") {
    const stored = container.getItem(BOOK_SLOT);
    const storedAmount = stored?.typeId === "minecraft:book" ? stored.amount : 0;
    const moved = Math.min(item.amount, 64 - storedAmount);
    if (moved > 0) container.setItem(BOOK_SLOT, new ItemStack("minecraft:book", storedAmount + moved));
    if (item.amount > moved) {
      const remainder = item.clone();
      remainder.amount = item.amount - moved;
      returnPhysicalItem(storage, remainder);
    }
    return;
  }

  if (getEnchantments(item).length > 0 && !container.getItem(SOURCE_SLOT)) {
    const inserted = item.clone();
    inserted.amount = 1;
    container.setItem(SOURCE_SLOT, inserted);
    if (item.amount > 1) {
      const remainder = item.clone();
      remainder.amount = item.amount - 1;
      returnPhysicalItem(storage, remainder);
    }
    return;
  }
  returnPhysicalItem(storage, item);
}

function sanitizeContainer(storage, container) {
  const source = container.getItem(SOURCE_SLOT);
  if (source && (isChoiceItem(source) || isPreviewItem(source))) {
    container.setItem(SOURCE_SLOT, undefined);
    if (!isChoiceItem(source) && !isPreviewItem(source)) routePhysicalItem(storage, container, source);
  } else if (source?.amount > 1) {
    const kept = source.clone();
    kept.amount = 1;
    const remainder = source.clone();
    remainder.amount = source.amount - 1;
    container.setItem(SOURCE_SLOT, kept);
    returnPhysicalItem(storage, remainder);
  }

  const books = container.getItem(BOOK_SLOT);
  if (books && (books.typeId !== "minecraft:book" || isPreviewItem(books))) {
    container.setItem(BOOK_SLOT, undefined);
    if (isPreviewItem(books)) container.setItem(OUTPUT_SLOT, books);
    else routePhysicalItem(storage, container, books);
  }

  const amethyst = container.getItem(AMETHYST_SLOT);
  if (amethyst && (amethyst.typeId !== "minecraft:amethyst_shard" || isPreviewItem(amethyst))) {
    container.setItem(AMETHYST_SLOT, undefined);
    routePhysicalItem(storage, container, amethyst);
  }

  const output = container.getItem(OUTPUT_SLOT);
  if (output && !isPreviewItem(output)) {
    container.setItem(OUTPUT_SLOT, undefined);
    returnPhysicalItem(storage, output);
  }

  for (let slot = FIRST_CHOICE_SLOT; slot <= NEXT_PAGE_SLOT; slot += 1) {
    const item = container.getItem(slot);
    if (!item || isChoiceItem(item)) continue;
    container.setItem(slot, undefined);
    if (isPreviewItem(item) && !container.getItem(OUTPUT_SLOT)) container.setItem(OUTPUT_SLOT, item);
    else if (!isPreviewItem(item)) returnPhysicalItem(storage, item);
  }

  for (let slot = AMETHYST_SLOT + 1; slot <= LAST_CHOICE_SLOT; slot += 1) {
    const item = container.getItem(slot);
    if (!item) continue;
    container.setItem(slot, undefined);
    if (!isChoiceItem(item) && !isPreviewItem(item)) routePhysicalItem(storage, container, item);
  }
}

function createChoiceItem(storage, enchantment, selected) {
  const settings = getSettings();
  const cost = calculateCost(enchantment, settings);
  const item = new ItemStack(selected ? SELECTED_ITEM_ID : CHOICE_ITEM_ID, 1);
  item.nameTag = `${selected ? "§a> " : "§f"}${describeEnchantment(enchantment)} §7- §b${compactCost(cost, settings)}`;
  item.setLore([
    `§7XP cost: ${formatCost(cost)}`,
    selected ? "§aShown in the output slot" : "§8Click to select",
  ]);
  item.setDynamicProperty("adp:choice", true);
  item.setDynamicProperty("adp:station_id", storage.id);
  item.setDynamicProperty("adp:enchantment_id", enchantment.type.id);
  return item;
}

function compactCost(cost, settings = getSettings()) {
  return `${cost.levels}L + ${settings.amethystCost}A`;
}

function formatAmethystCost(settings = getSettings()) {
  const count = settings.amethystCost;
  return `${count} Amethyst ${count === 1 ? "Shard" : "Shards"}`;
}

function createPageItem(storage, pageDelta) {
  const item = new ItemStack(pageDelta < 0 ? PREVIOUS_PAGE_ITEM_ID : NEXT_PAGE_ITEM_ID, 1);
  item.nameTag = pageDelta < 0 ? "§fPrevious enchantments" : "§fMore enchantments";
  item.setLore([pageDelta < 0 ? "§7Show the previous four rows" : "§7Show the next four rows"]);
  item.setDynamicProperty("adp:choice", true);
  item.setDynamicProperty("adp:station_id", storage.id);
  item.setDynamicProperty("adp:page_delta", pageDelta);
  return item;
}

function pageItemMatches(item, storageId, pageDelta) {
  const expectedType = pageDelta < 0 ? PREVIOUS_PAGE_ITEM_ID : NEXT_PAGE_ITEM_ID;
  return item?.typeId === expectedType
    && item.getDynamicProperty("adp:station_id") === storageId
    && item.getDynamicProperty("adp:page_delta") === pageDelta;
}

function heldItem(player) {
  return player.getComponent("minecraft:equippable")?.getEquipment(EquipmentSlot.Mainhand);
}

function dyeForItem(item) {
  const color = DYE_COLORS.get(item?.typeId);
  return color ? { item, state: color[0], name: color[1] } : undefined;
}

function heldDye(player) {
  return dyeForItem(heldItem(player));
}

function consumeHeldItem(player, expectedTypeId) {
  if (player.getGameMode() === GameMode.Creative) return;
  const equippable = player.getComponent("minecraft:equippable");
  const item = equippable?.getEquipment(EquipmentSlot.Mainhand);
  if (!equippable || !item || item.typeId !== expectedTypeId) throw new Error("The held item changed before it could be consumed.");
  if (item.amount <= 1) equippable.setEquipment(EquipmentSlot.Mainhand, undefined);
  else {
    const remaining = item.clone();
    remaining.amount -= 1;
    equippable.setEquipment(EquipmentSlot.Mainhand, remaining);
  }
}

function dyeWorkstation(player, anchor, dye) {
  if (!anchor || !dye || !ensureWorkstation(anchor)) return;
  const sections = workstationSections(anchor);
  const currentColor = runeColor(anchor);
  const name = workstationName(anchor);
  if (currentColor === dye.state) return message(player, `The ${name} runes are already ${dye.name.toLowerCase()}.`, "§7");
  const originalPermutations = sections.map((section) => section.permutation);
  try {
    sections.forEach((section) => section.setPermutation(section.permutation.withState("adp:rune_color", dye.state)));
    consumeHeldItem(player, dye.item.typeId);
  } catch (error) {
    sections.forEach((section, index) => {
      try {
        section.setPermutation(originalPermutations[index]);
      } catch {
        // Best-effort visual rollback.
      }
    });
    return message(player, `Could not dye the ${name}: ${error}`, "§c");
  }
  try {
    anchor.dimension.playSound("chime.amethyst_block", particleLocation(anchor), { volume: 1, pitch: 1.1 });
  } catch {
    // The color change remains valid if the sound cannot play.
  }
  message(player, `The ${name} runes now glow ${dye.name.toLowerCase()}.`, "§a");
}

function stackPillar(player, anchor, heldTypeId) {
  if (!anchor || !isPillarId(anchor.typeId) || !isPillarId(heldTypeId)) return;
  if (anchor.typeId !== heldTypeId) {
    return message(player, "The upper pillar must use the same material as the lower pillar.");
  }
  if (stackPart(anchor) !== "single") {
    return message(player, "A Disenchanting Pillar can be no more than two blocks high.");
  }
  const upper = blockAtHeight(anchor, 1);
  if (!upper || upper.typeId !== "minecraft:air") {
    return message(player, "Clear the block above the pillar before stacking it.");
  }

  const original = anchor.permutation;
  const color = runeColor(anchor);
  const powered = anchor.permutation.getState("adp:powered") === true;
  try {
    setPillarPart(anchor, anchor.typeId, "lower", powered, color);
    setPillarPart(upper, anchor.typeId, "upper", powered, color);
    consumeHeldItem(player, heldTypeId);
    ensureStorage(anchor);
  } catch (error) {
    try {
      anchor.setPermutation(original);
      if (upper.typeId === heldTypeId) upper.setType("minecraft:air");
    } catch {
      // Best-effort rollback.
    }
    return message(player, `Could not stack the pillar: ${error}`);
  }

  try {
    anchor.dimension.playSound("use.stone", particleLocation(anchor), { volume: 0.8, pitch: 0.85 });
    spawnFloatingRune(anchor.dimension, color, particleLocation(anchor));
  } catch {
    // Stacking remains valid if effects cannot play.
  }
  message(player, "The Disenchanting Pillar is now two blocks high.");
}

function createOutputBook(storage, enchantment, preview) {
  const book = new ItemStack("minecraft:enchanted_book", 1);
  const enchantable = book.getComponent("minecraft:enchantable");
  if (!enchantable || !enchantable.canAddEnchantment(enchantment)) return undefined;
  enchantable.addEnchantment(enchantment);
  if (preview) {
    const settings = getSettings();
    const cost = calculateCost(enchantment, settings);
    book.setLore([
      `§bDisenchant: ${describeEnchantment(enchantment)}`,
      `§7Cost: ${formatCost(cost)} + ${formatAmethystCost(settings)} + 1 blank book`,
      "§aTake or shift-click to complete",
    ]);
    book.setDynamicProperty("adp:preview", true);
    book.setDynamicProperty("adp:station_id", storage.id);
    book.setDynamicProperty("adp:enchantment_id", enchantment.type.id);
  }
  return book;
}

function generatedItemMatches(item, typeId, storageId, enchantmentId) {
  return item?.typeId === typeId
    && item.getDynamicProperty("adp:station_id") === storageId
    && item.getDynamicProperty("adp:enchantment_id") === enchantmentId;
}

function rebuildGeneratedSlots(storage, container) {
  const state = getState(storage);
  const source = container.getItem(SOURCE_SLOT);
  const fingerprint = sourceFingerprint(source);
  if (state.sourceFingerprint !== fingerprint) {
    state.sourceFingerprint = fingerprint;
    state.selectedId = undefined;
    state.page = 0;
  }

  const enchantments = getEnchantments(source).slice(0, MAX_ENCHANTMENT_CHOICES);
  if (!enchantments.some((enchantment) => enchantment.type.id === state.selectedId)) state.selectedId = undefined;
  const maximumPage = Math.max(0, Math.ceil(enchantments.length / CHOICES_PER_PAGE) - 1);
  state.page = Math.max(0, Math.min(maximumPage, Number(state.page) || 0));
  const visibleEnchantments = enchantments.slice(state.page * CHOICES_PER_PAGE, (state.page + 1) * CHOICES_PER_PAGE);

  for (let slot = FIRST_CHOICE_SLOT; slot <= LAST_VISIBLE_CHOICE_SLOT; slot += 1) {
    const enchantment = visibleEnchantments[slot - FIRST_CHOICE_SLOT];
    if (!enchantment) {
      if (isChoiceItem(container.getItem(slot))) container.setItem(slot, undefined);
      continue;
    }
    const selected = enchantment.type.id === state.selectedId;
    const expectedType = selected ? SELECTED_ITEM_ID : CHOICE_ITEM_ID;
    const current = container.getItem(slot);
    if (!generatedItemMatches(current, expectedType, storage.id, enchantment.type.id)) {
      container.setItem(slot, createChoiceItem(storage, enchantment, selected));
    }
  }

  const previous = container.getItem(PREVIOUS_PAGE_SLOT);
  if (state.page > 0) {
    if (!pageItemMatches(previous, storage.id, -1)) container.setItem(PREVIOUS_PAGE_SLOT, createPageItem(storage, -1));
  } else if (isChoiceItem(previous)) container.setItem(PREVIOUS_PAGE_SLOT, undefined);

  const next = container.getItem(NEXT_PAGE_SLOT);
  if (state.page < maximumPage) {
    if (!pageItemMatches(next, storage.id, 1)) container.setItem(NEXT_PAGE_SLOT, createPageItem(storage, 1));
  } else if (isChoiceItem(next)) container.setItem(NEXT_PAGE_SLOT, undefined);

  for (let slot = AMETHYST_SLOT + 1; slot <= LAST_CHOICE_SLOT; slot += 1) {
    if (isChoiceItem(container.getItem(slot))) container.setItem(slot, undefined);
  }

  const selected = enchantments.find((enchantment) => enchantment.type.id === state.selectedId);
  const currentOutput = container.getItem(OUTPUT_SLOT);
  if (!selected) {
    if (isPreviewItem(currentOutput)) container.setItem(OUTPUT_SLOT, undefined);
    return;
  }
  if (!generatedItemMatches(currentOutput, "minecraft:enchanted_book", storage.id, selected.type.id)) {
    container.setItem(OUTPUT_SLOT, createOutputBook(storage, selected, true));
  }
}

function canAfford(player, cost) {
  return player.getGameMode() === GameMode.Creative || player.level >= cost.levels;
}

function decrementBooks(books) {
  if (books.amount <= 1) return undefined;
  const remaining = books.clone();
  remaining.amount -= 1;
  return remaining;
}

function decrementAmethyst(amethyst, amount) {
  if (amount <= 0 || !amethyst) return amethyst;
  if (amethyst.amount <= amount) return undefined;
  const remaining = amethyst.clone();
  remaining.amount -= amount;
  return remaining;
}

function rebuildSourceWithoutAnvilHistory(source, removedEnchantmentId) {
  // Bedrock does not expose the vanilla anvil prior-work penalty to scripts.
  // Constructing a fresh stack is the only stable way to prevent that hidden
  // value from compounding when a player extracts and later reapplies books.
  const rebuilt = new ItemStack(source.typeId, source.amount);

  rebuilt.nameTag = source.nameTag;
  rebuilt.keepOnDeath = source.keepOnDeath;
  rebuilt.lockMode = source.lockMode;
  rebuilt.setLore(source.getRawLore());
  rebuilt.setCanDestroy(source.getCanDestroy());
  rebuilt.setCanPlaceOn(source.getCanPlaceOn());

  const dynamicProperties = {};
  for (const id of source.getDynamicPropertyIds()) {
    dynamicProperties[id] = source.getDynamicProperty(id);
  }
  if (Object.keys(dynamicProperties).length > 0) rebuilt.setDynamicProperties(dynamicProperties);

  const sourceDurability = source.getComponent("minecraft:durability");
  const rebuiltDurability = rebuilt.getComponent("minecraft:durability");
  if (sourceDurability && rebuiltDurability) rebuiltDurability.damage = sourceDurability.damage;

  const sourceDyeable = source.getComponent("minecraft:dyeable");
  const rebuiltDyeable = rebuilt.getComponent("minecraft:dyeable");
  if (sourceDyeable && rebuiltDyeable) rebuiltDyeable.color = sourceDyeable.color;

  const remainingEnchantments = getEnchantments(source)
    .filter((enchantment) => enchantment.type.id !== removedEnchantmentId);
  const rebuiltEnchantable = rebuilt.getComponent("minecraft:enchantable");
  if (remainingEnchantments.length > 0) {
    if (!rebuiltEnchantable) throw new Error("The rebuilt source item is not enchantable.");
    rebuiltEnchantable.addEnchantments(remainingEnchantments);
  }

  return rebuilt;
}

function activateWorkstation(anchor, consumedAmethyst = false) {
  const dimension = anchor.dimension;
  const location = anchor.location;
  const effectLocation = particleLocation(anchor);
  try {
    workstationSections(anchor).forEach((section) => {
      section.setPermutation(section.permutation.withState("adp:powered", true));
    });
    dimension.playSound("respawn_anchor.charge", effectLocation, { volume: 1, pitch: 1.15 });
    dimension.playSound("random.orb", effectLocation, { volume: 1, pitch: 0.8 });
    if (consumedAmethyst) {
      dimension.playSound("break.amethyst_block", effectLocation, { volume: 1, pitch: 1 });
    }
  } catch {
    // Effects must not invalidate a completed transaction.
  }
  for (const delay of [0, 5, 10, 15, 20]) {
    system.runTimeout(() => {
      try {
        dimension.spawnParticle("adp:disenchanting_burst", effectLocation);
        spawnFloatingRune(dimension, runeColor(anchor), effectLocation);
      } catch {
        // The chunk may have unloaded.
      }
    }, delay);
  }
  system.runTimeout(() => {
    try {
      const currentAnchor = findWorkstationAnchor(dimension.getBlock(location));
      if (!currentAnchor) return;
      workstationSections(currentAnchor).forEach((section) => {
        section.setPermutation(section.permutation.withState("adp:powered", false));
      });
    } catch {
      // The block may have unloaded.
    }
  }, 30);
}

function baseForStorage(storage) {
  const { x, y, z } = storage.location;
  const block = storage.dimension.getBlock({ x: Math.floor(x), y: Math.floor(y), z: Math.floor(z) });
  return findWorkstationAnchor(block);
}

function commitDisenchantment(player, storage, enchantmentId, destinationSlot) {
  const container = getStorageInventory(storage);
  const playerInventory = player.getComponent("minecraft:inventory")?.container;
  if (!container || !playerInventory) return;
  const sourceOriginal = container.getItem(SOURCE_SLOT);
  const booksOriginal = container.getItem(BOOK_SLOT);
  const amethystOriginal = container.getItem(AMETHYST_SLOT);
  if (!sourceOriginal) return message(player, "The item slot is empty.", "§c");
  if (!booksOriginal || booksOriginal.typeId !== "minecraft:book") return message(player, "Place at least one blank book in the books slot.", "§c");
  const selected = getEnchantments(sourceOriginal).find((enchantment) => enchantment.type.id === enchantmentId);
  if (!selected) return message(player, "That enchantment is no longer on the source item.", "§c");
  const settings = getSettings();
  const cost = calculateCost(selected, settings);
  if (settings.amethystCost > 0 && (amethystOriginal?.typeId !== "minecraft:amethyst_shard" || amethystOriginal.amount < settings.amethystCost)) {
    return message(player, `Place ${formatAmethystCost(settings)} in the Amethyst Shards slot.`, "§c");
  }
  if (!canAfford(player, cost)) return message(player, `You need ${formatCost(cost)}.`, "§c");

  let outputSlot = destinationSlot;
  if (outputSlot === undefined || playerInventory.getItem(outputSlot)) {
    outputSlot = undefined;
    for (let slot = 0; slot < playerInventory.size; slot += 1) {
      if (!playerInventory.getItem(slot)) {
        outputSlot = slot;
        break;
      }
    }
  }
  if (outputSlot === undefined) return message(player, "Make one empty inventory slot before disenchanting.", "§c");

  const outputBook = createOutputBook(storage, selected, false);
  if (!outputBook) return message(player, "Minecraft will not accept that enchantment on a book.", "§c");
  let updatedSource;
  try {
    updatedSource = rebuildSourceWithoutAnvilHistory(sourceOriginal, selected.type.id);
  } catch (error) {
    console.warn(`[Disenchanting Pillar] Could not reset anvil history for ${player.name}: ${error}`);
    return message(player, `This item's data could not be preserved safely: ${error}`, "§c");
  }
  const finalSource = updatedSource.typeId === "minecraft:enchanted_book" && getEnchantments(updatedSource).length === 0
    ? new ItemStack("minecraft:book", 1)
    : updatedSource;
  const remainingBooks = decrementBooks(booksOriginal);
  const remainingAmethyst = decrementAmethyst(amethystOriginal, settings.amethystCost);
  const chargeXp = player.getGameMode() !== GameMode.Creative;
  const originalXp = player.getTotalXp();

  try {
    container.setItem(SOURCE_SLOT, finalSource);
    container.setItem(BOOK_SLOT, remainingBooks);
    container.setItem(AMETHYST_SLOT, remainingAmethyst);
    if (chargeXp) player.addLevels(-cost.levels);
    playerInventory.setItem(outputSlot, outputBook);
  } catch (error) {
    console.warn(`[Disenchanting Pillar] Transaction failed for ${player.name}: ${error}`);
    container.setItem(SOURCE_SLOT, sourceOriginal);
    container.setItem(BOOK_SLOT, booksOriginal);
    container.setItem(AMETHYST_SLOT, amethystOriginal);
    try {
      playerInventory.setItem(outputSlot, undefined);
      const missingXp = chargeXp ? originalXp - player.getTotalXp() : 0;
      if (missingXp > 0) player.addExperience(missingXp);
    } catch {
      // Best-effort rollback if the player disconnected.
    }
    return message(player, `Disenchantment was rolled back: ${error}`, "§c");
  }

  const state = getState(storage);
  state.selectedId = undefined;
  state.sourceFingerprint = sourceFingerprint(finalSource);
  const base = baseForStorage(storage);
  if (base) activateWorkstation(base, settings.amethystCost > 0);
  message(player, `${describeEnchantment(selected)} disenchanted for ${formatCost(cost)} and ${formatAmethystCost(settings)}.`, "§a");
}

function handleChoiceTaken(player, item) {
  const stationId = item.getDynamicProperty("adp:station_id");
  const enchantmentId = item.getDynamicProperty("adp:enchantment_id");
  const pageDelta = item.getDynamicProperty("adp:page_delta");
  if (typeof stationId !== "string") return;
  const storage = resolveGeneratedItemStorage(player, stationId);
  if (!storage) return message(player, "That selector is no longer linked to a nearby pillar. Reopen the pillar.", "§c");
  if (typeof pageDelta === "number" && pageDelta !== 0) {
    const state = getState(storage);
    state.page = Math.max(0, state.page + Math.sign(pageDelta));
    return;
  }
  if (typeof enchantmentId !== "string") return;
  const source = getStorageInventory(storage)?.getItem(SOURCE_SLOT);
  const enchantment = getEnchantments(source).find((entry) => entry.type.id === enchantmentId);
  if (!enchantment) return;
  getState(storage).selectedId = enchantmentId;
  const cost = calculateCost(enchantment, getSettings());
  message(player, `${describeEnchantment(enchantment)} selected — ${formatCost(cost)} and ${formatAmethystCost()}.`, "§b");
}

function handlePreviewTaken(player, item, destinationSlot) {
  const stationId = item.getDynamicProperty("adp:station_id");
  const enchantmentId = item.getDynamicProperty("adp:enchantment_id");
  if (typeof stationId !== "string" || typeof enchantmentId !== "string") return;
  const storage = resolveGeneratedItemStorage(player, stationId);
  if (!storage) return message(player, "That output is no longer linked to a nearby pillar. Reopen the pillar.", "§c");
  commitDisenchantment(player, storage, enchantmentId, destinationSlot);
}

function scanPlayerForGeneratedItems(player) {
  try {
    const cursor = player.getComponent("minecraft:cursor_inventory");
    const cursorItem = cursor?.item;
    if (isChoiceItem(cursorItem)) {
      cursor.clear();
      handleChoiceTaken(player, cursorItem);
    } else if (isPreviewItem(cursorItem)) {
      cursor.clear();
      handlePreviewTaken(player, cursorItem, undefined);
    }

    const inventory = player.getComponent("minecraft:inventory")?.container;
    if (!inventory) return;
    for (let slot = 0; slot < inventory.size; slot += 1) {
      const item = inventory.getItem(slot);
      if (isChoiceItem(item)) {
        inventory.setItem(slot, undefined);
        handleChoiceTaken(player, item);
      } else if (isPreviewItem(item)) {
        inventory.setItem(slot, undefined);
        handlePreviewTaken(player, item, slot);
      }
    }
  } catch {
    // The player may have closed the screen or disconnected mid-tick.
  }
}

function processStorage(storage) {
  try {
    const base = baseForStorage(storage);
    if (base && storage.getDynamicProperty("adp:storage_schema") !== STORAGE_SCHEMA) {
      storage = replaceLegacyStorage(base, storage);
    }
    const container = getStorageInventory(storage);
    if (!container) return;
    storage.nameTag = CONTAINER_TITLE;
    sanitizeContainer(storage, container);
    rebuildGeneratedSlots(storage, container);
  } catch {
    // Ignore invalid or unloading entities.
  }
}

export async function showAdminMenu(player) {
  if (!isOperator(player)) return message(player, "Only world operators can change pillar costs.", "§c");
  const current = getSettings();
  const response = await new ModalFormData()
    .title("Pillar Cost Settings")
    .header("Base level costs by rarity")
    .slider("Common base", 0, 10, { defaultValue: current.commonBase, valueStep: 1 })
    .slider("Uncommon base", 0, 10, { defaultValue: current.uncommonBase, valueStep: 1 })
    .slider("Rare base", 0, 10, { defaultValue: current.rareBase, valueStep: 1 })
    .slider("Very rare base", 0, 10, { defaultValue: current.veryRareBase, valueStep: 1 })
    .slider("Extra levels per enchantment level above I", 0, 4, { defaultValue: current.perLevel, valueStep: 1 })
    .divider()
    .slider("Minimum base level cost", 0, 10, { defaultValue: current.minimum, valueStep: 1 })
    .slider("Maximum base level cost", 1, 10, { defaultValue: current.maximum, valueStep: 1 })
    .divider()
    .slider("Mending surcharge (XP levels)", 0, 100, { defaultValue: current.mendingExtraLevels, valueStep: 1 })
    .slider("Curse surcharge (XP levels)", 0, 100, { defaultValue: current.curseExtraLevels, valueStep: 1 })
    .divider()
    .slider("Amethyst shards per disenchantment", 0, 64, { defaultValue: current.amethystCost, valueStep: 1 })
    .toggle("Reset all settings to defaults", { defaultValue: false })
    .submitButton("Save global settings")
    .show(player);
  if (response.canceled || !response.formValues) return;
  const [commonBase, uncommonBase, rareBase, veryRareBase, perLevel, minimum, maximum, mendingExtraLevels, curseExtraLevels, amethystCost, shouldReset] = response.formValues;
  const saved = shouldReset
    ? resetSettings()
    : saveSettings({ commonBase, uncommonBase, rareBase, veryRareBase, perLevel, minimum, maximum, mendingExtraLevels, curseExtraLevels, amethystCost });
  message(player, shouldReset ? "Costs reset to defaults." : `Costs saved. Normal bounds are ${saved.minimum}–${saved.maximum} levels.`, "§a");
}

function dropStorage(storage) {
  const container = getStorageInventory(storage);
  if (container) {
    for (let slot = 0; slot < container.size; slot += 1) {
      const item = container.getItem(slot);
      if (!item) continue;
      container.setItem(slot, undefined);
      if (!isChoiceItem(item) && !isPreviewItem(item)) storage.dimension.spawnItem(item, storage.location);
    }
  }
  activeUsers.delete(storage.id);
  stationStates.delete(storage.id);
  storage.remove();
}

function storagesAt(block) {
  const key = blockKey(block);
  const candidates = block.dimension.getEntities({
    type: STORAGE_ID,
    location: storageLocation(block),
    maxDistance: 0.75,
  });
  const exact = candidates.filter((storage) => storage.getDynamicProperty("adp:block_key") === key);
  return exact.length > 0 ? exact : candidates.filter((storage) => !storage.getDynamicProperty("adp:block_key"));
}

function rejectPillarPlacement(event, reason) {
  const typeId = event.block.typeId;
  event.block.setType("minecraft:air");
  if (event.player.getGameMode() !== GameMode.Creative) returnToPlayer(event.player, new ItemStack(typeId, 1));
  message(event.player, reason, "§c");
}

world.afterEvents.playerPlaceBlock.subscribe((event) => {
  try {
    if (event.block.typeId === LEGACY_PILLAR_ID) {
      const migrated = migrateLegacyPillar(event.block);
      if (migrated) ensureStorage(migrated);
      return;
    }
    if (isAltarId(event.block.typeId)) {
      ensureStorage(event.block);
      return;
    }
    if (!isPillarId(event.block.typeId)) return;

    const below = blockAtHeight(event.block, -1);
    if (below?.typeId === event.block.typeId && stackPart(below) === "upper") {
      rejectPillarPlacement(event, "A Disenchanting Pillar can be no more than two blocks high.");
      return;
    }
    if (below?.typeId === event.block.typeId && ["single", "lower"].includes(stackPart(below))) {
      const color = runeColor(below);
      const powered = below.permutation.getState("adp:powered") === true;
      setPillarPart(below, below.typeId, "lower", powered, color);
      setPillarPart(event.block, event.block.typeId, "upper", powered, color);
      ensureStorage(below);
      return;
    }

    setPillarPart(event.block, event.block.typeId, "single", false, runeColor(event.block));
    ensureStorage(event.block);
  } catch (error) {
    if (isWorkstationId(event.block.typeId)) {
      const typeId = event.block.typeId;
      try {
        event.block.setType("minecraft:air");
      } catch {
        // Best-effort cleanup.
      }
      if (event.player.getGameMode() !== GameMode.Creative) returnToPlayer(event.player, new ItemStack(typeId, 1));
    }
    message(event.player, `Storage initialization failed: ${error}`, "§c");
  }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const typeId = event.brokenBlockPermutation.type.id;
  const { x, y, z } = event.block.location;

  if (typeId === LEGACY_PILLAR_ID) {
    const part = event.brokenBlockPermutation.getState("adp:part");
    const baseY = y - (part === "top" ? 2 : part === "middle" ? 1 : 0);
    for (let offset = 0; offset < 3; offset += 1) {
      const section = event.dimension.getBlock({ x, y: baseY + offset, z });
      if (section?.typeId === LEGACY_PILLAR_ID) section.setType("minecraft:air");
    }
    const legacyBase = { dimension: event.dimension, location: { x, y: baseY, z } };
    storagesAt(legacyBase).forEach(dropStorage);
    return;
  }

  if (isAltarId(typeId)) {
    const removed = { dimension: event.dimension, location: { x, y, z } };
    storagesAt(removed).forEach(dropStorage);
    return;
  }
  if (!isPillarId(typeId)) return;

  const part = event.brokenBlockPermutation.getState("adp:stack_part");
  if (part === "upper") {
    const lower = event.dimension.getBlock({ x, y: y - 1, z });
    if (lower?.typeId === typeId && stackPart(lower) === "lower") {
      setPillarPart(lower, typeId, "single", lower.permutation.getState("adp:powered") === true, runeColor(lower));
    }
    return;
  }

  const removed = { dimension: event.dimension, location: { x, y, z } };
  const storageEntities = storagesAt(removed);
  if (part === "lower") {
    const upper = event.dimension.getBlock({ x, y: y + 1, z });
    if (upper?.typeId === typeId && stackPart(upper) === "upper") {
      setPillarPart(upper, typeId, "single", upper.permutation.getState("adp:powered") === true, runeColor(upper));
      for (const storage of storageEntities) {
        storage.teleport(storageLocation(upper));
        storage.setDynamicProperty("adp:block_key", blockKey(upper));
      }
      return;
    }
  }
  storageEntities.forEach(dropStorage);
});

world.beforeEvents.playerInteractWithEntity.subscribe((event) => {
  if (event.target.typeId !== STORAGE_ID) return;
  const storage = event.target;
  const player = event.player;
  const heldTypeId = event.itemStack?.typeId ?? heldItem(player)?.typeId;
  const base = baseForStorage(storage);
  if (isPillarId(base?.typeId) && isPillarId(heldTypeId)) {
    event.cancel = true;
    system.run(() => stackPillar(player, baseForStorage(storage), heldTypeId));
    return;
  }
  const dye = dyeForItem(event.itemStack ?? heldItem(player));
  if (!dye && player.isSneaking && isOperator(player)) {
    event.cancel = true;
    system.run(() => showAdminMenu(player).catch((error) => message(player, `Could not open settings: ${error}`, "§c")));
    return;
  }
  if (!dye) return;
  event.cancel = true;
  system.run(() => {
    const currentDye = heldDye(player);
    if (!currentDye || currentDye.item.typeId !== dye.item.typeId) return;
    dyeWorkstation(player, baseForStorage(storage), currentDye);
  });
});

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  if (event.target.typeId !== STORAGE_ID) return;
  activeUsers.set(event.target.id, { storage: event.target, playerId: event.player.id, tick: system.currentTick });
  processStorage(event.target);
});

world.beforeEvents.playerInteractWithBlock.subscribe((event) => {
  if (
    event.isFirstEvent === false
    || (!isWorkstationId(event.block.typeId) && event.block.typeId !== LEGACY_PILLAR_ID)
  ) {
    return;
  }

  const player = event.player;
  const heldTypeId = event.itemStack?.typeId ?? heldItem(player)?.typeId;
  const wantsStack = isPillarId(event.block.typeId) && isPillarId(heldTypeId);
  const dye = dyeForItem(event.itemStack ?? heldItem(player));
  const wantsAdmin = !dye && player.isSneaking && isOperator(player);
  if (!wantsStack && !dye && !wantsAdmin) return;

  const dimension = event.block.dimension;
  const location = { ...event.block.location };
  event.cancel = true;
  system.run(() => {
    const base = findWorkstationAnchor(dimension.getBlock(location));
    if (!base) return message(player, "This disenchanting workstation is incomplete.");
    if (wantsStack) {
      stackPillar(player, base, heldTypeId);
      return;
    }
    const currentDye = heldDye(player);
    if (dye && currentDye?.item.typeId === dye.item.typeId) {
      dyeWorkstation(player, base, currentDye);
      return;
    }
    if (wantsAdmin) {
      showAdminMenu(player).catch((error) => message(player, `Could not open settings: ${error}`));
    }
  });
});

world.afterEvents.playerInteractWithBlock.subscribe((event) => {
  if (event.isFirstEvent === false || (!isWorkstationId(event.block.typeId) && event.block.typeId !== LEGACY_PILLAR_ID)) return;
  const base = findWorkstationAnchor(event.block);
  if (!base) return message(event.player, "This disenchanting workstation is incomplete.", "§c");
  system.run(() => {
    if (!ensureWorkstation(base)) return message(event.player, "This disenchanting workstation could not initialize.", "§c");
    const dye = heldDye(event.player);
    if (dye) {
      dyeWorkstation(event.player, base, dye);
      return;
    }
    if (event.player.isSneaking && isOperator(event.player)) {
      showAdminMenu(event.player).catch((error) => message(event.player, `Could not open settings: ${error}`, "§c"));
      return;
    }
    ensureStorage(base);
    message(event.player, `Interact with the ${workstationName(base)} body to open the Disenchanting interface.`);
  });
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id !== "adp:admin") return;
  const source = event.sourceEntity;
  if (!source || source.typeId !== "minecraft:player") return;
  system.run(() => showAdminMenu(source).catch((error) => message(source, `Could not open settings: ${error}`, "§c")));
});

system.runInterval(() => {
  for (const player of world.getAllPlayers()) scanPlayerForGeneratedItems(player);
  for (const dimensionId of ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]) {
    try {
      const dimension = world.getDimension(dimensionId);
      for (const storage of dimension.getEntities({ type: STORAGE_ID })) processStorage(storage);
    } catch {
      // Dimension may be unavailable during startup.
    }
  }
  for (const [storageId, session] of activeUsers) {
    if (system.currentTick - session.tick > SESSION_TIMEOUT_TICKS) activeUsers.delete(storageId);
  }
}, 2);

system.runInterval(() => {
  for (const dimensionId of ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]) {
    try {
      const dimension = world.getDimension(dimensionId);
      for (const storage of dimension.getEntities({ type: STORAGE_ID })) {
        if (Math.random() > 0.72) continue;
        const anchor = baseForStorage(storage);
        if (!anchor) continue;
        if (!workstationHasNearbyPlayer(storage, dimensionId)) continue;
        spawnFloatingRuneCluster(dimension, runeColor(anchor), particleLocation(anchor));
      }
    } catch {
      // Ambient visuals may be skipped while a dimension or chunk is unloading.
    }
  }
}, 24);

system.runInterval(() => {
  for (const dimensionId of ["minecraft:overworld", "minecraft:nether", "minecraft:the_end"]) {
    try {
      const dimension = world.getDimension(dimensionId);
      for (const storage of dimension.getEntities({ type: STORAGE_ID })) {
        const base = baseForStorage(storage);
        if (!base) dropStorage(storage);
      }
    } catch {
      // Ignore unloaded chunks.
    }
  }
}, 1200);

export { DEFAULT_SETTINGS };
