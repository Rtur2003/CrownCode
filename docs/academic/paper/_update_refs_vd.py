"""Update .bib and .ris: shorten 6+ author lists to 'First and others'."""
import re

with open('AURIS_references_TR.bib', encoding='utf-8') as f:
    content = f.read()

# Find each author = {...} block, count authors, shorten if 6+
def shorten_authors(match):
    full = match.group(1)
    authors = full.split(' and ')
    if len(authors) >= 6:
        return f'author    = {{{authors[0]} and others}}'
    return match.group(0)

new = re.sub(r'author\s*=\s*\{([^}]+)\}', shorten_authors, content)
with open('AURIS_references_TR.bib', 'w', encoding='utf-8') as f:
    f.write(new)

# Count
shortened = sum(1 for m in re.finditer(r'and others', new))
print(f'BibTeX: {shortened} entries shortened to "and others"')

# Regenerate .ris
TYPE_MAP = {'article': 'JOUR', 'inproceedings': 'CONF', 'book': 'BOOK', 'misc': 'GEN'}
parts = re.split(r'\n(?=@)', new)
out = []
for e in parts:
    e = e.strip()
    m = re.match(r'@(\w+)\{([^,]+),', e)
    if not m:
        continue
    btype = m.group(1).lower()
    ris = TYPE_MAP.get(btype, 'GEN')
    fields = dict(re.findall(r'(\w+)\s*=\s*\{(.*?)\},?\s*\n', e + '\n'))

    def clean(s):
        return s.replace('{', '').replace('}', '').replace('\\"', '').replace("\\'", '')

    rec = [f'TY  - {ris}']
    if 'author' in fields:
        for a in fields['author'].split(' and '):
            rec.append(f'AU  - {clean(a.strip())}')
    for k, rk in [('title', 'TI'), ('journal', 'JO'), ('booktitle', 'BT'),
                  ('year', 'PY'), ('volume', 'VL'), ('number', 'IS'),
                  ('publisher', 'PB'), ('doi', 'DO')]:
        if k in fields:
            rec.append(f'{rk}  - {clean(fields[k])}')
    if 'pages' in fields:
        pg = clean(fields['pages'])
        rec.append(f"SP  - {pg.split('--')[0]}")
        if '--' in pg:
            rec.append(f"EP  - {pg.split('--')[1]}")
    rec.append('ER  - ')
    out.append('\n'.join(rec))

with open('AURIS_references_TR.ris', 'w', encoding='utf-8') as f:
    f.write('\n\n'.join(out) + '\n')
print(f'.ris regenerated: {len(out)} entries')
