from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "website" / "public" / "assets"

ASSETS = [
    ("technology-pro-head-p00003.webp", ROOT / "经验素材取地/蓝虫具身/PRO版渲染/0723 渲染.31.jpg", (1920, 1080)),
    ("pro-arm-detail-p00004.webp", ROOT / "经验素材取地/蓝虫具身/PRO版渲染/胳膊渲染.37.jpg", (1920, 1080)),
    ("about-company-a00767.webp", ROOT / "经验素材取地/照片素材/26.5.21领导视察照片/IMG_4253.JPG", (1800, 1350)),
    ("engineering-a00706.webp", ROOT / "经验素材取地/照片素材/12.3生产/NIK_2435.JPG", (1800, 1200)),
    ("news-event-a02136.webp", ROOT / "经验素材取地/活动文件/珠海比赛/10.29比赛/照片/NIK_0658.JPG", (1800, 1200)),
    ("application-service-a01588.webp", ROOT / "docs/preview/keyframes/A01588/frame-04-0032.99s.jpg", (900, 1200)),
    ("application-field-a01610.webp", ROOT / "docs/preview/keyframes/A01610/frame-01-0014.74s.jpg", (1600, 900)),
    ("news-task-a02330.webp", ROOT / "docs/preview/keyframes/A02330/frame-03-0032.23s.jpg", (1600, 900)),
    ("news-task-a01596.webp", ROOT / "docs/preview/keyframes/A01596/frame-03-0060.17s.jpg", (1600, 900)),
]

OUT.mkdir(parents=True, exist_ok=True)
for name, source, size in ASSETS:
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image.thumbnail(size, Image.Resampling.LANCZOS)
        image.save(OUT / name, "WEBP", quality=82, method=6)
        print(f"{name}: {image.width}x{image.height}")
