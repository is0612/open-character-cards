"""把纯白底立绘抠成透明 PNG（只删与画布边缘连通的白色，角色身上的白色保留）。

用法: python keyout.py <in_dir> <out_dir>
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage


def keyout(src: Path, dst: Path) -> tuple[int, int, int, int]:
    img = Image.open(src).convert("RGB")
    w, h = img.size
    arr = np.asarray(img).astype(np.int16)

    mn = arr.min(axis=2)
    mx = arr.max(axis=2)
    near_white = (mn >= 230) & ((mx - mn) <= 20)

    # 连通域标记，只保留与画布四条边相连的那部分白（角色内部的白色不受影响）
    labels, count = ndimage.label(near_white)
    edge = np.concatenate([labels[0, :], labels[-1, :], labels[:, 0], labels[:, -1]])
    edge_labels = np.unique(edge[edge > 0])
    bg = np.isin(labels, edge_labels)

    alpha = np.where(bg, 0, 255).astype(np.uint8)
    a = Image.fromarray(alpha, "L")
    a = a.filter(ImageFilter.MinFilter(3))       # 收缩 1px，吃掉残留白边
    a = a.filter(ImageFilter.GaussianBlur(0.6))  # 羽化抗锯齿

    out = img.convert("RGBA")
    out.putalpha(a)

    box = out.getbbox()
    if box:
        out = out.crop(box)

    dst.parent.mkdir(parents=True, exist_ok=True)
    out.save(dst, optimize=True)
    return (w, h, out.size[0], out.size[1])


def main() -> None:
    src_dir = Path(sys.argv[1])
    out_dir = Path(sys.argv[2])
    for f in sorted(src_dir.glob("*.png")):
        if f.name.startswith("Japanese_"):
            continue
        ow, oh, nw, nh = keyout(f, out_dir / f.name)
        print(f"{f.name:<16} {ow}x{oh} -> {nw}x{nh}")


if __name__ == "__main__":
    main()
