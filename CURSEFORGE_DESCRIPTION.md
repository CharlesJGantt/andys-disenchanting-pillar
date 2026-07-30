# Andy's Disenchanting Pillar

**Save the enchantment you want without destroying the item—or getting the others along with it.**

Andy's Disenchanting Pillar adds a survival-balanced reverse-enchanting workstation to Minecraft Bedrock. Insert an enchanted tool, weapon, armor piece, or enchanted book; supply ordinary books and amethyst shards; select one exact enchantment; review the cost; and take the previewed enchanted book to complete the transfer.

The source item survives and keeps every enchantment you did not select.

This is intentionally not a free or early-game enchantment splitter. Preserving both the item and the removed enchantment is extremely powerful, so the workstation recipe and recurring book, amethyst, and XP costs are deliberately substantial. The goal is to add a valuable mid-game service without becoming game-breaking or making Survival enchanting, exploration, loot, or anvils irrelevant.

## What it does

- Extracts one chosen enchantment at a time.
- Works with vanilla enchanted tools, weapons, armor, and books.
- Preserves every unselected enchantment on the source.
- Produces a normal enchanted book that can be used in a vanilla anvil.
- Uses a physical container-style interface with drag and shift-click support.
- Shows the result and full cost before consuming anything.
- Rebuilds processed items to prevent hidden prior-work history from creating runaway anvil prices.
- Includes validation and best-effort rollback to protect items and resources.

## Three workstation forms

Choose the shape that fits your build:

- **Compact Disenchanting Pillar:** a complete one-block workstation.
- **Tall Disenchanting Pillar:** add a second matching pillar to create a coordinated two-block form.
- **Disenchanting Altar:** a one-block lectern-shaped alternative with a recessed amethyst focus.

All three forms work identically for disenchanting. They use the same interface, storage, costs, dye system, visual effects, and operator settings. The difference is aesthetic: compact and tall pillars suit monument-style builds, while the altar provides a one-block lectern-shaped alternative. Pillars can stack to a maximum of two blocks; altars do not stack.

## 48 vanilla-material variants

Craft the pillar from your preferred hard block. The add-on supports 48 body materials across stone, cobblestone, andesite, diorite, granite, tuff, deepslate, mud, calcite, dripstone, quartz, sandstone, Nether masonry, basalt, and prismarine families.

The models reference Minecraft's built-in material textures so they blend naturally into survival builds. Copper fittings, amethyst growths, and custom rune channels complete the Mystic workstation design.

| Family | Available materials |
|---|---|
| Stone | Stone, Smooth Stone, Cobblestone, Mossy Cobblestone, Stone Bricks, Mossy Stone Bricks, Cracked Stone Bricks, Chiseled Stone Bricks |
| Andesite | Andesite, Polished Andesite |
| Diorite | Diorite, Polished Diorite |
| Granite | Granite, Polished Granite |
| Tuff | Tuff, Polished Tuff, Tuff Bricks, Chiseled Tuff |
| Deepslate | Deepslate, Cobbled Deepslate, Polished Deepslate, Deepslate Bricks, Cracked Deepslate Bricks, Deepslate Tiles, Cracked Deepslate Tiles, Chiseled Deepslate |
| Earthen and mineral | Mud Bricks, Packed Mud, Calcite, Dripstone Block |
| Quartz | Quartz Block, Smooth Quartz, Quartz Bricks, Chiseled Quartz |
| Sandstone | Sandstone, Smooth Sandstone, Chiseled Sandstone, Cut Sandstone |
| Nether | Netherrack, Nether Bricks, Red Nether Bricks, Blackstone, Polished Blackstone, Polished Blackstone Bricks, Basalt, Polished Basalt |
| Ocean | Prismarine, Dark Prismarine |

## Dyeable glowing runes

Hold any of Minecraft's 16 normal dyes and interact with a pillar or altar to recolor its rune inscriptions and nearby floating glyphs. Both halves of a tall pillar remain synchronized.

Only the carved runes and amethyst focus emit light. The body keeps its normal block appearance. A faint non-emissive enchantment glint occasionally sweeps across the main faces.

Rune color is cosmetic. It does not alter enchantment compatibility, extraction costs, or workstation power.

## Balanced extraction costs

Every completed extraction uses one ordinary book, eight amethyst shards by default, and XP levels based on enchantment rarity and level. The normal portion is capped between one and four XP levels by default. Mending adds five levels. Curse of Binding and Curse of Vanishing add thirty levels, making curse removal possible but intentionally expensive.

These costs use player **levels**, not raw XP points.

| Default cost setting | Amount |
|---|---:|
| Common base | 1 level |
| Uncommon base | 2 levels |
| Rare base | 3 levels |
| Very rare base | 4 levels |
| Each enchantment level above I | +1 level |
| Normal minimum | 1 level |
| Normal maximum | 4 levels |
| Mending surcharge | +5 levels |
| Curse surcharge | +30 levels |
| Amethyst shards | 8 shards |
| Ordinary books | 1 book |

| Example | Final XP cost | Additional resources |
|---|---:|---|
| Efficiency I | 1 level | 1 book + 8 shards |
| Efficiency V | 4 levels | 1 book + 8 shards |
| Unbreaking II | 3 levels | 1 book + 8 shards |
| Fortune III | 4 levels | 1 book + 8 shards |
| Silk Touch I | 4 levels | 1 book + 8 shards |
| Mending I | 9 levels | 1 book + 8 shards |
| Curse of Binding I | 34 levels | 1 book + 8 shards |
| Curse of Vanishing I | 34 levels | 1 book + 8 shards |

World operators can adjust rarity costs, per-level scaling, normal minimum and maximum costs, the Mending surcharge, the curse surcharge, and the number of amethyst shards consumed.

## Safe preview workflow

Selecting an enchantment is free. The prospective enchanted book appears in Output, but nothing is consumed until you take or shift-click it.

Before committing, the add-on checks the source item, selected enchantment, ordinary book, amethyst supply, XP, output compatibility, player proximity, and inventory space.

## How to use the pillar or altar

| Interface area | Purpose |
|---|---|
| **Item** | Holds one enchanted tool, weapon, armor piece, or enchanted book |
| **Books** | Holds ordinary books, up to a stack of 64 |
| **Amethyst Shards** | Holds the shards used for the configured extraction cost |
| **Enchantments** | Lists each enchantment on the source as a selectable row |
| **Output** | Previews the enchanted book that will be created |

1. Interact with any part of a pillar or altar.
2. Place the enchanted source in **Item**.
3. Place ordinary books in **Books**.
4. Place amethyst shards in **Amethyst Shards**.
5. Select the row containing the enchantment you want to remove.
6. Review the displayed XP, book, and shard cost.
7. Change rows freely if you want to preview another enchantment.
8. Take or shift-click the enchanted book in **Output** to commit the transfer.

Only the selected enchantment is removed. Every other enchantment remains on the source. Repeat the process to extract another enchantment. When the last enchantment is removed from an enchanted book, the empty source becomes an ordinary book.

## Crafting

### Compact pillar

Craft any material variant at a crafting table:

```text
Amethyst Shard | Lapis Block      | Amethyst Shard
Copper Ingot   | Enchanting Table | Copper Ingot
Body Material  | Obsidian         | Body Material
```

### Tall pillar

Craft two pillars from the same body material. Place the first, hold the second matching pillar, and interact with the placed pillar. The held item is consumed outside Creative mode and the workstation becomes a coordinated two-block pillar.

The tall pillar is assembled by interaction; do not try to place a normal pillar block directly on top. Two blocks is the maximum.

### Altar

Convert a matching pillar into an altar with this shapeless recipe:

```text
1 Disenchanting Pillar + 2 Copper Ingots + 1 Amethyst Shard
```

The altar retains the pillar's body material.

| Finished form | Total resources |
|---|---|
| Compact pillar | 2 Amethyst Shards, 1 Lapis Block, 2 Copper Ingots, 1 Enchanting Table, 1 Obsidian, 2 matching Body Material blocks |
| Tall pillar | 4 Amethyst Shards, 2 Lapis Blocks, 4 Copper Ingots, 2 Enchanting Tables, 2 Obsidian, 4 matching Body Material blocks |
| Altar | 3 Amethyst Shards, 1 Lapis Block, 4 Copper Ingots, 1 Enchanting Table, 1 Obsidian, 2 matching Body Material blocks |

The recipes target established mid-game survival: enchanting-table progression, amethyst exploration, lapis, copper, obsidian, and your chosen building material. All three forms have identical disenchanting capabilities; their shapes are aesthetic choices.

## In-game guide

Every player receives a signed CWES field guide the first time the add-on loads. It explains crafting, workstation forms, slot placement, enchantment selection, costs, extraction, rune dyeing, and operator controls.

A replacement guide is craftable from one ordinary book and one amethyst shard.

## Operator controls

Operators can sneak-interact with a workstation while not holding dye or run:

```text
/scriptevent adp:admin
```

Request another guide with:

```text
/scriptevent adp:guide
```

## Requirements and compatibility

- Minecraft Bedrock **1.26.0 or newer**
- Both included packs active at the same version
- No experimental gameplay toggles
- Vibrant Visuals supported

Standard vanilla equipment and books are the primary compatibility target. Back up important worlds before installing or updating any add-on, and test unusual third-party items in a copied world.

## Installation

1. Download `Andys Disenchanting Pillar v1.6.5.mcaddon`.
2. Open the file with Minecraft Bedrock.
3. Wait for both included packs to import or update.
4. Create a world or edit an existing world.
5. In **Behavior Packs > My Packs**, activate **Andy's Disenchanting Pillar [BP]**.
6. Confirm that **Andy's Disenchanting Pillar [RP]** is active under Resource Packs. Bedrock may activate the paired pack automatically.
7. Start the world. No experimental gameplay toggles are needed.

When updating, back up the world, import the new `.mcaddon`, make sure the behavior and resource packs are the same version, and completely leave and reopen the world. If multiple installed versions are shown, activate only the newest matching pair.

## Troubleshooting

### The workstation does not appear in the crafting table

- Confirm that **Andy's Disenchanting Pillar [BP]** is active.
- Confirm that its paired resource pack is active at the same version.
- Use a crafting table, not the 2×2 inventory grid.
- Use two identical supported body-material blocks in the bottom corners.
- Completely leave and reopen the world after changing active packs.

### The pillar or altar does not open

- Confirm that both included packs are active at version 1.6.5.
- Interact with any visible part of the pillar or altar.
- For a tall pillar, either level can be used.
- Completely leave and reopen the world if the packs were just installed or updated.
- Test once with other UI-changing resource packs disabled.

### No enchantments appear

- Put one enchanted tool, weapon, armor piece, or enchanted book in **Item**.
- Confirm that the item actually contains enchantments.
- Remove and reinsert the source item to refresh its enchantment rows.
- Standard vanilla items are the primary compatibility target.

### Output remains empty

- Put at least one ordinary book in **Books**.
- Put at least the configured number of amethyst shards in **Amethyst Shards**.
- Select one of the named enchantment rows.
- Confirm that the selected enchantment can be stored on a normal enchanted book.

### The output cannot be taken

- Confirm that you have the displayed number of XP levels.
- Confirm that one ordinary book and the required shards are still present.
- Make room in the player inventory when using shift-click.
- Reselect the enchantment if the source item or workstation contents changed after the preview appeared.

### Rune dyeing does not work

- Hold one normal Minecraft dye.
- Interact directly with the pillar or altar.
- Both halves of a tall pillar recolor together.
- One dye is consumed outside Creative mode.

### The operator menu does not open

- The player must be a world operator.
- Sneak-interact while not holding dye.
- Alternatively, run `/scriptevent adp:admin`.

### The import fails

- Confirm that the filename ends in `.mcaddon`, not `.zip`.
- Download the file again if it may be incomplete.
- Close and reopen Minecraft Bedrock.
- Do not extract, rename, or recompress the package.

### An older version still appears

- Check **Settings → Storage** for older behavior-pack and resource-pack copies.
- Remove obsolete copies if needed.
- Restart Minecraft.
- Import version 1.6.5 again and activate the matching BP and RP.

## Credits

Original gameplay design, scripts, interface, workstation geometry, rune channels, guide, lore, balancing, integration, and documentation: **Andy/CWES**.

Floating rune designs adapt **Enchantment Runes** by **SargentReckless**, released under **CC0-1.0**:

- https://modrinth.com/resourcepack/enchantment-runes
- https://creativecommons.org/publicdomain/zero/1.0/

## Support

[AndyTheMakerMC.xyz](https://AndyTheMakerMC.xyz)

When reporting a problem, include:

- Minecraft Bedrock version and platform;
- add-on version;
- whether both packs are active at the same version;
- source item and enchantments;
- selected enchantment and displayed cost;
- workstation form and body material;
- exact steps that reproduce the problem;
- screenshot, video, or relevant content-log message;
- whether the problem also occurs in a new test world with other add-ons disabled.

## Ownership and license

Copyright © AndyTheMaker 2026. All rights reserved, except for the separately credited CC0 floating-rune source.

You may use the unmodified add-on in personal worlds, multiplayer worlds, Realms, servers, videos, livestreams, reviews, tutorials, and showcases.

Do not redistribute, mirror, sell, repackage, modify and publish, or claim the project as your own without written permission.

Minecraft is a trademark of Microsoft Corporation. This independent add-on is not an official Minecraft product and is not approved by or associated with Mojang or Microsoft.
