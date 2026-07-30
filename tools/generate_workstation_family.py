"""Generate Andy's original disenchanting workstation family.

The generated models use original cube geometry and custom rune masks while
referencing Minecraft's built-in block textures for every construction
material, copper fitting, dark recess, and amethyst crystal.
"""

from __future__ import annotations

import io
import json
import shutil
import zipfile
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
BP = ROOT / "Andys Disenchanting Pillar BP"
RP = ROOT / "Andys Disenchanting Pillar RP"
BLOCKS_DIR = BP / "blocks" / "workstations"
RECIPES_DIR = BP / "recipes" / "workstations"
LOOT_DIR = BP / "loot_tables" / "blocks" / "workstations"
MODELS_DIR = RP / "models" / "blocks"
TEXTURES_DIR = RP / "textures" / "blocks" / "workstations"
PARTICLE_TEXTURES_DIR = RP / "textures" / "particle"
PARTICLES_DIR = RP / "particles"
RUNE_SOURCE = ROOT / "Inspiration" / "3x3 Enchantment Runes (1).zip"
ADAPTED_RUNE_SOURCE = ROOT / "tools" / "assets" / "cc0_floating_runes_alpha.png"
PACK_ICON_SOURCE = ROOT / "Inspiration" / "disenchanting_pillar_pack_icon_source.png"
PACK_ICON_SIZE = (128, 128)


@dataclass(frozen=True)
class Material:
    slug: str
    name: str
    item: str
    texture: str

    @property
    def pillar_id(self) -> str:
        return f"adp:{self.slug}_disenchanting_pillar"

    @property
    def altar_id(self) -> str:
        return f"adp:{self.slug}_disenchanting_altar"

    @property
    def body_texture(self) -> str:
        return f"adp_body_{self.slug}"


MATERIALS = [
    Material("stone", "Stone", "minecraft:stone", "textures/blocks/stone"),
    Material("smooth_stone", "Smooth Stone", "minecraft:smooth_stone", "textures/blocks/stone_slab_top"),
    Material("cobblestone", "Cobblestone", "minecraft:cobblestone", "textures/blocks/cobblestone"),
    Material("mossy_cobblestone", "Mossy Cobblestone", "minecraft:mossy_cobblestone", "textures/blocks/cobblestone_mossy"),
    Material("stone_bricks", "Stone Brick", "minecraft:stone_bricks", "textures/blocks/stonebrick"),
    Material("mossy_stone_bricks", "Mossy Stone Brick", "minecraft:mossy_stone_bricks", "textures/blocks/stonebrick_mossy"),
    Material("cracked_stone_bricks", "Cracked Stone Brick", "minecraft:cracked_stone_bricks", "textures/blocks/stonebrick_cracked"),
    Material("chiseled_stone_bricks", "Chiseled Stone Brick", "minecraft:chiseled_stone_bricks", "textures/blocks/stonebrick_carved"),
    Material("andesite", "Andesite", "minecraft:andesite", "textures/blocks/stone_andesite"),
    Material("polished_andesite", "Polished Andesite", "minecraft:polished_andesite", "textures/blocks/stone_andesite_smooth"),
    Material("diorite", "Diorite", "minecraft:diorite", "textures/blocks/stone_diorite"),
    Material("polished_diorite", "Polished Diorite", "minecraft:polished_diorite", "textures/blocks/stone_diorite_smooth"),
    Material("granite", "Granite", "minecraft:granite", "textures/blocks/stone_granite"),
    Material("polished_granite", "Polished Granite", "minecraft:polished_granite", "textures/blocks/stone_granite_smooth"),
    Material("tuff", "Tuff", "minecraft:tuff", "textures/blocks/tuff"),
    Material("polished_tuff", "Polished Tuff", "minecraft:polished_tuff", "textures/blocks/polished_tuff"),
    Material("tuff_bricks", "Tuff Brick", "minecraft:tuff_bricks", "textures/blocks/tuff_bricks"),
    Material("chiseled_tuff", "Chiseled Tuff", "minecraft:chiseled_tuff", "textures/blocks/chiseled_tuff"),
    Material("deepslate", "Deepslate", "minecraft:deepslate", "textures/blocks/deepslate/deepslate"),
    Material("cobbled_deepslate", "Cobbled Deepslate", "minecraft:cobbled_deepslate", "textures/blocks/deepslate/cobbled_deepslate"),
    Material("polished_deepslate", "Polished Deepslate", "minecraft:polished_deepslate", "textures/blocks/deepslate/polished_deepslate"),
    Material("deepslate_bricks", "Deepslate Brick", "minecraft:deepslate_bricks", "textures/blocks/deepslate/deepslate_bricks"),
    Material("cracked_deepslate_bricks", "Cracked Deepslate Brick", "minecraft:cracked_deepslate_bricks", "textures/blocks/deepslate/cracked_deepslate_bricks"),
    Material("deepslate_tiles", "Deepslate Tile", "minecraft:deepslate_tiles", "textures/blocks/deepslate/deepslate_tiles"),
    Material("cracked_deepslate_tiles", "Cracked Deepslate Tile", "minecraft:cracked_deepslate_tiles", "textures/blocks/deepslate/cracked_deepslate_tiles"),
    Material("chiseled_deepslate", "Chiseled Deepslate", "minecraft:chiseled_deepslate", "textures/blocks/deepslate/chiseled_deepslate"),
    Material("mud_bricks", "Mud Brick", "minecraft:mud_bricks", "textures/blocks/mud_bricks"),
    Material("packed_mud", "Packed Mud", "minecraft:packed_mud", "textures/blocks/packed_mud"),
    Material("calcite", "Calcite", "minecraft:calcite", "textures/blocks/calcite"),
    Material("dripstone", "Dripstone", "minecraft:dripstone_block", "textures/blocks/dripstone_block"),
    Material("quartz", "Quartz", "minecraft:quartz_block", "textures/blocks/quartz_block_side"),
    Material("smooth_quartz", "Smooth Quartz", "minecraft:smooth_quartz", "textures/blocks/quartz_block_bottom"),
    Material("quartz_bricks", "Quartz Brick", "minecraft:quartz_bricks", "textures/blocks/quartz_bricks"),
    Material("chiseled_quartz", "Chiseled Quartz", "minecraft:chiseled_quartz_block", "textures/blocks/quartz_block_chiseled"),
    Material("sandstone", "Sandstone", "minecraft:sandstone", "textures/blocks/sandstone_normal"),
    Material("smooth_sandstone", "Smooth Sandstone", "minecraft:smooth_sandstone", "textures/blocks/sandstone_smooth"),
    Material("chiseled_sandstone", "Chiseled Sandstone", "minecraft:chiseled_sandstone", "textures/blocks/sandstone_carved"),
    Material("cut_sandstone", "Cut Sandstone", "minecraft:cut_sandstone", "textures/blocks/sandstone_top"),
    Material("netherrack", "Netherrack", "minecraft:netherrack", "textures/blocks/netherrack"),
    Material("nether_bricks", "Nether Brick", "minecraft:nether_brick", "textures/blocks/nether_brick"),
    Material("red_nether_bricks", "Red Nether Brick", "minecraft:red_nether_brick", "textures/blocks/red_nether_brick"),
    Material("blackstone", "Blackstone", "minecraft:blackstone", "textures/blocks/blackstone"),
    Material("polished_blackstone", "Polished Blackstone", "minecraft:polished_blackstone", "textures/blocks/polished_blackstone"),
    Material("polished_blackstone_bricks", "Polished Blackstone Brick", "minecraft:polished_blackstone_bricks", "textures/blocks/polished_blackstone_bricks"),
    Material("basalt", "Basalt", "minecraft:basalt", "textures/blocks/basalt_side"),
    Material("polished_basalt", "Polished Basalt", "minecraft:polished_basalt", "textures/blocks/polished_basalt_side"),
    Material("prismarine", "Prismarine", "minecraft:prismarine", "textures/blocks/prismarine_rough"),
    Material("dark_prismarine", "Dark Prismarine", "minecraft:dark_prismarine", "textures/blocks/prismarine_dark"),
]

COLORS = {
    "cyan": (40, 225, 235),
    "white": (245, 250, 250),
    "orange": (245, 130, 35),
    "magenta": (218, 85, 205),
    "light_blue": (85, 195, 240),
    "yellow": (250, 220, 55),
    "lime": (150, 225, 45),
    "pink": (245, 150, 185),
    "gray": (105, 120, 130),
    "light_gray": (185, 195, 195),
    "purple": (165, 80, 220),
    "blue": (65, 90, 220),
    "brown": (155, 105, 70),
    "green": (90, 165, 60),
    "red": (220, 65, 55),
    "black": (72, 62, 92),
}


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8-sig"))


def reset_generated_directories() -> None:
    for path in (BLOCKS_DIR, RECIPES_DIR, LOOT_DIR):
        if path.exists():
            shutil.rmtree(path)
        path.mkdir(parents=True)
    TEXTURES_DIR.mkdir(parents=True, exist_ok=True)
    PARTICLE_TEXTURES_DIR.mkdir(parents=True, exist_ok=True)
    PARTICLES_DIR.mkdir(parents=True, exist_ok=True)


def uv_faces(material: str, size: tuple[float, float, float]) -> dict:
    x, y, z = size
    if material in {"runes", "amethyst", "amethyst_bud"}:
        # Stretch the complete 16x16 glyph over every visible panel face.
        # The same full-texture mapping lets crossed amethyst planes reproduce
        # the silhouette in Minecraft's transparent bud/cluster texture
        # instead of sampling a tiny corner onto a purple cuboid.
        return {
            face: {"uv": [0, 0], "uv_size": [16, 16], "material_instance": material}
            for face in ("north", "east", "south", "west", "up", "down")
        }
    return {
        "north": {"uv": [0, 0], "uv_size": [x, y], "material_instance": material},
        "east": {"uv": [0, 0], "uv_size": [z, y], "material_instance": material},
        "south": {"uv": [0, 0], "uv_size": [x, y], "material_instance": material},
        "west": {"uv": [0, 0], "uv_size": [z, y], "material_instance": material},
        "up": {"uv": [0, 0], "uv_size": [x, z], "material_instance": material},
        "down": {"uv": [0, 0], "uv_size": [x, z], "material_instance": material},
    }


def cube(
    origin: tuple[float, float, float],
    size: tuple[float, float, float],
    material: str = "body",
    *,
    rotation: tuple[float, float, float] | None = None,
    pivot: tuple[float, float, float] | None = None,
) -> dict:
    value = {"origin": list(origin), "size": list(size), "uv": uv_faces(material, size)}
    if rotation is not None:
        value["rotation"] = list(rotation)
        value["pivot"] = list(pivot or (0, 0, 0))
    return value


def cutout_plane(
    origin: tuple[float, float, float],
    size: tuple[float, float, float],
    material: str,
    *,
    rotation: tuple[float, float, float],
    pivot: tuple[float, float, float],
) -> dict:
    """Create a two-sided plane without textured edge faces.

    Vanilla amethyst buds/clusters use intersecting alpha-cutout planes. Keeping
    the texture off the paper-thin edges prevents stretched purple rectangles
    and makes the focus read like Minecraft's own cluster model.
    """
    value = {
        "origin": list(origin),
        "size": list(size),
        "uv": {
            "north": {"uv": [0, 0], "uv_size": [16, 16], "material_instance": material},
            "south": {"uv": [0, 0], "uv_size": [16, 16], "material_instance": material},
        },
        "rotation": list(rotation),
        "pivot": list(pivot),
    }
    return value


def surface_cutout(
    origin: tuple[float, float, float],
    size: tuple[float, float, float],
    material: str,
    *,
    rotation: tuple[float, float, float],
    pivot: tuple[float, float, float],
) -> dict:
    """Create a two-sided cutout that lies against a sloped top surface."""
    return {
        "origin": list(origin),
        "size": list(size),
        "uv": {
            "up": {"uv": [0, 0], "uv_size": [16, 16], "material_instance": material},
            "down": {"uv": [0, 0], "uv_size": [16, 16], "material_instance": material},
        },
        "rotation": list(rotation),
        "pivot": list(pivot),
    }


def face_cutout(
    origin: tuple[float, float, float],
    size: tuple[float, float, float],
    material: str,
    face: str,
) -> dict:
    """Create one outward-facing textured surface without textured edges."""
    return {
        "origin": list(origin),
        "size": list(size),
        "uv": {
            face: {"uv": [0, 0], "uv_size": [16, 16], "material_instance": material},
        },
    }


def add_four_corner_cubes(cubes: list[dict], y: float, height: float, inset: float = 6) -> None:
    # Copper brackets sit slightly proud of the stone. The former exact shared
    # outer faces caused depth-buffer flicker under both render pipelines.
    proud = 0.06
    bracket_size = 2.0 + proud * 2
    for x in (-inset - proud, inset - 2 - proud):
        for z in (-inset - proud, inset - 2 - proud):
            cubes.append(cube(
                (x, y - proud, z),
                (bracket_size, height + proud * 2, bracket_size),
                "copper",
            ))


def add_side_panels(
    cubes: list[dict],
    y: float,
    height: float,
    half_width: float = 3,
    distance: float = 5,
) -> None:
    width = half_width * 2
    # Draw the transparent inscription directly in front of the workstation's
    # selected vanilla body texture. There is deliberately no second backing
    # panel: removing that parallel surface prevents depth-buffer flicker and
    # lets every material variant remain visible behind its runes.
    rune_offset = 0.12
    rune_depth = 0.02
    frame_depth = 0.18
    frame_width = 0.65

    cubes.extend([
        face_cutout(
            (-half_width + 0.5, y + 0.5, -distance - rune_offset - rune_depth),
            (width - 1, height - 1, rune_depth),
            "runes",
            "north",
        ),
        face_cutout(
            (-half_width + 0.5, y + 0.5, distance + rune_offset),
            (width - 1, height - 1, rune_depth),
            "runes",
            "south",
        ),
        face_cutout(
            (-distance - rune_offset - rune_depth, y + 0.5, -half_width + 0.5),
            (rune_depth, height - 1, width - 1),
            "runes",
            "west",
        ),
        face_cutout(
            (distance + rune_offset, y + 0.5, -half_width + 0.5),
            (rune_depth, height - 1, width - 1),
            "runes",
            "east",
        ),
    ])

    outer_half = half_width + frame_width
    # North and south frames.
    for z in (-distance - frame_depth, distance):
        cubes.extend([
            cube((-outer_half, y - frame_width, z), (frame_width, height + frame_width * 2, frame_depth)),
            cube((half_width, y - frame_width, z), (frame_width, height + frame_width * 2, frame_depth)),
            cube((-half_width, y - frame_width, z), (width, frame_width, frame_depth)),
            cube((-half_width, y + height, z), (width, frame_width, frame_depth)),
        ])
    # West and east frames.
    for x in (-distance - frame_depth, distance):
        cubes.extend([
            cube((x, y - frame_width, -outer_half), (frame_depth, height + frame_width * 2, frame_width)),
            cube((x, y - frame_width, half_width), (frame_depth, height + frame_width * 2, frame_width)),
            cube((x, y - frame_width, -half_width), (frame_depth, frame_width, width)),
            cube((x, y + height, -half_width), (frame_depth, frame_width, width)),
        ])


def add_vertical_glint(
    cubes: list[dict],
    y: float,
    height: float,
    half_width: float,
    distance: float,
) -> None:
    """Add an animated, sparse enchantment sweep to four main block faces."""
    width = half_width * 2
    offset = 0.06
    depth = 0.01
    cubes.extend([
        face_cutout(
            (-half_width, y, -distance - offset - depth),
            (width, height, depth),
            "glint",
            "north",
        ),
        face_cutout(
            (-half_width, y, distance + offset),
            (width, height, depth),
            "glint",
            "south",
        ),
        face_cutout(
            (-distance - offset - depth, y, -half_width),
            (depth, height, width),
            "glint",
            "west",
        ),
        face_cutout(
            (distance + offset, y, -half_width),
            (depth, height, width),
            "glint",
            "east",
        ),
    ])


def add_crystal_focus(cubes: list[dict], y: float, height: float = 3.0, scale: float = 1.4) -> None:
    # Vanilla amethyst buds and clusters are defined by intersecting cutout
    # planes. Reproduce that construction with Minecraft's own cluster texture
    # instead of using solid purple prisms.
    thickness = 0.01
    pivot = (0, y + height / 2, 0)
    cubes.append(cutout_plane(
        (-scale / 2, y, -thickness / 2),
        (scale, height, thickness),
        "amethyst",
        rotation=(0, 45, 0),
        pivot=pivot,
    ))
    cubes.append(cutout_plane(
        (-scale / 2, y, -thickness / 2),
        (scale, height, thickness),
        "amethyst",
        rotation=(0, -45, 0),
        pivot=pivot,
    ))
    glow_scale = scale * 0.38
    glow_height = height * 0.58
    glow_y = y + height * 0.2
    glow_depth = 0.04
    for rotation_y in (45, -45):
        cubes.append(cutout_plane(
            (-glow_scale / 2, glow_y, -glow_depth / 2),
            (glow_scale, glow_height, glow_depth),
            "amethyst_glow",
            rotation=(0, rotation_y, 0),
            pivot=pivot,
        ))


def compact_pillar_cubes() -> list[dict]:
    cubes = [
        cube((-8, 0, -8), (16, 1.0, 16)),
        cube((-7, 1.0, -7), (14, 1.0, 14)),
        cube((-6, 2.0, -6), (12, 1.25, 12)),
        cube((-5, 3.25, -5), (10, 8.5, 10)),
        cube((-7, 11.75, -7), (14, 1.0, 14)),
        cube((-6, 12.75, -6), (12, 0.75, 12)),
        cube((-2, 13.42, -2), (4, 0.72, 4), "amethyst_core"),
    ]
    add_four_corner_cubes(cubes, 1.75, 2.0, inset=6)
    add_four_corner_cubes(cubes, 11.75, 1.75, inset=7)
    add_side_panels(cubes, 4.15, 6.95, half_width=3.0, distance=5.0)
    add_vertical_glint(cubes, 3.35, 8.35, half_width=4.7, distance=5.0)
    add_crystal_focus(cubes, 13.25, 2.75, 5.2)
    return cubes


def lower_pillar_cubes() -> list[dict]:
    cubes = [
        cube((-8, 0, -8), (16, 1.0, 16)),
        cube((-7, 1.0, -7), (14, 1.0, 14)),
        cube((-6, 2.0, -6), (12, 1.25, 12)),
        cube((-5, 3.25, -5), (10, 11.75, 10)),
        cube((-6.25, 15.0, -6.25), (12.5, 0.92, 12.5)),
    ]
    add_four_corner_cubes(cubes, 1.75, 2.0, inset=6)
    add_four_corner_cubes(cubes, 13.75, 2.25, inset=6)
    add_side_panels(cubes, 4.15, 9.75, half_width=3.0, distance=5.0)
    add_vertical_glint(cubes, 3.35, 11.5, half_width=4.7, distance=5.0)
    return cubes


def upper_pillar_cubes() -> list[dict]:
    cubes = [
        cube((-6.25, 0.08, -6.25), (12.5, 0.92, 12.5)),
        cube((-5, 1.0, -5), (10, 10.75, 10)),
        cube((-7, 11.75, -7), (14, 1.0, 14)),
        cube((-6, 12.75, -6), (12, 0.75, 12)),
        cube((-2, 13.42, -2), (4, 0.72, 4), "amethyst_core"),
    ]
    add_four_corner_cubes(cubes, 0, 2.0, inset=6)
    add_four_corner_cubes(cubes, 11.75, 1.75, inset=7)
    add_side_panels(cubes, 2.0, 8.75, half_width=3.0, distance=5.0)
    add_vertical_glint(cubes, 1.05, 10.65, half_width=4.7, distance=5.0)
    add_crystal_focus(cubes, 13.25, 2.75, 5.2)
    return cubes


def altar_cubes() -> list[dict]:
    cubes = [
        cube((-8, 0, -8), (16, 1.0, 16)),
        cube((-7, 1.0, -7), (14, 1.0, 14)),
        cube((-6.5, 2.0, -6.5), (13, 1.0, 13)),
        cube((-6, 3.0, -6), (12, 5.75, 12)),
        cube((-7, 8.75, -7), (14, 0.75, 14)),
    ]
    add_side_panels(cubes, 3.75, 3.75, half_width=3.5, distance=6.0)
    add_vertical_glint(cubes, 3.05, 5.6, half_width=5.7, distance=6.0)

    # One coherent 22.5-degree plane gives the altar the unmistakable profile
    # of a lectern. Four separately sized sections preserve a true opening for
    # the amethyst focus while all sharing the same slope and pivot.
    slope = (22.5, 0, 0)
    slope_pivot = (0, 9.25, 0)
    cubes.extend([
        cube((-7, 9.0, -6), (4.5, 1.5, 12), rotation=slope, pivot=slope_pivot),
        cube((2.5, 9.0, -6), (4.5, 1.5, 12), rotation=slope, pivot=slope_pivot),
        cube((-2.5, 9.0, -6), (5.0, 1.5, 4.0), rotation=slope, pivot=slope_pivot),
        cube((-2.5, 9.0, 2.0), (5.0, 1.5, 4.0), rotation=slope, pivot=slope_pivot),
        # A vanilla amethyst-block socket follows the lectern slope. Its top is
        # a quarter unit below the surrounding stone, leaving a visible recess
        # while giving the cluster a solid growth base.
        cube(
            (-2.0, 9.45, -1.6),
            (4.0, 0.8, 3.2),
            "amethyst_core",
            rotation=slope,
            pivot=slope_pivot,
        ),
        # Copper side supports stop just below the sloped stone at each end.
        # The rear pair is taller because that edge of the lectern is raised.
        cube((-6.35, 2.25, -6.35), (1.7, 8.65, 1.7), "copper"),
        cube((4.65, 2.25, -6.35), (1.7, 8.65, 1.7), "copper"),
        cube((-6.35, 2.25, 4.65), (1.7, 4.2, 1.7), "copper"),
        cube((4.65, 2.25, 4.65), (1.7, 4.2, 1.7), "copper"),
        # Small slope-matched caps sit on the stone instead of passing through
        # it, preserving the copper-corner motif without intersecting geometry.
        cube((-6.8, 10.56, -5.8), (1.8, 0.65, 1.8), "copper", rotation=slope, pivot=slope_pivot),
        cube((5.0, 10.56, -5.8), (1.8, 0.65, 1.8), "copper", rotation=slope, pivot=slope_pivot),
        cube((-6.8, 10.56, 4.0), (1.8, 0.65, 1.8), "copper", rotation=slope, pivot=slope_pivot),
        cube((5.0, 10.56, 4.0), (1.8, 0.65, 1.8), "copper", rotation=slope, pivot=slope_pivot),
        cube((-1.0, 8.65, -6.25), (2.0, 0.55, 1.0), "copper", rotation=slope, pivot=slope_pivot),
        cube((-1.0, 9.75, 5.25), (2.0, 0.55, 1.0), "copper", rotation=slope, pivot=slope_pivot),
    ])
    # Small, non-emissive engraved glyphs run down both sides of the central
    # focus opening, matching the reference altar without adding more bloom.
    for x in (-4.7, 3.3):
        for z in (-4.4, -1.5, 1.4):
            cubes.append(surface_cutout(
                (x, 10.55, z),
                (1.4, 0.02, 1.9),
                "top_runes",
                rotation=slope,
                pivot=slope_pivot,
            ))
    # Seat the vanilla-style cluster slightly into the recessed amethyst block.
    add_crystal_focus(cubes, 10.0, 4.9, 5.8)
    return cubes


def generate_geometry() -> None:
    pillar = {
        "format_version": "1.12.0",
        "minecraft:geometry": [{
            "description": {
                "identifier": "geometry.adp_disenchanting_pillar_v2",
                "texture_width": 16,
                "texture_height": 16,
                "visible_bounds_width": 2,
                "visible_bounds_height": 3,
                "visible_bounds_offset": [0, 1, 0],
            },
            "bones": [
                {"name": "single", "pivot": [0, 0, 0], "cubes": compact_pillar_cubes()},
                {"name": "lower", "pivot": [0, 0, 0], "cubes": lower_pillar_cubes()},
                {"name": "upper", "pivot": [0, 0, 0], "cubes": upper_pillar_cubes()},
            ],
        }],
    }
    altar = {
        "format_version": "1.12.0",
        "minecraft:geometry": [{
            "description": {
                "identifier": "geometry.adp_disenchanting_altar",
                "texture_width": 16,
                "texture_height": 16,
                "visible_bounds_width": 2,
                "visible_bounds_height": 2,
                "visible_bounds_offset": [0, 0.75, 0],
            },
            "bones": [{"name": "altar", "pivot": [0, 0, 0], "cubes": altar_cubes()}],
        }],
    }
    write_json(MODELS_DIR / "disenchanting_pillar_v2.geo.json", pillar)
    write_json(MODELS_DIR / "disenchanting_altar.geo.json", altar)


def draw_original_rune_mask() -> Image.Image:
    image = Image.new("L", (64, 64), 0)
    draw = ImageDraw.Draw(image)
    # Original angular "severed bond" glyph with enough detail to remain
    # legible on the concept's tall recessed panels.
    segments = [
        ((17, 7), (43, 7)),
        ((43, 7), (43, 20)),
        ((43, 20), (31, 20)),
        ((31, 20), (31, 31)),
        ((31, 31), (48, 31)),
        ((48, 31), (48, 44)),
        ((48, 44), (21, 44)),
        ((21, 44), (21, 57)),
        ((12, 22), (21, 31)),
        ((12, 40), (21, 31)),
        ((48, 12), (54, 18)),
        ((48, 50), (54, 44)),
    ]
    for start, end in segments:
        draw.line((start, end), fill=255, width=4)
    for center in ((12, 12), (53, 27), (12, 51)):
        x, y = center
        draw.polygon(((x, y - 3), (x + 3, y), (x, y + 3), (x - 3, y)), fill=255)
    return image


def generate_rune_textures() -> None:
    mask = draw_original_rune_mask()
    for name, color in COLORS.items():
        # Keep only the dyed glyph opaque. The body texture remains visible
        # through the rest of the framed recess for every material variant.
        image = Image.new("RGBA", mask.size, (0, 0, 0, 0))
        glow = tuple(min(255, channel + 25) for channel in color)
        rune_pixels = image.load()
        mask_pixels = mask.load()
        for y in range(mask.height):
            for x in range(mask.width):
                if mask_pixels[x, y]:
                    rune_pixels[x, y] = (*glow, 255)
        image.save(TEXTURES_DIR / f"runes_{name}.png", optimize=True)

    mer = Image.new("RGB", mask.size, (0, 0, 245))
    mer.putdata([
        # MER channels are metalness, emissive, and roughness. Keep the rune
        # emission deliberately faint so Vibrant Visuals adds only a subtle
        # self-lit edge instead of a large bloom halo.
        (0, 15, 210) if alpha else (0, 0, 245)
        for alpha in mask.get_flattened_data()
    ])
    mer.save(TEXTURES_DIR / "runes_mer.png", optimize=True)

    # Small carved glyph used on the altar's lectern surface. It is deliberately
    # dark and non-emissive so the detail reads like an engraving in both
    # Classic rendering and Vibrant Visuals.
    top_rune = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    top_rune_draw = ImageDraw.Draw(top_rune)
    top_rune_draw.line(((4, 3), (11, 3), (8, 7), (12, 7), (12, 10), (5, 10), (8, 13)), fill=(58, 61, 68, 235), width=2)
    top_rune_draw.point((3, 7), fill=(58, 61, 68, 235))
    top_rune.save(TEXTURES_DIR / "altar_top_runes.png", optimize=True)

    # Original inner crystal core. This overlays only the center of Minecraft's
    # vanilla cluster cutout and carries a lower MER emission than the runes.
    amethyst_glow = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
    amethyst_glow_draw = ImageDraw.Draw(amethyst_glow)
    amethyst_glow_draw.polygon(
        ((8, 2), (11, 6), (10, 13), (8, 15), (6, 13), (5, 6)),
        fill=(142, 78, 196, 210),
    )
    amethyst_glow_draw.polygon(
        ((8, 4), (9, 7), (8, 12), (7, 7)),
        fill=(192, 136, 232, 220),
    )
    amethyst_glow.save(TEXTURES_DIR / "amethyst_inner_glow.png", optimize=True)
    amethyst_glow_mer = Image.new("RGB", (16, 16), (0, 0, 245))
    amethyst_glow_mer.putdata([
        (0, 22, 215) if alpha else (0, 0, 245)
        for alpha in amethyst_glow.getchannel("A").get_flattened_data()
    ])
    amethyst_glow_mer.save(TEXTURES_DIR / "amethyst_inner_glow_mer.png", optimize=True)
    write_json(
        TEXTURES_DIR / "amethyst_inner_glow.texture_set.json",
        {
            "format_version": "1.21.30",
            "minecraft:texture_set": {
                "color": "amethyst_inner_glow",
                "metalness_emissive_roughness": "amethyst_inner_glow_mer",
            },
        },
    )

    # Bedrock does not expose the enchanted-item glint shader to custom block
    # geometry. Reproduce its brief diagonal sweep with a sparse alpha-tested
    # flipbook instead. Frame zero is transparent; six following frames move a
    # one-pixel blue-purple highlight across the workstation's main faces.
    frame_count = 7
    glint = Image.new("RGBA", (16, 16 * frame_count), (0, 0, 0, 0))
    glint_pixels = glint.load()
    for frame, shift in enumerate((-12, -8, -4, 0, 4, 8), start=1):
        frame_y = frame * 16
        for y in range(16):
            x = 15 - y + shift
            if 0 <= x < 16 and y % 2 == 0:
                glint_pixels[x, frame_y + y] = (164, 132, 235, 190)
            highlight_x = x + 2
            if 0 <= highlight_x < 16 and y % 4 == 1:
                glint_pixels[highlight_x, frame_y + y] = (116, 184, 240, 185)
    glint.save(TEXTURES_DIR / "workstation_glint.png", optimize=True)
    write_json(
        RP / "textures" / "flipbook_textures.json",
        [{
            "flipbook_texture": "textures/blocks/workstations/workstation_glint",
            "atlas_tile": "adp_workstation_glint",
            # Thirty-two blank steps plus six sweep frames at four ticks each
            # produces one brief surface glint every 7.6 seconds.
            "frames": ([0] * 32) + [1, 2, 3, 4, 5, 6],
            "ticks_per_frame": 4,
            "blend_frames": False,
        }],
    )

    # Remove the former floating starburst implementation when regenerating an
    # existing working tree.
    for old_shimmer in (
        PARTICLE_TEXTURES_DIR / "workstation_shimmer.png",
        PARTICLES_DIR / "workstation_shimmer.particle.json",
    ):
        if old_shimmer.exists():
            old_shimmer.unlink()

    for name in COLORS:
        write_json(
            TEXTURES_DIR / f"runes_{name}.texture_set.json",
            {
                "format_version": "1.21.30",
                "minecraft:texture_set": {
                    "color": f"runes_{name}",
                    "metalness_emissive_roughness": "runes_mer",
                },
            },
        )


def read_cc0_runes() -> list[Image.Image]:
    if ADAPTED_RUNE_SOURCE.exists():
        strip = Image.open(ADAPTED_RUNE_SOURCE).convert("RGBA")
        return [strip.crop((0, y, 8, y + 8)) for y in range(0, strip.height, 8)]
    if not RUNE_SOURCE.exists():
        return [draw_original_rune_mask().resize((8, 8), Image.Resampling.NEAREST)]
    frames: list[Image.Image] = []
    with zipfile.ZipFile(RUNE_SOURCE) as archive:
        for letter in "acdefghiklmnorst":
            name = f"assets/minecraft/textures/particle/sga_{letter}.png"
            if name not in archive.namelist():
                continue
            frames.append(Image.open(io.BytesIO(archive.read(name))).convert("RGBA"))
    if not frames:
        return [draw_original_rune_mask().resize((8, 8), Image.Resampling.NEAREST)]
    ADAPTED_RUNE_SOURCE.parent.mkdir(parents=True, exist_ok=True)
    strip = Image.new("RGBA", (8, 8 * len(frames)), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        alpha = frame.getchannel("A")
        normalized = Image.new("RGBA", (8, 8), (255, 255, 255, 0))
        normalized.putalpha(alpha)
        strip.alpha_composite(normalized, (0, index * 8))
    strip.save(ADAPTED_RUNE_SOURCE, optimize=True)
    return frames


def generate_floating_runes() -> None:
    frames = read_cc0_runes()[:8]
    for old_texture in PARTICLE_TEXTURES_DIR.glob("floating_rune*.png"):
        old_texture.unlink()
    for old_effect in PARTICLES_DIR.glob("floating_rune*.particle.json"):
        old_effect.unlink()

    # The glyph shapes are shared by every workstation color. Script-provided
    # Molang variables tint these eight white masks at spawn time, avoiding the
    # former 16 colors x 8 shapes duplication.
    for index, source in enumerate(frames):
        alpha = source.getchannel("A")
        glyph_pixels = Image.new("RGBA", (8, 8), (255, 255, 255, 0))
        glyph_pixels.putalpha(alpha)
        texture = Image.new("RGBA", (16, 16), (0, 0, 0, 0))
        texture.alpha_composite(glyph_pixels, (4, 4))
        texture_name = f"floating_rune_{index}"
        texture.save(PARTICLE_TEXTURES_DIR / f"{texture_name}.png", optimize=True)

        effect = {
            "format_version": "1.10.0",
            "particle_effect": {
                "description": {
                    "identifier": f"adp:{texture_name}",
                    "basic_render_parameters": {
                        "material": "particles_alpha",
                        "texture": f"textures/particle/{texture_name}",
                    },
                },
                "components": {
                    "minecraft:emitter_rate_instant": {"num_particles": 2},
                    "minecraft:emitter_lifetime_once": {"active_time": 0.05},
                    "minecraft:emitter_shape_sphere": {
                        "radius": 0.62,
                        "direction": [
                            "v.particle_random_1 * 2.0 - 1.0",
                            "v.particle_random_2 * 0.35 + 0.12",
                            "v.particle_random_3 * 2.0 - 1.0",
                        ],
                        "surface_only": True,
                    },
                    "minecraft:particle_lifetime_expression": {
                        "max_lifetime": "0.95 + v.particle_random_1 * 0.75",
                    },
                    "minecraft:particle_initial_speed": "0.025 + v.particle_random_2 * 0.035",
                    "minecraft:particle_motion_dynamic": {
                        "linear_acceleration": [0, 0.018, 0],
                        "linear_drag_coefficient": 0.08,
                    },
                    "minecraft:particle_initial_spin": {
                        "rotation": "v.particle_random_2 * 70.0 - 35.0",
                        "rotation_rate": "v.particle_random_3 * 18.0 - 9.0",
                    },
                    "minecraft:particle_appearance_billboard": {
                        "size": [
                            "0.105 + v.particle_random_1 * 0.025",
                            "0.105 + v.particle_random_1 * 0.025",
                        ],
                        "facing_camera_mode": "lookat_xyz",
                        "uv": {
                            "texture_width": 16,
                            "texture_height": 16,
                            "uv": [0, 0],
                            "uv_size": [16, 16],
                        },
                    },
                    "minecraft:particle_appearance_tinting": {
                        "color": [
                            "variable.rune_color.r",
                            "variable.rune_color.g",
                            "variable.rune_color.b",
                            1.0,
                        ],
                    },
                },
            },
        }
        write_json(PARTICLES_DIR / f"{texture_name}.particle.json", effect)

def material_instances(material: Material, rune_color: str) -> dict:
    return {
        # Bedrock requires every material instance in one custom block to use
        # a compatible render method. Alpha-test also renders fully opaque
        # stone and copper correctly while supporting the cutout crystals and
        # rune mask.
        "*": {"texture": material.body_texture, "render_method": "alpha_test"},
        "body": {"texture": material.body_texture, "render_method": "alpha_test"},
        "copper": {"texture": "copper_block", "render_method": "alpha_test"},
        "panel": {"texture": "polished_tuff", "render_method": "alpha_test"},
        "amethyst": {"texture": "amethyst_cluster", "render_method": "alpha_test"},
        "amethyst_bud": {"texture": "medium_amethyst_bud", "render_method": "alpha_test"},
        "amethyst_core": {"texture": "amethyst_block", "render_method": "alpha_test"},
        "amethyst_glow": {
            "texture": "adp_amethyst_inner_glow",
            "render_method": "alpha_test",
            "face_dimming": False,
            "ambient_occlusion": False,
        },
        "top_runes": {
            "texture": "adp_altar_top_runes",
            "render_method": "alpha_test",
            "face_dimming": True,
            "ambient_occlusion": True,
        },
        "glint": {
            "texture": "adp_workstation_glint",
            "render_method": "alpha_test",
            "face_dimming": False,
            "ambient_occlusion": False,
        },
        "runes": {
            "texture": f"adp_workstation_runes_{rune_color}",
            "render_method": "alpha_test",
            "face_dimming": False,
            "ambient_occlusion": False,
        },
    }


def common_components(material: Material, geometry: object, loot: str) -> dict:
    return {
        "minecraft:geometry": geometry,
        "minecraft:material_instances": material_instances(material, "cyan"),
        "minecraft:collision_box": {"origin": [-8, 0, -8], "size": [16, 16, 16]},
        "minecraft:selection_box": {"origin": [-8, 0, -8], "size": [16, 16, 16]},
        "minecraft:destructible_by_mining": {"seconds_to_destroy": 4},
        "minecraft:destructible_by_explosion": False,
        "minecraft:loot": loot,
        "minecraft:map_color": "#5A5860",
        "minecraft:light_emission": 1,
        "tag:minecraft:is_pickaxe_item_destructible": {},
        "tag:minecraft:stone_tier_destructible": {},
        "tag:adp:disenchanting_workstation": {},
    }


def color_permutations(material: Material) -> list[dict]:
    return [
        {
            "condition": f"query.block_state('adp:rune_color') == '{color}'",
            "components": {"minecraft:material_instances": material_instances(material, color)},
        }
        for color in COLORS
    ]


def direction_permutations() -> list[dict]:
    return [
        {
            "condition": "query.block_state('minecraft:cardinal_direction') == 'east'",
            "components": {"minecraft:transformation": {"rotation": [0, 90, 0]}},
        },
        {
            "condition": "query.block_state('minecraft:cardinal_direction') == 'south'",
            "components": {"minecraft:transformation": {"rotation": [0, 180, 0]}},
        },
        {
            "condition": "query.block_state('minecraft:cardinal_direction') == 'west'",
            "components": {"minecraft:transformation": {"rotation": [0, 270, 0]}},
        },
    ]


def generate_block_files(material: Material) -> None:
    pillar_components = common_components(
        material,
        {
            "identifier": "geometry.adp_disenchanting_pillar_v2",
            "bone_visibility": {
                "single": "query.block_state('adp:stack_part') == 'single'",
                "lower": "query.block_state('adp:stack_part') == 'lower'",
                "upper": "query.block_state('adp:stack_part') == 'upper'",
            },
        },
        f"loot_tables/blocks/workstations/{material.slug}_disenchanting_pillar.json",
    )
    pillar_components["tag:adp:disenchanting_pillar"] = {}
    pillar = {
        "format_version": "1.21.90",
        "minecraft:block": {
            "description": {
                "identifier": material.pillar_id,
                "menu_category": {"category": "construction"},
                "states": {
                    "adp:powered": [False, True],
                    "adp:rune_color": list(COLORS),
                    "adp:stack_part": ["single", "lower", "upper"],
                },
            },
            "components": pillar_components,
            "permutations": color_permutations(material) + [{
                "condition": "query.block_state('adp:powered') == true",
                "components": {"minecraft:light_emission": 3},
            }],
        },
    }

    altar_components = common_components(
        material,
        "geometry.adp_disenchanting_altar",
        f"loot_tables/blocks/workstations/{material.slug}_disenchanting_altar.json",
    )
    altar_components["tag:adp:disenchanting_altar"] = {}
    altar = {
        "format_version": "1.21.90",
        "minecraft:block": {
            "description": {
                "identifier": material.altar_id,
                "menu_category": {"category": "construction"},
                "states": {
                    "adp:powered": [False, True],
                    "adp:rune_color": list(COLORS),
                },
                "traits": {
                    "minecraft:placement_direction": {
                        "enabled_states": ["minecraft:cardinal_direction"],
                        "y_rotation_offset": 180,
                    },
                },
            },
            "components": altar_components,
            "permutations": color_permutations(material) + direction_permutations() + [
                {
                    "condition": "query.block_state('adp:powered') == true",
                    "components": {"minecraft:light_emission": 3},
                },
            ],
        },
    }
    write_json(BLOCKS_DIR / f"{material.slug}_disenchanting_pillar.json", pillar)
    write_json(BLOCKS_DIR / f"{material.slug}_disenchanting_altar.json", altar)


def generate_loot(material: Material) -> None:
    for kind, identifier in (("pillar", material.pillar_id), ("altar", material.altar_id)):
        write_json(
            LOOT_DIR / f"{material.slug}_disenchanting_{kind}.json",
            {
                "pools": [{
                    "rolls": 1,
                    "entries": [{"type": "item", "name": identifier, "weight": 1}],
                }],
            },
        )


def generate_recipes(material: Material) -> None:
    write_json(
        RECIPES_DIR / f"{material.slug}_disenchanting_pillar.json",
        {
            "format_version": "1.21.10",
            "minecraft:recipe_shaped": {
                "description": {"identifier": f"adp:{material.slug}_disenchanting_pillar"},
                "tags": ["crafting_table"],
                "unlock": {"context": "AlwaysUnlocked"},
                "pattern": ["ALA", "CEC", "BOB"],
                "key": {
                    "A": {"item": "minecraft:amethyst_shard"},
                    "L": {"item": "minecraft:lapis_block"},
                    "C": {"item": "minecraft:copper_ingot"},
                    "E": {"item": "minecraft:enchanting_table"},
                    "O": {"item": "minecraft:obsidian"},
                    "B": {"item": material.item},
                },
                "result": {"item": material.pillar_id, "count": 1},
            },
        },
    )
    write_json(
        RECIPES_DIR / f"{material.slug}_disenchanting_altar.json",
        {
            "format_version": "1.21.10",
            "minecraft:recipe_shapeless": {
                "description": {"identifier": f"adp:{material.slug}_disenchanting_altar"},
                "tags": ["crafting_table"],
                "unlock": {"context": "AlwaysUnlocked"},
                "ingredients": [
                    {"item": material.pillar_id},
                    {"item": "minecraft:copper_ingot"},
                    {"item": "minecraft:copper_ingot"},
                    {"item": "minecraft:amethyst_shard"},
                ],
                "result": {"item": material.altar_id, "count": 1},
            },
        },
    )


def generate_legacy_block() -> None:
    default = next(material for material in MATERIALS if material.slug == "polished_blackstone_bricks")
    components = common_components(
        default,
        {
            "identifier": "geometry.adp_disenchanting_pillar_v2",
            "bone_visibility": {
                "single": "false",
                "lower": "query.block_state('adp:part') == 'base'",
                "upper": "query.block_state('adp:part') == 'middle'",
            },
        },
        f"loot_tables/blocks/workstations/{default.slug}_disenchanting_pillar.json",
    )
    components["tag:adp:legacy_disenchanting_pillar"] = {}
    legacy = {
        "format_version": "1.21.90",
        "minecraft:block": {
            "description": {
                "identifier": "adp:disenchanting_pillar",
                "states": {
                    "adp:powered": [False, True],
                    "adp:part": ["base", "middle", "top"],
                    "adp:rune_color": list(COLORS),
                },
            },
            "components": components,
            "permutations": color_permutations(default) + [{
                "condition": "query.block_state('adp:powered') == true",
                "components": {"minecraft:light_emission": 3},
            }],
        },
    }
    write_json(BP / "blocks" / "disenchanting_pillar.json", legacy)


def update_resource_tables() -> None:
    terrain = {
        "resource_pack_name": "andys_disenchanting_pillar",
        "texture_name": "atlas.terrain",
        "padding": 8,
        "num_mip_levels": 4,
        "texture_data": {},
    }
    texture_data = terrain["texture_data"]
    for material in MATERIALS:
        texture_data[material.body_texture] = {"textures": material.texture}
    for color in COLORS:
        texture_data[f"adp_workstation_runes_{color}"] = {
            "textures": f"textures/blocks/workstations/runes_{color}"
        }
    texture_data["adp_altar_top_runes"] = {
        "textures": "textures/blocks/workstations/altar_top_runes"
    }
    texture_data["adp_amethyst_inner_glow"] = {
        "textures": "textures/blocks/workstations/amethyst_inner_glow"
    }
    texture_data["adp_workstation_glint"] = {
        "textures": "textures/blocks/workstations/workstation_glint"
    }
    write_json(RP / "textures" / "terrain_texture.json", terrain)

    blocks = {"format_version": [1, 1, 0], "adp:disenchanting_pillar": {"sound": "stone"}}
    for material in MATERIALS:
        blocks[material.pillar_id] = {"sound": "stone"}
        blocks[material.altar_id] = {"sound": "stone"}
    write_json(RP / "blocks.json", blocks)

    textures = sorted(path.relative_to(RP).as_posix() for path in (RP / "textures").rglob("*.png"))
    write_json(RP / "textures" / "textures_list.json", textures)


def update_language_files() -> None:
    bp_lang_path = BP / "texts" / "en_US.lang"
    rp_lang_path = RP / "texts" / "en_US.lang"

    def retained_lines(path: Path) -> list[str]:
        lines = path.read_text(encoding="utf-8-sig").splitlines() if path.exists() else []
        return [
            line for line in lines
            if not line.startswith("tile.adp:")
            or line.startswith("tile.adp:disenchanting_pillar")
        ]

    generated = []
    for material in MATERIALS:
        generated.extend([
            f"tile.{material.pillar_id}.name={material.name} Disenchanting Pillar",
            f"tile.{material.altar_id}.name={material.name} Disenchanting Altar",
        ])
    for path in (bp_lang_path, rp_lang_path):
        lines = retained_lines(path)
        lines = [line for line in lines if not line.startswith("tile.adp:disenchanting_pillar")]
        lines.append("tile.adp:disenchanting_pillar.name=Legacy Disenchanting Pillar")
        lines.extend(generated)
        path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def update_legacy_recipe_and_loot() -> None:
    for path in (
        BP / "recipes" / "disenchanting_pillar.json",
        BP / "loot_tables" / "blocks" / "disenchanting_pillar.json",
    ):
        if path.exists():
            path.unlink()


def generate_pack_icons() -> None:
    """Create compact Bedrock menu icons from the preserved high-resolution art."""
    source = PACK_ICON_SOURCE if PACK_ICON_SOURCE.exists() else BP / "pack_icon.png"
    with Image.open(source) as image:
        resized = image.convert("RGB").resize(PACK_ICON_SIZE, Image.Resampling.LANCZOS)
        optimized = resized.quantize(colors=256, method=Image.Quantize.MEDIANCUT)
        for destination in (BP / "pack_icon.png", RP / "pack_icon.png"):
            optimized.save(destination, optimize=True, compress_level=9)


def generate_all() -> None:
    if len(MATERIALS) != 48:
        raise RuntimeError(f"Expected 48 materials, found {len(MATERIALS)}")
    reset_generated_directories()
    generate_geometry()
    generate_rune_textures()
    generate_floating_runes()
    for material in MATERIALS:
        generate_block_files(material)
        generate_recipes(material)
        generate_loot(material)
    generate_legacy_block()
    update_legacy_recipe_and_loot()
    update_resource_tables()
    update_language_files()
    generate_pack_icons()
    print(f"Generated {len(MATERIALS)} pillar blocks, {len(MATERIALS)} altar blocks, and {len(COLORS)} rune colors.")


if __name__ == "__main__":
    generate_all()
