import fs from 'fs';
import path from 'path';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import { query } from '../../config/db';
import { AppError } from '../../middleware/errorHandler';

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
];
const MAX_SIZE = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    const now = new Date();
    const dir = path.join('uploads', String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, '0'));
    // multer does not create the destination directory — ensure it exists.
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIMES.includes(file.mimetype)) {
      cb(new AppError(400, 'INVALID_FILE_TYPE', `Loại file không được hỗ trợ: ${file.mimetype}`));
      return;
    }
    cb(null, true);
  },
});

export async function saveRecord(file: Express.Multer.File, uploadedBy: number) {
  const filePath = file.path.replace(/\\/g, '/');
  const { rows } = await query(
    `INSERT INTO uploads (original_name, file_name, mime_type, size_bytes, path, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [file.originalname, file.filename, file.mimetype, file.size, filePath, uploadedBy],
  );
  return rows[0];
}

export async function findAll() {
  const { rows } = await query(
    `SELECT * FROM uploads WHERE is_deleted = false ORDER BY created_at DESC`,
  );
  return rows;
}

export async function softDelete(id: number) {
  const { rows } = await query(
    `UPDATE uploads SET is_deleted = true WHERE id = $1 RETURNING *`,
    [id],
  );
  if (!rows.length) throw new AppError(404, 'NOT_FOUND', 'File không tồn tại');
  return rows[0];
}
