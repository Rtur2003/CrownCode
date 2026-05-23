import docx
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')
paragraphs = [p.text.strip() for p in doc.paragraphs]
full_text = '\n'.join(paragraphs)

print('='*60)
print('GUJSA KONTROL LİSTESİ')
print('='*60)

# ── 1. Güncellik oranı (%30 son 5 yıl = 2021-2026) ────────────────────────────
print('\n[1] GÜNCELLİK ORANI (son 5 yıl: 2021-2026)')
ref_years = []
in_refs = False
for p in paragraphs:
    m = re.match(r'^\d{1,2}\..*', p)
    if m and len(p) > 20 and any(kw in p for kw in ['Proceedings','Trans.','J.','Sensors','Adv Neural','ICASSP','NeurIPS','IEEE','Pattern','Expert','Mathematics','Sci.','Mühendislik','Avrupa','Computational','ICLR','ICML','Discover','Gazi','librosa','Scikit','Copet','AudioLDM','Frank J.']):
        years = re.findall(r'\b(20\d{2})\b', p)
        if years:
            yr = int(years[-1])
            ref_years.append(yr)

recent = [y for y in ref_years if y >= 2021]
total = len(ref_years)
pct = len(recent)/total*100 if total else 0
print(f'  Toplam referans: {total}')
print(f'  2021+ referans: {len(recent)} ({pct:.1f}%)')
print(f'  Kural: en az %30  →  {"✓ TAMAM" if pct >= 30 else "✗ EKSİK"}')

# ── 2. Gazi dergisi atıfı kontrolü ────────────────────────────────────────────
print('\n[2] GAZİ DERGİSİ ATIF KONTROLÜ')
gazi_in_refs = [p for p in paragraphs if 'Gazi' in p and re.match(r'^\d{1,2}\.', p)]
gazi_in_body = [p for p in paragraphs if 'Journal of the Faculty of Engineering and Architecture of Gazi University' in p]
gazi_abbr = [p for p in paragraphs if 'Gazi' in p and 'Fen Bilimleri' in p and re.match(r'^\d{1,2}\.', p)]
print(f'  Gazi atıflı referans: {len(gazi_in_refs)} adet')
for g in gazi_in_refs:
    print(f'    → {g[:120]}')
if gazi_in_body:
    print(f'  ✓ "Journal of the Faculty..." metin içinde geçiyor')
else:
    print(f'  (Gazi dergisine atıf varsa İngilizce tam adı kullanılmalı)')

# ── 3. Metin içi atıf formatı ─────────────────────────────────────────────────
print('\n[3] METİN İÇİ ATIF FORMATI')
# [1,2,3] grubu 4'ten fazla mı?
grouped = re.findall(r'\[(\d+(?:,\s*\d+){3,})\]', full_text)
if grouped:
    print(f'  ✗ 4+ gruplu atıf bulundu: {grouped[:5]}')
else:
    print(f'  ✓ Gruplu atıf (4+) yok')

# Yazar adı sonrası format: (Yazar vd. [X])
author_cite = re.findall(r'[A-ZÇĞİÖŞÜ][a-zçğışöüa-z]+ vd\. \[\d+\]', full_text)
print(f'  Yazar+atıf formatı örnek: {author_cite[:3]}')

# Cümle sonu atıflar
end_cite = re.findall(r'\.\s*\[\d+\]', full_text)
print(f'  Cümle sonu atıf (hatalı format): {len(end_cite)} adet {"✗" if end_cite else "✓"}')
if end_cite:
    print(f'    Örnekler: {end_cite[:3]}')

# ── 4. DOI kontrolü ───────────────────────────────────────────────────────────
print('\n[4] DOI KONTROLÜ (yayınlanmış makalelerde DOI olmamalı)')
doi_refs = [p for p in paragraphs if 'doi' in p.lower() and re.match(r'^\d{1,2}\.', p)]
if doi_refs:
    print(f'  ✗ DOI içeren referans: {len(doi_refs)} adet')
    for d in doi_refs:
        print(f'    → {d[:120]}')
else:
    print(f'  ✓ DOI içeren referans yok')

# ── 5. "vd." kullanımı kontrolü ───────────────────────────────────────────────
print('\n[5] "vd." KULLANIMI (3+ yazar için)')
vd_refs = [p for p in paragraphs if ' vd.,' in p and re.match(r'^\d{1,2}\.', p)]
print(f'  "vd." kullanan referans sayısı: {len(vd_refs)}')
for v in vd_refs:
    print(f'    [{v[:3]}] {v[:100]}')

# ── 6. Şekil ve Tablo numaraları ──────────────────────────────────────────────
print('\n[6] ŞEKİL/TABLO METIN İÇİ ATIFLAR')
sekil_refs = re.findall(r'Şekil\s+(\d+)', full_text)
tablo_refs = re.findall(r'Tablo\s+(\d+)', full_text)
sekil_nums = sorted(set(int(x) for x in sekil_refs))
tablo_nums = sorted(set(int(x) for x in tablo_refs))
print(f'  Metin içi Şekil numaraları: {sekil_nums}')
print(f'  Metin içi Tablo numaraları: {tablo_nums}')

# Şekil caption numaraları
caption_sekil = []
caption_tablo = []
for p in paragraphs:
    ms = re.match(r'Şekil\s+(\d+)[\.:]', p)
    mt = re.match(r'Tablo\s+(\d+)[\.:]', p)
    if ms: caption_sekil.append(int(ms.group(1)))
    if mt: caption_tablo.append(int(mt.group(1)))
caption_sekil.sort()
caption_tablo.sort()
print(f'  Caption Şekil numaraları: {caption_sekil}')
print(f'  Caption Tablo numaraları: {caption_tablo}')

# ── 7. "on iki" / eski ifadeler ───────────────────────────────────────────────
print('\n[7] ESKİ İFADELER KONTROLÜ')
for kw in ['on iki', 'on iki yapay', 'MusicGe[^n]']:
    found = re.findall(kw, full_text, re.IGNORECASE)
    if found:
        print(f'  ✗ "{kw}" hâlâ mevcut: {len(found)} kez')
    else:
        print(f'  ✓ "{kw}" yok')

# ── 8. Toplam referans sayısı ─────────────────────────────────────────────────
print(f'\n[8] TOPLAM REFERANS: {total}/39')
print(f'    Beklenen: 39  →  {"✓ TAMAM" if total == 39 else "✗ EKSİK/FAZLA"}')
