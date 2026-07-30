# Andy's Disenchanting Pillar - Detailed Add-on Description

## Overview

Andy's Disenchanting Pillar adds a focused reverse-enchanting workstation to Minecraft Bedrock. Instead of destroying enchantments with a grindstone or forcing the player to keep an unwanted combination, the pillar separates one chosen enchantment from a tool, weapon, armor piece, or enchanted book and stores it in a new enchanted book.

The feature is deliberately not free. Every extraction requires an ordinary book, amethyst shards, and XP levels. The cost depends on the enchantment's rarity and level, with additional penalties for Mending and curses. This makes the workstation useful enough to recover valuable enchantments while preserving the progression and resource pressure of survival gameplay instead of becoming a game-breaking source of effortless enchantments.

## The player experience

The pillar and altar behave like dedicated workstations rather than chat-command utilities. Interacting with any part of either model opens a purpose-built container interface containing:

- **Item:** one enchanted source item.
- **Books:** up to 64 ordinary books.
- **Amethyst Shards:** up to 64 amethyst shards.
- **Enchantments:** named rows generated from the source item.
- **Output:** a preview of the selected enchanted book.

The enchantment rows show exactly what can be removed and what it will cost. Four rows are visible at once. Items with more enchantments receive previous and next page controls. Selecting a row highlights it and creates a preview, but consumes nothing. The player can freely change the selection until satisfied.

Taking the output book is the commitment action. At that moment the pillar validates the source, materials, XP, selected enchantment, player inventory, and output compatibility. Only after those checks succeed does it remove the enchantment, consume the resources, charge XP, and deliver a clean enchanted book.

## What the pillar needs

For a normal extraction, the player supplies:

1. One item containing at least one enchantment.
2. One ordinary book for the enchantment being removed.
3. Eight amethyst shards by default.
4. Enough XP levels for the selected enchantment.
5. One open player-inventory slot for the completed book.

The pillar can store stacks of books and shards, so several enchantments can be removed one after another without reopening or reloading the workstation.

## Cost and balance

Normal enchantments use a rarity-and-level formula. Common enchantments begin at one level, Uncommon at two, Rare at three, and Very Rare at four. Each enchantment level above I adds one level, with the normal result clamped between one and four levels by default.

Two special rules apply after that normal calculation:

- **Mending:** adds five XP levels by default.
- **Curse of Binding or Curse of Vanishing:** adds thirty XP levels by default.

The default eight-amethyst material cost is paid in addition to XP and one book. This recurring cost keeps the workstation from turning every unwanted enchanted drop into effortless permanent value.

Operators can adjust all rarity bases, per-level scaling, normal bounds, special surcharges, and the amethyst requirement. Settings apply globally to every pillar and altar in the world.

## Mid-game progression

The pillar is intended to become available after the player has established basic mining, enchanting, Nether access, and exploration progress.

```text
Amethyst Shard | Lapis Block      | Amethyst Shard
Copper Ingot   | Enchanting Table | Copper Ingot
Body Material  | Obsidian         | Body Material
```

The recipe requires diamonds indirectly through the enchanting table, plus lapis, amethyst, copper, obsidian, and two matching hard blocks. Forty-eight stone, masonry, earthen, quartz, Nether, and ocean materials are supported. The body material becomes permanent when crafted.

A single placed pillar is a complete one-block workstation. To create the tall form, craft a second pillar from the same body material, hold it, and interact with the placed pillar. The held item is consumed outside Creative mode and the model becomes a coordinated two-block workstation. A matching altar is crafted shapelessly from the material pillar, two copper ingots, and one amethyst shard.

All three forms disenchant items identically. Their interface, storage, costs, rune dyes, output, and operator settings are shared. Pillars stack to a maximum of two blocks; the altar remains one block. The choice is architectural rather than mechanical.

## Enchanted items and books

The pillar removes only the enchantment selected by the player. Every other enchantment remains on the source.

Example:

```text
Source Diamond Pickaxe
- Efficiency V
- Fortune III
- Unbreaking III
- Mending I

Selected: Fortune III

Resulting Pickaxe
- Efficiency V
- Unbreaking III
- Mending I

Output
- Enchanted Book: Fortune III
```

An enchanted book containing several enchantments can also be separated one enchantment at a time. When its final enchantment is extracted, the empty source becomes an ordinary book.

## Reapplying extracted enchantments

The resulting books are normal enchanted books and can be used with a vanilla anvil. The add-on also addresses Minecraft's hidden prior-work penalty. Without this handling, repeatedly removing and reapplying an enchantment can make the vanilla anvil price grow to unrealistic values.

On a successful extraction, the pillar creates a fresh source stack and restores the script-accessible item data and all remaining enchantments. The output book is also newly created. This resets the hidden anvil history while preserving the normal visible properties supported by the stable API.

## Physical storage and transaction safety

The workstation contents are real, persistent container contents. Players can drag and shift-click items using familiar inventory controls. Books and shards remain stored between uses and through chunk unloading.

Generated enchantment rows and output previews are temporary control objects, not rewards. The add-on continuously removes or routes them if they are moved out of their intended slots. Breaking a pillar drops only genuine player-supplied contents and never drops generated selector items.

The extraction process follows a validation-first transaction. Missing books, missing shards, insufficient XP, a changed source item, a missing enchantment, a full inventory, or an incompatible output cancels the operation before resources are consumed. Runtime failures trigger a best-effort rollback.

## Appearance and feedback

The add-on offers a compact pillar, stacked two-block pillar, and amethyst-focused altar. Each uses original cube geometry with Minecraft's built-in material, copper, and amethyst textures. Custom rune channels emit light continuously, and the workstation becomes brighter during a successful extraction.

The transaction produces:

- Magical activation sounds.
- The sound of amethyst breaking when shards are consumed.
- Dye-matched floating runes and a short extraction burst.
- A temporary increase in light emission.

Every vanilla dye can recolor the runes. Holding dye and interacting with a pillar or altar updates all coordinated sections and consumes one dye outside Creative mode.

The resource pack is compatible with Vibrant Visuals. A pixel-accurate MER mask makes only the carved runes and amethyst focus emissive. A faint, intermittent non-emissive glint crosses the main surfaces without turning the entire model into a constant glow. Classic and Fancy graphics continue to use the normal color textures.

## Guide and accessibility

Every player receives a signed CWES Pillar Guide when first joining with the current guide revision. It explains crafting, slot placement, enchantment selection, costs, extraction, rune dyeing, and operator controls.

Replacement guides are survival-craftable:

```text
1 Book + 1 Amethyst Shard = Pillar Guide
```

The interface displays enchantment names and costs directly, reducing reliance on hidden tooltips or memorized rules.

## Operator controls

Operators can sneak-interact with a pillar while not holding dye, or run:

```text
/scriptevent adp:admin
```

A replacement guide can be requested with:

```text
/scriptevent adp:guide
```

Normal players cannot alter the global cost settings.

## Technical requirements

The add-on contains both a behavior pack and a resource pack. The behavior pack supplies generated workstation blocks, stacking behavior, storage, recipes, the cost engine, guide generation, transactions, and operator screen. The resource pack supplies original pillar and altar geometry, PBR rune textures, particles, icons, and the conditional container interface.

It targets Minecraft Bedrock engine version 1.26.0 or newer and stable `@minecraft/server` 2.8.0 plus `@minecraft/server-ui` 2.1.0. Experimental gameplay toggles are not intended.

## Compatibility note

Standard vanilla tools, weapons, armor, and books are the primary target. Bedrock's stable Script API does not expose every hidden item field. Unusual third-party items, armor with data not exposed to scripts, or heavily customized items should be tested in a copy of the world before long-term use.

## Design philosophy

The pillar is meant to solve three survival frustrations without erasing progression:

- Valuable enchantments should be recoverable.
- The player should choose exactly what is removed.
- Recovery should still cost meaningful resources.

The result is a controlled conservation system: enchantments move, but they are never duplicated by the pillar.
