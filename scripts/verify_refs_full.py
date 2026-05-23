import docx
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')

# Güncellenen referansları tam metin olarak doğrula
check_nums = {1, 2, 5, 10, 11, 12, 20, 21, 24, 25, 36}
# Sayfa numarası zaten olan referansları da kontrol et
also_check = {3, 6, 7, 8, 9, 13, 37, 38, 39}

print('=== GÜNCELLENEN REFERANSLAR (tam metin) ===\n')
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    m = re.match(r'^(\d{1,2})\.', t)
    if m and len(t) > 20:
        n = int(m.group(1))
        if any(kw in t for kw in ['Proceedings', 'Trans.', 'J.', 'Sensors', 'Adv Neural',
                                   'ICASSP', 'NeurIPS', 'IEEE', 'Pattern', 'Expert',
                                   'Mathematics', 'Sci.', 'Mühendislik', 'Avrupa',
                                   'Computational', 'ICLR', 'ICML', 'Discover', 'Gazi',
                                   'librosa', 'Scikit', 'Copet', 'AudioLDM', 'Frank J.']):
            if n in check_nums:
                # Sayfa numarası var mı kontrol et
                has_pages = bool(re.search(r'\d+-\d+', t))
                status = '✓ SAYFA VAR' if has_pages else '✗ SAYFA YOK'
                print(f'[{n:2d}] {status}')
                print(f'      {t}')
                print()

print('\n=== SAYFA DURUMU ÖZET (tüm refs) ===\n')
results = []
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    m = re.match(r'^(\d{1,2})\.', t)
    if m and len(t) > 20:
        n = int(m.group(1))
        if any(kw in t for kw in ['Proceedings', 'Trans.', 'J.', 'Sensors', 'Adv Neural',
                                   'ICASSP', 'NeurIPS', 'IEEE', 'Pattern', 'Expert',
                                   'Mathematics', 'Sci.', 'Mühendislik', 'Avrupa',
                                   'Computational', 'ICLR', 'ICML', 'Discover', 'Gazi',
                                   'librosa', 'Scikit', 'Copet', 'AudioLDM', 'Frank J.']):
            # Sayfa numarası pattern: rakam-rakam (örn. 47704-47720, 1-5)
            page_match = re.search(r'(\d+-\d+)', t)
            has_pages = bool(page_match)
            page_str = page_match.group(1) if page_match else '—'
            results.append((n, has_pages, page_str))

# Sayfa numarası olmayanları raporla
no_pages = [r for r in results if not r[1]]
with_pages = [r for r in results if r[1]]

print(f'Sayfa numarası OLAN referanslar: {len(with_pages)}/39')
for r in sorted(with_pages):
    print(f'  [{r[0]:2d}] {r[2]}')

print(f'\nSayfa numarası OLMAYAN referanslar: {len(no_pages)}/39')
for r in sorted(no_pages):
    print(f'  [{r[0]:2d}]')
