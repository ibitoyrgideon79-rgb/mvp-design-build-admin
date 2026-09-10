// Resizes/compresses an image File to a small square JPEG data URL before it
// goes to the API - there's no object storage set up (S3, Cloudinary, etc.),
// so photos are stored directly in Postgres as a data URL. Keeping them
// small (300x300, JPEG q=0.8) keeps that from bloating the table or slowing
// down the staff list/card views.
export function resizeImageToDataUrl(file, maxSize = 300, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
