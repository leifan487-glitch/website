from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
TASK = ROOT / "screenshots" / "task015"


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


def build_before_after():
    width = 2160
    height = 1660
    canvas = Image.new("RGB", (width, height), "#d8d7d2")
    draw = ImageDraw.Draw(canvas)
    draw.text((54, 34), "BLUE WORM / TASK 015 / VISUAL LANGUAGE V2", fill="#101112", font=font(30, True))
    draw.text((54, 86), "BEFORE / V1", fill="#55585a", font=font(18, True))
    draw.text((1098, 86), "AFTER / V2 PROTOTYPE", fill="#55585a", font=font(18, True))
    paste_centered(canvas, TASK / "01-before-home-core-1440.png", (54, 128, 1062, 1606))
    paste_centered(canvas, TASK / "02-after-home-core-1440.png", (1098, 128, 2106, 1606))
    canvas.save(TASK / "task015-before-after-board.jpg", quality=90, optimize=True, progressive=True)


def build_visual_language():
    width = 2220
    height = 1860
    canvas = Image.new("RGB", (width, height), "#d8d7d2")
    draw = ImageDraw.Draw(canvas)
    draw.text((48, 30), "BLUE WORM / VISUAL LANGUAGE V2 / REVIEW BOARD", fill="#101112", font=font(30, True))

    desktop = [
        ("REAL WORLD / DESKTOP", "03-real-world-1440.png"),
        ("TECHNOLOGY / DESKTOP", "04-technology-1440.png"),
        ("APPLICATIONS / DESKTOP", "05-applications-1440.png"),
    ]
    mobile = [
        ("REAL WORLD / MOBILE", "07-real-world-390.png"),
        ("TECHNOLOGY / MOBILE", "08-technology-390.png"),
        ("APPLICATIONS / MOBILE", "09-applications-390.png"),
    ]
    cell_width = 692
    x_positions = [48, 764, 1480]

    for column, (label, filename) in enumerate(desktop):
        x = x_positions[column]
        draw.text((x, 92), label, fill="#55585a", font=font(17, True))
        paste_centered(canvas, TASK / filename, (x, 128, x + cell_width, 996))

    for column, (label, filename) in enumerate(mobile):
        x = x_positions[column]
        draw.text((x, 1040), label, fill="#55585a", font=font(17, True))
        paste_centered(canvas, TASK / filename, (x, 1078, x + cell_width, 1812))

    canvas.save(TASK / "task015-visual-language-board.jpg", quality=90, optimize=True, progressive=True)


build_before_after()
build_visual_language()
print("task015-before-after-board.jpg")
print("task015-visual-language-board.jpg")
