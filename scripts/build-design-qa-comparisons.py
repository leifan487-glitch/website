from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[2]
WEBSITE = ROOT / "website"
SHOT = WEBSITE / "screenshots" / "homepage-core-1440x1000.png"
OUT = WEBSITE / "screenshots"


def font(size: int):
    for candidate in (
        Path("C:/Windows/Fonts/arialbd.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ):
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def contain(image: Image.Image, size: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(size, Image.Resampling.LANCZOS)
    return copy


def comparison(name: str, reference_path: Path, crop: tuple[int, int, int, int]):
    reference = Image.open(reference_path).convert("RGB")
    implementation = Image.open(SHOT).convert("RGB").crop(crop)

    panel_width = 1180
    panel_height = 960
    header_height = 92
    gap = 28
    canvas = Image.new(
        "RGB",
        (panel_width * 2 + gap, panel_height + header_height),
        "#d4d3cf",
    )
    draw = ImageDraw.Draw(canvas)
    draw.text((28, 28), "REFERENCE / LAYOUT PRINCIPLE", fill="#111111", font=font(24))
    draw.text(
        (panel_width + gap + 28, 28),
        "BLUE WORM / IMPLEMENTATION",
        fill="#111111",
        font=font(24),
    )

    for index, image in enumerate((reference, implementation)):
        fitted = contain(image, (panel_width, panel_height))
        x = index * (panel_width + gap) + (panel_width - fitted.width) // 2
        y = header_height + (panel_height - fitted.height) // 2
        canvas.paste(fitted, (x, y))

    path = OUT / f"qa-comparison-{name}.png"
    canvas.save(path, optimize=True)
    return path


comparisons = [
    comparison(
        "product-idea",
        ROOT / "docs/reference-research/envato/10_arku/03_editorial-about-grid.png",
        (0, 1000, 1440, 2092),
    ),
    comparison(
        "product-detail",
        ROOT / "docs/reference-research/envato/02_archik/02_large-media-showcase.png",
        (0, 2092, 1440, 3262),
    ),
    comparison(
        "real-world",
        ROOT / "docs/reference-research/envato/04_xstar/03_dark-media-transition.png",
        (0, 3262, 1440, 4452),
    ),
]

master = Image.new("RGB", (2388, 1052 * len(comparisons)), "#bdbcb8")
for index, path in enumerate(comparisons):
    board = Image.open(path).convert("RGB")
    master.paste(board, (0, index * 1052))
master.save(OUT / "qa-comparison-homepage-core.png", optimize=True)
