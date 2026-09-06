from pathlib import Path

from PIL import Image, ImageOps


root = Path(__file__).resolve().parents[2]
assets = root / "website/public/assets"

hero_source = root / "经验素材取地/微信图片_20260903105656_13_124.png"
hero_target = assets / "hero-standard-editorial-source-0903.webp"

standard_source = root / "经验素材取地/蓝虫具身/标准版渲染/整机/PNG/01.png"
nav_target = assets / "nav-standard-a01781.webp"

with Image.open(hero_source) as image:
    image = ImageOps.exif_transpose(image).convert("RGB")
    image.thumbnail((2400, 1350), Image.Resampling.LANCZOS)
    image.save(hero_target, "WEBP", quality=86, method=6)
    print(f"{hero_target.name}: {image.width}x{image.height}")

with Image.open(standard_source) as image:
    image = ImageOps.exif_transpose(image).convert("RGBA")
    # A01781 is the isolated front-view Standard render. Preserve its alpha;
    # no products are composited or retouched.
    alpha = image.getchannel("A")
    bounds = alpha.getbbox()
    if bounds:
        image = image.crop(bounds)
    image.thumbnail((560, 760), Image.Resampling.LANCZOS)
    image.save(nav_target, "WEBP", quality=86, method=6)
    print(f"{nav_target.name}: {image.width}x{image.height}")
