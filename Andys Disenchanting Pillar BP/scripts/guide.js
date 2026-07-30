import { ItemStack, system, world } from "@minecraft/server";

const GUIDE_MARKER = "adp:guide_received_v12";
const GUIDE_ITEM_ID = "adp:pillar_guide";

function addToPlayerOrDrop(player, itemStack) {
  const inventory = player.getComponent("minecraft:inventory")?.container;
  const remainder = inventory?.addItem(itemStack) ?? itemStack;
  if (remainder) player.dimension.spawnItem(remainder, player.location);
}

export function createGuideBook() {
  const guide = new ItemStack("minecraft:writable_book", 1);
  const book = guide.getComponent("minecraft:book");
  if (!book) throw new Error("The writable book component is unavailable.");

  const pages = [
    "§lANDY'S DISENCHANTING PILLAR§r\n\nCWES Field Guide\n\nMystic technology discovered by Donaldson more than seventy years ago.",
    "§lTHREE FORMS§r\n\nChoose a compact pillar, a two-block stacked pillar, or an amethyst-focused Disenchanting Altar. Every form has the same storage, costs, and function; the choice is aesthetic.",
    "§lPURPOSE§r\n\nEvery form separates one enchantment from an item and preserves it in an ordinary book. The enchantment is transferred, never duplicated.",
    "§lPILLAR CRAFTING§r\n\nA L A\nC E C\nB O B\n\nA: Amethyst Shard\nL: Lapis Block\nC: Copper Ingot\nE: Enchanting Table\nO: Obsidian\nB: one supported hard block",
    "§l48 MATERIALS§r\n\nThe two B positions choose the pillar body: stone, tuff, deepslate, quartz, sandstone, Nether masonry, prismarine, and many related variants.",
    "§lTALL PILLAR§r\n\nHold a second pillar of the same material and interact with the compact pillar. It is consumed to form the coordinated two-block workstation. Two blocks is the maximum.",
    "§lALTAR CRAFTING§r\n\nUse a shapeless recipe: 1 material pillar + 2 copper ingots + 1 amethyst shard. The result is the matching one-block Disenchanting Altar.",
    "§lOPEN THE WORKSTATION§r\n\nInteract with the pillar or altar body. Its container opens above your inventory. You can drag items or use shift-click.",
    "§lLOAD THE SLOTS§r\n\nItem: one enchanted item.\nBooks: ordinary books.\nAmethyst Shards: the configured shard cost.\nOutput: the selected enchanted-book preview.",
    "§lCHOOSE AN ENCHANTMENT§r\n\nSelect the named enchantment row to remove. Up to four rows show at once. Blue arrow runes appear only when more pages are available.",
    "§lEXTRACTION COST§r\n\nEach extraction uses 1 book and 8 amethyst shards by default, plus 1–4 XP levels. Mending adds 5 levels. Either curse adds 30 levels. Costs are deliberately high to protect Survival balance.",
    "§lDISENCHANT§r\n\nThe selected row turns green and its book appears in Output. Take or shift-click that book to complete. Selecting another row changes the preview for free.",
    "§lREAPPLYING§r\n\nUse a normal anvil to put an extracted enchantment back on an item. The workstation clears hidden prior-work history so repeated transfers do not create runaway anvil prices.",
    "§lREPLACEMENT GUIDE§r\n\nCraft an ordinary book with one amethyst shard. The result becomes a fresh copy of this CWES field guide.",
    "§lENCHANTED BOOKS§r\n\nBooks with several enchantments can be separated too. When the final enchantment is removed, the emptied source becomes an ordinary book.",
    "§lDYE THE RUNES§r\n\nHold any normal dye and interact with a pillar or altar. Both halves of a tall pillar update together. One dye is consumed outside Creative mode.",
    "§lMYSTIC GLOW§r\n\nThe carved runes and amethyst focus glow. Sparse enchanting glyphs float near every form, and their color follows the dye applied to the workstation.",
    "§lOPERATORS§r\n\nSneak-interact with a workstation or use this command to adjust XP and amethyst costs:\n/scriptevent adp:admin",
    "§lCWES NOTE§r\n\nWe know what the device does. We do not yet know why it obeys books, experience, and those impossible runes. — Donaldson Archive",
  ];

  pages.forEach((page, index) => book.setPageContent(index, page));
  guide.setLore(["§r§5A CWES field guide", "§r§7Mystic Technology Series"]);
  book.signBook("Pillar Guide", "CWES");
  return guide;
}

export function giveGuide(player, markReceived = false) {
  try {
    addToPlayerOrDrop(player, createGuideBook());
    if (markReceived) player.setDynamicProperty(GUIDE_MARKER, true);
    player.sendMessage("§5[Disenchanting Pillar]§r A CWES field guide has been added to your inventory.");
  } catch (error) {
    player.sendMessage(`§c[Disenchanting Pillar] Could not create the guide: ${error}`);
  }
}

world.afterEvents.playerSpawn.subscribe((event) => {
  if (!event.initialSpawn) return;
  const player = event.player;
  system.runTimeout(() => {
    try {
      if (!player.isValid || player.getDynamicProperty(GUIDE_MARKER) === true) return;
      giveGuide(player, true);
    } catch {
      // The player may have disconnected before delayed delivery.
    }
  }, 20);
});

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id !== "adp:guide") return;
  const player = event.sourceEntity;
  if (!player || player.typeId !== "minecraft:player") return;
  system.run(() => giveGuide(player));
});

function convertCraftedGuide(player) {
  const cursor = player.getComponent("minecraft:cursor_inventory");
  if (cursor?.item?.typeId === GUIDE_ITEM_ID) {
    cursor.clear();
    addToPlayerOrDrop(player, createGuideBook());
  }

  const inventory = player.getComponent("minecraft:inventory")?.container;
  if (!inventory) return;
  for (let slot = 0; slot < inventory.size; slot += 1) {
    if (inventory.getItem(slot)?.typeId === GUIDE_ITEM_ID) inventory.setItem(slot, createGuideBook());
  }
}

system.runInterval(() => {
  for (const player of world.getAllPlayers()) {
    try {
      convertCraftedGuide(player);
    } catch (error) {
      console.warn(`[Disenchanting Pillar] Could not convert a crafted guide for ${player.name}: ${error}`);
    }
  }
}, 5);
