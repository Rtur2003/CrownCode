import docx
from docx.shared import Pt
import re
import sys
sys.stdout.reconfigure(encoding='utf-8')

doc = docx.Document('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')

def set_para(p, text, size_pt=9):
    p.clear()
    run = p.add_run(text)
    run.bold = False
    run.font.size = Pt(size_pt)
    run.font.name = 'Times New Roman'

# Kaynak paragraflarını bul
ref_map = {}
for i, p in enumerate(doc.paragraphs):
    t = p.text.strip()
    m = re.match(r'^(\d{1,2})\.', t)
    if m and len(t) > 20:
        if any(kw in t for kw in [
            'Proceedings', 'Trans.', 'J.', 'Sensors', 'Adv Neural', 'ICASSP',
            'NeurIPS', 'IEEE', 'Pattern', 'Expert', 'Mathematics', 'Sci.',
            'Mühendislik', 'Avrupa', 'Computational', 'ICLR', 'ICML', 'Discover',
            'Gazi', 'librosa', 'Scikit', 'Copet', 'AudioLDM', 'Frank J.'
        ]):
            n = int(m.group(1))
            ref_map[n] = i

# ─── Doğrulanmış sayfa numaraları ile güncellenecek referanslar ───────────────

new_refs = {}

# [1] MusicGen — NeurIPS 2023 vol 36, gerçek sayfa: 47704-47720
new_refs[1] = ('1. Copet J., Kreuk F., Gat I., Remez T., Vyas D., Atal Y., Synnaeve G., Défossez A., '
               'Simple and Controllable Music Generation, '
               'Adv Neural Inf Process Syst, 36, 47704-47720, 2023.')

# [2] AudioLDM — ICML 2023 PMLR 202, gerçek sayfa: 21450-21474
new_refs[2] = ('2. Liu H., Chen Z., Yuan Y., Mei X., Liu X., Mandic D., Wang W., Plumbley M.D., '
               'AudioLDM: Text-to-Audio Generation with Latent Diffusion Models, '
               'Proceedings of the 40th International Conference on Machine Learning (ICML 2023), '
               'Honolulu, Hawaii, A.B.D., 21450-21474, 23-29 Temmuz, 2023.')

# [5] Afchar — NOT: Bu makale ICASSP 2025'te yayınlandı, 2024'te değil!
# Gerçek sayfa: 1-5, ICASSP 2025
new_refs[5] = ('5. Afchar D., Meseguer Brocal G., Hennequin R., '
               'AI-Generated Music Detection and Its Challenges, '
               'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
               '(ICASSP 2025), 1-5, Hyderabad, Hindistan, 6-11 Nisan, 2025.')

# [10] AASIST — ICASSP 2022, gerçek sayfa: 6367-6371
new_refs[10] = ('10. Jung J., Heo H., Tak H., Shim H., Chung J.S., Lee B., Yu H., Evans N., '
                'AASIST: Audio Anti-Spoofing Using Integrated Spectro-Temporal Graph Attention Networks, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2022), 6367-6371, Singapur, 22-27 Mayıs, 2022.')

# [11] RawNet2 — ICASSP 2021, gerçek sayfa: 6369-6373
new_refs[11] = ('11. Tak H., Patino J., Todisco M., Nautsch A., Evans N., Larcher A., '
                'End-to-End Anti-Spoofing with RawNet2, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2021), 6369-6373, Toronto, Kanada, 6-11 Haziran, 2021.')

# [12] Vicomtech ADD — ICASSP 2022, gerçek sayfa: 9241-9245
new_refs[12] = ('12. Martín-Doñas J.M., Álvarez A., '
                'The Vicomtech Audio Deepfake Detection System Based on Wav2vec2 for the 2022 ADD Challenge, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2022), 9241-9245, Singapur, 22-27 Mayıs, 2022.')

# [20] Whisper — INTERSPEECH 2023, gerçek sayfa: 4009-4013
new_refs[20] = ('20. Kawa P., Plata M., Czuba M., Szymański P., Syga P., '
                'Improved DeepFake Detection Using Whisper Features, '
                'Proceedings of the 24th Annual Conference of the International Speech Communication Association '
                '(INTERSPEECH 2023), 4009-4013, Dublin, İrlanda, 20-24 Ağustos, 2023.')

# [21] Generalize — INTERSPEECH 2022, gerçek sayfa: 2783-2787
new_refs[21] = ('21. Müller N., Czempin P., Diekmann F., Froghyar A., Böttinger K., '
                'Does Audio Deepfake Detection Generalize?, '
                'Proceedings of the 23rd Annual Conference of the International Speech Communication Association '
                '(INTERSPEECH 2022), 2783-2787, Incheon, Güney Kore, 18-22 Eylül, 2022.')

# [24] CLAP — ICASSP 2023, gerçek sayfa: 1-5
new_refs[24] = ('24. Elizalde B., Deshmukh S., Al Ismail M., Wang H., '
                'CLAP: Learning Audio Concepts from Natural Language Supervision, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023.')

# [25] LAION-CLAP — ICASSP 2023, gerçek sayfa: 1-5
new_refs[25] = ('25. Wu Y., Chen K., Zhang T., Hui Y., Berg-Kirkpatrick T., Dubnov S., '
                'Large-Scale Contrastive Language-Audio Pretraining with Feature Fusion and '
                'Keyword-to-Caption Augmentation, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2023), 1-5, Rhodes, Yunanistan, 4-10 Haziran, 2023.')

# [36] WavLM+MFA — ICASSP 2024, gerçek sayfa: 12702-12706
new_refs[36] = ('36. Guo Y., Huang H., Chen X., Zhao H., Wang Y., '
                'Audio Deepfake Detection with Self-Supervised WavLM and Multi-Fusion Attentive Classifier, '
                'Proceedings of the IEEE International Conference on Acoustics, Speech and Signal Processing '
                '(ICASSP 2024), 12702-12706, Seoul, Güney Kore, 14-19 Nisan, 2024.')

# ─── Uygula ──────────────────────────────────────────────────────────────────
for num in sorted(new_refs.keys()):
    idx = ref_map.get(num)
    if idx is not None:
        old = doc.paragraphs[idx].text.strip()
        set_para(doc.paragraphs[idx], new_refs[num], size_pt=9)
        print(f'\n[{num}] GUNCELLENDI')
        print(f'  ESK: {old[:120]}')
        print(f'  YEN: {new_refs[num][:120]}')
    else:
        print(f'[{num}] BULUNAMADI!')

doc.save('docs/academic/paper/deliverables/AURIS_Makale_Metni.docx')
print('\nKaydedildi.')

# ─── Son durum özeti ─────────────────────────────────────────────────────────
print('\n=== SON DURUM ===')
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
            print(f'  [{n:2d}] {t[:160]}')
