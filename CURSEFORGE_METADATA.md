# CurseForge Upload Metadata

Use this sheet when creating the CurseForge project and uploading version 1.6.5.

## Project

| Field | Value |
|---|---|
| Game | Minecraft Bedrock |
| Title | Andy's Disenchanting Pillar |
| Suggested slug | `andys-disenchanting-pillar` |
| Class | Addons |
| Main category | Magic |
| Additional category 1 | Utility |
| Additional category 2 | Technology |
| Additional category 3 | Vanilla+ |
| Additional category 4 | Survival |
| License | All Rights Reserved |
| Description | `CURSEFORGE_DESCRIPTION.md` |
| Summary | `CURSEFORGE_SUMMARY.txt` |

### Category rationale

- **Magic** is the best main category because the core mechanic extracts enchantments and removes curses through a Mystic workstation.
- **Utility** covers the practical management and reuse of enchantments.
- **Technology** covers the dedicated configurable workstation and its operator-controlled costs.
- **Vanilla+** reflects the use of vanilla materials, books, XP, enchanted books, anvils, dyes, and survival progression.
- **Survival** reflects the intentionally expensive, mid-game balance and recurring resource costs.

CurseForge permits one main category and up to four relevant additional categories. Do not add unrelated categories simply for visibility.

## Listing copy

### Summary

> Extract chosen enchantments into reusable books with a balanced Bedrock workstation. Spend XP, books, and amethyst; build compact pillars, stacked pillars, or altars in 48 materials; dye glowing runes; configure costs; and enjoy Vibrant Visuals support.

Character count: **253**

### Full description

Copy the contents of `CURSEFORGE_DESCRIPTION.md`.

## Images

| Use | File |
|---|---|
| CurseForge logo/avatar | `artwork/Andys-Disenchanting-Pillar-CurseForge-Avatar-400x400.png` |
| Square promotional image | `artwork/Andys-Disenchanting-Pillar-CurseForge-Thumbnail-1x1-FINAL.png` |
| Main hero/gallery image | `artwork/Andys-Disenchanting-Pillar-Hero-16x9-FINAL.jpg` |

Include real in-game screenshots in the CurseForge gallery so players can see the actual workstation models and interface.

## Release file

| Field | Value |
|---|---|
| Upload file | `dist/Andys Disenchanting Pillar v1.6.5.mcaddon` |
| Display name | Andy's Disenchanting Pillar v1.6.5 |
| Release type | Release |
| Version | 1.6.5 |
| Minimum engine version in manifests | 1.26.0 |
| Experimental toggles | None required |
| Required related projects | None |
| Optional related projects | None |

Select only the exact Minecraft Bedrock versions that were tested and are available in CurseForge's supported-version picker.

## First-release notes

Copy the contents of `CURSEFORGE_CHANGELOG_v1.6.5.md` into the file changelog field.

## Final upload checklist

- Upload the combined `.mcaddon`, not one of the fallback `.mcpack` files.
- Confirm the uploaded filename and display name both say version 1.6.5.
- Set the file type to **Release**.
- Add the 400-by-400 avatar as the project logo.
- Add the 16:9 hero and real in-game screenshots to the gallery.
- Paste the 253-character summary exactly.
- Paste the complete public description.
- Select **Addons**, **Magic**, **Utility**, **Technology**, **Vanilla+**, and **Survival** as listed above.
- Select only tested Bedrock game versions.
- Confirm the All Rights Reserved license and the CC0 rune attribution in the description.
