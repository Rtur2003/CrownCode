import docx
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')

for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if t:
        print(f'{i}|||{t}')
