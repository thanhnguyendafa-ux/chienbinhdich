import { getG6WeakAverageScaffoldContent } from './g6-u1-3-weak-average-scaffold-content.js';

export const g6WeakAverageScaffoldFolders = Object.freeze([
  Object.freeze({ id: 'global6-u1-3-wa-scaffold', name: '28 Scaffold · Yếu → Trung bình · Mastery 100%', description: '28 bài Q–A scaffold Unit 1–3: Core Grammar → Common Mistakes → Exam Skills. Mỗi Set 20 checkpoint và PASS ở 100% Mastery.', parentId: 'global6-review-u1-3', order: 90 }),
  Object.freeze({ id: 'global6-u1-3-wa-scaffold-core', name: 'A · Core Grammar · 13 bài', description: 'Xây lại nền ngữ pháp từ gợi nhớ đến áp dụng đề.', parentId: 'global6-u1-3-wa-scaffold', order: 1 }),
  Object.freeze({ id: 'global6-u1-3-wa-scaffold-mistakes', name: 'B · Common Mistakes · 7 bài', description: 'Chống nhầm bằng nhận diện → phán đoán → tự sửa.', parentId: 'global6-u1-3-wa-scaffold', order: 2 }),
  Object.freeze({ id: 'global6-u1-3-wa-scaffold-exam', name: 'C · Exam Skills · 8 bài', description: 'Chuyển grammar sang đúng dạng đề: rewrite, rearrangement, questions, verb form, error, word form, cloze và cues.', parentId: 'global6-u1-3-wa-scaffold', order: 3 })
]);

const specs = Object.freeze([
  {setNo:1,folderId:'global6-u1-3-wa-scaffold-core',order:1,title:'Present Simple – am / is / are',slug:'g6-u1-3-scaffold-01-present-simple-be',activityTypes:['mcq','true_false','typing','sentence_order'],difficulty:'easy',focus:'Nhớ và dùng đúng động từ be ở hiện tại đơn; khẳng định, phủ định, câu hỏi.'},
  {setNo:2,folderId:'global6-u1-3-wa-scaffold-core',order:2,title:'Present Simple – V / V-s / V-es',slug:'g6-u1-3-scaffold-02-v-s-es',activityTypes:['mcq','true_false','typing'],difficulty:'easy',focus:'Chia động từ thường ở hiện tại đơn, đặc biệt ngôi he/she/it.'},
  {setNo:3,folderId:'global6-u1-3-wa-scaffold-core',order:3,title:'Present Simple – do / does / don’t / doesn’t',slug:'g6-u1-3-scaffold-03-do-does',activityTypes:['mcq','true_false','typing'],difficulty:'easy',focus:'Phủ định và câu hỏi với động từ thường; tránh lỗi does + V-s.'},
  {setNo:4,folderId:'global6-u1-3-wa-scaffold-core',order:4,title:'Adverbs of Frequency + Word Order',slug:'g6-u1-3-scaffold-04-frequency',activityTypes:['mcq','true_false','typing','sentence_order'],difficulty:'easy',focus:'Hiểu nghĩa và đặt đúng vị trí always/usually/often/sometimes/never.'},
  {setNo:5,folderId:'global6-u1-3-wa-scaffold-core',order:5,title:'Wh-questions + How often',slug:'g6-u1-3-scaffold-05-wh-how-often',activityTypes:['mcq','true_false','typing'],difficulty:'medium',focus:'Chọn từ hỏi và tạo câu hỏi với be/do/does trong phạm vi U1–3.'},
  {setNo:6,folderId:'global6-u1-3-wa-scaffold-core',order:6,title:'Prepositions of Place',slug:'g6-u1-3-scaffold-06-prepositions',activityTypes:['mcq','true_false','typing'],difficulty:'easy',focus:'Hiểu và dùng in/on/under/next to/behind/in front of/between/opposite/near.'},
  {setNo:7,folderId:'global6-u1-3-wa-scaffold-core',order:7,title:'Possessive Case – ’s / s’',slug:'g6-u1-3-scaffold-07-possessive',activityTypes:['mcq','true_false','sentence_order'],difficulty:'easy',focus:"Nói sở hữu với danh từ chỉ người; phân biệt 's, s' và plural -s."},
  {setNo:8,folderId:'global6-u1-3-wa-scaffold-core',order:8,title:'There is / There are + Prepositions',slug:'g6-u1-3-scaffold-08-there-is-are',activityTypes:['mcq','true_false','typing'],difficulty:'easy',focus:'Mô tả nhà/phòng; chọn is/are theo danh từ sau cấu trúc và kết hợp giới từ vị trí.'},
  {setNo:9,folderId:'global6-u1-3-wa-scaffold-core',order:9,title:'Be vs Have / Has – Describing Appearance',slug:'g6-u1-3-scaffold-09-be-have-appearance',activityTypes:['mcq','true_false','typing'],difficulty:'easy',focus:'Phân biệt be + adjective với have/has + noun khi tả người.'},
  {setNo:10,folderId:'global6-u1-3-wa-scaffold-core',order:10,title:'Present Continuous – am / is / are + V-ing',slug:'g6-u1-3-scaffold-10-present-continuous',activityTypes:['mcq','true_false','typing','sentence_order'],difficulty:'easy',focus:'Nhận diện hành động đang diễn ra và tạo câu khẳng định đúng.'},
  {setNo:11,folderId:'global6-u1-3-wa-scaffold-core',order:11,title:'Present Continuous – V-ing Spelling + Negative + Questions',slug:'g6-u1-3-scaffold-11-ing-negative-questions',activityTypes:['mcq','true_false','typing'],difficulty:'medium',focus:'Viết đúng V-ing và tạo phủ định/câu hỏi.'},
  {setNo:12,folderId:'global6-u1-3-wa-scaffold-core',order:12,title:'Present Simple vs Present Continuous',slug:'g6-u1-3-scaffold-12-simple-vs-continuous',activityTypes:['mcq','true_false','typing'],difficulty:'medium',focus:'Phân biệt thói quen với hành động đang diễn ra; chọn thì theo ngữ cảnh.'},
  {setNo:13,folderId:'global6-u1-3-wa-scaffold-core',order:13,title:'Mixed Grammar U1–3 – Exam Scaffold',slug:'g6-u1-3-scaffold-13-mixed-grammar',activityTypes:['mcq','true_false','typing'],difficulty:'medium',focus:'Trộn ngữ pháp U1–3 theo cách đề hỏi; luyện nhận diện trước khi chọn công thức.'},
  {setNo:14,folderId:'global6-u1-3-wa-scaffold-mistakes',order:1,title:'Common Mistake – Be vs Động từ thường / động từ hành động',slug:'g6-u1-3-scaffold-14-be-vs-action',activityTypes:['mcq','true_false','typing'],difficulty:'medium',focus:'Chuyên trị lỗi is/am/are + V nguyên mẫu trong Present Simple.'},
  {setNo:15,folderId:'global6-u1-3-wa-scaffold-mistakes',order:2,title:'Common Mistake – V-s/es vs Does',slug:'g6-u1-3-scaffold-15-v-s-es-vs-does',activityTypes:['mcq','true_false','typing'],difficulty:'medium',focus:'Chuyên trị lỗi ngôi thứ ba số ít trong khẳng định, phủ định, câu hỏi.'},
  {setNo:16,folderId:'global6-u1-3-wa-scaffold-mistakes',order:3,title:'Common Mistake – Adverb Position: Be vs Động từ thường / động từ hành động',slug:'g6-u1-3-scaffold-16-frequency-position',activityTypes:['mcq','true_false','typing','sentence_order'],difficulty:'medium',focus:'Chuyên trị vị trí always/usually/often/sometimes/never.'},
  {setNo:17,folderId:'global6-u1-3-wa-scaffold-mistakes',order:4,title:'Common Mistake – Possessive ’s vs Plural -s',slug:'g6-u1-3-scaffold-17-possessive-vs-plural',activityTypes:['mcq','true_false','typing'],difficulty:'medium',focus:'Phân biệt “nhiều” và “của ai”; vị trí dấu nháy sở hữu.'},
  {setNo:18,folderId:'global6-u1-3-wa-scaffold-mistakes',order:5,title:'Common Mistake – There is vs There are + Prepositions',slug:'g6-u1-3-scaffold-18-there-is-vs-are',activityTypes:['mcq','true_false','typing'],difficulty:'medium',focus:'Chuyên trị chọn sai số ít/số nhiều và sai giới từ trong câu mô tả.'},
  {setNo:19,folderId:'global6-u1-3-wa-scaffold-mistakes',order:6,title:'Common Mistake – Be vs Have/Has in Appearance',slug:'g6-u1-3-scaffold-19-be-vs-have-appearance',activityTypes:['mcq','true_false','typing','sentence_order'],difficulty:'medium',focus:'Chuyên trị lỗi mô tả người trong U3.'},
  {setNo:20,folderId:'global6-u1-3-wa-scaffold-mistakes',order:7,title:'Common Mistake – Present Simple vs Present Continuous (Mixed)',slug:'g6-u1-3-scaffold-20-simple-vs-continuous-mistakes',activityTypes:['mcq','true_false','typing'],difficulty:'medium',focus:'Chuyên trị các bẫy dấu hiệu thời gian, be/auxiliary và câu trộn hai thì.'},
  {setNo:21,folderId:'global6-u1-3-wa-scaffold-exam',order:1,title:'Sentence Transformation / Rewrite U1–3',slug:'g6-u1-3-scaffold-21-rewrite',activityTypes:['mcq','true_false','typing'],difficulty:'hard',focus:'Viết lại câu theo cấu trúc U1–3; giữ đúng nghĩa, đúng chủ ngữ và đúng dạng động từ.'},
  {setNo:22,folderId:'global6-u1-3-wa-scaffold-exam',order:2,title:'Sentence Rearrangement U1–3',slug:'g6-u1-3-scaffold-22-rearrangement',activityTypes:['mcq','true_false','sentence_order'],difficulty:'medium',focus:'Sắp xếp từ thành câu đúng; chú ý vị trí trợ động từ, trạng từ tần suất, giới từ và V-ing.'},
  {setNo:23,folderId:'global6-u1-3-wa-scaffold-exam',order:3,title:'Make Questions / Underlined Parts U1–3',slug:'g6-u1-3-scaffold-23-make-questions',activityTypes:['mcq','true_false','typing'],difficulty:'hard',focus:'Đặt câu hỏi cho phần thông tin được cho; chọn đúng Wh-word và do/does/be.'},
  {setNo:24,folderId:'global6-u1-3-wa-scaffold-exam',order:4,title:'Verb Form Mixed U1–3',slug:'g6-u1-3-scaffold-24-verb-form',activityTypes:['mcq','typing'],difficulty:'hard',focus:'Chia động từ trong ngoặc; nhận diện be, Present Simple, Present Continuous và have/has.'},
  {setNo:25,folderId:'global6-u1-3-wa-scaffold-exam',order:5,title:'Find & Correct the Error – Exam Format',slug:'g6-u1-3-scaffold-25-error-correction',activityTypes:['mcq','typing'],difficulty:'hard',focus:'Phát hiện một lỗi ngữ pháp trong câu U1–3, gọi tên quy tắc và sửa đúng.'},
  {setNo:26,folderId:'global6-u1-3-wa-scaffold-exam',order:6,title:'Word Form U1–3',slug:'g6-u1-3-scaffold-26-word-form',activityTypes:['mcq','typing'],difficulty:'medium',focus:'Nhận diện noun/adjective/verb trong ngữ cảnh; biến đổi một số từ phổ biến U1–3 để điền đúng chỗ trống.'},
  {setNo:27,folderId:'global6-u1-3-wa-scaffold-exam',order:7,title:'Grammar Cloze / Gap Fill U1–3',slug:'g6-u1-3-scaffold-27-grammar-cloze',activityTypes:['mcq','true_false','typing'],difficulty:'hard',focus:'Điền từ/cấu trúc vào đoạn ngắn; dùng ngữ cảnh để chọn thì, be, possessive, preposition và there is/are.'},
  {setNo:28,folderId:'global6-u1-3-wa-scaffold-exam',order:8,title:'Sentence Completion from Cues U1–3',slug:'g6-u1-3-scaffold-28-cues',activityTypes:['mcq','true_false','typing'],difficulty:'hard',focus:'Viết câu hoàn chỉnh từ từ/cụm gợi ý; tự thêm trợ động từ, be, mạo từ/giới từ và chia động từ đúng.'}
]);

export const g6WeakAverageScaffoldRegistry = Object.freeze(specs.map(spec => Object.freeze({
  id: `g6-u13-wa-scaffold-${String(spec.setNo).padStart(2, '0')}`,
  folderId: spec.folderId, order: spec.order, version: 1,
  course: 'Global Success 6', unit: 'Units 1–3 · Midterm 1',
  title: `${String(spec.setNo).padStart(2, '0')} · ${spec.title}`,
  subtitle: `20 câu · ${spec.activityTypes.join(' · ')} · Scaffold Q→A · Mastery 100%`,
  expectedTimeMinutes: spec.setNo >= 21 ? 20 : 18,
  lessonSlug: spec.slug, passThreshold: 100, completionPolicy: 'all-items', typingTolerance: true,
  effortPassEnabled: false, difficulty: spec.difficulty, teacher: 'Thầy Thành MRT',
  description: `${spec.focus} Thiết kế cho học sinh lớp 6 yếu → trung bình; phần A của scaffold được dùng làm lời giải sau Submit. PASS chỉ khi Mastery đạt 100%.`,
  activityTypes: Object.freeze([...spec.activityTypes]), itemCount: 20,
  loadContent: () => getG6WeakAverageScaffoldContent(spec.setNo)
})));
