const lessonSpecs = Object.freeze([
  Object.freeze({ key:'a2', order:1, title:'A2 · Luyện đọc âm /p/ và /b/', expectedTimeMinutes:7, itemCount:3, activityTypes:['typing'] }),
  Object.freeze({ key:'b1', order:2, title:'B1 · Phân loại từ với has và is', expectedTimeMinutes:12, itemCount:3, activityTypes:['classification'] }),
  Object.freeze({ key:'b2', order:3, title:'B2 · Đọc định nghĩa và viết tính từ', expectedTimeMinutes:9, itemCount:6, activityTypes:['typing'] }),
  Object.freeze({ key:'b3', order:4, title:'B3 · Điền tính từ phù hợp', expectedTimeMinutes:8, itemCount:5, activityTypes:['typing'] }),
  Object.freeze({ key:'b4', order:5, title:'B4 · Chia động từ ở hiện tại tiếp diễn', expectedTimeMinutes:12, itemCount:10, activityTypes:['typing'] }),
  Object.freeze({ key:'b5', order:6, title:'B5 · Hiện tại đơn hay hiện tại tiếp diễn', expectedTimeMinutes:10, itemCount:7, activityTypes:['typing'] }),
  Object.freeze({ key:'b6', order:7, title:'B6 · Tạo câu ở hiện tại tiếp diễn', expectedTimeMinutes:10, itemCount:6, activityTypes:['mcq'] }),
  Object.freeze({ key:'c1', order:8, title:'C1 · Tạo hội thoại từ từ/cụm từ cho sẵn', expectedTimeMinutes:11, itemCount:6, activityTypes:['mcq','typing'] }),
  Object.freeze({ key:'c3', order:9, title:'C3 · Miêu tả một người đặc biệt', expectedTimeMinutes:10, itemCount:1, activityTypes:['typing'] }),
  Object.freeze({ key:'d1', order:10, title:'D1 · Điền từ vào bài đọc', expectedTimeMinutes:9, itemCount:6, activityTypes:['typing'] }),
  Object.freeze({ key:'d2', order:11, title:'D2 · Một người bạn tốt là...', expectedTimeMinutes:9, itemCount:1, activityTypes:['typing'] }),
  Object.freeze({ key:'d3', order:12, title:'D3 · Chọn những điều một người bạn tốt làm', expectedTimeMinutes:9, itemCount:5, activityTypes:['mcq'] }),
  Object.freeze({ key:'e1', order:13, title:'E1 · Xác định mở bài, thân bài, kết bài', expectedTimeMinutes:9, itemCount:1, activityTypes:['classification'] }),
  Object.freeze({ key:'e2', order:14, title:'E2 · Ghép câu hỏi với từng phần bài viết', expectedTimeMinutes:10, itemCount:7, activityTypes:['mcq'] }),
  Object.freeze({ key:'e3', order:15, title:'E3 · Viết về người bạn thân nhất', expectedTimeMinutes:15, itemCount:1, activityTypes:['typing'] })
]);

export const g6U3WorkbookFolders = Object.freeze([
  Object.freeze({
    id:'global6-unit3',
    name:'Unit 3 · My Friends',
    description:'Global Success 6 · Unit 3 · My Friends',
    parentId:'global6',
    order:3
  }),
  Object.freeze({
    id:'global6-unit3-workbook',
    name:'Sách bài tập · Unit 3',
    description:'Bài SBT Global Success 6 Unit 3 · My Friends. A1 và C2 được bỏ vì phụ thuộc trực tiếp vào hình ảnh; không tạo bài thay thế.',
    parentId:'global6-unit3',
    order:1
  })
]);

function descriptor(spec) {
  return Object.freeze({
    id:`g6-u3-wb-${spec.key}`,
    folderId:'global6-unit3-workbook',
    order:spec.order,
    version:1,
    course:'Global Success 6',
    unit:'Unit 3 · My Friends · Sách bài tập',
    title:spec.title,
    subtitle:'Nhắc nhanh trước bài · Bài SBT · Giải thích tiếng Việt sau Submit',
    expectedTimeMinutes:spec.expectedTimeMinutes,
    lessonSlug:`g6-u3-wb-${spec.key}`,
    passThreshold:80,
    completionPolicy:'explain-and-accept',
    typingTolerance:true,
    teacher:'Thầy Thành MRT',
    description:`${spec.itemCount} lượt theo bài SBT. Bài phụ thuộc hình bị loại; câu dài cố định được chuyển sang lựa chọn khi cần; bài mở vẫn giữ production.`,
    activityTypes:Object.freeze(spec.activityTypes),
    itemCount:spec.itemCount,
    loadContent:() => import('./g6-u3-workbook-content.js').then(module => module.getG6U3WorkbookContent(spec.key))
  });
}

export const g6U3WorkbookRegistry = Object.freeze(lessonSpecs.map(descriptor));
