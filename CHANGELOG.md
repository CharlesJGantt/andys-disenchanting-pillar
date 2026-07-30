# Changelog

## 1.6.5

- Rebuilt the altar's central focus as a visible vanilla amethyst-block socket aligned to and slightly recessed beneath the sloped lectern surface.
- Reseated the amethyst cluster into that socket so it visibly grows from the block instead of emerging through the altar top.
- Replaced the altar's intersecting upright copper crown pieces with height-adjusted side supports and slope-matched copper caps.
- Removed the floating purple shimmer particle entirely.
- Added a sparse animated surface overlay that briefly sweeps across the workstation's main faces every 7.6 seconds, approximating the vanilla enchanted-item glint without emissive bloom.
- Updated the CWES field guide and public release documentation with the exact pillar, tall-pillar, altar, guide, and extraction recipes; default cost tables; dye controls; installation steps; and the intended Survival balance.

## 1.6.4

- Removed the separate dark backing from every vertical rune panel so each inscription now reveals the workstation's selected vanilla block texture.
- Kept the rune glyphs on one outward-facing transparent surface, physically separated from the body and frame to eliminate texture-collision flicker.
- Raised and enlarged the vanilla-textured amethyst clusters on both pillar forms and the altar.
- Added a small amethyst-block growth base beneath every cluster.
- Brightened the subtle purple amethyst-core emission from MER 16 to 22.
- Dimmed the rune-inscription emission from MER 19 to 15 for restrained Vibrant Visuals bloom.

## 1.6.3

- Rebuilt every vertical rune glyph as an outward-face-only cutout instead of a six-face paper-thin cube.
- Increased the physical gap between rune glyphs and their dark backing panels to remove depth-buffer flicker.
- Lifted the altar-top rune engravings farther above the sloped surface to prevent coplanar flashing.
- Separated copper brackets and the tall-pillar block seam from shared stone faces.
- Reduced rune PBR emission by a further 20 percent, from MER emission 24 to 19.
- Strengthened the periodic non-additive shimmer so its diagonal enchanted glints are visible without producing Vibrant Visuals bloom.
- Enlarged the invisible workstation interaction area to cover the full footprint and both levels of a tall pillar.

## 1.6.2

- Enlarged the vanilla-textured amethyst clusters on the compact pillar, tall pillar, and altar.
- Added a faint original purple inner emission to the amethyst clusters at a lower strength than the rune emission.
- Added six small non-emissive rune engravings to the altar's sloped lectern surface around its central opening.
- Recentered the workstation's four top labels and aligned their shared baseline with the corresponding slots.
- Split the third label into `Amethyst` above `Shards` while keeping `Shards` aligned with Item, Books, and Output.
- Fixed enchantment-row name bindings so each row displays its enchantment, level, and compact cost instead of appearing blank.
- Reconnected the choice and selected-row icons to generated rune textures, removing the magenta missing-texture squares.
- Updated the in-game guide, validation message, and public documentation to call the slot Amethyst Shards.

## 1.6.1

- Replaced the altar's four-sided basin top with one coherent 22.5-degree lectern-style surface and a true central focus opening.
- Added placement direction to altars so the raised lectern edge faces consistently when placed.
- Replaced the remaining solid purple crystal cuboids with crossed alpha-cutout geometry using Minecraft's built-in amethyst-cluster texture.
- Enlarged the compact and tall pillar crown clusters so the vanilla-style amethyst silhouette is readable.
- Increased the number and positional variety of floating runes, with randomized timing, size, lifetime, angle, and slow spin.
- Added a brief, very faint periodic enchantment shimmer using non-additive, low-alpha particles.
- Preserved Vibrant Visuals compatibility: rune emission remains restrained and the new shimmer does not use emissive or additive bloom.

## 1.6.0

- Rebuilt all three workstation silhouettes against the original concept artwork.
- Added layered rune assemblies with dark inset beds, separate emissive glyph planes, and raised stone frames instead of surface-mounted rune sheets.
- Gave the compact pillar a slimmer framed shaft, stepped plinth and capital, exposed crown crystal, and prominent copper corner brackets.
- Reworked the two-block pillar into a continuous tower with a restrained coupling band instead of the previous oversized stack of middle slabs.
- Rebuilt the altar with a compact framed housing, sloped lectern-like shoulders, a real central well, copper braces, and a projecting amethyst focus.
- Added a generated isometric geometry preview and verified every model remains within its intended one- or two-block bounds.

## 1.5.9

- Reduced the placed rune emission from maximum-strength PBR emission to a faint self-lit engraving.
- Reduced idle block light from 4 to 1 and active extraction light from 9–12 to 3.
- Fixed the MaterialInstances validation error by using one compatible alpha-test render method across every material in each workstation block.
- Rebuilt the four enchantment rows without the unsupported UI `modifications` property.

## 1.5.8

- Replaced 128 color-specific floating-rune definitions and 128 duplicate textures with eight shared glyph definitions and eight shared white glyph masks.
- Floating runes now receive the placed workstation's dye color dynamically through Bedrock's supported Molang particle variables.
- Reduced the add-on source from 610 files to 370 while preserving all 48 materials, both workstation models, all 16 rune colors, and all eight floating glyph shapes.

## 1.5.7

- Replaced the generic nested-pack installer with the exact direct two-folder archive structure proven by the working CWES Foundation and Silk Touch Spawners add-ons.
- Uses short `ADP_BP` and `ADP_RP` archive roots, no nested archives, and no explicit directory entries.
- Guarantees each pack's `manifest.json` and `pack_icon.png` are the first entries in its archive section.
- Uses the same .NET ZIP writer and compression settings as the working CWES Foundation build.

## 1.5.6

- Rebuilt the `.mcaddon` in Microsoft's documented format: an outer ZIP containing the behavior and resource `.mcpack` files.
- Stored the already-compressed inner packs without recompression.
- Put `manifest.json` first in both `.mcpack` archives so Bedrock can identify each pack immediately.
- Replaced the duplicated 1254×1254 pack icons with optimized 128×128 menu icons while preserving the high-resolution source artwork.
- Reduced the combined installer from roughly 5 MB to a compact package dominated by actual add-on content.

## 1.5.5

- Reissued the corrected workstation build with a new pack version so Bedrock recognizes it as an update when 1.5.4 is already installed.

## 1.5.4

- Made tall-pillar assembly reliable: hold a matching material pillar and interact with the placed compact pillar.
- Fixed dye interactions being intercepted by the workstation's hidden storage container.
- Separated rune faces from their backing panels to remove texture collision and z-fighting.
- Increased the original rune-panel artwork to 64×64 and mapped the complete rune instead of sampling only one corner.
- Strengthened rune-only PBR emission while keeping the stone and copper body non-emissive.
- Reshaped the compact pillar, tall pillar, and altar closer to their concept designs and exposed their amethyst focuses.
- Replaced the large morphing particle rectangles with eight fixed, small enchanting-alphabet glyph variants in every dye color.
- Updated the in-game guide with the reliable tall-pillar assembly control.

## 1.5.3

- Fixed all generated workstation blocks being rejected because their Creative menu group lacked the required namespace.
- Matched the proven CWES custom-model approach by using the stable `construction` category without an unnecessary group override.

## 1.5.2

- Rebuilt the combined `.mcaddon` using directly visible behavior-pack and resource-pack folders so Bedrock can read both manifests without nested-archive handling.

## 1.5.1

- Fixed the `.mcaddon` installer being reported as an unknown pack by storing its nested behavior and resource `.mcpack` archives without recompressing them.
- Added separately installable versioned behavior-pack and resource-pack `.mcpack` files to every build as a fallback.

## 1.5.0

- Replaced the borrowed Lost Runes workstation visuals with original cube geometry.
- Added compact one-block and coordinated two-block Disenchanting Pillars.
- Added a one-block Disenchanting Altar with a protruding amethyst focus.
- Added 48 craft-selected vanilla material variants for both workstation types.
- Added rune-only emissive rendering in all 16 dye colors.
- Added dye-matched floating enchanting runes to pillars and altars.
- Removed the excessive full-body enchanted shimmer.
- Added safe stacking, unstacking, storage movement, and legacy three-block migration.
- Updated the CWES field guide for all workstation forms and recipes.

## 1.4.9

- Reduced the animated enchantment shimmer's opacity by roughly three quarters so it reads as a subtle surface glint instead of solid purple-blue bands.
- Reduced the shimmer's PBR emissive strength and increased its roughness to prevent excessive Vibrant Visuals bloom.
- Slowed the shimmer animation slightly while preserving the pillar's separate rune glow.

## 1.4.8

- Added the `pbr` resource-pack capability required for Vibrant Visuals compatibility.
- Added PBR texture sets for the pillar cap, animated magical glint, and all sixteen dyeable rune colors.
- Added a generated MER map that makes only the rune markings emissive while keeping the surrounding pillar stone non-metallic and rough.
- Added a complete resource-pack texture list so custom block, item, particle, and PBR textures are registered by the current renderer.

## 1.4.7

- Fixed the Disenchanting Pillar and replacement guide recipes not appearing in the crafting-table recipe list.
- Added an explicit `AlwaysUnlocked` rule to both recipes so new and existing players can discover and craft them immediately.

## 1.4.6

- Fixed operator sneak-interaction opening the admin settings only while holding another pillar.
- The admin shortcut now handles clicks on both the visible pillar blocks and the invisible lower-pedestal storage entity.
- Sneak-interacting while empty-handed or holding any non-dye item now opens the settings for operators; dyes continue to recolor the runes.

## 1.4.5

- Fixed pillars opening Minecraft's `Unknown` fallback horse inventory instead of the Disenchanting interface.
- Restored the proven private `ADP_CONTAINER` title used by the custom interface.
- Removed the invisible storage entity's unnecessary client entity, empty geometry, and render controller. With no client model, Bedrock has no anchor on which to render its internal title as a world nameplate.
- Existing storage entities adopt the corrected title automatically, restoring the custom UI without replacing placed pillars.

## 1.4.4

- Added a shapeless replacement-guide recipe: one ordinary book plus one amethyst shard.
- The crafted result automatically becomes the complete signed CWES Pillar Guide with all current instructions.
- Added a written-book-style icon and enchantment glint for the crafting result.
- Registered `/scriptevent adp:guide` as an additional way to request a replacement guide.
- Updated the guide itself and the design document with the replacement recipe.

## 1.4.3

- Rebalanced the pillar into challenging mid-game progression by removing the Echo Shard and separate Diamond requirements.
- The new recipe uses two amethyst shards, one lapis block, two copper ingots, one enchanting table, one obsidian, and two polished blackstone bricks.
- Updated the automatically delivered CWES field guide and design document with the new recipe.

## 1.4.2

- Removed the visible `ADP_CONTAINER` nameplate from placed pillars.
- The invisible storage entity now remains unnamed in the world while its localized entity title provides the same private marker used to route only pillar inventories to the custom interface.
- Existing pillar storage entities have their old name tag cleared automatically during normal processing; pillars do not need to be replaced.

## 1.4.1

- Fixed extracted enchantments becoming unrealistically expensive when reapplied at a vanilla anvil.
- A completed extraction now rebuilds the source item without Bedrock's hidden prior-work penalty instead of cloning that penalty into the updated item.
- Preserves the source item's name, lore, durability, dye color, Adventure-mode restrictions, lock/keep settings, dynamic properties, and all remaining enchantments during the reset.
- Extracted enchanted books continue to be newly created stacks, so both sides of the transaction begin with clean anvil history.

## 1.4.0

- Hid the two empty pagination boxes and added distinct blue previous/next arrow runes that appear only when another enchantment page exists.
- Rewrote the automatically delivered CWES guide around the current Item, Books, Shards, enchantment-row, and Output workflow.
- Made the Lost Runes source add-on's powered texture, disabled face dimming, and light-emission treatment permanent after placement.
- Added an animated translucent purple-blue enchantment shimmer aligned to the pillar's original geometry.
- Added all sixteen vanilla dye colors for the luminous runes.
- Holding a dye and interacting with any pillar section recolors the base, shaft, and crown together and consumes one dye outside Creative mode.
- Added deterministic visual-asset generation for rune recolors, arrow icons, and the animated glint texture.

## 1.3.0

- Added a dedicated Shards slot that accepts stacks of amethyst shards.
- Every successful disenchantment now consumes eight amethyst shards by default in addition to one blank book and the configured XP levels.
- Added the amethyst cost to enchantment rows, output previews, success messages, the CWES guide, and the design specification.
- Added an operator setting for zero to sixty-four amethyst shards per disenchantment; the default is eight.
- Added the vanilla Bedrock amethyst-block breaking sound when shards are consumed by a successful transaction.
- Migrated existing pillar storage to the new slot layout while preserving source items, blank books, and output contents.

## 1.2.3

- Fixed the source item being duplicated when its final enchantment was removed.
- The fully disenchanted source now remains in the Item slot for the player to take normally instead of being automatically moved into the player inventory while the container is open.

## 1.2.2

- Fixed output books disappearing without completing the transaction when Creative players had fewer levels than the displayed cost.
- Reconnects a taken selector or output preview to its nearby pillar even if the short-lived UI session has expired.
- Shows validation and transaction failures in the action bar while the container screen is still open.
- Corrected the wide enchantment-row anchors so the rows remain inside the panel.
- Uses the container's supported hover-text binding for the visible enchantment-row text.
- Added a content-log warning when an unexpected transaction error forces a rollback.

## 1.2.1

- Removed the scrolling/title implementation that placed selector rows over the player inventory and failed to refresh names.
- Added four fixed-position enchantment rows that cannot drift outside the enchantment panel.
- Bound each row label directly to its generated selector item's name and compact XP cost.
- Added previous/next selector items for sources with more than four enchantments.
- Unified every cost as XP levels: Mending adds 5 levels and either curse adds 30 levels by default.

## 1.2.0

- Replaced the unlabeled rune-box grid with full-width named enchantment rows.
- Each row now displays the enchantment, level, and compact XP cost without requiring a tooltip.
- Added a four-row viewport with scrolling for heavily enchanted or add-on-generated items.
- The selected row turns green while the proposed enchanted book appears in Output.
- Clarified that the Books slot accepts a normal stack of up to 64 books and consumes one per completed disenchantment.
- Updated the in-game CWES guide for the named-row workflow.

## 1.1.2

- Fixed enchantment slots drifting progressively to the right and escaping the interface panel.
- Kept all fifteen enchantment selectors inside a centered five-column by three-row layout.
- Shortened and scaled interface labels to prevent text overflow at larger GUI scales.
- Separated the input/book and book/output operation symbols for clean alignment.

## 1.1.1

- Fixed the lower pedestal not opening the container by exposing the hidden horse-container entity above the base block's selection box.
- Added automatic migration of already-placed pillars to the corrected storage entity while preserving their real input, book, and output items.
- Kept the pillar's full physical collision and the add-on's original UI, rune selection, XP costs, guide, and transaction logic.

## 1.1.0

- Replaced the scripted form with a real, draggable horse-container inventory and crafting-style JSON UI.
- Added dedicated source, blank-books, output-preview, and enchantment-choice slots.
- Enchantment runes show names and XP costs in their tooltips and can be clicked to change the preview without consuming anything.
- Taking or shift-clicking the preview book now commits the transaction, deducts XP and one blank book, removes only the selected enchantment, and delivers a clean enchanted book.
- Added validation and rollback for invalid inputs, insufficient XP, full inventories, incompatible enchantments, and interrupted transactions.
- Generated selector and preview items are tagged, automatically recovered from the cursor or inventory, and never drop when the pillar is broken.
- Updated and reissued the CWES Pillar Guide.

## 1.0.3

- Reworked the pillar menu into a reverse-crafting transaction with visible item, books, enchantment-selection, and output-preview sections.
- Replaced held-item loading with inventory selection for the item slot and quantity-based inventory transfer for the books slot.
- Selecting an enchantment now updates a non-consuming enchanted-book preview and its XP cost.
- Added **Disenchant** as the explicit commit action; it consumes one book and the displayed XP, removes the selected enchantment, and puts the result into the player inventory.
- Added a full-inventory safety check and retained recovery for output books created by older versions.
- Updated and reissued the in-game Pillar Guide for the new workflow.

## 1.0.2

- Rebuilt the pillar as a true three-block structure because Bedrock custom-block geometry cannot exceed 30 pixels; the former combined 48-pixel model was invalid.
- Added valid base, shaft, and crown block states using the supplied Ancient Lost Runes geometry.
- Interacting with or breaking any pillar section now resolves to the shared base and storage.
- Added safe assembly, blocked-space handling, cleanup, and one-item drop behavior.
- Existing one-block pillars from 1.0.0/1.0.1 automatically assemble their missing shaft and crown when first used if the space above is clear.

## 1.0.1

- Moved `terrain_texture.json` into the resource pack's `textures` directory so Bedrock resolves the pillar's custom rune materials and renders the model.
- Marked the invisible companion storage entity as summonable so `Dimension.spawnEntity` can initialize pillar storage.
- Added a build-time check for the required texture-atlas location.

## 1.0.0

- Initial implementation.
