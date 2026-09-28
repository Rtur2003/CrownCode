"""Encoding, contact sheets, muxing and lighter copies."""
import subprocess
from pathlib import Path

import cv2
import numpy as np

from .core import FPS, H, W


class Encoder:
    """Raw BGR frames in, H.264 out (Instagram-friendly bitrate)."""

    def __init__(self, path: Path):
        self.path = Path(path)
        self.proc = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}',
                                      '-r', str(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
                                      '-maxrate', '14M', '-bufsize', '28M', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
                                      str(self.path)], stdin=subprocess.PIPE)

    def write(self, frame: np.ndarray):
        self.proc.stdin.write(np.ascontiguousarray(frame).tobytes())

    def close(self):
        self.proc.stdin.close()
        if self.proc.wait():
            raise SystemExit('ffmpeg failed')


def stills(render, times, path: Path, cols=6):
    tiles = []
    for t in times:
        img = cv2.resize(render(int(round(t * FPS))), (360, 640), interpolation=cv2.INTER_AREA)
        cv2.putText(img, f'{t:.2f}', (8, 630), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
        tiles.append(img)
    while len(tiles) % cols:
        tiles.append(np.zeros_like(tiles[0]))
    sheet = np.vstack([np.hstack(tiles[r:r + cols]) for r in range(0, len(tiles), cols)])
    cv2.imwrite(str(path), sheet, [cv2.IMWRITE_JPEG_QUALITY, 88])
    return path


def mux(video: Path, wav: Path, out: Path, lufs: float | None = None):
    """Video plus sound; with `lufs`, the sound is brought to that integrated loudness."""
    level = ['-af', f'loudnorm=I={lufs}:TP=-1.5:LRA=11', '-ar', '48000'] if lufs is not None else []
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(video), '-i', str(wav), '-c:v', 'copy', *level, '-c:a', 'aac',
                    '-b:a', '256k', '-shortest', '-movflags', '+faststart', str(out)], check=True)


def lighter(src: Path, dst: Path, height=1920, crf=22, maxrate='8M'):
    """A smaller copy: `height` 1920 for a sub-30 MB preview, 1280 for a phone."""
    scale = [] if height == H else ['-vf', f'scale={height * 9 // 16}:{height}']
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(src), *scale, '-c:v', 'libx264', '-preset', 'slow',
                    '-crf', str(crf), '-maxrate', maxrate, '-bufsize', '16M', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
                    '-movflags', '+faststart', str(dst)], check=True)
