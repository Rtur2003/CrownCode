import docx, sys, re
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')

# Tüm referans paragraflarını bul
print('=== TÜM REFERANSLAR ===')
in_refs = False
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if 'Kaynaklar' in t and 'References' in t:
        in_refs = True
        continue
    if in_refs and t and re.match(r'^\d+\.', t):
        print(f'Para {i}: {t}')
