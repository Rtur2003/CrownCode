import docx
import sys
sys.stdout.reconfigure(encoding='utf-8')

# Resmi template'i oku
for fname in ['docs/academic/paper/_official_template.docx',
              'docs/academic/paper/_template_published.docx']:
    try:
        doc = docx.Document(fname)
        print(f'\n{"="*60}')
        print(f'FILE: {fname}')
        print('='*60)
        for i, p in enumerate(doc.paragraphs):
            t = p.text.strip()
            if t:
                print(f'{i}: {t[:200]}')
    except Exception as e:
        print(f'{fname}: {e}')
