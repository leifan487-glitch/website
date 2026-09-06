from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[2]
source = root / "经验素材取地/活动文件/珠海比赛/10.29比赛/照片/NIK_0658.JPG"
target = root / "website/public/assets/news-event-a02136.webp"

with Image.open(source) as image:
    image = ImageOps.exif_transpose(image).convert("RGB")
    # Deliberately exclude the foreground robot from the public event image.
    image = image.crop((0, 0, image.width, 1500))
    image.thumbnail((1800, 700), Image.Resampling.LANCZOS)
    image.save(target, "WEBP", quality=82, method=6)
    print(f"news-event-a02136.webp: {image.width}x{image.height}")
