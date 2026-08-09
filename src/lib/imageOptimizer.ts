/**
 * HTML5 Canvas Image Optimizer
 * Resizes and compresses device photos down to WebP/JPEG (~20KB-40KB)
 * to ensure zero Vercel 4.5MB payload limit errors and instant multi-device sync.
 */
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
