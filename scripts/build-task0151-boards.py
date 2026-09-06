from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
TASK = ROOT / "screenshots" / "task0151" / "public"


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


def paste_centered(canvas: Image.Image, image_path: Path, box: tuple[int, int, int, int]):
    left, top, right, bottom = box
    image = contain(Image.open(image_path).convert("RGB"), (right - left, bottom - top))
    x = left + (right - left - image.width) // 2
    y = top + (bottom - top - image.height) // 2
    canvas.paste(image, (x, y))


def build_public_review_board():
    width = 2400
    height = 1980
    canvas = Image.new("RGB", (width, height), "#d8d7d2")
    draw = ImageDraw.Draw(canvas)
    draw.text((54, 34), "BLUE WORM / TASK 015.1 / PRODUCTION PUBLIC V2", fill="#101112", font=font(30, True))
    draw.text((54, 82), "FINAL REFINEMENT REVIEW BOARD", fill="#55585a", font=font(18, True))

    desktop = [
        ("REAL WORLD / DESKTOP", "01-real-world-1440.png"),
        ("TECHNOLOGY / DESKTOP", "02-technology-1440.png"),
        ("APPLICATIONS / DESKTOP", "03-applications-1440.png"),
    ]
    mobile = [
        ("REAL WORLD / MOBILE", "05-real-world-390.png"),
        ("TECHNOLOGY / MOBILE", "06-technology-390.png"),
        ("APPLICATIONS / MOBILE", "07-applications-390.png"),
    ]
    cell_width = 738
    x_positions = [54, 831, 1608]

    for column, (label, filename) in enumerate(desktop):
        x = x_positions[column]
        draw.text((x, 126), label, fill="#55585a", font=font(17, True))
        paste_centered(canvas, TASK / filename, (x, 162, x + cell_width, 1050))

    for column, (label, filename) in enumerate(mobile):
        x = x_positions[column]
        draw.text((x, 1090), label, fill="#55585a", font=font(17, True))
        paste_centered(canvas, TASK / filename, (x, 1128, x + cell_width, 1926))

    canvas.save(TASK / "task0151-production-public-v2-review-board.jpg", quality=91, optimize=True, progressive=True)


def build_mobile_crop_board():
    width = 1860
    height = 820
    canvas = Image.new("RGB", (width, height), "#d8d7d2")
    draw = ImageDraw.Draw(canvas)
    draw.text((48, 30), "TASK 015.1 / 390PX REEL CROP AUDIT / 4:5", fill="#101112", font=font(28, True))
    frames = [
        ("01 / SV010 / REEL 01.5S", "09-reel-sv010-390.png"),
        ("02 / SV018 / REEL 05.0S", "10-reel-sv018-390.png"),
        ("03 / SV054 / REEL 09.0S", "11-reel-sv054-390.png"),
        ("04 / SV007 / REEL 12.5S", "12-reel-sv007-390.png"),
    ]
    box_width = 420
    gap = 28
    for index, (label, filename) in enumerate(frames):
        left = 48 + index * (box_width + gap)
        draw.text((left, 92), label, fill="#55585a", font=font(16, True))
        paste_centered(canvas, TASK / filename, (left, 132, left + box_width, 766))
    canvas.save(TASK / "task0151-mobile-reel-crop-board.jpg", quality=92, optimize=True, progressive=True)


build_public_review_board()
build_mobile_crop_board()
print("task0151-production-public-v2-review-board.jpg")
print("task0151-mobile-reel-crop-board.jpg")
