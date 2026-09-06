from __future__ import annotations

import html
import json
import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


SHARE_DATE = os.environ.get("SHARE_DATE", "2026-09-05")
OUTPUT_DIR = Path("screenshots") / f"share-{SHARE_DATE}"
REPORT_PATH = OUTPUT_DIR / "capture-report.json"


def load_font(size: int, bold: bool = False) -> ImageFont.ImageFont:
    candidates = [
        Path("C:/Windows/Fonts/msyhbd.ttc" if bold else "C:/Windows/Fonts/msyh.ttc"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    return ImageFont.load_default()


def make_board(report: dict, viewport: str, columns: int) -> str:
    rows = [item for item in report["results"] if item["viewport"] == viewport]
    card_width = 420 if viewport == "desktop" else 310
    card_height = 700
    gap = 24
    margin = 36
    header_height = 110
    row_count = (len(rows) + columns - 1) // columns
    board_width = margin * 2 + columns * card_width + (columns - 1) * gap
    board_height = margin * 2 + header_height + row_count * card_height + (row_count - 1) * gap
    board = Image.new("RGB", (board_width, board_height), "#f3f3f1")
    draw = ImageDraw.Draw(board)
    draw.text(
        (margin, margin),
        f"Blue Worm Website | {viewport.title()} Full-page Screenshots",
        fill="#111111",
        font=load_font(30, True),
    )
    draw.text(
        (margin, margin + 44),
        f"Production Public snapshot | {SHARE_DATE} | {len(rows)} pages",
        fill="#555555",
        font=load_font(18),
    )

    for index, item in enumerate(rows):
        column = index % columns
        row = index // columns
        x = margin + column * (card_width + gap)
        y = margin + header_height + row * (card_height + gap)
        draw.rounded_rectangle(
            (x, y, x + card_width, y + card_height),
            radius=7,
            fill="#ffffff",
            outline="#d5d5d0",
            width=1,
        )
        image = Image.open(OUTPUT_DIR / item["filename"]).convert("RGB")
        image.thumbnail((card_width - 36, card_height - 108), Image.Resampling.LANCZOS)
        image_x = x + (card_width - image.width) // 2
        image_y = y + 18
        board.paste(image, (image_x, image_y))
        label_y = y + card_height - 72
        draw.text(
            (x + 18, label_y),
            f"{index + 1:02d}  {item['label']}",
            fill="#111111",
            font=load_font(17, True),
        )
        draw.text((x + 18, label_y + 28), item["path"], fill="#666666", font=load_font(14))

    filename = f"00-overview-{viewport}.jpg"
    board.save(OUTPUT_DIR / filename, quality=90, optimize=True)
    return filename


def make_gallery(report: dict, board_names: list[str]) -> None:
    cards = []
    for route in report["routes"]:
        desktop = next(
            item for item in report["results"]
            if item["path"] == route["path"] and item["viewport"] == "desktop"
        )
        mobile = next(
            item for item in report["results"]
            if item["path"] == route["path"] and item["viewport"] == "mobile"
        )
        cards.append(
            f"""
        <section>
          <header><span>{html.escape(route['slug'][:2])}</span><h2>{html.escape(route['label'])}</h2><code>{html.escape(route['path'])}</code></header>
          <div class="pair">
            <a href="{html.escape(desktop['filename'])}"><img src="{html.escape(desktop['filename'])}" alt="{html.escape(route['label'])} desktop screenshot"><strong>Desktop 1440px</strong></a>
            <a href="{html.escape(mobile['filename'])}"><img src="{html.escape(mobile['filename'])}" alt="{html.escape(route['label'])} mobile screenshot"><strong>Mobile 390px</strong></a>
          </div>
        </section>
        """
        )

    board_links = "".join(
        f'<a class="board" href="{name}"><img src="{name}" alt="Screenshot overview"><strong>{name}</strong></a>'
        for name in board_names
    )
    document = f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>\u84dd\u866b\u5177\u8eab\u5b98\u7f51\u622a\u56fe\u5305 {SHARE_DATE}</title>
<style>
*{{box-sizing:border-box}}body{{margin:0;background:#ecece8;color:#111;font-family:Arial,'Microsoft YaHei',sans-serif}}main{{max-width:1480px;margin:auto;padding:48px 28px 80px}}h1{{font-size:clamp(30px,5vw,68px);margin:0 0 12px}}.intro{{color:#555;margin:0 0 34px}}.boards{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;margin-bottom:28px}}.board,section{{background:#fff;border:1px solid #d4d4cf;border-radius:7px;overflow:hidden}}.board{{display:block;color:inherit;text-decoration:none;padding:14px}}.board img{{display:block;width:100%;height:300px;object-fit:contain;background:#f5f5f2}}.board strong,.pair strong{{display:block;padding-top:10px}}section{{margin:18px 0;padding:20px}}section header{{display:flex;align-items:baseline;gap:14px;border-bottom:1px solid #ddd;padding-bottom:14px;margin-bottom:18px}}section header span{{font-weight:700}}section h2{{font-size:24px;margin:0}}code{{margin-left:auto;color:#666}}.pair{{display:grid;grid-template-columns:minmax(0,1fr) minmax(220px,.32fr);gap:18px;align-items:start}}.pair a{{color:inherit;text-decoration:none;min-width:0}}.pair img{{display:block;width:100%;max-height:760px;object-fit:contain;object-position:top;background:#f4f4f1;border:1px solid #ddd}}@media(max-width:720px){{main{{padding:28px 14px 50px}}.boards,.pair{{grid-template-columns:1fr}}section header{{align-items:flex-start;flex-wrap:wrap}}code{{width:100%;margin:0}}}}
</style>
</head>
<body><main>
<h1>\u84dd\u866b\u5177\u8eab\u5b98\u7f51\u622a\u56fe\u5305</h1>
<p class="intro">Production Public | {SHARE_DATE} | {report['routeCount']} \u4e2a\u9875\u9762 | \u684c\u9762\u4e0e\u624b\u673a\u5b8c\u6574\u957f\u56fe</p>
<div class="boards">{board_links}</div>
{''.join(cards)}
</main></body></html>
"""
    (OUTPUT_DIR / "index.html").write_text(document, encoding="utf-8")


def make_readme(report: dict, board_names: list[str]) -> None:
    route_lines = "\n".join(f"- `{item['path']}`: {item['label']}" for item in report["routes"])
    result_text = "\u901a\u8fc7" if report["allPassed"] else "\u672a\u901a\u8fc7\uff0c\u8bf7\u67e5\u770b capture-report.json"
    content = f"""# \u84dd\u866b\u5177\u8eab\u5b98\u7f51\u622a\u56fe\u5305

- \u622a\u56fe\u65e5\u671f: {SHARE_DATE}
- \u5c55\u793a\u53e3\u5f84: Production Public
- \u9875\u9762\u6570\u91cf: {report['routeCount']}
- \u622a\u56fe\u6570\u91cf: {report['screenshotCount']} (\u6bcf\u9875 Desktop 1440px + Mobile 390px)
- \u81ea\u52a8\u6838\u9a8c: {result_text}

## \u5feb\u901f\u67e5\u770b

- `{board_names[0]}`: \u684c\u9762\u7248\u603b\u89c8
- `{board_names[1]}`: \u624b\u673a\u7248\u603b\u89c8
- `index.html`: \u53ef\u70b9\u51fb\u6d4f\u89c8\u5168\u90e8\u957f\u56fe
- `capture-report.json`: HTTP\u3001\u7834\u56fe\u3001\u6a2a\u5411\u6ea2\u51fa\u4e0e\u6d4f\u89c8\u5668\u9519\u8bef\u68c0\u67e5

## \u9875\u9762\u6e05\u5355

{route_lines}

## \u8bf4\u660e

\u672c\u622a\u56fe\u5305\u53ea\u5305\u542b\u5f53\u524d\u516c\u5f00\u5bfc\u822a\u4e0e\u516c\u5f00\u5185\u5bb9\u3002\u672a\u516c\u5f00\u7684\u6587\u6863\u3001\u4e0b\u8f7d\u3001\u552e\u540e\u3001\u77e5\u8bc6\u5e93\u6a21\u5757\u6ca1\u6709\u52a0\u5165\u5bf9\u5916\u622a\u56fe\uff1b\u5b83\u4eec\u5f53\u524d\u4ec5\u663e\u793a\u201c\u6682\u672a\u5f00\u653e\u201d\u3002\u56fe\u7247\u4e0e\u89c6\u9891\u516c\u5f00\u8fb9\u754c\u6cbf\u7528\u5b98\u7f51\u73b0\u6709 Production Public \u914d\u7f6e\u3002
"""
    (OUTPUT_DIR / "README.md").write_text(content, encoding="utf-8")


report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
boards = [
    make_board(report, "desktop", columns=3),
    make_board(report, "mobile", columns=4),
]
make_gallery(report, boards)
make_readme(report, boards)

print(json.dumps({
    "outputDir": str(OUTPUT_DIR.resolve()),
    "boards": boards,
    "gallery": "index.html",
    "readme": "README.md",
}, ensure_ascii=True, indent=2))
