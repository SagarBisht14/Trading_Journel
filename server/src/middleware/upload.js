import fs from 'fs/promises';
import path from 'path';
import multer from 'multer';
import sharp from 'sharp';
import { ApiError } from '../utils/apiError.js';

const uploadRoot = process.env.UPLOAD_ROOT || 'uploads';
const storage = multer.memoryStorage();

const imageFilter = (_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new ApiError(400, 'Only image uploads are allowed'));
    return;
  }
  cb(null, true);
};

export const uploadTradeImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 7 * 1024 * 1024, files: 10 }
}).array('images', 10);

export const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 4 * 1024 * 1024, files: 1 }
}).single('avatar');

export const uploadDataFile = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 1 }
}).single('file');

export function runMulter(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        next(new ApiError(400, err.message));
        return;
      }
      if (err) {
        next(err);
        return;
      }
      next();
    });
  };
}

export async function saveImageFiles({ files = [], userId, folder = 'trades', types = [] }) {
  if (!files.length) return [];

  const absoluteDir = path.join(process.cwd(), uploadRoot, folder, String(userId));
  await fs.mkdir(absoluteDir, { recursive: true });

  const saved = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const filename = `${Date.now()}-${index}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(absoluteDir, filename);

    const buffer = await sharp(file.buffer)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();

    await fs.writeFile(outputPath, buffer);

    saved.push({
      type: types[index] || 'Other',
      url: `/${uploadRoot}/${folder}/${userId}/${filename}`,
      filename,
      originalName: file.originalname,
      mimeType: 'image/webp',
      size: buffer.length
    });
  }

  return saved;
}
