import docx
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')

no_page_nums = {4, 16, 17, 18, 19, 22, 23, 26, 27, 29, 35}

print('=== SAYFA NUMARASI OLMAYAN 11 REFERANS ===\n')
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    m = re.match(r'^(\d{1,2})\.', t)
    if m and len(t) > 20:
        n = int(m.group(1))
        if n in no_page_nums:
            print(f'[{n:2d}] {t}')
            print()
