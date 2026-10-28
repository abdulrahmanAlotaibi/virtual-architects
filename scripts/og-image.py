#!/usr/bin/env python3
"""Draw app/opengraph-image.png (1200x630): the board mark beside the wordmark on a paper
panel, on the desk, in the light Review Desk colors from app/globals.css.
Standard library only. Run it again if the mark or the colors change."""
import struct
import zlib
from pathlib import Path

W, H = 1200, 630
SS = 4  # supersampling for the round shapes

DESK = (0xEB, 0xE1, 0xCB)
PAPER = (0xFD, 0xF9, 0xEE)
RULE = (0xE6, 0xDC, 0xC4)
SHADOW = (0xD6, 0xC9, 0xAD)
INK = (0x22, 0x1D, 0x17)
INK_3 = (0x7A, 0x6F, 0x5C)
STAMP = (0xC9, 0x3F, 0x28)
# --tint-0, 1, 2, 4, 5: enterprise, solution, cloud and infra, research, the board.
SEATS = [(0x7D, 0x3C, 0x6B), (0x2D, 0x6A, 0x43), (0xB0, 0x7A, 0x1C), (0x66, 0x77, 0x1F), (0x8B, 0x5E, 0x2B)]

GLYPHS = {
    "A": ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
    "C": ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
    "D": ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
    "E": ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
    "F": ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
    "O": ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
    "Y": ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
    "H": ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
    "I": ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
    "L": ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
    "R": ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
    "S": ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
    "T": ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
    "U": ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
    "V": ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
    " ": ["00000"] * 7,
}

px = [[DESK for _ in range(W)] for _ in range(H)]


def rect(x, y, w, h, c):
    for yy in range(max(0, y), min(H, y + h)):
        row = px[yy]
        for xx in range(max(0, x), min(W, x + w)):
            row[xx] = c


def blend(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))


def shape(x0, y0, x1, y1, inside, c):
    """Fill the pixels where `inside(x, y)` holds, anti-aliased by supersampling."""
    for yy in range(max(0, int(y0)), min(H, int(y1) + 1)):
        for xx in range(max(0, int(x0)), min(W, int(x1) + 1)):
            hits = sum(inside(xx + (i + 0.5) / SS, yy + (j + 0.5) / SS) for i in range(SS) for j in range(SS))
            if hits:
                px[yy][xx] = blend(px[yy][xx], c, hits / (SS * SS))


def circle(cx, cy, r, c):
    shape(cx - r, cy - r, cx + r, cy + r, lambda x, y: (x - cx) ** 2 + (y - cy) ** 2 <= r * r, c)


def rounded(x, y, w, h, r, c):
    def inside(px_, py_):
        qx = max(abs(px_ - (x + w / 2)) - (w / 2 - r), 0)
        qy = max(abs(py_ - (y + h / 2)) - (h / 2 - r), 0)
        return qx * qx + qy * qy <= r * r
    shape(x, y, x + w, y + h, inside, c)


# Paper panel with a rule and a soft offset shadow.
PX, PY, PW, PH = 96, 130, W - 192, 370
rect(PX + 12, PY + 12, PW, PH, SHADOW)
rect(PX, PY, PW, PH, RULE)
rect(PX + 1, PY + 1, PW - 2, PH - 2, PAPER)

# The mark, 24-unit grid scaled by 9, on the left of the panel.
S = 9.0
MX, MY = PX + 92, PY + (PH - 24 * S) / 2
for (cx, cy), c in zip([(12, 3.6), (19.99, 9.4), (16.94, 18.8), (7.06, 18.8), (4.01, 9.4)], SEATS):
    circle(MX + cx * S, MY + cy * S, 3.1 * S, c)
rounded(MX + 8.4 * S, MY + 8.4 * S, 7.2 * S, 7.2 * S, 2 * S, STAMP)


def word(text, x, y, cell, c):
    for i, ch in enumerate(text):
        g = GLYPHS[ch]
        for r in range(7):
            for k in range(5):
                if g[r][k] == "1":
                    rect(x + (i * 6 + k) * cell, y + r * cell, cell, cell, c)


# Wordmark, two lines in ink, then the tagline below it.
TX = int(MX + 24 * S + 72)
CELL = 9
word("VIRTUAL", TX, PY + 92, CELL, INK)
word("ARCHITECTS", TX, PY + 92 + 7 * CELL + 24, CELL, INK)
word("FIVE ADVISE  YOU DECIDE", TX, PY + 92 + 2 * (7 * CELL) + 24 + 52, 3, INK_3)

def png(path: Path):
    raw = b"".join(b"\x00" + bytes(v for p in row for v in p) for row in px)

    def chunk(tag, data):
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)

    data = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", W, H, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw, 9)) + chunk(b"IEND", b"")
    path.write_bytes(data)


png(Path(__file__).resolve().parent.parent / "app" / "opengraph-image.png")
print("wrote app/opengraph-image.png")
