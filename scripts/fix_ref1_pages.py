import docx
from docx.shared import Pt
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')

def set_para(p, text, size_pt=9):
    p.clear()
    run = p.add_run(text)
    run.bold = False
    run.font.size = Pt(size_pt)
    run.font.name = 'Times New Roman'

# Find ref [1] — MusicGen
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if t.startswith('1.') and 'Copet' in t:
        print(f'Para {i}: {t}')
        # Fix: remove fabricated page range, correct NeurIPS 2023 format (no page numbers)
        new_text = ('1. Copet J., Kreuk F., Gat I., Remez T., Vyas D., Atal Y., Synnaeve G., Défossez A., '
                    'Simple and Controllable Music Generation, '
                    'Advances in Neural Information Processing Systems (NeurIPS 2023), Cilt 36, 2023.')
        set_para(p, new_text, size_pt=9)
        print(f'Para {i} guncellendi.')
        break
else:
    print('Ref [1] bulunamadi!')

# Also check ref [4] WaveFake — was "Cilt 1" added correctly?
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    if t.startswith('4.') and ('WaveFake' in t or 'Doerr' in t or 'Fabian' in t):
        print(f'Para {i} [4]: {t}')
        break

doc.save('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')
print('Kaydedildi.')
