from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


root = Path(__file__).resolve().parents[2]
screens = root / "website/screenshots"
out = screens / "task0093-design-qa-board.jpg"

font = ImageFont.load_default()
canvas = Image.new("RGB", (1640, 1510), "#111315")
draw = ImageDraw.Draw(canvas)


def label(text, x, y):
    draw.text((x, y), text, fill="#f4f4f2", font=font)


def place(image_path, box, crop=None):
    with Image.open(image_path) as image:
        image = image.convert("RGB")
        if crop:
            image = image.crop(crop)
        fitted = ImageOps.contain(image, (box[2], box[3]), Image.Resampling.LANCZOS)
        x = box[0] + (box[2] - fitted.width) // 2
        y = box[1] + (box[3] - fitted.height) // 2
        canvas.paste(fitted, (x, y))


label("01 HERO ARTWORK — SOURCE", 40, 24)
label("01 HERO ARTWORK — IMPLEMENTATION 1440x900", 840, 24)
place(root / "经验素材取地/微信图片_20260903105656_13_124.png", (40, 50, 760, 430))
place(screens / "task0093-home-1440.png", (840, 50, 760, 430))

label("02 NAV SURFACE — REFERENCE", 40, 514)
label("02 NAV SURFACE — IMPLEMENTATION", 840, 514)
place(
    Path("C:/Users/99770/AppData/Local/Temp/codex-clipboard-5c113005-c29d-442b-a9e0-9433041a0b72.png"),
    (40, 540, 760, 170),
)
place(screens / "task0093-home-1440.png", (840, 540, 760, 170), crop=(0, 0, 1440, 120))

label("03 PRODUCT PANEL — REFERENCE", 40, 754)
label("03 PRODUCT PANEL — IMPLEMENTATION", 840, 754)
place(
    Path("C:/Users/99770/AppData/Local/Temp/codex-clipboard-20e740b2-d96d-4ac7-89c1-421c7f0679a6.png"),
    (40, 780, 760, 300),
)
place(
    screens / "task0093-dropdown-standard-1440.png",
    (840, 780, 760, 300),
    crop=(0, 82, 1440, 310),
)

label("04 PRODUCT PANEL — UPCOMING STATE", 40, 1124)
place(
    screens / "task0093-dropdown-upcoming-1440.png",
    (40, 1150, 1560, 310),
    crop=(0, 82, 1440, 310),
)

out.parent.mkdir(parents=True, exist_ok=True)
canvas.save(out, "JPEG", quality=90, optimize=True)
print(out.name)
