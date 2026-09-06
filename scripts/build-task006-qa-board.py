from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / "screenshots"
OUT = SHOTS / "task006-qa-ia-boundary.png"


def label_font(size: int):
    try:
        return ImageFont.truetype("C:/Windows/Fonts/arialbd.ttf", size)
    except OSError:
        return ImageFont.load_default()


def fit_width(image: Image.Image, width: int) -> Image.Image:
    height = round(image.height * width / image.width)
    return image.resize((width, height), Image.Resampling.LANCZOS)


before = Image.open(SHOTS / "task006-before-home-desktop.png").convert("RGB")
after = Image.open(SHOTS / "task006-home-desktop.png").convert("RGB")
product = Image.open(SHOTS / "task006-standard-product-desktop.png").convert("RGB")

# Compare the two sections that previously made Home too deep against their
# new destinations: a short bridge on Home and the full content on Product.
before_deep = before.crop((0, 900, 1440, 2973))
after_bridge = after.crop((0, 900, 1440, 1531))
product_deep = product.crop((0, 487, 1440, 2560))

columns = [
    ("BEFORE · HOME OWNED FULL EXPLANATION", fit_width(before_deep, 660)),
    ("AFTER · HOME CONCEPT BRIDGE", fit_width(after_bridge, 660)),
    ("AFTER · PRODUCT OWNS FULL DETAIL", fit_width(product_deep, 660)),
]

padding = 34
label_height = 64
canvas_width = padding + sum(image.width + padding for _, image in columns)
canvas_height = padding + label_height + max(image.height for _, image in columns) + padding
canvas = Image.new("RGB", (canvas_width, canvas_height), "#111315")
draw = ImageDraw.Draw(canvas)
font = label_font(20)

x = padding
for label, image in columns:
    draw.text((x, padding + 12), label, fill="#f5f4f0", font=font)
    canvas.paste(image, (x, padding + label_height))
    x += image.width + padding

canvas.save(OUT, optimize=True)
print(OUT.name)
