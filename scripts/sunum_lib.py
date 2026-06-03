"""
AURIS sunum kütüphanesi — profesyonel, çakışmasız layout sistemi.
Slayt: 13.33 x 7.5 inç (16:9)
Güvenli içerik alanı: x ∈ [0.4, 12.93], y ∈ [1.70, 6.80]
Footer bölgesi: y ∈ [7.05, 7.45] (içerik buraya girmez)
"""
import os
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR

# ── Palet ──
NAVY  = RGBColor(0x10, 0x2A, 0x4C)
NAVY2 = RGBColor(0x08, 0x1B, 0x33)
STEEL = RGBColor(0x2E, 0x5A, 0x7E)
TEAL  = RGBColor(0x0A, 0x80, 0x8C)
TEALL = RGBColor(0xE2, 0xF1, 0xF2)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
PAPER = RGBColor(0xF6, 0xF8, 0xFA)
MGRAY = RGBColor(0xEA, 0xEE, 0xF2)
LINE  = RGBColor(0xD2, 0xD9, 0xE0)
DGRAY = RGBColor(0x24, 0x2A, 0x30)
TGRAY = RGBColor(0x6A, 0x74, 0x80)
GOLD  = RGBColor(0xD9, 0x9A, 0x07)
GOLDD = RGBColor(0x8A, 0x66, 0x00)
GREEN = RGBColor(0x1B, 0x6E, 0x3C)
GREENL= RGBColor(0xE8, 0xF5, 0xEB)
RED   = RGBColor(0xB3, 0x29, 0x29)
REDL  = RGBColor(0xFC, 0xEC, 0xEC)
AMBER = RGBColor(0xFF, 0xF3, 0xDD)

SW, SH = 13.33, 7.5
MARGIN = 0.4
CONTENT_TOP = 1.70
CONTENT_BOT = 6.82
FOOTER_Y = 7.08


def _set_run(p, text, fs, bold, color, italic=False, font="Calibri"):
    r = p.add_run(); r.text = text
    r.font.size = Pt(fs); r.font.bold = bold; r.font.color.rgb = color
    r.font.italic = italic; r.font.name = font


def slide(prs):
    return prs.slides.add_slide(prs.slide_layouts[6])


def bg(s, c):
    f = s.background.fill; f.solid(); f.fore_color.rgb = c


def rect(s, l, t, w, h, fill, line=None, lw=1.0):
    sh = s.shapes.add_shape(1, Inches(l), Inches(t), Inches(w), Inches(h))
    if fill is None:
        sh.fill.background()
    else:
        sh.fill.solid(); sh.fill.fore_color.rgb = fill
    if line:
        sh.line.color.rgb = line; sh.line.width = Pt(lw)
    else:
        sh.line.fill.background()
    sh.shadow.inherit = False
    return sh


def text(s, l, t, w, h, content, fs=14, bold=False, color=DGRAY,
         align=PP_ALIGN.LEFT, anchor=MSO_ANCHOR.TOP, italic=False, font="Calibri"):
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = Pt(2); tf.margin_right = Pt(2)
    tf.margin_top = Pt(1); tf.margin_bottom = Pt(1)
    p = tf.paragraphs[0]; p.alignment = align
    _set_run(p, content, fs, bold, color, italic, font)
    return tb


def paras(s, l, t, w, h, lines, fs=14, color=DGRAY, gap=6, lead="",
          anchor=MSO_ANCHOR.TOP):
    """lines: list of str veya (str, color) veya (str, color, bold)."""
    tb = s.shapes.add_textbox(Inches(l), Inches(t), Inches(w), Inches(h))
    tf = tb.text_frame; tf.word_wrap = True
    tf.vertical_anchor = anchor
    tf.margin_left = Pt(2); tf.margin_right = Pt(2)
    first = True
    for item in lines:
        if isinstance(item, tuple):
            txt = item[0]; col = item[1] if len(item) > 1 else color
            bd = item[2] if len(item) > 2 else False
        else:
            txt, col, bd = item, color, False
        p = tf.paragraphs[0] if first else tf.add_paragraph()
        first = False
        p.alignment = PP_ALIGN.LEFT
        p.space_after = Pt(gap); p.space_before = Pt(0)
        pre = "" if txt == "" else lead
        _set_run(p, pre + txt, fs, bd, col)
    return tb


# ── Üst başlık şeridi ──
def header(s, kicker, title, sub=None):
    rect(s, 0, 0, SW, 1.5, NAVY)
    rect(s, 0, 1.5, SW, 0.055, GOLD)
    # Sol vurgu bloğu
    rect(s, 0, 0, 0.18, 1.5, GOLD)
    if kicker:
        text(s, 0.45, 0.16, 11.0, 0.32, kicker.upper(), fs=11.5, bold=True,
             color=GOLD)
    text(s, 0.45, 0.46, 12.4, 0.66, title, fs=23, bold=True, color=WHITE)
    if sub:
        text(s, 0.45, 1.12, 12.4, 0.36, sub, fs=12, color=RGBColor(0xAD,0xC4,0xD6))


def footer(s):
    rect(s, 0.4, 7.02, 12.53, 0.012, LINE)
    text(s, 0.4, 7.08, 4.6, 0.32,
         "AURIS · YZ Üretimli Müzik Tespiti", fs=9, color=TGRAY)
    text(s, 5.1, 7.08, 7.83, 0.32,
         "Hasan Arthur Altuntaş  ·  BM498  ·  Düzce Üniversitesi  ·  2025-2026",
         fs=9, color=TGRAY, align=PP_ALIGN.RIGHT)


# ── İstatistik kartı ──
def stat(s, l, t, w, h, value, label, vfs=28, fill=NAVY, vcolor=GOLD,
         lcolor=WHITE):
    rect(s, l, t, w, h, fill)
    text(s, l, t + h*0.14, w, h*0.5, value, fs=vfs, bold=True, color=vcolor,
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    text(s, l, t + h*0.63, w, h*0.34, label, fs=11, color=lcolor,
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


# ── Etiketli rozet ──
def chip(s, l, t, w, h, txt, fill=TEAL, fc=WHITE, fs=10.5):
    rect(s, l, t, w, h, fill)
    text(s, l, t, w, h, txt, fs=fs, bold=True, color=fc,
         align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)


# ── Bilgi kutusu (sol renkli bar) ──
def panel(s, l, t, w, h, title, body_lines, fill=TEALL, bar=TEAL,
          tcolor=NAVY, bfs=11.5, tfs=13, gap=5):
    rect(s, l, t, w, h, fill)
    rect(s, l, t, 0.1, h, bar)
    text(s, l+0.24, t+0.13, w-0.4, 0.4, title, fs=tfs, bold=True, color=tcolor)
    if isinstance(body_lines, str):
        body_lines = [body_lines]
    paras(s, l+0.24, t+0.6, w-0.42, h-0.72, body_lines, fs=bfs, color=DGRAY,
          gap=gap)


# ── TABLO — tek fonksiyon, çakışmasız ──
def table(s, l, t, col_w, headers, rows, row_h=0.42, hdr_h=0.42,
          fs=11, hdr_fs=11.5, highlight_row=None, align_cols=None,
          zebra=True):
    """
    Sabit hücre koordinatlarıyla tablo çizer.
    col_w: sütun genişlikleri listesi.  Toplam = tablo genişliği.
    highlight_row: vurgulanacak satır indeksi (0-based) veya None.
    align_cols: her sütun için PP_ALIGN listesi (None → tümü CENTER).
    Döner: tablo alt y koordinatı.
    """
    cx = [l]
    for w in col_w[:-1]:
        cx.append(cx[-1] + w)
    if align_cols is None:
        align_cols = [PP_ALIGN.CENTER] * len(headers)
    # Başlık
    for h, x, w, al in zip(headers, cx, col_w, align_cols):
        rect(s, x, t, w, hdr_h, NAVY)
        pad = 0.1 if al == PP_ALIGN.LEFT else 0
        text(s, x+pad, t, w-2*pad, hdr_h, h, fs=hdr_fs, bold=True,
             color=WHITE, align=al, anchor=MSO_ANCHOR.MIDDLE)
    # Satırlar
    y = t + hdr_h
    for ri, row in enumerate(rows):
        if highlight_row is not None and ri == highlight_row:
            fill = AMBER
        elif zebra and ri % 2 == 1:
            fill = MGRAY
        else:
            fill = WHITE
        for cell, x, w, al in zip(row, cx, col_w, align_cols):
            rect(s, x, y, w, row_h, fill, LINE, 0.5)
            pad = 0.1 if al == PP_ALIGN.LEFT else 0.03
            is_hi = (highlight_row is not None and ri == highlight_row)
            text(s, x+pad, y, w-2*pad, row_h, str(cell), fs=fs,
                 bold=is_hi, color=(GREEN if is_hi else DGRAY),
                 align=al, anchor=MSO_ANCHOR.MIDDLE)
        y += row_h
    return y


# ── İmza sayfası ──
def imza(s, no, adi):
    bg(s, PAPER)
    rect(s, 0, 0, SW, 0.5, NAVY)
    text(s, 0.4, 0.07, 12.5, 0.38, f"BM498 Mezuniyet Tezi — {no}: {adi}",
         fs=11, color=WHITE, anchor=MSO_ANCHOR.MIDDLE)
    rect(s, 2.4, 1.05, 8.5, 5.95, WHITE, TEAL, 1.5)
    rect(s, 2.4, 1.05, 8.5, 0.7, NAVY)
    text(s, 2.4, 1.05, 8.5, 0.7, "ÖĞRENCİ İMZA SAYFASI", fs=17, bold=True,
         color=WHITE, align=PP_ALIGN.CENTER, anchor=MSO_ANCHOR.MIDDLE)
    fields = [("Öğrenci Adı Soyadı", "Hasan Arthur Altuntaş"),
              ("Öğrenci Numarası", ""), ("Bölüm", "Bilgisayar Mühendisliği"),
              ("Danışman", ""), ("Sunum Tarihi", ""), ("Sunum Adı", adi)]
    for i, (lbl, val) in enumerate(fields):
        top = 2.1 + i*0.6
        text(s, 2.75, top, 3.1, 0.35, lbl+":", fs=12, bold=True, color=NAVY)
        text(s, 5.95, top, 4.6, 0.35, val, fs=12, color=DGRAY)
        rect(s, 5.9, top+0.36, 4.7, 0.012, LINE)
    text(s, 2.75, 5.95, 3.0, 0.38, "İmza:", fs=13, bold=True, color=NAVY)
    rect(s, 3.6, 6.34, 6.7, 0.014, DGRAY)
    text(s, 3.6, 6.4, 6.7, 0.3,
         "(Öğrenci bu alanı imzalayarak sunumun kendisine ait olduğunu onaylar.)",
         fs=9, color=TGRAY, align=PP_ALIGN.CENTER)


# ── Bölüm ayraç ──
def divider(prs, no, title):
    s = slide(prs); bg(s, NAVY)
    rect(s, 0, 2.62, SW, 0.06, GOLD)
    text(s, 0.5, 0.7, 12.3, 1.1, no, fs=54, bold=True, color=GOLD,
         align=PP_ALIGN.CENTER)
    text(s, 0.5, 1.7, 12.3, 0.85, title, fs=25, bold=True, color=WHITE,
         align=PP_ALIGN.CENTER)
    text(s, 0.5, 6.45, 12.3, 0.4,
         "Hasan Arthur Altuntaş  ·  BM498  ·  Düzce Üniversitesi  ·  2025-2026",
         fs=11, color=RGBColor(0x55,0x72,0x90), align=PP_ALIGN.CENTER)
    return s


# ── Görsel — EN-BOY ORANI KORUNARAK ──
def image(s, path, l, t, w, h, caption=None, frame=True, cap_fs=10):
    if os.path.exists(path):
        try:
            from PIL import Image as PImg
            with PImg.open(path) as im:
                iw, ih = im.size
            iar = iw/ih; bar = w/h
            if iar > bar:
                dw = w; dh = w/iar; dl = l; dt = t + (h-dh)/2
            else:
                dh = h; dw = h*iar; dt = t; dl = l + (w-dw)/2
        except Exception:
            dl, dt, dw, dh = l, t, w, h
        if frame:
            rect(s, dl-0.05, dt-0.05, dw+0.1, dh+0.1, WHITE, LINE, 0.75)
        s.shapes.add_picture(path, Inches(dl), Inches(dt), Inches(dw), Inches(dh))
        cap_t = dt + dh + 0.06
    else:
        rect(s, l, t, w, h, MGRAY, TEAL)
        text(s, l, t+h/2-0.2, w, 0.4, f"[{os.path.basename(path)}]", fs=10,
             color=TGRAY, align=PP_ALIGN.CENTER)
        cap_t = t + h + 0.06
    if caption:
        text(s, l, cap_t, w, 0.3, caption, fs=cap_fs, color=TGRAY,
             italic=True, align=PP_ALIGN.CENTER)
