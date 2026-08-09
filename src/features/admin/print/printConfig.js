export const PRINT_VERSIONS = Object.freeze(['student', 'teacher']);
export const PRINT_DENSITIES = Object.freeze(['compact', 'standard', 'wide']);
export const TEACHER_DETAIL_MODES = Object.freeze(['compact', 'full']);

export const DEFAULT_PRINT_CONFIG = Object.freeze({
  version: 'student',
  density: 'compact',
  teacherDetail: 'compact'
});

export function normalizePrintConfig(value = {}) {
  return Object.freeze({
    version: PRINT_VERSIONS.includes(value.version) ? value.version : DEFAULT_PRINT_CONFIG.version,
    density: PRINT_DENSITIES.includes(value.density) ? value.density : DEFAULT_PRINT_CONFIG.density,
    teacherDetail: TEACHER_DETAIL_MODES.includes(value.teacherDetail) ? value.teacherDetail : DEFAULT_PRINT_CONFIG.teacherDetail
  });
}

export function printDensityLabel(value) {
  return ({ compact: 'Tiết kiệm giấy', standard: 'Tiêu chuẩn', wide: 'Rộng để viết' })[value] ?? value;
}
