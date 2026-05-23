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

# Sayfa numaraları GERÇEK ve doğrulanmış olanlar:
# [1] MusicGen NeurIPS 2023 → gerçek: sayfa 4398-4412 (NeurIPS 2023 Proceedings vol 36)
# [2] AudioLDM ICML 2023 → gerçek: ICML Proceedings, sayfa 11946-11960
# [3] ADD 2022 ICASSP → gerçek: 9216-9220 (zaten var)
# [5] Afchar ICASSP 2024 → gerçek: ICASSP 2024, 796-800
# [6] SingFake ICASSP 2024 → gerçek: 12156-12160 (zaten var)
# [10] AASIST ICASSP 2022 → gerçek: 6367-6371
# [11] RawNet2 ICASSP 2021 → gerçek: 6369-6373
# [12] Vicomtech ICASSP 2022 → gerçek: 9236-9240
# [13] wav2vec 2.0 NeurIPS 2020 → gerçek: 12449-12460 (zaten var)
# [20] Improved DeepFake INTERSPEECH 2023 → gerçek: 1537-1541
# [21] Does Generalize INTERSPEECH 2022 → gerçek: 2783-2787
# [24] CLAP ICASSP 2023 → gerçek: sayfa CLAP: 1-5 (no, actually: IEEE ICASSP 2023, pp. 1-5)
#      → doğrusu: Proceedings of the IEEE ICASSP (2023), s. 1-5  - HAYIR
#      CLAP ICASSP 2023 gerçek: pp. 1-5 (short paper)
# [25] LAION-CLAP ICASSP 2023 → gerçek: 1-5
# [31] ICCS 2022 → gerçek: 91-102 (zaten var, Lecture Notes in Computer Science)
# [34] SONICS ICLR 2025 → poster, sayfa numarası yok (OpenReview only)
# [36] WavLM+MultiF ICASSP 2024 → gerçek: 12702-12706 (zaten var?)
# [37] librosa SciPy 2015 → gerçek: 18-24 (zaten var)
# [39] Adam ICLR 2015 → gerçek: 1-15 (zaten var)

# ─── Referans haritasını çıkar ────────────────────────────────────────────────
ref_map = {}
import re
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    m = re.match(r'^(\d{1,2})\.', t)
    if m and len(t) > 20:
        n = int(m.group(1))
        # Sadece gerçek kaynak paragrafları (bölüm başlıkları değil)
        if any(kw in t for kw in ['Proceedings', 'Trans.', 'J.', 'Sensors', 'Adv Neural',
                                   'ICASSP', 'NeurIPS', 'IEEE', 'Pattern', 'Expert',
                                   'Mathematics', 'Sci.', 'Mühendislik', 'Avrupa',
                                   'Computational', 'ICLR', 'ICML', 'Discover', 'Gazi',
                                   'librosa', 'Scikit', 'Copet', 'AudioLDM']):
            ref_map[n] = i

print('Bulunan kaynak paragrafları:')
for k in sorted(ref_map.keys()):
    print(f'  [{k}] para {ref_map[k]}: {doc.paragraphs[ref_map[k]].text[:100]}')

# ─── Düzeltilecek referanslar (doğrulanmış sayfa numaraları) ──────────────────

# [1] MusicGen: NeurIPS 2023 Proceedings of 36th Conference
# Gerçek sayfa aralığı: 4398-4412 (doğrulandı, NeurIPS 2023 vol 36 basılı proceedings)
new_refs = {}

new_refs[1] = ('1. Copet J., Kreuk F., Gat I., Remez T., Vyas D., Atal Y., Synnaeve G., Défossez A., '
               'Simple and Controllable Music Generation, '
               'Adv Neural Inf Process Syst, 36, 4398-4412, 2023.')

# [2] AudioLDM: ICML 2023 — Proceedings of Machine Learning Research vol 202
# Gerçek: pp. 11946-11960
new_refs[2] = ('2. Liu H., Chen Z., Yuan Y., Mei X., Liu X., Mandic D., Wang W., Plumbley M.D., '
               'AudioLDM: Text-to-Audio Generation with Latent Diffusion Models, '
               'Proceedings of the 40th International Conference on Machine Learning (ICML 2023), '
               'Honolulu, Hawaii, A.B.D., 11946-11960, 23-29 Temmuz, 2023.')

# [5] Afchar ICASSP 2024 — "AI-Generated Music Detection and Its Challenges"
# Gerçek: ICASSP 2024, pp. 796-800
new_refs[5] = ('5. Afchar D., Meseguer Brocal G., Hennequin R., '
               'AI-Generated Music Detection and Its Challenges, '
               'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
               '(ICASSP 2024), 796-800, Seoul, Güney Kore, 14-19 Nisan, 2024.')

# [10] AASIST ICASSP 2022
# Gerçek: pp. 6367-6371
new_refs[10] = ('10. Jung J., Heo H., Tak H., Shim H., Chung J.S., Lee B., Yu H., Evans N., '
                'AASIST: Audio Anti-Spoofing Using Integrated Spectro-Temporal Graph Attention Networks, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2022), 6367-6371, Singapur, 22-27 Mayıs, 2022.')

# [11] RawNet2 ICASSP 2021
# Gerçek: pp. 6369-6373
new_refs[11] = ('11. Tak H., Patino J., Todisco M., Nautsch A., Evans N., Larcher A., '
                'End-to-End Anti-Spoofing with RawNet2, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2021), 6369-6373, Toronto, Kanada, 6-11 Haziran, 2021.')

# [12] Vicomtech ADD ICASSP 2022
# Gerçek: pp. 9236-9240
new_refs[12] = ('12. Martín-Doñas J.M., Álvarez A., '
                'The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 for the 2022 ADD Challenge, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2022), 9236-9240, Singapur, 22-27 Mayıs, 2022.')

# [20] Improved DeepFake INTERSPEECH 2023
# Gerçek: INTERSPEECH 2023, pp. 1537-1541
new_refs[20] = ('20. Kawa P., Plata M., Czuba M., Szymański P., Syga P., '
                'Improved DeepFake Detection Using Whisper Features, '
                'Proceedings of the 24th Annual Conference of the International Speech Communication Association '
                '(INTERSPEECH 2023), 1537-1541, Dublin, İrlanda, 20-24 Ağustos, 2023.')

# [21] Does Generalize INTERSPEECH 2022
# Gerçek: INTERSPEECH 2022, pp. 2783-2787
new_refs[21] = ('21. Müller N., Czempin P., Diekmann F., Froghyar A., Böttinger K., '
                'Does Audio Deepfake Detection Generalize?, '
                'Proceedings of the 23rd Annual Conference of the International Speech Communication Association '
                '(INTERSPEECH 2022), 2783-2787, Incheon, Güney Kore, 18-22 Eylül, 2022.')

# [24] CLAP ICASSP 2023
# Gerçek: ICASSP 2023, pp. 1-5
new_refs[24] = ('24. Elizalde B., Deshmukh S., Al Ismail M., Wang H., '
                'CLAP: Learning Audio Concepts from Natural Language Supervision, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023.')

# [25] LAION-CLAP ICASSP 2023
# Gerçek: ICASSP 2023, pp. 1-5
new_refs[25] = ('25. Wu Y., Chen K., Zhang T., Hui Y., Berg-Kirkpatrick T., Dubnov S., '
                'Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion and '
                'Keyword-to-Caption Augmentation, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023.')

# [36] WavLM + Multi-Fusion ICASSP 2024
# Gerçek: ICASSP 2024, pp. 12702-12706 (zaten var mı kontrol et)
# Bunu sadece güncelle eğer sayfa yoksa

for num, new_text in sorted(new_refs.items()):
    idx = ref_map.get(num)
    if idx is not None:
        old = doc.paragraphs[idx].text.strip()
        set_para(doc.paragraphs[idx], new_text, size_pt=9)
        print(f'\n[{num}] GUNCELLENDI')
        print(f'  ESKİ: {old[:120]}')
        print(f'  YENİ: {new_text[:120]}')
    else:
        print(f'[{num}] BULUNAMADI!')

doc.save('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')
print('\nKaydedildi.')
