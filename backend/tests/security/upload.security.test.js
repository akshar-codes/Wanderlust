import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import request from "supertest";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

import { validateFileType } from "../../src/middlewares/upload.js";
import AppError from "../../src/utils/AppError.js";
import errorHandler from "../../src/middlewares/errorHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// We need a minimal app with multer
const app = express();

// A simple local storage multer for testing filters
// (Does not use Cloudinary)
const testStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, __dirname),
  filename: (req, file, cb) => cb(null, "test-upload-" + file.originalname)
});

import { ALLOWED_MIME_TYPES } from "../../src/config/cloudConfig.js";

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(
      new AppError(400, "Only JPG, JPEG, PNG, and WebP images are allowed", { code: "BAD_REQUEST" }),
      false,
    );
  }
  cb(null, true);
};

const avatarUpload = multer({
  storage: testStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const listingImageUpload = multer({
  storage: testStorage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
});

app.post("/upload/avatar", avatarUpload.single("image"), validateFileType, (req, res) => {
  res.status(200).json({ success: true });
});

app.post("/upload/listing", listingImageUpload.array("images", 10), validateFileType, (req, res) => {
  res.status(200).json({ success: true });
});

app.use(errorHandler);

// Helper to create fake files
const createFakeFile = (name, content) => {
  const fp = path.join(__dirname, name);
  fs.writeFileSync(fp, content);
  return fp;
};

// Valid magic bytes
const jpgMagic = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01]);
const tinyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==";
const pngMagic = Buffer.from(tinyPngBase64, "base64");
const gifMagic = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]); // GIF89a
const pdfMagic = Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2D]); // %PDF-

describe("Upload Security Tests", () => {
  let createdFiles = [];

  const getFile = (name, magic) => {
    const p = createFakeFile(name, Buffer.concat([magic, Buffer.alloc(100)]));
    createdFiles.push(p);
    return p;
  };

  afterAll(() => {
    // cleanup
    for (const file of createdFiles) {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
    // Also cleanup uploaded files by multer
    const files = fs.readdirSync(__dirname);
    for (const f of files) {
      if (f.startsWith("test-upload-")) {
        fs.unlinkSync(path.join(__dirname, f));
      }
    }
  });

  describe("MIME type filter & Extension Validation", () => {
    it("Valid JPEG passes filter", async () => {
      const p = getFile("valid.jpg", jpgMagic);
      const res = await request(app).post("/upload/avatar").attach("image", p, { contentType: "image/jpeg" });
      expect(res.statusCode).toBe(200);
    });

    it("Valid PNG passes filter", async () => {
      const p = getFile("valid.png", pngMagic);
      const res = await request(app).post("/upload/avatar").attach("image", p, { contentType: "image/png" });
      if (res.statusCode !== 200) console.log("PNG ERROR:", res.text);
      expect(res.statusCode).toBe(200);
    });

    it("image/gif rejected by filter", async () => {
      const p = getFile("bad.gif", gifMagic);
      const res = await request(app).post("/upload/avatar").attach("image", p, { contentType: "image/gif" });
      expect(res.statusCode).toBe(400);
      expect(res.text).toMatch(/Only JPG, JPEG, PNG, and WebP/i);
    });

    it("application/pdf spoofed with .jpg extension rejected by filter if user sets bad mime", async () => {
      const p = getFile("spoof.jpg", pdfMagic);
      const res = await request(app).post("/upload/avatar").attach("image", p, { contentType: "application/pdf" });
      expect(res.statusCode).toBe(400);
    });
  });

  describe("File size limits", () => {
    it("Avatar upload: file > 5 MB rejected", async () => {
      // create 6mb file
      const bigBuffer = Buffer.alloc(6 * 1024 * 1024);
      jpgMagic.copy(bigBuffer);
      const p = createFakeFile("big.jpg", bigBuffer);
      createdFiles.push(p);

      const res = await request(app).post("/upload/avatar").attach("image", p, { contentType: "image/jpeg" });
      expect(res.statusCode).toBe(400); // MulterError is mapped to 400
    });

    it("Listing upload: exactly 11 files rejected", async () => {
      const p = getFile("valid.jpg", jpgMagic);
      const req = request(app).post("/upload/listing");
      for (let i=0; i<11; i++) {
        req.attach("images", p, { contentType: "image/jpeg" });
      }
      const res = await req;
      expect(res.statusCode).toBe(400); // MulterError mapped to 400
    });
  });

  describe("Magic-byte / content spoofing (validateFileType)", () => {
    it("File with JPEG extension but PDF magic bytes (spoofed MIME) rejected", async () => {
      const p = getFile("spoofed.jpg", pdfMagic);
      const res = await request(app).post("/upload/avatar").attach("image", p, { contentType: "image/jpeg" });
      expect(res.statusCode).toBe(400);
      expect(res.text).toMatch(/Invalid file content/i);
    });

    it("File with JPEG extension but GIF magic bytes rejected", async () => {
      const p = getFile("spoofed2.jpg", gifMagic);
      const res = await request(app).post("/upload/avatar").attach("image", p, { contentType: "image/jpeg" });
      expect(res.statusCode).toBe(400);
    });

    it("Zero-byte file rejected", async () => {
      const p = createFakeFile("empty.jpg", Buffer.alloc(0));
      createdFiles.push(p);
      const res = await request(app).post("/upload/avatar").attach("image", p, { contentType: "image/jpeg" });
      expect(res.statusCode).toBe(400);
    });
  });
});
