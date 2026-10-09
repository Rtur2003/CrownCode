# Paper 2 — writing protocol, citation hygiene, disclosure and venue options

Everything marked **documented** comes from a source listed in §9; everything marked **heuristic** is practice advice, not a
measured fact. Venue figures are those found on 2026-10-05 and must be re-checked on the day of submission.

## 1. Principle

The aim is prose that reads like one specific researcher explaining one specific piece of work: concrete, numerate, slightly
asymmetric, honest about what failed. That is a writing-quality goal. It is not a promise to pass an AI-text detector, for two reasons.

- Detectors are unreliable. In a study of seven GPT detectors, TOEFL essays by non-native writers were flagged as AI-generated at
  an average false-positive rate of 61.3 % while essays by US students were classified almost perfectly (Liang et al., Patterns
  2023, doi 10.1016/j.patter.2023.100779). The cause is low perplexity, which plain, careful non-native prose also has. Honest text
  can be flagged; polished machine text can slip through.
- Venues do not ask whether a detector fired. They ask whether AI assistance was disclosed according to their policy (§6).

So the defence that works is (a) the author really wrote and understands every paragraph, (b) the drafting trail exists, and
(c) any assistance is declared where the venue requires it.

## 2. What is documented about LLM-influenced scientific prose

- Kobak, González-Márquez, Horvát, Lause (Science Advances 2025, doi 10.1126/sciadv.adt3813): across 15 million PubMed abstracts,
  2024 shows an abrupt rise of *style* words, mostly verbs and adjectives, not content words. Examples with large excess: delves,
  underscores, showcasing (excess ratios 28.0, 13.8, 10.7); common ones: potential, findings, crucial. A 10-word set (across,
  additionally, comprehensive, crucial, enhancing, exhibited, insights, notably, particularly, within) gives the same lower bound
  (≥ 13.5 % of 2024 abstracts processed with LLMs). The authors also cite intricate, meticulously, pivotal, realm, showcasing from earlier work.
- Consequence for us: do not stack these words by reflex. Several are normal English ("within", "across"), so the rule is
  *frequency and reflex*, not a ban list. Technical words that are the actual subject (robustness, calibration) stay.

**Heuristic tells to avoid** (not from a study): every paragraph the same length; triplets everywhere ("X, Y, and Z"); "not only … but
also" and "ranging from … to …" scaffolds; em-dash chains; closing sentences that restate the paragraph ("Overall, …"); announcing the
section ("In this section, we …"); vague authority ("studies have shown"); adjective inflation (remarkable, striking, seamless);
hedge stacks ("may potentially suggest"); nominalised verbs ("the utilisation of"); perfectly parallel bullet grammar; a thesis
sentence that could open any paper in the field.

**Heuristic traits of human technical prose:** a number or a named object in most sentences; a short sentence after a long one;
a stated decision and its reason ("We dropped MERT-330M because it did not fit in 4 GB"); admission of a failed attempt; a claim
followed by its limit in the same paragraph; terms defined once and then used without synonyms.

## 3. Rules for this paper

1. Gopen & Swan (American Scientist 78(6):550–558, 1990): keep the grammatical subject near its verb; put the new information at the
   end of the sentence (stress position); put the old, linking information at the start (topic position); one point per unit of
   discourse; give context before novelty.
2. One term per concept for the whole paper: "fake source", "real corpus", "training pair", "cell", "shift type", "operating point".
   No synonyms for variety.
3. Every results sentence carries its number, its unit/metric and its interval, taken from the claims ledger.
4. Scoped verbs: "we observe", "in these cells", "for the tested generators". No "proves", "demonstrates that detectors generalise".
5. First-person plural for choices ("we fix the window at 10 s"); passive only when the agent is irrelevant.
6. American spelling throughout; Latin-script punctuation; at most one em dash per page.
7. Limits go next to the claim they limit, not in a distant paragraph.
8. No sentence that only restates the previous one.
9. Avoid Turkish-English calques ("in the scope of", "it is seen that", "as it is known"); prefer the short direct form.

Before / after examples (generic, no results):

| Flat, scaffolded | Plainer |
|---|---|
| "It is worth noting that detectors may potentially exhibit varying performance across diverse generators." | "Detector accuracy differs by generator." |
| "This study delves into the intricate landscape of cross-dataset evaluation." | "We evaluate each detector on data from other sources than its training data." |
| "The results underscore the pivotal role of the real corpus." | "Changing the real corpus lowered AUROC by X; changing the generator lowered it by Y." (numbers from the ledger) |
| "Overall, our comprehensive analysis showcases the robustness of the approach." | Delete; or state the one result that matters. |
| "A threshold was selected, which was subsequently applied." | "We chose the threshold on the calibration split and applied it unchanged to the test split." |

## 4. Paragraph blueprint (what each paragraph must do)

- **Abstract (≤ 250 words):** gap with citations in one sentence; what we did (crossed design, systems, data counts); three results with numbers; one limit; no "first".
- **Introduction (5–6 paragraphs):** (1) why detection matters, with the Deezer figures as vendor statements; (2) what cross-dataset results exist and what they leave confounded; (3) our design in two sentences; (4) four contributions as a numbered list; (5) paper outline in one sentence.
- **Related work:** one paragraph per cluster (datasets; detectors; evaluation protocols; shortcut literature); a comparison table instead of prose for who-did-what.
- **Data and protocol:** one subsection per source (counts, licence, format, lineage unit); equalisation regimes; splits and sealing; legal handling.
- **Systems:** one paragraph per family; parameters in a table; tuning budget stated.
- **Results:** each subsection opens with the question, then the number, then the reading, then the limit. Figures carry the story; text points to them.
- **Discussion:** what transfers; what does not; competing explanations (era, mastering, pre-training contamination); each limitation named with its likely direction of bias.
- **Conclusion (≤ 150 words):** scoped claims, one practical recommendation (report operating points and null tasks), one open problem.

## 5. Process (recommended)

1. Numbers: every figure and table is generated from a stored CSV by a script; a **claims ledger** (CSV: claim id, sentence, value,
   source file, script, verified-on date) feeds the text.
2. Author drafts the claim sentences and the Discussion in their own words from the ledger.
3. Assistant role: structure, logic checks, number-to-ledger checks, clarity edits, figure code in the first paper's style.
   Where the assistant drafts paragraphs, the author rewrites them sentence by sentence before they enter the manuscript.
4. Self-audit script (heuristic, run on every draft): sentence-length mean and SD; paragraph-length SD; per-1,000-word counts of
   the Kobak marker words, em dashes, "not only … but", "Overall,", "In this section"; numbers per paragraph; first-person ratio.
   The script flags outliers; it is not a pass/fail test and its thresholds are tuned on the first paper's English abstract and
   on several published papers in this field, not on any detector.
5. Native or advanced reader pass (advisor, colleague, or a language service) for idiom; record who and when.
6. Keep the trail: version history of the manuscript file, git log of scripts, dated notes. This is the real evidence of authorship.
7. Declare assistance per §6 before submission.

## 5b. Figure and table standard (fixed from the first plot, adapted to the venue later)

The first paper's figures set the baseline: Times New Roman, transparent background, GOLD #C99347 / HUMAN #3cb44b / AI-red #e6194b
for the two classes, grid alpha 0.15. Reviewers and readers judge legibility before content, so these rules are checked on every figure.

1. **Size first.** Build each figure at its final printed width (single column or full width of the chosen venue). Nothing is
   scaled afterwards. Venue widths are set in the adaptation pass; until then use 3.5 in and 7.2 in as working widths.
2. **Text.** Axis labels, tick labels, legends and panel letters ≥ 8 pt at final size (≥ 9 pt for the main-text figures when the
   venue allows); one font family; English labels with units ("AUROC", "False-positive rate (%)"); no figure titles inside the image
   because the caption carries them; panels labelled (a), (b), (c).
3. **Lines and marks.** Line width ≥ 0.75 pt, marker size ≥ 4 pt, error bars drawn with caps and defined in the caption (95 % lineage-bootstrap CI).
4. **Colour.** Class colours stay as in paper 1 (human green, AI red, accent gold). System families get a separate fixed mapping used in
   every figure (AURIS family: gold shades; SSL families: blue/teal/grey; published detectors: purple), plus distinct markers or
   hatches so the figure survives grayscale and common colour-vision deficiencies. The mapping is stored once in the plotting module.
5. **Layout.** Legends outside the data area; no overlapping labels; heatmaps share one colour scale per row of panels; axis ranges
   identical across panels that are meant to be compared; order of systems identical in all figures and tables.
6. **Formats.** Vector PDF for line art (fonts embedded) plus a PNG at 300–600 dpi as the venue requires (**verify per venue**); file
   names `fig01_design.pdf` … in the order of appearance.
7. **Captions.** Self-contained: what is plotted, n per class, interval type, regime (R0/R1/R2), and the one-sentence reading.
8. **Tables.** At most seven columns; the same number of decimals per metric (three for AUROC); intervals written `0.812 [0.790, 0.834]`;
   bold marks the best value only when the table says what bold means; units in the header; footnotes for abbreviations.
9. **QA before every export:** print at 100 % and read it; shrink to 50 % and read the smallest text; convert to grayscale; check
   that fonts are embedded and no raster text is blurred; compare terminology and numbering with the text.

## 5c. Venue adaptation pass (after the advisor names the venue)

Checklist, in this order: template and page/word limits; reference style and the way preprints and datasets are cited; figure width,
resolution and font rules; abstract length and keywords; data- and code-availability statement; ethics statement; AI-assistance
declaration (place and wording, §6); preprint and APC policy; cover letter; supplementary-material format. The study itself does not
change; only the packaging does. A change log is kept so the claims ledger stays valid.

## 6. Disclosure policies found (check again on the day)

| Publisher | Requirement found |
|---|---|
| IEEE | AI-generated text must be disclosed in the acknowledgements, and the sections that contain it cite the AI system |
| Springer Nature (incl. the Journal on Audio, Speech, and Music Processing) | LLMs cannot be authors; use is documented in Methods or a suitable alternative; "AI-assisted copy editing" (grammar, readability, no generative content) need not be declared; one Springer Nature page says it should be declared in line with the guidance, so check the journal page |
| Elsevier | Declaration statement before the references for use beyond basic grammar/spelling checks: tool, reason, human review |
| MDPI | Disclosure in Acknowledgements and detail in Methods |

None of these require a detector score. All of them require that authors take full responsibility for the content.

## 7. Citation hygiene

- A reference enters the bibliography only after the DOI/arXiv/publisher page was opened and author list, year, venue and pages
  were compared with the entry. Record `verified-on` in `references.csv`.
- Preprints and workshop papers are labelled as such; arXiv versions cited by version (Echoes v2 differs from v1).
- Vendor statements (Deezer, ArtifactNet demo) are cited as vendor statements.
- No sentence cites a paper for something the paper was only skimmed for; the "Depth" column in `LITERATURE_MAP.md` must be
  "full" for any paper used as evidence rather than as context.
- Self-citation of paper 1 is limited to the features, the data pool and the LOGO table, each with table numbers **verified**
  against the final manuscript.

## 8. Venue options (found 2026-10-05)

| Venue | Model | Speed signal | Cost signal | Fit | Notes |
|---|---|---|---|---|---|
| Journal on Audio, Speech, and Music Processing (Springer; formerly EURASIP JASM, renamed 2026-01-01) | Open access | Median 28 days to first decision (journal page) | APC not on the fetched page; waivers on an ad-hoc basis | Exact scope; IF 2.7 (2025), CiteScore 4.5 | Best match for speed plus topic; check the APC and preprint policy |
| IEEE Access | Open access | IEEE advertises about 4 weeks to a decision (reported by a third-party site) | APC US$2,160 in the IEEE 2026 list | Broad scope, sound-science bar | Fast fallback; APC is the barrier |
| TISMIR | Diamond open access | Mean 247 days from submission to publication in the posted statistics (year not shown in the excerpt) | No author fees | MIR audience, high prestige, acceptance rate 36 % in the posted table | Slowest; best if prestige matters more than speed |
| IEEE/ACM TASLP | Hybrid | First decision 3–5 months (third-party estimate) | OA option US$2,800 in the IEEE 2026 list | Top audio venue | Selective; unlikely to meet the "fast" goal |
| Scientific Reports | Open access | Not verified | Not verified | Li et al. 2026 published here | Look up before considering |
| Conferences (ISMIR, ICASSP, Interspeech, DCASE) | — | Deadlines not verified | — | Faster visibility, short page limits | Our design is journal-sized; a workshop paper on one block is possible |
| arXiv preprint | — | Immediate | None | Establishes date | Decide the timing against paper 1's status and the target venue's preprint policy |

Status: the venue is chosen by the advisor after the research and writing are finished (decision D2). The table is the starting
list for that conversation: the Journal on Audio, Speech, and Music Processing fits "fast and in English" best on the evidence
found; TISMIR is the patient, fee-free alternative; IEEE Access only if an APC can be paid.

## 8b. Ethics and integrity paragraph (needed by most venues)

Detection errors can accuse real artists; the paper states that scores are not proof of authorship, reports per-genre false-positive
rates, uses only openly licensed human recordings plus datasets under their licences, releases no audio, and declares AI-assisted
writing per the venue policy.

## 9. Sources used for this file

Liang et al., Patterns 2023 (doi 10.1016/j.patter.2023.100779); Kobak et al., Science Advances 2025 (doi 10.1126/sciadv.adt3813);
Gopen & Swan, American Scientist 78(6):550–558 (1990); Springer Nature AI guidance and journal guideline pages; Elsevier policy
text quoted in publisher compilations; IEEE guideline text quoted in the same compilations; IEEE 2026 APC list; Journal on
Audio, Speech, and Music Processing home page; TISMIR "About" statistics; a third-party summary of IEEE Access timing.

## 8c. Venue facts added 2026-10-09 (re-check on the day)

| Item | Fact found | Source status |
|---|---|---|
| Journal on Audio, Speech, and Music Processing | APC £1,490 / US$1,990 / €1,690 plus taxes; waivers and discounts for authors from the lowest-income countries, other requests case by case for financial need, to be made at submission | Springer "How to publish with us" page, opened |
| TISMIR | Research article limit 8,000 words including references; blind review (title page with title and abstract only); fee-free routes and the APC figure conflict between sources (£530 in one report, other lower figures in an earlier search) | Guidelines page opened; fee unresolved |
| TÜBİTAK Turkish J. Electrical Eng. & Computer Sciences | No APC | policy page per report; confirm |
| TMLR | No fees | policy page per report; confirm |
| Signal Processing (Elsevier) | Subscription route has no author fee; optional OA about US$2,920 | report; confirm |
| Digital Signal Processing (Elsevier) | Moving to full open access; APC about US$2,900 for new submissions after the transition date | report; confirm |
| ICASSP 2027 (Toronto) | Full-paper deadline 23 Sep 2026 has passed; notification 13 Jan 2027; final papers 27 Jan 2027 | CFP page opened |
| EUSIPCO 2027 | Paper deadline 6 Feb 2027 | report and earlier search agree; confirm |
| Interspeech 2027 | Full submission 9 Feb 2027 per the key-dates page; Interspeech dates conflicted in an earlier search | report; confirm |
| ISMIR 2027, SMC 2027, DCASE 2027 workshop, AES | No paper CFP found yet | report and earlier search |
