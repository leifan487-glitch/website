from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
SHOT = ROOT / "screenshots"
items = [
    ("SOURCE / LOCKED V1", "task006-home-desktop.png"),
    ("HOME V0", "task007-home-1440.png"),
    ("PRODUCTS", "task007-products-1440.png"),
    ("STANDARD", "task007-standard-1440.png"),
    ("PRO", "task007-pro-1440.png"),
    ("TECHNOLOGY", "task007-technology-1440.png"),
    ("APPLICATIONS", "task007-applications-1440.png"),
    ("ABOUT", "task007-about-1440.png"),
    ("NEWS", "task007-news-1440.png"),
    ("CONTACT", "task007-contact-1440.png"),
]
font = ImageFont.load_default()
thumb_w, gap, label_h = 320, 24, 34
thumbs = []
for label, name in items:
    im = Image.open(SHOT / name).convert("RGB")
    im.thumbnail((thumb_w, 1400), Image.Resampling.LANCZOS)
    card = Image.new("RGB", (thumb_w, im.height + label_h), "#f2f0eb")
    card.paste(im, (0, label_h))
    ImageDraw.Draw(card).text((10, 10), label, fill="#090a0b", font=font)
    thumbs.append(card)

cols = 5
rows = (len(thumbs) + cols - 1) // cols
row_heights = [max(thumbs[i].height for i in range(r*cols, min((r+1)*cols, len(thumbs)))) for r in range(rows)]
canvas = Image.new("RGB", (cols*thumb_w + (cols+1)*gap, sum(row_heights) + (rows+1)*gap), "#111315")
y = gap
for r in range(rows):
    x = gap
    for c in range(cols):
        i = r*cols+c
        if i >= len(thumbs): break
        canvas.paste(thumbs[i], (x, y))
        x += thumb_w + gap
    y += row_heights[r] + gap
canvas.save(SHOT / "task007-design-qa-board.jpg", quality=88, optimize=True)
print("task007-design-qa-board.jpg")
