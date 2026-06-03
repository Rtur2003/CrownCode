"""
Sunum denetim aracı — taşma, örtüşme, sığmama tespiti.
Slayt: 13.33 x 7.5 inç
"""
import sys
sys.stdout.reconfigure(encoding='utf-8')
from pptx import Presentation
from pptx.util import Emu

SW = 13.33
SH = 7.5
EMU = 914400

def inch(v): return v / EMU

files = [
    '01_Donem_Baslangic_Sunumu','02_Literatur_Taramasi_Sunumu',
    '03_Tasarim_ve_Gelistirme_Sunumu','04_Sonuc_ve_Demo_Sunumu',
    '05_Final_Savunma_Sunumu','AURIS_Tum_Sunumlar_Birlesik',
]
base = 'docs/academic/TeslimEdilecekler/Sunumlar'

total_issues = 0
for f in files:
    prs = Presentation(f'{base}/{f}.pptx')
    file_issues = []
    for si, slide in enumerate(prs.slides):
        boxes = []  # (name, l, t, r, b, has_text)
        for sh in slide.shapes:
            try:
                l = inch(sh.left); t = inch(sh.top)
                w = inch(sh.width); h = inch(sh.height)
            except (TypeError, AttributeError):
                continue
            r = l + w; b = t + h
            txt = ""
            if sh.has_text_frame:
                txt = sh.text_frame.text.strip()
            # 1) Sınır taşması (1.5pt tolerans = 0.02 inç)
            tol = 0.03
            if l < -tol or t < -tol or r > SW+tol or b > SH+tol:
                # küçük taşmalar göz ardı; ciddi olanları yakala
                overflow = max(0-l, 0-t, r-SW, b-SH)
                if overflow > 0.05:
                    snip = (txt[:40]+'…') if len(txt)>40 else txt
                    file_issues.append(
                        f"  S{si+1}: TAŞMA {overflow:.2f}in  "
                        f"[{l:.2f},{t:.2f},{r:.2f},{b:.2f}] '{snip}'")
            boxes.append((sh.shape_id, l, t, r, b, bool(txt), txt))
    if file_issues:
        print(f"\n=== {f} ===")
        for iss in file_issues:
            print(iss)
        total_issues += len(file_issues)

print(f"\n{'='*50}")
print(f"TOPLAM SINIR TAŞMASI: {total_issues}")
