/**
 * HTML5 Canvas Image Optimizer
 * Resizes and compresses device photos directly down to WebP Blobs/Strings (~100-250KB)
 * to eliminate Vercel payload limits and maximize speed.
 */

export async function compressImageFileToBlob(
  file: File,
  maxWidth: number = 800,
  quality: number = 0.78
): Promise<Blob> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !file) {
      resolve(file);
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob && blob.size > 0) {
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

export async function compressImageDataUrl(
  dataUrl: string,
  maxWidth: number = 600,
  quality: number = 0.72
): Promise<string> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !dataUrl || !dataUrl.startsWith('data:image')) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      try {
        const compressedWebP = canvas.toDataURL('image/webp', quality);
        if (compressedWebP && compressedWebP.length < dataUrl.length) {
          resolve(compressedWebP);
          return;
        }
      } catch (e) {}

      try {
        const compressedJpeg = canvas.toDataURL('image/jpeg', quality);
        if (compressedJpeg && compressedJpeg.length < dataUrl.length) {
          resolve(compressedJpeg);
          return;
        }
      } catch (e) {}

      resolve(dataUrl);
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}
