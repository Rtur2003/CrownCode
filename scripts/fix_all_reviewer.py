import docx
from docx.shared import Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')
paras = doc.paragraphs


def replace_in_para(idx, old, new):
    p = paras[idx]
    for run in p.runs:
        if old in run.text:
            run.text = run.text.replace(old, new)
            print(f'  Para {idx}: "{old}" -> "{new}"')
            return True
    # fallback: full para text check (split across runs)
    full = p.text
    if old in full:
        # rebuild as single run
        p.clear()
        r = p.add_run(full.replace(old, new))
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9)
        print(f'  Para {idx} (rebuilt): "{old}" -> "{new}"')
        return True
    print(f'  Para {idx}: NOT FOUND: "{old}"')
    return False


def set_heading(idx, text):
    p = paras[idx]
    full = p.text
    p.clear()
    r = p.add_run(text)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(10)
    r.bold = True
    print(f'  Para {idx} heading set: {text}')


# ════════════════════════════════════════════════════════════
# 1. HATA: "MusicGe" → "MusicGen" (Türkçe Öz, para 11)
# ════════════════════════════════════════════════════════════
print('\n[1] MusicGe -> MusicGen fix')
replace_in_para(11, 'MusicGe gibi', 'MusicGen gibi')

# ════════════════════════════════════════════════════════════
# 2. HATA: İkincil başlık büyük harf
# ════════════════════════════════════════════════════════════
print('\n[2] Subheading capitalization')
heading_fixes = {
    68: ('2.1. Kullanılan veri kümesi (Utilized Dataset)',
         '2.1. Kullanılan Veri Kümesi (Utilized Dataset)'),
    74: ('2.2. Öznitelik çıkarma (Feature extraction)',
         '2.2. Öznitelik Çıkarma (Feature extraction)'),
    81: ('2.3. Sınıflandırma modelleri (Classification models)',
         '2.3. Sınıflandırma Modelleri (Classification models)'),
    89: ('2.4. Eğitim protokolü ve karar eşiği optimizasyonu (Training Protocol and Decision Threshold Optimisation)',
         '2.4. Eğitim Protokolü ve Karar Eşiği Optimizasyonu (Training Protocol and Decision Threshold Optimisation)'),
}
for idx, (old_text, new_text) in heading_fixes.items():
    p = paras[idx]
    # Preserve bold/font from runs
    full = p.text.strip()
    if old_text in full or full == old_text:
        p.clear()
        r = p.add_run(new_text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        r.bold = True
        print(f'  Para {idx}: heading updated -> {new_text}')
    else:
        print(f'  Para {idx}: text mismatch, got: {full[:80]}')

# ════════════════════════════════════════════════════════════
# 3. HATA: Tablo 6 başlığı "Icon Description Table" -> "Symbol Description Table"
# ════════════════════════════════════════════════════════════
print('\n[3] Icon -> Symbol in Tablo 6 caption')
replace_in_para(172, 'Icon Description Table', 'Symbol Description Table')

# ════════════════════════════════════════════════════════════
# 4. HATA: Kaynak 38 "Journal of Machine Learning Research" -> "J. Mach. Learn. Res."
# ════════════════════════════════════════════════════════════
print('\n[4] Ref 38 journal abbreviation')
replace_in_para(223, 'Journal of Machine Learning Research', 'J. Mach. Learn. Res.')

# ════════════════════════════════════════════════════════════
# 5. HATA: Şekil numaralandırma kayması — metin içi atıflar
# Audit: metin para 142 "Şekil 13" -> eşik taraması = Şekil 12 caption (para 145)
#         "Şekil 14" -> kaynak bazlı = Şekil 13 caption (para 148)
#         para 156 "Şekil 15" -> eğitim/doğrulama = Şekil 14 caption (para 159)
#         para 161 "Şekil 15" -> korelasyon ısı haritası = Şekil 15 caption (para 164)
# Captions (ground truth from audit):
#   Şekil 6 (para 123): İlk yirmi öznitelik önem -> OK
#   Şekil 7 (para 126): TreeSHAP -> OK
#   Şekil 8 (para 131): LightGBM karmaşıklık matrisi -> OK
#   Şekil 9 (para 134): P(YZ) tahmin olasılık -> OK
#   Şekil 10 (para 137): Kalibrasyon eğrisi -> OK
#   Şekil 11 (para 140): Kesinlik-duyarlılık eğrisi -> OK
#   Şekil 12 (para 145): Karar eşiği taraması -> OK
#   Şekil 13 (para 148): Kaynak bazlı LightGBM -> OK
#   Şekil 14 (para 159): Eğitim ve çapraz doğrulama doğruluk farkı -> OK
#   Şekil 15 (para 164): 47 öznitelik korelasyon ısı haritası -> OK
#   Şekil 16 (para 167): Öznitelik sayısı vs doğruluk -> OK
#
# Body text references to check:
#   para 115: "Şekil 6" -> feature importance = Şekil 6 ✓
#   para 142: "Şekil 13" -> eşik taraması = Şekil 12 caption ✗ should be Şekil 12
#   para 142: "Şekil 14" -> kaynak bazlı = Şekil 13 caption ✗ should be Şekil 13
#   para 156: "Şekil 15" -> aşırı öğrenme/eğitim farkı = Şekil 14 caption ✗ should be Şekil 14
#   para 161: "Şekil 15" -> korelasyon ısı haritası ✓ matches caption para 164
#   para 161: mentions feature ablation -> check
# ════════════════════════════════════════════════════════════
print('\n[5] Figure reference fixes in body text')

# para 115: check what it says about figures
print(f'  Para 115: {paras[115].text[:200]}')
print(f'  Para 142: {paras[142].text[:300]}')
print(f'  Para 156: {paras[156].text[:300]}')
print(f'  Para 161: {paras[161].text[:300]}')

# Fix para 142: "Şekil 13" -> "Şekil 12", "Şekil 14" -> "Şekil 13"
# Must do in right order to avoid double-replace
p142 = paras[142]
full142 = p142.text
print(f'\n  Para 142 full: {full142}')
# Replace Şekil 14 first, then Şekil 13
new142 = full142.replace('Şekil 14', 'ŞEKIL_14_TMP')
new142 = new142.replace('Şekil 13', 'Şekil 12')
new142 = new142.replace('ŞEKIL_14_TMP', 'Şekil 13')
if new142 != full142:
    p142.clear()
    r = p142.add_run(new142)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(9)
    print(f'  Para 142 fixed: {new142[:200]}')
else:
    print(f'  Para 142: no change needed')

# Fix para 156: "Şekil 15" -> "Şekil 14"
p156 = paras[156]
full156 = p156.text
print(f'\n  Para 156 full: {full156}')
new156 = full156.replace('Şekil 15', 'Şekil 14')
if new156 != full156:
    p156.clear()
    r = p156.add_run(new156)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(9)
    print(f'  Para 156 fixed: {new156[:200]}')
else:
    print(f'  Para 156: no change needed')

# para 161: check if Şekil 15 and Şekil 16 refs are correct
p161 = paras[161]
full161 = p161.text
print(f'\n  Para 161 full: {full161}')
# Şekil 15 = korelasyon ısı haritası (caption para 164) ✓
# Şekil 16 = öznitelik sayısı vs doğruluk (caption para 167) ✓
# These should be fine — just print for confirmation

# ════════════════════════════════════════════════════════════
# 6. HATA: Şekil 4 ve Şekil 5 metin içi atıf yok
# Add citations in para 107 (after Şekil 4 caption) body text
# and para 109 (ML vs DL paragraph) for Şekil 5
# ════════════════════════════════════════════════════════════
print('\n[6] Add Şekil 4 and Şekil 5 in-text references')
print(f'  Para 95 (results intro): {paras[95].text[:200]}')
print(f'  Para 109: {paras[109].text[:200]}')

# Para 109 starts with "Makine öğrenmesi ile derin öğrenme aileleri..."
# Add Şekil 5 reference at the start
p109 = paras[109]
full109 = p109.text
if 'Şekil 5' not in full109 and 'Şekil 4' not in full109:
    # Prepend reference to Şekil 5 (ML vs DL comparison figure)
    new109 = ('Şekil 4, yedi makine öğrenmesi modelinin ROC eğrilerini karşılaştırmaktadır. '
              'Şekil 5, makine öğrenmesi ile derin öğrenme ailelerinin performans dağılımını göstermektedir. '
              + full109)
    p109.clear()
    r = p109.add_run(new109)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(9)
    print(f'  Para 109: Şekil 4 ve Şekil 5 eklendi')
else:
    print(f'  Para 109: already references figures')

# ════════════════════════════════════════════════════════════
# 7. HATA: Tablo 4 metin içi atıf yok
# Tablo 4 caption is para 102. Check if any body text references it.
# ════════════════════════════════════════════════════════════
print('\n[7] Tablo 4 in-text reference')
print(f'  Para 95: {paras[95].text[:200]}')
# Para 95 discusses Tablo 3, check if Tablo 4 is mentioned
has_tablo4 = any('Tablo 4' in paras[i].text for i in range(93, 115))
print(f'  Tablo 4 mentioned in paras 93-114: {has_tablo4}')

if not has_tablo4:
    # Find para right after Tablo 4 (para 102 is caption, need body text after it)
    # Para 95 discusses results, add Tablo 4 ref there
    p95 = paras[95]
    full95 = p95.text
    # Add Tablo 4 mention at end of para 95
    new95 = full95.rstrip()
    if not new95.endswith('.'):
        new95 += '.'
    new95 += (' LightGBM modelinin sınıf bazlı kesinlik, duyarlılık ve F1 değerleri '
              'Tablo 4\'te ayrıntılı biçimde sunulmuştur.')
    p95.clear()
    r = p95.add_run(new95)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(9)
    print(f'  Para 95: Tablo 4 atfı eklendi')

# ════════════════════════════════════════════════════════════
# 8. HATA: Tablo 6 (Simge) metin içi atıf yok
# ════════════════════════════════════════════════════════════
print('\n[8] Tablo 6 in-text reference')
has_tablo6 = any('Tablo 6' in paras[i].text for i in range(169, 175))
print(f'  Tablo 6 mentioned in paras 169-174: {has_tablo6}')
print(f'  Para 171: {paras[171].text[:200]}')

if not has_tablo6:
    p171 = paras[171]
    full171 = p171.text
    new171 = full171.rstrip()
    if not new171.endswith(':'):
        new171 = new171.rstrip('.')
    new171 += ' Tablo 6\'da sunulmaktadır:'
    # Remove trailing colon from original if present
    new171 = new171.replace('sunulmuştur: Tablo 6\'da sunulmaktadır:', 'Tablo 6\'da sunulmaktadır:')
    new171 = new171.replace('sunulmuştur Tablo 6\'da sunulmaktadır:', 'Tablo 6\'da sunulmaktadır:')
    p171.clear()
    r = p171.add_run(new171)
    r.font.name = 'Times New Roman'
    r.font.size = Pt(9)
    print(f'  Para 171: Tablo 6 atfı eklendi -> {new171[:150]}')

# ════════════════════════════════════════════════════════════
# 9. Kaynak 4 (WaveFake): cilt/sayfa bilgisi ekle
# ════════════════════════════════════════════════════════════
print('\n[9] Ref 4 WaveFake volume/page')
print(f'  Para 189: {paras[189].text}')
replace_in_para(189,
    'Advances in Neural Information Processing Systems Datasets and Benchmarks Track, 2021.',
    'Adv Neural Inf Process Syst Datasets Benchmarks Track, 1, 2021.')

# ════════════════════════════════════════════════════════════
# 10. Tablo 7 caption: dipnotu caption'dan çıkar, tablonun altına taşı
# Caption para 151: remove "(— : yayında rapor edilmemiş.)" from caption
# ════════════════════════════════════════════════════════════
print('\n[10] Tablo 7 caption footnote fix')
replace_in_para(151,
    'Tablo 7. Literatürle karşılaştırma (Comparison with literature). (— : yayında rapor edilmemiş.)',
    'Tablo 7. Literatürle karşılaştırma (Comparison with literature)')
# Add footnote as separate para after the table — find para after table
# Table is between caption (151) and intro text (153); add footnote at para 152 (blank)
p152 = paras[152]
p152.clear()
r = p152.add_run('— : Kaynak yayında rapor edilmemiştir.')
r.font.name = 'Times New Roman'
r.font.size = Pt(8)
r.italic = True
print(f'  Para 152: dipnot eklendi')

doc.save('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')
print('\nKaydedildi.')
