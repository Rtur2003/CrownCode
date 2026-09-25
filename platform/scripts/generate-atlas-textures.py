"""Build the static textures of the homepage atlas scene.

  public/images/atlas/nebula.webp   2048x1024 equirectangular sky: warm dust band
                                    along the galactic plane, slate-blue depth,
                                    dark lanes. Seeded, so it rebuilds identically.
  public/images/atlas/crown.png     the crowned-face mark as a gold glyph on
                                    transparent alpha (sprite for the atlas core).

Usage (from platform/): python scripts/generate-atlas-textures.py
Requires numpy + Pillow.
"""
import numpy as np
from PIL import Image

rng = np.random.default_rng(20260925)
W, H = 2048, 1024


def value_noise(shape, cells, seed):
    """Smooth periodic value noise (wraps horizontally for the equirect seam)."""
    r = np.random.default_rng(seed)
    gx, gy = cells
    grid = r.random((gy + 1, gx))
    grid = np.concatenate([grid, grid[:, :1]], axis=1)  # wrap in x
    h, w = shape
    y = np.linspace(0, gy, h, endpoint=False)
    x = np.linspace(0, gx, w, endpoint=False)
    x0, y0 = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = x - x0, y - y0
    sx, sy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a = grid[y0][:, x0]
    b = grid[y0][:, x0 + 1]
    c = grid[y0 + 1][:, x0]
    d = grid[y0 + 1][:, x0 + 1]
    top = a + (b - a) * sx[None, :]
    bottom = c + (d - c) * sx[None, :]
    return top + (bottom - top) * sy[:, None]


def fbm(shape, base, octaves, seed):
    total, amp, norm = np.zeros(shape), 1.0, 0.0
    for o in range(octaves):
        total += amp * value_noise(shape, (base[0] * 2 ** o, base[1] * 2 ** o), seed + o)
        norm += amp
        amp *= 0.5
    return total / norm


lat = np.linspace(np.pi / 2, -np.pi / 2, H)[:, None]
lon = np.linspace(-np.pi, np.pi, W, endpoint=False)[None, :]
# Galactic plane tilted ~24° against the horizon, wavering slightly.
band_center = 0.42 * np.sin(lon + 0.6) + 0.06 * np.sin(3 * lon)
dist = np.abs(lat - band_center)
warp = fbm((H, W), (8, 4), 5, 11)
band = np.exp(-((dist + (warp - 0.5) * 0.35) / 0.34) ** 2)
dust = fbm((H, W), (16, 8), 6, 23)
lanes = np.clip((fbm((H, W), (24, 12), 5, 37) - 0.52) * 3.2, 0, 1)
glow = band * (0.35 + 0.65 * dust) * (1 - 0.8 * lanes * band)
haze = fbm((H, W), (6, 3), 4, 51)

deep = np.array([9, 9, 12]) / 255
slate = np.array([34, 44, 58]) / 255
amber = np.array([150, 102, 52]) / 255
cream = np.array([232, 199, 140]) / 255
img = deep + slate * (haze[..., None] * 0.55) * (1 - band[..., None] * 0.6)
img = img + amber * (glow[..., None] ** 1.4) * 0.85
img = img + cream * (np.clip(glow - 0.55, 0, 1)[..., None] ** 2) * 0.9
# Faint background stars baked in; bright stars are real points in the scene.
stars = rng.random((H, W))
img = img + (stars > 0.9993)[..., None] * np.array([0.55, 0.5, 0.42]) * rng.random((H, W))[..., None]
img = np.clip(img, 0, 1) ** (1 / 1.05)
Image.fromarray((img * 255).astype(np.uint8)).save('public/images/atlas/nebula.webp', quality=82, method=6)

# The glyph is dark ink on a transparent/white field: keep only the ink.
glyph = np.asarray(Image.open('public/images/showroom/crown-glyph.webp').convert('RGBA')).astype(np.float32)
alpha = (glyph[..., 3] / 255) * (1 - glyph[..., :3].mean(-1) / 255)
gold = np.zeros(glyph.shape, dtype=np.uint8)
gold[..., 0], gold[..., 1], gold[..., 2] = 243, 214, 150
gold[..., 3] = (alpha * 255).astype(np.uint8)
Image.fromarray(gold, 'RGBA').save('public/images/atlas/crown.png', optimize=True)
print('ok')
