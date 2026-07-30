# Andy's Disenchanting Pillar v1.6.5

This is the first public release of **Andy's Disenchanting Pillar** for Minecraft Bedrock.

## Added

- Extract one selected enchantment at a time into a reusable enchanted book.
- Preserve the source item and every enchantment that was not selected.
- Support enchanted tools, weapons, armor, and multi-enchantment books.
- Convert an emptied enchanted book back into an ordinary book.
- Use a container-style interface with Item, Books, Amethyst Shards, Enchantments, and Output areas.
- Preview an extraction and its complete cost before consuming anything.
- Commit the transfer by taking or shift-clicking the previewed output book.
- Prevent hidden vanilla prior-work history from producing runaway anvil prices after extraction.

## Workstations

- Added a complete one-block **Disenchanting Pillar**.
- Added a coordinated two-block **Tall Disenchanting Pillar** assembled from two matching pillars.
- Added a one-block lectern-shaped **Disenchanting Altar**.
- All three forms use the same interface, storage, costs, enchantment rules, and operator settings; their differences are aesthetic.
- Added 48 craft-selected body materials using Minecraft's built-in stone, masonry, earthen, quartz, Nether, basalt, and prismarine textures.

## Crafting

### Compact pillar

```text
Amethyst Shard | Lapis Block      | Amethyst Shard
Copper Ingot   | Enchanting Table | Copper Ingot
Body Material  | Obsidian         | Body Material
```

The two matching body-material blocks determine the pillar's permanent appearance.

### Tall pillar

Craft two pillars from the same material. Place the first pillar, hold the second matching pillar, and interact with the placed pillar.

### Altar

```text
1 matching Disenchanting Pillar
2 Copper Ingots
1 Amethyst Shard
= 1 matching Disenchanting Altar
```

## Survival balance

- Each extraction consumes one ordinary book.
- Each extraction consumes eight amethyst shards by default.
- Normal enchantments cost between one and four XP levels by default, based on rarity and enchantment level.
- Mending adds five XP levels.
- Curse of Binding and Curse of Vanishing add thirty XP levels.
- Costs are intentionally substantial so enchantment recovery remains useful without becoming game-breaking or replacing normal Survival enchanting, exploration, loot, and anvil progression.
- Operators can configure rarity costs, per-level scaling, normal minimum and maximum costs, Mending and curse surcharges, and the amethyst requirement.

## Appearance and feedback

- Added dyeable rune inscriptions supporting all 16 normal Minecraft dyes.
- Added dye-matched floating enchanting glyphs.
- Added restrained rune and amethyst emission for Vibrant Visuals.
- Added a faint intermittent surface glint without a constant full-body enchanted shimmer.
- Added extraction particles, activation sounds, and an amethyst-breaking sound when shards are consumed.
- Added synchronized rune colors across both halves of a tall pillar.

## Guide and administration

- Added a signed CWES field guide delivered to each player on first load.
- Added a replacement guide recipe using one ordinary book and one amethyst shard.
- Added the operator settings command:

```text
/scriptevent adp:admin
```

- Added the replacement-guide command:

```text
/scriptevent adp:guide
```

## Compatibility

- Supports Minecraft Bedrock 1.26.0 or newer.
- Uses stable Script APIs.
- Requires no experimental gameplay toggles.
- Supports Vibrant Visuals, Classic, and Fancy rendering.
- Includes both the required behavior pack and resource pack in one `.mcaddon` installer.

Back up important worlds before installing or updating any add-on.
