from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
BEFORE = ROOT / "screenshots" / "task014"
AFTER = ROOT / "screenshots" / "task0141"
OUT = AFTER / "task0141-before-after-board.jpg"


def font(size: int, bold: bool = False):
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def contain(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    result = image.copy()
    result.thumbnail(box, Image.Resampling.LANCZOS)
    return result


pairs = [
    ("HOME", BEFORE / "02-home-1440-long.png", AFTER / "home-1440-long.png"),
    ("STANDARD", BEFORE / "04-standard-1440-long.png", AFTER / "standard-1440-long.png"),
    ("APPLICATIONS", BEFORE / "08-applications-1440-long.png", AFTER / "applications-1440-long.png"),
    ("ABOUT", BEFORE / "09-about-1440-long.png", AFTER / "about-1440-long.png"),
]

panel_width = 1010
panel_height = 720
gutter = 36
row_header = 78
row_height = row_header + panel_height + 42
canvas = Image.new("RGB", (panel_width * 2 + gutter + 72, row_height * len(pairs) + 92), "#d7d6d1")
draw = ImageDraw.Draw(canvas)
draw.text((36, 24), "BLUE WORM / TASK 014.1 / PUBLIC CONTENT DENSITY", fill="#101112", font=font(27, True))
draw.text((36, 61), "BEFORE", fill="#4d5052", font=font(15, True))
draw.text((panel_width + gutter + 36, 61), "AFTER", fill="#4d5052", font=font(15, True))

for index, (name, before_path, after_path) in enumerate(pairs):
    y0 = 92 + index * row_height
    draw.rectangle((0, y0, canvas.width, y0 + row_header), fill="#111214")
    draw.text((36, y0 + 24), name, fill="#f7f6f2", font=font(24, True))
    for column, path in enumerate((before_path, after_path)):
        image = Image.open(path).convert("RGB")
        fitted = contain(image, (panel_width, panel_height))
        x = 36 + column * (panel_width + gutter) + (panel_width - fitted.width) // 2
        y = y0 + row_header + (panel_height - fitted.height) // 2
        canvas.paste(fitted, (x, y))

OUT.parent.mkdir(parents=True, exist_ok=True)
canvas.save(OUT, quality=90, optimize=True, progressive=True)
print(OUT.name)
