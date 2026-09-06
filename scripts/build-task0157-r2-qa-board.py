import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BEFORE = ROOT / "screenshots" / "task0157-r2-audit"
AFTER = ROOT / "screenshots" / "task0157-r2"


def font(size: int, bold: bool = False):
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def paste_contained(canvas: Image.Image, image_path: Path, box: tuple[int, int, int, int]):
    left, top, right, bottom = box
    image = Image.open(image_path).convert("RGB")
    image.thumbnail((right - left, bottom - top), Image.Resampling.LANCZOS)
    x = left + (right - left - image.width) // 2
    y = top + (bottom - top - image.height) // 2
    canvas.paste(image, (x, y))


report = json.loads((AFTER / "browser-qa.json").read_text(encoding="utf-8"))
for width in (1440, 390):
    record = next(item for item in report["captures"] if item["route"] == "/about" and item["width"] == width)
    source = Image.open(AFTER / f"about-{width}.png").convert("RGB")
    top = round(record["aboutBelief"]["section"]["pageTop"])
    height = round(record["aboutBelief"]["section"]["height"])
    source.crop((0, top, source.width, top + height)).save(AFTER / f"about-section-clean-{width}.png")


comparisons = [
    (
        "VIDEO CENTER / ENTRY",
        BEFORE / "01-video-center-before.png",
        AFTER / "video-center-focus-1440.png",
    ),
    (
        "ABOUT / RESEARCH SECTION",
        BEFORE / "02-about-belief-before.png",
        AFTER / "about-section-clean-1440.png",
    ),
]

width = 2040
header_height = 136
row_height = 760
gutter = 36
column_width = (width - gutter * 3) // 2
height = header_height + row_height * len(comparisons) + gutter
canvas = Image.new("RGB", (width, height), "#d8d7d2")
draw = ImageDraw.Draw(canvas)
draw.text((gutter, 28), "BLUE WORM / TASK 015.7 R2 / BEFORE–AFTER QA", fill="#101112", font=font(30, True))
draw.text((gutter, 82), "SOURCE / PROBLEM EVIDENCE", fill="#55585a", font=font(18, True))
draw.text((gutter * 2 + column_width, 82), "IMPLEMENTATION / FINAL CAPTURE", fill="#55585a", font=font(18, True))

for index, (label, before_path, after_path) in enumerate(comparisons):
    top = header_height + row_height * index
    draw.text((gutter, top + 10), label, fill="#303234", font=font(18, True))
    paste_contained(canvas, before_path, (gutter, top + 54, gutter + column_width, top + row_height - 24))
    paste_contained(canvas, after_path, (gutter * 2 + column_width, top + 54, width - gutter, top + row_height - 24))

output = AFTER / "task0157-r2-before-after-board.jpg"
canvas.save(output, quality=92, optimize=True, progressive=True)
print(output.name)
