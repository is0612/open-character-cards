"""抹掉 AI 生图右下角的水印（浅灰字压在纯色背景上）。

做法：先按像素找出人物的最右边界，确保水印矩形不与人物重叠；
再逐行取「同高度、人物左侧」的背景 90 分位色，平铺进矩形，左/上边缘做羽化。
不改尺寸、不动人物。

用法: python tools/mock/dewater.py bailing xiachuan
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ASSETS = Path('tools/mock/assets')


def clean(name: str) -> str:
    src = ASSETS / f'{name}.png'
    im = Image.open(src).convert('RGB')
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape
    gray = a.mean(axis=2)
    bg = float(np.median(gray[0:40, 0:40]))

    # 人物最右边界（只看下半部分，图标/文字都在那儿）
    lower = gray[int(h * 0.80):h, : int(w * 0.98)]
    ys_l, xs_l = np.where(lower < bg - 18)
    right = int(xs_l.max()) if len(xs_l) else 0
    x0 = min(max(right + 14, int(w * 0.70)), int(w * 0.94))
    y0 = int(h * 0.86)

    # 矩形内不该有任何人物的暗像素，有就说明顶点估错了
    probe = gray[y0:h, x0:w]
    hit = int((probe < bg - 18).sum())
    print(f'{name}: 人物右边界 {right}px, 清理区 x[{x0}-{w - 1}] y[{y0}-{h - 1}], 区内暗像素 {hit}')

    # 逐行取干净背景色：左侧 200px 内的 90 分位（避开可能侵入的深色人物）
    band = a[:, max(x0 - 200, 0):max(x0 - 16, 1), :]
    row_color = np.percentile(band, 90, axis=1)  # (h, 3)

    out = a.copy()
    out[y0:h, x0:w, :] = row_color[y0:h][:, None, :]

    # 左侧与上方各羽化一段，避免出现硬边
    wx = np.clip((np.arange(x0, w) - x0 + 1) / 18.0, 0, 1)[None, :, None]
    wy = np.clip((np.arange(y0, h) - y0 + 1) / 10.0, 0, 1)[:, None, None]
    k = wx * wy
    out[y0:h, x0:w, :] = a[y0:h, x0:w, :] * (1 - k) + out[y0:h, x0:w, :] * k

    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8)).save(src)
    return f'{name}: 已清理 -> {src}'


if __name__ == '__main__':
    names = sys.argv[1:] or ['bailing', 'xiachuan']
    for n in names:
        print(clean(n))
