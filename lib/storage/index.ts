import fs from "fs";
import path from "path";

export interface UploadResult {
  fileName: string;
  fileUrl: string;
  fileType: "image" | "video" | "document";
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  provider: "local" | "cloudinary" | "s3";
}

const ALLOWED_MIME_TYPES: Record<string, "image" | "video" | "document"> = {
  "image/jpeg": "image",
  "image/png": "image",
  "image/webp": "image",
  "image/gif": "image",
  "image/svg+xml": "image",
  "video/mp4": "video",
  "video/webm": "video",
  "application/pdf": "document",
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export async function uploadFile(
  file: File | { name: string; type: string; size: number; buffer: Buffer }
): Promise<UploadResult> {
  const mimeType = file.type;
  const fileType = ALLOWED_MIME_TYPES[mimeType];

  if (!fileType) {
    throw new Error(`Unsupported file type: ${mimeType}. Allowed: JPEG, PNG, WebP, GIF, SVG, MP4, WebM, PDF`);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File exceeds maximum size of 10MB (file is ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
  }

  const extension = path.extname(file.name) || `.${mimeType.split("/")[1]}`;
  const uniqueName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${extension}`;
  const provider = (process.env.STORAGE_PROVIDER as "local" | "cloudinary" | "s3") || "local";

  if (provider === "local") {
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    let buffer: Buffer;

    if ("buffer" in file) {
      buffer = file.buffer;
    } else {
      const bytes = await (file as File).arrayBuffer();
      buffer = Buffer.from(bytes);
    }

    await fs.promises.writeFile(filePath, buffer);

    return {
      fileName: file.name,
      fileUrl: `/uploads/${uniqueName}`,
      fileType,
      mimeType,
      fileSize: file.size,
      provider: "local",
    };
  }

  // Cloudinary / S3 placeholder fallback
  return {
    fileName: file.name,
    fileUrl: `/uploads/${uniqueName}`,
    fileType,
    mimeType,
    fileSize: file.size,
    provider: "local",
  };
}

export async function deleteFile(fileUrl: string): Promise<boolean> {
  try {
    if (fileUrl.startsWith("/uploads/")) {
      const localPath = path.join(process.cwd(), "public", fileUrl);
      if (fs.existsSync(localPath)) {
        await fs.promises.unlink(localPath);
        return true;
      }
    }
    return true;
  } catch (err) {
    console.error("Failed to delete file:", err);
    return false;
  }
}
