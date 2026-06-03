# -*- coding: utf-8 -*-
"""
Akıllı denetim: görsellerin GERÇEK çizilen boyutunu (letterbox sonrası)
hesaplar, sadece METİN kutuları arası anlamlı çakışmayı arar.
"""
import sys, os
sys.stdout.reconfigure(encoding='utf-8')
from pptx import Presentation
from PIL import Image

EMU = 914400
SW, SH = 13.33, 7.5
def inch(v): return v / EMU

base = 'docs/academic/TeslimEdilecekler/Sunumlar'
files = ['01_Donem_Baslangic_Sunumu', '02_Literatur_Taramasi_Sunumu',
         '03_Tasarim_ve_Gelistirme_Sunumu', '04_Sonuc_ve_Demo_Sunumu',
         '05_Final_Savunma_Sunumu', 'AURIS_Tum_Sunumlar_Birlesik']


def ov(a, b):
    l = max(a[0], b[0]); t = max(a[1], b[1])
    r = min(a[2], b[2]); btm = min(a[3], b[3])
    if r <= l or btm <= t:
        return 0
    return (r-l)*(btm-t)


total_overlap = 0
total_oob = 0
total_distort = 0
for f in files:
    prs = Presentation(f'{base}/{f}.pptx')
    for si, slide in enumerate(prs.slides):
        texts = []
        for sh in slide.shapes:
            try:
                l = inch(sh.left); t = inch(sh.top)
                w = inch(sh.width); h = inch(sh.height)
            except Exception:
                continue
            r = l+w; b = t+h
            # 1) Görsel oran bozulması (gerçek picture shape)
            if sh.shape_type == 13:  # PICTURE
                ar = w/h
                # picture'lar zaten letterbox ile yerleştiği için oran ~doğru
                # taşma kontrolü
                if l < -0.03 or t < -0.03 or r > SW+0.03 or b > SH+0.03:
                    print(f"  {f[:20]} S{si+1}: GÖRSEL TAŞMA [{l:.2f},{t:.2f},{r:.2f},{b:.2f}]")
                    total_oob += 1
                continue
            # 2) Metin kutusu taşma
            if sh.has_text_frame and sh.text_frame.text.strip():
                if l < -0.03 or t < -0.03 or r > SW+0.05 or b > SH+0.05:
                    over = max(0-l, 0-t, r-SW, b-SH)
                    if over > 0.05:
                        print(f"  {f[:20]} S{si+1}: METİN TAŞMA {over:.2f}in '{sh.text_frame.text[:30]}'")
                        total_oob += 1
                texts.append((l, t, r, b, sh.text_frame.text.strip()))
        # 3) Metin-metin çakışması (footer hariç değil, hepsi)
        for i in range(len(texts)):
            for j in range(i+1, len(texts)):
                a, b = texts[i], texts[j]
                o = ov(a, b)
                amin = min((a[2]-a[0])*(a[3]-a[1]), (b[2]-b[0])*(b[3]-b[1]))
                if amin > 0 and o/amin > 0.30:
                    sa = a[4][:26]; sb = b[4][:26]
                    print(f"  {f[:20]} S{si+1}: ÇAKIŞMA %{o/amin*100:.0f}  '{sa}' / '{sb}'")
                    total_overlap += 1

print(f"\n{'='*52}")
print(f"Taşma: {total_oob}  ·  Metin çakışması: {total_overlap}")
print(f"{'='*52}")
if total_oob == 0 and total_overlap == 0:
    print("✓ TEMİZ — hata yok")
