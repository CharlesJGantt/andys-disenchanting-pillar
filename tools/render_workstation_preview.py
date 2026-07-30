"""Render a lightweight isometric QA preview of the generated workstation geometry."""

from __future__ import annotations

import json
import math
from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
MODELS = ROOT / "Andys Disenchanting Pillar RP" / "models" / "blocks"
OUTPUT = ROOT / "docs" / "generated_workstation_geometry_preview.png"

MATERIAL_COLORS = {
    "body": (105, 108, 112),
    "copper": (174, 99, 65),
    "panel": (34, 38, 46),
    "runes": (38, 205, 218),
    "amethyst": (142, 83, 191),
    "amethyst_bud": (164, 105, 210),
    "amethyst_core": (126, 72, 174),
}

FACES = (
    (0, 1, 3, 2),
    (4, 6, 7, 5),
    (0, 4, 5, 1),
    (2, 3, 7, 6),
    (0, 2, 6, 4),
    (1, 5, 7, 3),
)


def normalize(vector: tuple[float, float, float]) -> tuple[float, float, float]:
    length = math.sqrt(sum(value * value for value in vector))
    return tuple(value / length for value in vector)


def dot(left: tuple[float, float, float], right: tuple[float, float, float]) -> float:
    return sum(a * b for a, b in zip(left, right))


def cross(left: tuple[float, float, float], right: tuple[float, float, float]) -> tuple[float, float, float]:
    return (
        left[1] * right[2] - left[2] * right[1],
        left[2] * right[0] - left[0] * right[2],
        left[0] * right[1] - left[1] * right[0],
    )


def rotate(point: tuple[float, float, float], rotation: list[float], pivot: list[float]) -> tuple[float, float, float]:
    x, y, z = (point[index] - pivot[index] for index in range(3))
    for axis, degrees in enumerate(rotation):
        angle = math.radians(degrees)
        sine, cosine = math.sin(angle), math.cos(angle)
        if axis == 0:
            y, z = y * cosine - z * sine, y * sine + z * cosine
        elif axis == 1:
            x, z = x * cosine + z * sine, -x * sine + z * cosine
        else:
            x, y = x * cosine - y * sine, x * sine + y * cosine
    return x + pivot[0], y + pivot[1], z + pivot[2]


def material_for_cube(cube: dict) -> str:
    uv = cube.get("uv", {})
    for face in uv.values():
        if isinstance(face, dict) and face.get("material_instance"):
            return face["material_instance"]
    return "body"


def cube_vertices(cube: dict, y_offset: float) -> list[tuple[float, float, float]]:
    x, y, z = cube["origin"]
    width, height, depth = cube["size"]
    points = [
        (x, y, z),
        (x + width, y, z),
        (x, y + height, z),
        (x + width, y + height, z),
        (x, y, z + depth),
        (x + width, y, z + depth),
        (x, y + height, z + depth),
        (x + width, y + height, z + depth),
    ]
    if "rotation" in cube:
        points = [rotate(point, cube["rotation"], cube.get("pivot", [0, 0, 0])) for point in points]
    return [(px, py + y_offset, pz) for px, py, pz in points]


def load_bone(path: Path, name: str) -> list[dict]:
    geometry = json.loads(path.read_text(encoding="utf-8"))
    bones = geometry["minecraft:geometry"][0]["bones"]
    return next(bone["cubes"] for bone in bones if bone["name"] == name)


def model_faces(cubes_with_offsets: list[tuple[list[dict], float]]) -> list[tuple[float, list[tuple[float, float, float]], str]]:
    camera = normalize((1.4, 1.0, -1.4))
    faces = []
    for cubes, y_offset in cubes_with_offsets:
        for cube in cubes:
            vertices = cube_vertices(cube, y_offset)
            material = material_for_cube(cube)
            for indices in FACES:
                polygon = [vertices[index] for index in indices]
                edge_a = tuple(polygon[1][axis] - polygon[0][axis] for axis in range(3))
                edge_b = tuple(polygon[2][axis] - polygon[0][axis] for axis in range(3))
                normal = cross(edge_a, edge_b)
                center = tuple(sum(point[axis] for point in polygon) / 4 for axis in range(3))
                if dot(normal, camera) <= 0:
                    continue
                faces.append((dot(center, camera), polygon, material))
    return sorted(faces, key=lambda item: item[0])


def render_model(cubes_with_offsets: list[tuple[list[dict], float]], size: tuple[int, int]) -> Image.Image:
    width, height = size
    camera = normalize((1.4, 1.0, -1.4))
    right = normalize(cross((0, 1, 0), camera))
    up = normalize(cross(camera, right))
    faces = model_faces(cubes_with_offsets)
    projected = []
    points = []
    for depth, polygon, material in faces:
        screen = [(dot(point, right), -dot(point, up)) for point in polygon]
        points.extend(screen)
        projected.append((depth, screen, material, polygon))
    min_x = min(point[0] for point in points)
    max_x = max(point[0] for point in points)
    min_y = min(point[1] for point in points)
    max_y = max(point[1] for point in points)
    scale = min((width - 32) / (max_x - min_x), (height - 32) / (max_y - min_y))
    offset_x = (width - (max_x - min_x) * scale) / 2 - min_x * scale
    offset_y = (height - (max_y - min_y) * scale) / 2 - min_y * scale

    image = Image.new("RGBA", size, (24, 27, 33, 255))
    draw = ImageDraw.Draw(image)
    light = normalize((-0.5, 1.0, -0.3))
    for _, polygon, material, world_polygon in projected:
        edge_a = tuple(world_polygon[1][axis] - world_polygon[0][axis] for axis in range(3))
        edge_b = tuple(world_polygon[2][axis] - world_polygon[0][axis] for axis in range(3))
        normal = normalize(cross(edge_a, edge_b))
        brightness = 0.72 + max(0, dot(normal, light)) * 0.28
        base = MATERIAL_COLORS.get(material, MATERIAL_COLORS["body"])
        color = tuple(min(255, round(channel * brightness)) for channel in base) + (255,)
        screen_polygon = [(x * scale + offset_x, y * scale + offset_y) for x, y in polygon]
        draw.polygon(screen_polygon, fill=color, outline=(18, 20, 24, 230))
    return image


def main() -> None:
    pillar_path = MODELS / "disenchanting_pillar_v2.geo.json"
    altar_path = MODELS / "disenchanting_altar.geo.json"
    compact = load_bone(pillar_path, "single")
    lower = load_bone(pillar_path, "lower")
    upper = load_bone(pillar_path, "upper")
    altar = load_bone(altar_path, "altar")

    panels = [
        render_model([(compact, 0)], (420, 620)),
        render_model([(lower, 0), (upper, 16)], (420, 620)),
        render_model([(altar, 0)], (500, 620)),
    ]
    output = Image.new("RGBA", (sum(panel.width for panel in panels), 620), (24, 27, 33, 255))
    x = 0
    for panel in panels:
        output.alpha_composite(panel, (x, 0))
        x += panel.width
    output.save(OUTPUT, optimize=True)
    print(OUTPUT)


if __name__ == "__main__":
    main()
