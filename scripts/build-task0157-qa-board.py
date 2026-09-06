from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
TASK = ROOT / "screenshots" / "task0157-editorial-refinement"
SOURCE = Path(
    "D:/微信缓存/xwechat_files/wxid_uhonng7fyrci22_a5df/temp/"
    "RWTemp/2026-09/9e20f478899dc29eb19741386f9343c8"
)


def font(size: int, bold: bool = False):
    candidates = [
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def paste_contained(canvas: Image.Image, image_path: Path, box: tuple[int, int, int, int]):
    left, top, right, bottom = box
    image = Image.open(image_path).convert("RGB")
    image.thumbnail((right - left, bottom - top), Image.Resampling.LANCZOS)
    x = left + (right - left - image.width) // 2
    y = top + (bottom - top - image.height) // 2
    canvas.paste(image, (x, y))


comparisons = [
    (
        "INQUIRY / OVERALL",
        SOURCE / "b2293e6796cda989b19c9c1edce10950.png",
        TASK / "inquiry-inquiry-brief-1440.png",
    ),
    (
        "INQUIRY / FORM",
        SOURCE / "d188ee9f42a23789cbcbbbb2d717d917.png",
        TASK / "inquiry-validation-1440.png",
    ),
    (
        "TECHNOLOGY / SYSTEM",
        SOURCE / "3bd8c24fe876e58394081034bb1abfa9.png",
        TASK / "technology-technology-explorer-intro-1440.png",
    ),
    (
        "TECHNOLOGY / CTA",
        SOURCE / "98e8bf88dba03da7937d063b71f42bc2.png",
        TASK / "technology-subpage-contact-blue-1440.png",
    ),
    (
        "APPLICATIONS / DIRECTIONS",
        SOURCE / "50060308787036b42ceb9109cd95c6b4.png",
        TASK / "applications-application-spectrum-1440.png",
    ),
    (
        "APPLICATIONS / CTA",
        SOURCE / "c4f47d53ea9e7b4446f18171febf5563.png",
        TASK / "applications-subpage-contact-1440.png",
    ),
    (
        "VIDEO CENTER / LIBRARY",
        SOURCE / "252ca37bc09c726902bf287a095c5708.png",
        TASK / "video-center-video-library-1440.png",
    ),
]


width = 2040
header_height = 132
row_height = 490
gutter = 36
column_width = (width - gutter * 3) // 2
height = header_height + row_height * len(comparisons) + gutter
canvas = Image.new("RGB", (width, height), "#d8d7d2")
draw = ImageDraw.Draw(canvas)
draw.text((gutter, 28), "BLUE WORM / TASK 015.7 / BEFORE–AFTER QA", fill="#101112", font=font(30, True))
draw.text((gutter, 82), "SOURCE / PROBLEM EVIDENCE", fill="#55585a", font=font(18, True))
draw.text((gutter * 2 + column_width, 82), "IMPLEMENTATION / FINAL CAPTURE", fill="#55585a", font=font(18, True))

for index, (label, source_path, implementation_path) in enumerate(comparisons):
    top = header_height + row_height * index
    draw.text((gutter, top + 10), label, fill="#303234", font=font(18, True))
    image_top = top + 48
    image_bottom = top + row_height - 20
    paste_contained(canvas, source_path, (gutter, image_top, gutter + column_width, image_bottom))
    paste_contained(
        canvas,
        implementation_path,
        (gutter * 2 + column_width, image_top, width - gutter, image_bottom),
    )

output = TASK / "task0157-before-after-qa-board.jpg"
canvas.save(output, quality=92, optimize=True, progressive=True)
print(output.name)
