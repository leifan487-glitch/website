from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "screenshots"
TASK = SHOTS / "task013"
PAIRS = [
    ("Technology", SHOTS / "task008-technology-1440.png", TASK / "technology-internal-1440-long.png"),
    ("Applications", SHOTS / "task008-applications-1440.png", TASK / "applications-internal-1440-long.png"),
    ("About", SHOTS / "task008-about-1440.png", TASK / "about-internal-1440-long.png"),
    ("Progress", SHOTS / "task008-news-1440.png", TASK / "progress-internal-1440-long.png"),
]

CELL_W = 620
CELL_H = 980
HEADER_H = 62
GAP = 20
BG = (232, 231, 227)
INK = (12, 13, 14)

def get_font(size):
    for path in (Path("C:/Windows/Fonts/arialbd.ttf"), Path("C:/Windows/Fonts/arial.ttf")):
        if path.exists():
            return ImageFont.truetype(str(path), size)
    return ImageFont.load_default()

def contain(image, width, height):
    copy = image.copy()
    copy.thumbnail((width, height), Image.Resampling.LANCZOS)
    return copy

canvas_w = CELL_W * 2 + GAP * 3
canvas_h = 82 + len(PAIRS) * (HEADER_H + CELL_H + GAP)
canvas = Image.new("RGB", (canvas_w, canvas_h), BG)
draw = ImageDraw.Draw(canvas)
draw.text((GAP, 24), "TASK 013 / COMPANY CONTENT FRAMEWORK / DESIGN QA", fill=INK, font=get_font(24))

y = 82
for label, before_path, after_path in PAIRS:
    draw.text((GAP, y + 18), f"{label} / V0 BASELINE", fill=INK, font=get_font(17))
    draw.text((GAP * 2 + CELL_W, y + 18), f"{label} / V1 INTERNAL REVIEW", fill=INK, font=get_font(17))
    y += HEADER_H
    for image_path, x in ((before_path, GAP), (after_path, GAP * 2 + CELL_W)):
        image = contain(Image.open(image_path).convert("RGB"), CELL_W, CELL_H)
        canvas.paste(image, (x + (CELL_W - image.width) // 2, y + (CELL_H - image.height) // 2))
    y += CELL_H + GAP

canvas.save(TASK / "task013-design-qa-board.jpg", quality=88, optimize=True)
