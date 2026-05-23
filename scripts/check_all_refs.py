import docx
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')

print('=== TUM REFERANSLAR ===')
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    # Kaynak numaralı paragraflar: "1. " ile başlayanlar, references bölümünde
    import re
    if re.match(r'^\d{1,2}\.', t) and len(t) > 20:
        print(f'Para {i}: {t[:200]}')
