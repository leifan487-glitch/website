from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
shot = root / "screenshots"
items = [
    ("TASK 007 HOME", "task007-home-1440.png"),
    ("TASK 008 HOME", "task008-home-1440.png"),
    ("STANDARD", "task008-standard-1440.png"),
    ("TECHNOLOGY", "task008-technology-1440.png"),
    ("APPLICATIONS", "task008-applications-1440.png"),
    ("ABOUT", "task008-about-1440.png"),
    ("NEWS", "task008-news-1440.png"),
    ("CONTACT", "task008-contact-1440.png"),
]
font = ImageFont.load_default()
thumb_w, gap, label_h, cols = 340, 24, 34, 4
cards = []
for label, name in items:
    image = Image.open(shot / name).convert("RGB")
    image.thumbnail((thumb_w, 1500), Image.Resampling.LANCZOS)
    card = Image.new("RGB", (thumb_w, image.height + label_h), "#f2f0eb")
    card.paste(image, (0, label_h))
    ImageDraw.Draw(card).text((10, 10), label, fill="#090a0b", font=font)
    cards.append(card)

rows = (len(cards) + cols - 1) // cols
row_heights = [max(card.height for card in cards[r*cols:(r+1)*cols]) for r in range(rows)]
canvas = Image.new("RGB", (cols*thumb_w + (cols+1)*gap, sum(row_heights) + (rows+1)*gap), "#111315")
y = gap
for row in range(rows):
    x = gap
    for card in cards[row*cols:(row+1)*cols]:
        canvas.paste(card, (x, y))
        x += thumb_w + gap
    y += row_heights[row] + gap
canvas.save(shot / "task008-design-qa-board.jpg", quality=88, optimize=True)
print("task008-design-qa-board.jpg")
