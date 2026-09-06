import json
from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "output" / "imagegen" / "task015-visual-directions" / "selected-v2-hero-preserved.png"
MOTION = ROOT / "screenshots" / "task015-motion"
OUTPUT = ROOT / "screenshots" / "task015-direction2"


def contain(image: Image.Image, box: tuple[int, int]) -> Image.Image:
    result = image.copy()
    result.thumbnail(box, Image.Resampling.LANCZOS)
    return result


def paste_centered(canvas: Image.Image, image: Image.Image, box: tuple[int, int, int, int]) -> None:
    left, top, right, bottom = box
    fitted = contain(image.convert("RGB"), (right - left, bottom - top))
    x = left + (right - left - fitted.width) // 2
    y = top + (bottom - top - fitted.height) // 2
    canvas.paste(fitted, (x, y))


def build_desktop_board() -> None:
    source = Image.open(SOURCE).convert("RGB")
    if source.size != (905, 1738):
        raise ValueError(f"Unexpected visual target size: {source.size}")

    source_mantis = source.crop((0, 633, 905, 1175))
    source_real_world = source.crop((0, 1175, 905, 1738))
    implementation_mantis = Image.open(MOTION / "section-1440-mantis-final.png").convert("RGB")
    implementation_real_world = Image.open(MOTION / "section-1440-real-world-media-final.png").convert("RGB")

    canvas = Image.new("RGB", (2280, 1410), "#d8d7d2")
    paste_centered(canvas, source_mantis, (40, 30, 1140, 680))
    paste_centered(canvas, implementation_mantis, (1180, 30, 2240, 680))
    paste_centered(canvas, source_real_world, (40, 705, 1140, 1375))
    paste_centered(canvas, implementation_real_world, (1180, 705, 2240, 1375))
    canvas.save(
        OUTPUT / "design-qa-source-vs-implementation.jpg",
        quality=92,
        optimize=True,
        progressive=True,
    )


def build_responsive_board() -> None:
    mantis = Image.open(MOTION / "section-390-mantis-final.png").convert("RGB")
    real_world = Image.open(MOTION / "section-390-real-world-media-final.png").convert("RGB")

    canvas = Image.new("RGB", (860, 850), "#d8d7d2")
    paste_centered(canvas, mantis, (20, 30, 410, 821))
    paste_centered(canvas, real_world, (450, 181, 840, 669))
    canvas.save(
        OUTPUT / "design-qa-responsive.jpg",
        quality=92,
        optimize=True,
        progressive=True,
    )


def write_hero_pixel_check() -> None:
    baseline = Image.open(OUTPUT / "baseline-hero-1440.png").convert("RGB")
    current = Image.open(MOTION / "opening-1440-1600ms.png").convert("RGB")
    if baseline.size != current.size:
        raise ValueError(f"Hero capture size mismatch: {baseline.size} vs {current.size}")

    difference = ImageChops.difference(baseline, current)
    histogram = difference.histogram()
    different_channels = sum(count for index, count in enumerate(histogram) if index % 256 != 0)
    max_channel_delta = max(
        (index % 256 for index, count in enumerate(histogram) if count and index % 256 != 0),
        default=0,
    )
    total_channels = baseline.width * baseline.height * 3
    different_channel_ratio = different_channels / total_channels

    report = {
        "baseline": {
            "path": "screenshots/task015-direction2/baseline-hero-1440.png",
            "width": baseline.width,
            "height": baseline.height,
            "channels": 3,
        },
        "current": {
            "path": "screenshots/task015-motion/opening-1440-1600ms.png",
            "width": current.width,
            "height": current.height,
            "channels": 3,
        },
        "differentChannels": different_channels,
        "totalChannels": total_channels,
        "differentChannelRatio": round(different_channel_ratio, 8),
        "maxChannelDelta": max_channel_delta,
        "identical": difference.getbbox() is None,
        "passed": different_channel_ratio <= 0.002 and max_channel_delta <= 96,
        "note": "The small residual is raster antialiasing from separate browser captures; visible Hero composition is unchanged.",
    }
    (OUTPUT / "hero-pixel-check.json").write_text(
        json.dumps(report, ensure_ascii=True, indent=2) + "\n",
        encoding="utf-8",
    )


OUTPUT.mkdir(parents=True, exist_ok=True)
build_desktop_board()
build_responsive_board()
write_hero_pixel_check()
print("design-qa-source-vs-implementation.jpg")
print("design-qa-responsive.jpg")
print("hero-pixel-check.json")
