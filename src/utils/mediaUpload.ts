/**
 * Client-side image compression and server file upload utilities.
 * Prevents browser freezes and localStorage QuotaExceededError crashes
 * by resizing heavy mobile/desktop photos and uploading binaries to /api/upload.
 */

export interface UploadResult {
  url: string;
  uploadedToServer: boolean;
}

const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
};

/**
 * Compresses and resizes an image file on an offscreen canvas.
 * Keeps output small (typically 30KB - 180KB) so UI never freezes.
 */
export const compressImageToBlob = async (
  file: File,
  maxDimension: number = 1280,
  squareCrop: boolean = false,
  quality: number = 0.84
): Promise<{ blob: Blob; mimeType: string; dataUrl: string }> => {
  const img = await loadImageFromFile(file);

  const srcWidth = img.naturalWidth || img.width || maxDimension;
  const srcHeight = img.naturalHeight || img.height || maxDimension;

  let targetWidth = srcWidth;
  let targetHeight = srcHeight;
  let sx = 0;
  let sy = 0;
  let sWidth = srcWidth;
  let sHeight = srcHeight;

  if (squareCrop) {
    const minSide = Math.min(srcWidth, srcHeight);
    sx = Math.floor((srcWidth - minSide) / 2);
    sy = Math.floor((srcHeight - minSide) / 2);
    sWidth = minSide;
    sHeight = minSide;
    const finalSize = Math.min(maxDimension, minSide);
    targetWidth = finalSize;
    targetHeight = finalSize;
  } else if (srcWidth > maxDimension || srcHeight > maxDimension) {
    if (srcWidth >= srcHeight) {
      targetWidth = maxDimension;
      targetHeight = Math.max(1, Math.round((srcHeight * maxDimension) / srcWidth));
    } else {
      targetHeight = maxDimension;
      targetWidth = Math.max(1, Math.round((srcWidth * maxDimension) / srcHeight));
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('No se pudo inicializar el procesador de imágenes.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);

  // Prefer WebP if supported, otherwise JPEG (or PNG if transparent)
  const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error('Error al comprimir la imagen.'));
      },
      outputMime,
      outputMime === 'image/png' ? undefined : quality
    );
  });

  // If PNG is still huge (> 450KB), re-encode as JPEG to keep it fast
  let finalBlob = blob;
  let finalMime = outputMime;
  if (finalMime === 'image/png' && finalBlob.size > 450 * 1024) {
    finalMime = 'image/jpeg';
    finalBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Error al optimizar imagen.'))),
        'image/jpeg',
        quality
      );
    });
  }

  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Error al leer imagen procesada.'));
    reader.readAsDataURL(finalBlob);
  });

  return { blob: finalBlob, mimeType: finalMime, dataUrl };
};

/**
 * Compresses an image and uploads it to the server (/api/upload).
 * Falls back to the compressed data URL if server upload fails.
 */
export const processAndUploadImage = async (
  file: File,
  options: { maxDimension?: number; squareCrop?: boolean } = {}
): Promise<UploadResult> => {
  const { maxDimension = 1280, squareCrop = false } = options;

  const { blob, mimeType, dataUrl } = await compressImageToBlob(
    file,
    maxDimension,
    squareCrop
  );

  try {
    const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
    const safeName = encodeURIComponent(
      (file.name.replace(/\.[^/.]+$/, '') || 'image').replace(/[^a-zA-Z0-9_-]/g, '_') + `.${ext}`
    );

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
        'X-File-Name': safeName,
      },
      body: blob,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        return { url: data.url, uploadedToServer: true };
      }
    }
  } catch {
    // Fallback to compressed data URL below
  }

  return { url: dataUrl, uploadedToServer: false };
};

/**
 * Uploads an audio file directly as binary to /api/upload.
 * Avoids storing huge multi-megabyte MP3 base64 strings inside database.json or localStorage.
 */
export const uploadAudioFile = async (file: File): Promise<UploadResult> => {
  const mimeType = file.type || 'audio/mpeg';
  const safeName = encodeURIComponent(file.name.replace(/[^a-zA-Z0-9._-]/g, '_'));

  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
        'X-File-Name': safeName,
      },
      body: file,
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.url) {
        return { url: data.url, uploadedToServer: true };
      }
    }
  } catch {
    // fallback if server offline
  }

  // Fallback for offline mode only (avoid crashing if too large)
  if (file.size > 4 * 1024 * 1024) {
    throw new Error('No se pudo subir el archivo de audio al servidor.');
  }

  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('No se pudo leer el archivo de audio.'));
    reader.readAsDataURL(file);
  });

  return { url: dataUrl, uploadedToServer: false };
};
