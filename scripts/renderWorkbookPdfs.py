#!/usr/bin/env python3
import csv, html, json, os, re, shutil, sys
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, Table, TableStyle
from pypdf import PdfReader, PdfWriter

DATA_DIR=Path(os.environ.get('EXPORT_OUT','workbook-export-data'))
OUT_DIR=Path(os.environ.get('PDF_OUT','workbook-pdf-export'))
PRODUCTION_SHA=os.environ.get('PRODUCTION_SHA','9d122b708f4519f9c54d0b384f6489d82dedd358')

with open(DATA_DIR/'corpus.json',encoding='utf-8') as f:
    corpus=json.load(f)
audit=corpus['audit']; lessons=corpus['lessons']
if audit.get('status')!='PASS':
    raise SystemExit('Refusing PDF generation because export audit is not PASS')

shutil.rmtree(OUT_DIR,ignore_errors=True)
OUT_DIR.mkdir(parents=True,exist_ok=True)

font_regular=find_font(['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf'])
font_bold=find_font(['/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf','/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf'])
if font_regular:
    pdfmetrics.registerFont(TTFont('ExportSans',font_regular)); BODY_FONT='ExportSans'
else: BODY_FONT='Helvetica'
if font_bold:
    pdfmetrics.registerFont(TTFont('ExportSansBold',font_bold)); BOLD_FONT='ExportSansBold'
else: BOLD_FONT='Helvetica-Bold'

styles=getSampleStyleSheet()
styles.add(ParagraphStyle(name='XTitle',fontName=BOLD_FONT,fontSize=18,leading=22,spaceAfter=7,alignment=TA_LEFT,textColor=colors.black))
styles.add(ParagraphStyle(name='XH1',fontName=BOLD_FONT,fontSize=13,leading=17,spaceBefore=8,spaceAfter=5))
styles.add(ParagraphStyle(name='XH2',fontName=BOLD_FONT,fontSize=11,leading=14,spaceBefore=6,spaceAfter=3))
styles.add(ParagraphStyle(name='XBody',fontName=BODY_FONT,fontSize=9.6,leading=14,spaceAfter=4))
styles.add(ParagraphStyle(name='XSmall',fontName=BODY_FONT,fontSize=8.2,leading=11,spaceAfter=2,textColor=colors.HexColor('#333333')))
styles.add(ParagraphStyle(name='XAnswer',fontName=BOLD_FONT,fontSize=9.6,leading=14,spaceBefore=3,spaceAfter=3,borderWidth=.5,borderColor=colors.black,borderPadding=5,backColor=colors.HexColor('#f3f3f3')))
styles.add(ParagraphStyle(name='XCenter',fontName=BOLD_FONT,fontSize=16,leading=20,alignment=TA_CENTER,spaceAfter=9))

TYPE_LABELS={
 'typing':'GÕ CÂU TRẢ LỜI','mcq':'TRẮC NGHIỆM','true_false':'ĐÚNG / SAI','sentence_order':'SẮP XẾP CÂU',
 'sequence_number':'ĐÁNH SỐ THỨ TỰ','classification':'PHÂN LOẠI','matching':'GHÉP CẶP'
}

def find_font(candidates):
    for p in candidates:
        if os.path.exists(p): return p
    return None

def p(text,style='XBody'):
    return Paragraph(escape(str(text or '')).replace('\n','<br/>'),styles[style])

def rich_link(url,label=None):
    label=escape(label or url); u=escape(url, {'"':'&quot;'})
    return Paragraph(f'<link href="{u}" color="blue"><u>{label}</u></link>',styles['XSmall'])

def flatten(value):
    if value is None: return ''
    if isinstance(value,str): return value
    if isinstance(value,bool): return 'true' if value else 'false'
    if isinstance(value,(int,float)): return str(value)
    if isinstance(value,list): return ' | '.join(flatten(v) for v in value)
    if isinstance(value,dict):
        return ' | '.join(f'{k}: {flatten(v)}' for k,v in value.items())
    return str(value)

def lesson_story(lesson):
    s=[]
    s.append(p(f"GLOBAL SUCCESS {lesson['grade']} - SÁCH BÀI TẬP",'XTitle'))
    s.append(p(lesson.get('folderPath') or lesson.get('unit'),'XH1'))
    s.append(p(f"Bài: {lesson.get('title','')}"))
    if lesson.get('subtitle'): s.append(p(lesson['subtitle'],'XSmall'))
    meta=f"Set: {lesson['setId']} | Mastery: {lesson['passThreshold']}% | Số câu/lượt: {lesson['itemCount']}"
    s.append(p(meta,'XSmall'))
    s.append(rich_link(lesson['productionUrl'],'Mở bài production trên Chiến Binh Dịch'))
    s.append(Spacer(1,4))
    theory=lesson.get('preLessonTheory')
    if theory:
        s.append(p('HỌC SINH THẤY TRƯỚC KHI LÀM','XH1'))
        if theory.get('title'): s.append(p(theory['title'],'XH2'))
        if theory.get('intro'): s.append(p(theory['intro']))
        for section in theory.get('sections') or []:
            s.append(p(section.get('heading',''),'XH2'))
            for bullet in section.get('bullets') or []: s.append(p('• '+flatten(bullet)))
        if theory.get('summary'): s.append(p('Ghi nhớ: '+theory['summary'],'XSmall'))
    s.append(p('TOÀN BỘ NỘI DUNG BÀI + ĐÁP ÁN','XH1'))
    for item in lesson.get('items') or []:
        s.extend(item_story(item))
    s.append(Spacer(1,6))
    s.append(p(f"Xuất từ production corpus commit {PRODUCTION_SHA}. Lựa chọn/token có thể được xáo vị trí khi học online; đáp án trong PDF là đáp án ngữ nghĩa/canonical.",'XSmall'))
    return s

def item_story(item):
    n=item['number']; t=item['type']; label=TYPE_LABELS.get(t,t.upper()); phase=item.get('learningPhase') or 'source'
    block=[p(f"Câu {n} - {label} - phase: {phase}",'XH2')]
    trace=item.get('sourceTrace') or {}
    if trace:
        block.append(p(f"Nguồn: {trace.get('originalActivity','')} | {trace.get('sourceBlock','')} | {trace.get('sourcePolicy','')}",'XSmall'))
    adap=item.get('digitalAdaptation') or {}
    if adap.get('note'): block.append(p('Chuyển đổi online: '+adap['note'],'XSmall'))
    passage=item.get('passage')
    if passage:
        title=passage.get('title') or passage.get('heading') or 'Đoạn đọc'
        block.append(p(title,'XH2'))
        block.append(p(passage.get('text') or passage.get('passage') or flatten(passage)))
    stim=item.get('stimulus')
    if stim:
        block.append(p(stim.get('title') or 'Ngữ cảnh','XSmall'))
        block.append(p(stim.get('text') or flatten(stim)))
    if item.get('sourceContext'):
        block.append(p('Ngữ cảnh nguồn: '+flatten(item['sourceContext']),'XSmall'))
    if item.get('wordBank'):
        block.append(p('Word bank: '+flatten(item['wordBank']),'XSmall'))
    block.append(p(item.get('prompt') or ''))
    if t=='mcq':
        for i,c in enumerate(item.get('choices') or []): block.append(p(f"{chr(65+i)}. {c.get('text',c)}"))
    elif t=='matching':
        groups={str(g.get('id')):g.get('label',g.get('id')) for g in item.get('groups') or []}
        block.append(p('Bên trái: '+', '.join(str(x.get('text')) for x in item.get('tokens') or []),'XSmall'))
        block.append(p('Bên phải: '+', '.join(str(v) for v in groups.values()),'XSmall'))
    elif t=='classification':
        block.append(p('Nhóm: '+', '.join(str(g.get('label',g.get('id'))) for g in item.get('groups') or []),'XSmall'))
        block.append(p('Thẻ cần phân loại: '+', '.join(str(x.get('text')) for x in item.get('tokens') or []),'XSmall'))
    elif t=='sentence_order':
        tokens=item.get('tokens') or []
        block.append(p('Khối từ: '+' | '.join(str(x.get('text',x) if isinstance(x,dict) else x) for x in tokens),'XSmall'))
    elif t=='sequence_number':
        for line in item.get('lines') or []: block.append(p(f"□ {line.get('text',line)}"))
    elif t=='typing':
        ui=item.get('typingUi') or {}
        if ui.get('instruction'): block.append(p(ui['instruction'],'XSmall'))
    ans=item.get('answer') or {}
    answer_text=ans.get('text') or ''
    if ans.get('mode')=='completion' and ans.get('sample'):
        answer_text += f" Ví dụ: {ans['sample']}"
    block.append(p('ĐÁP ÁN / CÁCH CHẤM: '+answer_text,'XAnswer'))
    fb=item.get('teachingFeedback') or {}
    if fb:
        if fb.get('reason'): block.append(p('Giải thích: '+flatten(fb['reason']),'XSmall'))
        if fb.get('theory'): block.append(p('Lý thuyết nhắc lại: '+flatten(fb['theory']),'XSmall'))
        if fb.get('example'): block.append(p('Ví dụ: '+flatten(fb['example']),'XSmall'))
        if fb.get('answerAnalysis'): block.append(p('Phân tích đáp án: '+flatten(fb['answerAnalysis']),'XSmall'))
    block.append(Spacer(1,5))
    return block

def build_pdf(lesson,out_path):
    doc=SimpleDocTemplate(str(out_path),pagesize=A4,rightMargin=14*mm,leftMargin=14*mm,topMargin=14*mm,bottomMargin=14*mm,title=f"{lesson['course']} {lesson['setId']}")
    doc.build(lesson_story(lesson),onFirstPage=footer,onLaterPages=footer)

def footer(canvas,doc):
    canvas.saveState(); canvas.setFont(BODY_FONT,7); canvas.drawString(14*mm,7*mm,f"Chiến Binh Dịch | {PRODUCTION_SHA[:12]}"); canvas.drawRightString(196*mm,7*mm,f"Trang {doc.page}"); canvas.restoreState()

def safe_name(text):
    text=re.sub(r'[^A-Za-z0-9._-]+','_',str(text)); return text.strip('_') or 'lesson'

def merge_pdfs(paths,out_path):
    writer=PdfWriter()
    for pth in paths:
        reader=PdfReader(str(pth))
        for page in reader.pages: writer.add_page(page)
    with open(out_path,'wb') as f: writer.write(f)

def audit_pdf(out_path):
    doc=SimpleDocTemplate(str(out_path),pagesize=A4,rightMargin=16*mm,leftMargin=16*mm,topMargin=16*mm,bottomMargin=16*mm,title='Workbook Production PDF Audit')
    st=[p('GLOBAL SUCCESS 2-3-5-6-7 - PRODUCTION WORKBOOK EXPORT AUDIT','XCenter'),p(f"Production commit: {audit['productionSha']}",'XSmall'),p(f"Production origin: {audit['productionOrigin']}",'XSmall'),p(f"Kết quả corpus audit: {audit['status']}",'XH1'),p(f"Tổng số bài SBT: {audit['totalLessons']} | Tổng số item học sinh làm: {audit['totalItems']} | Open/completion: {audit['openCompletionItems']}")]
    data=[[p('Grade','XSmall'),p('Lessons','XSmall'),p('Items','XSmall'),p('Accuracy','XSmall'),p('Completion','XSmall'),p('Question types','XSmall')]]
    for grade in ['2','3','5','6','7']:
        g=audit['grades'][grade]
        data.append([str(grade),str(g['lessons']),str(g['items']),str(g['accuracyItems']),str(g['completionItems']),', '.join(f"{k}:{v}" for k,v in g['types'].items())])
    tbl=Table(data,colWidths=[15*mm,20*mm,20*mm,22*mm,25*mm,80*mm],repeatRows=1)
    tbl.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),BODY_FONT),('FONTSIZE',(0,0),(-1,-1),7.8),('GRID',(0,0),(-1,-1),.35,colors.grey),('VALIGN',(0,0),(-1,-1),'TOP'),('BACKGROUND',(0,0),(-1,0),colors.HexColor('#eeeeee')),('LEFTPADDING',(0,0),(-1,-1),3),('RIGHTPADDING',(0,0),(-1,-1),3)]))
    st += [Spacer(1,6),tbl,p('Các gate bắt buộc','XH1')]
    gates=[('Expected lesson counts','PASS' if not audit['countFailures'] else 'FAIL'),('Mastery threshold 80%','PASS' if not audit['passThresholdNot80'] else 'FAIL'),('Objective item có đáp án','PASS' if not audit['missingObjectiveAnswers'] else 'FAIL'),('Slug duy nhất','PASS' if not audit['duplicateSlugs'] else 'FAIL'),('Question type hợp lệ','PASS' if not audit['unknownTypes'] else 'FAIL')]
    for k,v in gates: st.append(p(f"• {k}: {v}"))
    st += [p('Provenance G2/G3','XH1'),p('Grade 2: corpus production được gắn PDF-SOURCE-LOCKED trong sourceTrace của các bài đã audit. Grade 3: production vẫn gắn PUBLIC-STRUCTURE-ADAPTED; chưa tuyên bố page-by-page fidelity cho tới khi có đúng PDF SBT Grade 3.'),p('Học sinh lớp 2 đang thấy gì?','XH1'),p('Mỗi Unit mở bằng nhắc nhanh/lý thuyết ngắn, tiếp theo là MCQ từ vựng Anh→Việt, rồi các activity SBT text-only gồm ghép cặp, trắc nghiệm, gõ từ/câu ngắn, sắp xếp câu, đánh số, phân loại hoặc bài mở tùy Unit. Mỗi bài dùng Workbook All Items Mastery, ngưỡng PASS 80%. PDF từng bài bên dưới phản ánh corpus production và kèm đáp án/giải thích cho giáo viên.'),p('Lưu ý trình bày','XH1'),p('App có thể xáo vị trí choice/token theo exposure. PDF liệt kê authored content và đáp án ngữ nghĩa/canonical, không coi chữ cái A/B/C/D trên màn hình là SSOT.')]
    doc.build(st,onFirstPage=footer,onLaterPages=footer)

# Generate lesson PDFs and grade masters.
by_grade={2:[],3:[],5:[],6:[],7:[]}
manifest=[]
for lesson in lessons:
    grade=int(lesson['grade']); grade_dir=OUT_DIR/f'Global_Success_{grade}'; lesson_dir=grade_dir/'lessons'; lesson_dir.mkdir(parents=True,exist_ok=True)
    name=f"G{grade}_{len(by_grade[grade])+1:03d}_{safe_name(lesson['setId'])}.pdf"
    out=lesson_dir/name
    build_pdf(lesson,out)
    by_grade[grade].append(out)
    manifest.append({**{k:lesson.get(k) for k in ['grade','setId','folderPath','unit','title','lessonSlug','productionUrl','itemCount','passThreshold']},'pdf':str(out.relative_to(OUT_DIR))})

for grade,paths in by_grade.items():
    grade_dir=OUT_DIR/f'Global_Success_{grade}'
    master=grade_dir/f'Global_Success_{grade}_SBT_FULL_CONTENT_ANSWERS.pdf'
    merge_pdfs(paths,master)
    with open(grade_dir/'lesson_links.csv','w',encoding='utf-8',newline='') as f:
        rows=[r for r in manifest if int(r['grade'])==grade]
        w=csv.DictWriter(f,fieldnames=['setId','folderPath','unit','title','lessonSlug','productionUrl','itemCount','passThreshold','pdf']); w.writeheader(); w.writerows([{k:r[k] for k in w.fieldnames} for r in rows])

with open(OUT_DIR/'lesson_links_all.csv','w',encoding='utf-8',newline='') as f:
    w=csv.DictWriter(f,fieldnames=['grade','setId','folderPath','unit','title','lessonSlug','productionUrl','itemCount','passThreshold','pdf']); w.writeheader(); w.writerows(manifest)

# HTML index with one clickable web link and one local PDF filename per lesson.
rows=[]
for r in manifest:
    rows.append(f"<tr><td>{r['grade']}</td><td>{html.escape(r['folderPath'])}</td><td>{html.escape(r['setId'])}</td><td>{r['itemCount']}</td><td><a href=\"{html.escape(r['productionUrl'])}\">Học online</a></td><td><a href=\"{html.escape(r['pdf'])}\">PDF</a></td></tr>")
index_html='''<!doctype html><meta charset="utf-8"><title>Workbook export index</title><style>body{font-family:Arial,sans-serif;margin:24px}table{border-collapse:collapse;width:100%}th,td{border:1px solid #aaa;padding:6px;vertical-align:top}th{background:#eee;position:sticky;top:0}a{word-break:break-all}</style><h1>Global Success 2-3-5-6-7 - SBT production export</h1><p>Production SHA: '''+html.escape(PRODUCTION_SHA)+'''</p><table><thead><tr><th>Grade</th><th>Folder/Unit</th><th>Set</th><th>Items</th><th>Production</th><th>PDF</th></tr></thead><tbody>'''+''.join(rows)+'''</tbody></table>'''
(OUT_DIR/'INDEX.html').write_text(index_html,encoding='utf-8')
(OUT_DIR/'audit.json').write_text(json.dumps(audit,ensure_ascii=False,indent=2),encoding='utf-8')
(OUT_DIR/'README.txt').write_text('Mỗi thư mục grade có PDF tổng, thư mục lessons chứa PDF từng bài, lesson_links.csv chứa link production từng bài. INDEX.html là mục lục toàn bộ.\n',encoding='utf-8')
audit_pdf(OUT_DIR/'AUDIT_REPORT.pdf')

print(f"Generated {len(manifest)} lesson PDFs and 5 grade master PDFs under {OUT_DIR}")
