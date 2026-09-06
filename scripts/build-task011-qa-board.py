from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "screenshots"
PAIRS = [
    ("Support / 1280", SHOTS / "task011-before" / "02-support-1280.png", SHOTS / "task011-support-1280.png"),
    ("Inquiry / 768", SHOTS / "task011-before" / "04-inquiry-768.png", SHOTS / "task011-inquiry-768.png"),
    ("Mobile menu / 390", SHOTS / "task011-before" / "05-menu-390.png", SHOTS / "task011-menu-390.png"),
    ("Footer / 390", SHOTS / "task011-before" / "06-footer-390.png", SHOTS / "task011-footer-390.png"),
]

CELL_W = 760
HEADER_H = 52
GAP = 18
BG = (239, 239, 236)
INK = (15, 16, 17)
font = ImageFont.load_default(size=20)
label_font = ImageFont.load_default(size=16)

rows = []
for label, before_path, after_path in PAIRS:
    before = Image.open(before_path).convert("RGB")
    after = Image.open(after_path).convert("RGB")
    row_h = max(round(before.height * CELL_W / before.width), round(after.height * CELL_W / after.width))
    rows.append((label, before, after, row_h))

canvas_h = 76 + sum(HEADER_H + row_h + GAP for _, _, _, row_h in rows)
canvas = Image.new("RGB", (CELL_W * 2 + GAP * 3, canvas_h), BG)
draw = ImageDraw.Draw(canvas)
draw.text((GAP, 22), "TASK 011  /  VISUAL CONSISTENCY QA", fill=INK, font=font)

y = 68
for label, before, after, row_h in rows:
    draw.text((GAP, y + 14), f"{label}  ·  BEFORE", fill=INK, font=label_font)
    draw.text((GAP * 2 + CELL_W, y + 14), f"{label}  ·  AFTER", fill=INK, font=label_font)
    y += HEADER_H
    for image, x in ((before, GAP), (after, GAP * 2 + CELL_W)):
        resized_h = round(image.height * CELL_W / image.width)
        image = image.resize((CELL_W, resized_h), Image.Resampling.LANCZOS)
        canvas.paste(image, (x, y))
    y += row_h + GAP

canvas.save(SHOTS / "task011-design-qa-board.jpg", quality=86, optimize=True)
