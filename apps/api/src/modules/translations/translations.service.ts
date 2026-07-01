import ExcelJS from 'exceljs';
import * as repo from './translations.repository';
import { AppError } from '../../middleware/errorHandler';
import { TRANSLATABLE_MODULES, isValidModule, isValidField } from './translations.constants';

const COLUMNS = ['module', 'entity_id', 'field', 'locale', 'source_value', 'value'] as const;

/** Recursively strip leading/trailing whitespace from all JSON object keys. */
function stripJsonKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(stripJsonKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k.trim(), stripJsonKeys(v)]),
    );
  }
  return obj;
}

export function listModules() {
  return Object.entries(TRANSLATABLE_MODULES).map(([key, m]) => ({
    key,
    label: m.label,
    fields: m.fields,
  }));
}

export async function get(module: string, entityId?: number, locale?: string) {
  if (!isValidModule(module)) throw new AppError(400, 'INVALID_MODULE', `Module không hợp lệ: ${module}`);
  return repo.find(module, entityId, locale);
}

export async function upsertMany(
  entries: Array<{ module: string; entityId: number; field: string; locale: string; value: string | null }>,
  adminId: number,
) {
  const clean = entries.map((e) => {
    if (!isValidModule(e.module)) throw new AppError(400, 'INVALID_MODULE', `Module không hợp lệ: ${e.module}`);
    if (!isValidField(e.module, e.field))
      throw new AppError(400, 'INVALID_FIELD', `Field "${e.field}" không dịch được ở module "${e.module}"`);
    return {
      module: e.module,
      entity_id: e.entityId,
      field: e.field,
      locale: e.locale.toLowerCase(),
      value: e.value,
    };
  });
  return repo.upsertMany(clean, adminId);
}

/** Chuẩn hoá giá trị field gốc để hiển thị trong template (object → JSON). */
function sourceToString(val: unknown): string {
  if (val == null) return '';
  if (typeof val === 'object') return JSON.stringify(val);
  return String(val);
}

interface ExportRow {
  module: string;
  entity_id: number;
  field: string;
  locale: string;
  source_value: string;
  value: string;
}

async function buildExportRows(module: string, locale: string): Promise<ExportRow[]> {
  const meta = TRANSLATABLE_MODULES[module];
  const sources = await repo.fetchSourceRows(module);
  const existing = await repo.find(module, undefined, locale);
  const byKey = new Map<string, string>();
  for (const t of existing) byKey.set(`${t.entity_id}:${t.field}`, t.value ?? '');

  const out: ExportRow[] = [];
  for (const row of sources) {
    for (const field of meta.fields) {
      const source = sourceToString(row[field]);
      if (!source) continue; // bỏ field rỗng để template gọn
      out.push({
        module,
        entity_id: row.id,
        field,
        locale,
        source_value: source,
        value: byKey.get(`${row.id}:${field}`) ?? '',
      });
    }
  }
  return out;
}

/** Xuất file dịch. format 'json' | 'xlsx'. Nếu module rỗng → xuất tất cả module. */
export async function exportFile(
  moduleParam: string | undefined,
  locale: string,
  format: 'json' | 'xlsx',
): Promise<{ buffer: Buffer; filename: string; contentType: string }> {
  if (!locale) throw new AppError(400, 'LOCALE_REQUIRED', 'Thiếu locale');
  const modules = moduleParam
    ? [moduleParam]
    : Object.keys(TRANSLATABLE_MODULES);
  for (const m of modules) {
    if (!isValidModule(m)) throw new AppError(400, 'INVALID_MODULE', `Module không hợp lệ: ${m}`);
  }

  // Gom theo module để: JSON = 1 mảng phẳng; Excel = mỗi module 1 sheet cho gọn.
  const rowsByModule: Array<{ module: string; rows: ExportRow[] }> = [];
  for (const m of modules) rowsByModule.push({ module: m, rows: await buildExportRows(m, locale) });

  const stamp = `${moduleParam ?? 'all'}_${locale}`;
  if (format === 'json') {
    const flat = rowsByModule.flatMap((g) => g.rows);
    return {
      buffer: Buffer.from(JSON.stringify(flat, null, 2), 'utf8'),
      filename: `translations_${stamp}.json`,
      contentType: 'application/json',
    };
  }

  const wb = new ExcelJS.Workbook();
  for (const { module: m, rows } of rowsByModule) {
    if (rows.length === 0) continue; // bỏ module không có nội dung để dịch
    const ws = wb.addWorksheet(m.slice(0, 31)); // tên sheet ≤ 31 ký tự
    ws.columns = COLUMNS.map((c) => ({ header: c, key: c, width: c === 'source_value' || c === 'value' ? 40 : 16 }));
    ws.addRows(rows);
    ws.getRow(1).font = { bold: true };
  }
  // Luôn có ít nhất 1 sheet (exceljs yêu cầu) — nếu không có gì để dịch.
  if (wb.worksheets.length === 0) wb.addWorksheet('translations').columns = COLUMNS.map((c) => ({ header: c, key: c }));
  const arr = await wb.xlsx.writeBuffer();
  return {
    buffer: Buffer.from(arr),
    filename: `translations_${stamp}.xlsx`,
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
}

interface ImportResult {
  inserted: number;
  updated: number;
  errors: Array<{ row: number; message: string }>;
}

function parseJsonBuffer(buf: Buffer): Record<string, unknown>[] {
  let data: unknown;
  try {
    data = JSON.parse(buf.toString('utf8'));
  } catch {
    throw new AppError(400, 'INVALID_JSON', 'File JSON không hợp lệ');
  }
  if (!Array.isArray(data)) throw new AppError(400, 'INVALID_JSON', 'JSON phải là mảng các bản dịch');
  return data as Record<string, unknown>[];
}

async function parseXlsxBuffer(buf: Buffer): Promise<Record<string, unknown>[]> {
  const wb = new ExcelJS.Workbook();
  // exceljs typings mong đợi Buffer cụ thể — ép kiểu để tránh lệch generic Buffer của TS.
  await wb.xlsx.load(buf as unknown as Parameters<typeof wb.xlsx.load>[0]);
  if (wb.worksheets.length === 0) throw new AppError(400, 'EMPTY_FILE', 'File Excel trống');

  const out: Record<string, unknown>[] = [];
  // Đọc TẤT CẢ sheet (mỗi module 1 sheet). Sheet nào có cột `module` trong header thì
  // dùng theo dòng; nếu không có (template đơn sheet cũ) thì suy ra module từ tên sheet.
  for (const ws of wb.worksheets) {
    const header: string[] = [];
    ws.getRow(1).eachCell((cell, col) => {
      header[col] = String(cell.value ?? '').trim();
    });
    const hasModuleCol = header.includes('module');
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const obj: Record<string, unknown> = {};
      row.eachCell((cell, col) => {
        const key = header[col];
        if (key) obj[key] = cell.value;
      });
      if (!hasModuleCol && obj.module == null) obj.module = ws.name; // fallback theo tên sheet
      out.push(obj);
    });
  }
  return out;
}

/** Nhập bản dịch từ file .xlsx hoặc .json. Bỏ qua dòng lỗi và trả về danh sách lỗi. */
export async function importFile(file: Express.Multer.File, adminId: number): Promise<ImportResult> {
  const isJson = file.mimetype.includes('json') || file.originalname.toLowerCase().endsWith('.json');
  const raw = isJson ? parseJsonBuffer(file.buffer) : await parseXlsxBuffer(file.buffer);

  const errors: ImportResult['errors'] = [];
  const valid: repo.TranslationInput[] = [];

  raw.forEach((r, i) => {
    const rowNum = i + 2; // +1 header, +1 1-based
    const module = String(r.module ?? '').trim();
    const field = String(r.field ?? '').trim();
    const locale = String(r.locale ?? '').trim().toLowerCase();
    const entityId = Number(r.entity_id);
    // ExcelJS có thể trả cell.value là object với .text/.result — chuẩn hoá.
    let value = r.value;
    if (value && typeof value === 'object' && 'text' in (value as object)) {
      value = (value as { text: unknown }).text;
    }
    const valueStr = value == null ? '' : String(value);

    if (!module || !field || !locale) {
      errors.push({ row: rowNum, message: 'Thiếu module/field/locale' });
      return;
    }
    if (!Number.isInteger(entityId) || entityId <= 0) {
      errors.push({ row: rowNum, message: `entity_id không hợp lệ: ${r.entity_id}` });
      return;
    }
    if (!isValidModule(module)) {
      errors.push({ row: rowNum, message: `Module không hợp lệ: ${module}` });
      return;
    }
    if (!isValidField(module, field)) {
      errors.push({ row: rowNum, message: `Field "${field}" không dịch được ở "${module}"` });
      return;
    }
    if (valueStr === '') return; // ô trống → bỏ qua, không ghi đè

    // content_json must be valid JSON. Sanitise before storing:
    // - strip literal newlines (illegal inside JSON strings)
    // - strip spaces from JSON keys (spaced keys don't match base fields during deepMerge)
    if (field === 'content_json') {
      const cleaned = valueStr.replace(/[\r\n]+/g, ' ').replace(/  +/g, ' ');
      try {
        const parsed = JSON.parse(cleaned);
        const normalised = JSON.stringify(stripJsonKeys(parsed));
        valid.push({ module, entity_id: entityId, field, locale, value: normalised });
      } catch {
        errors.push({ row: rowNum, message: `content_json không phải JSON hợp lệ (entity ${entityId})` });
      }
      return;
    }

    valid.push({ module, entity_id: entityId, field, locale, value: valueStr });
  });

  const { inserted, updated } = await repo.upsertMany(valid, adminId);
  return { inserted, updated, errors };
}
