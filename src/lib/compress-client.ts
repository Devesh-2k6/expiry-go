/**
 * Fast client-side image compression using HTML5 Canvas.
 * Downsamples high-resolution smartphone camera photos (e.g. 12MB) to ~150KB in milliseconds,
 * preventing HTTP 413 (Payload Too Large) and eliminating slow upload times.
 */
export async function compressImageFile(file: File, maxWidth = 1200, quality = 0.8): Promise<File> {
  if (typeof window === "undefined" || !file || !file.type.startsWith("image/")) {
    return file;
  }

  // If already under 300KB, skip re-encoding
  if (file.size <= 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              const compressed = new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), {
                type: "image/jpeg",
              });
              resolve(compressed);
            } else {
              resolve(file);
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

