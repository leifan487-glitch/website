from pathlib import Path

from PIL import Image, ImageOps


root = Path(__file__).resolve().parents[2]
source = root / "经验素材取地/蓝虫具身/标准版渲染/合体渲染/视角一/JPG/01.jpg"
target = root / "website/public/assets/hero-standard-series-a01644-mobile-focus.webp"

with Image.open(source) as image:
    image = ImageOps.exif_transpose(image).convert("RGB")
    # Deliberate mobile composition: the complete central Mantis and one
    # adjacent arm configuration, with no partial product at either edge.
    image = image.crop((3500, 750, 5650, 3975))
    image = image.resize((1000, 1500), Image.Resampling.LANCZOS)
    image.save(target, "WEBP", quality=86, method=6)
    print(f"{target.name}: {image.width}x{image.height}")
