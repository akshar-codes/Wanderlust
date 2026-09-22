/**
 * Rewrites a Cloudinary URL to include width/quality/format transformations.
 * Returns the original URL unchanged if it is not a Cloudinary URL or if
 * the URL already contains a transformation segment.
 *
 * @param {string|undefined} url  - Original image URL from the API
 * @param {object}           opts
 * @param {number}  [opts.width]  - Max width in pixels (e.g. 640)
 * @param {string}  [opts.quality] - Cloudinary quality param (default "auto")
 * @param {string}  [opts.format]  - Cloudinary format param (default "auto")
 * @returns {string}
 */
export function cloudinaryUrl(url, { width, quality = "auto", format = "auto" } = {}) {
  if (!url || typeof url !== "string") return url;
  if (!url.includes("res.cloudinary.com")) return url;

  // Check if it already has transformations, which often look like /upload/v... or /upload/w_...
  // A standard URL looks like: https://res.cloudinary.com/cloud_name/image/upload/v1234/folder/file.jpg
  // We want to insert transformations after /upload/
  const uploadToken = "/upload/";
  const uploadIndex = url.indexOf(uploadToken);
  
  if (uploadIndex === -1) return url;
  
  const beforeUpload = url.substring(0, uploadIndex + uploadToken.length);
  const afterUpload = url.substring(uploadIndex + uploadToken.length);
  
  // Build transformation string
  const transforms = [];
  if (width) transforms.push(`w_${width}`);
  if (quality) transforms.push(`q_${quality}`);
  if (format) transforms.push(`f_${format}`);
  
  const transformString = transforms.join(",");
  
  // Prevent double-transformations (if afterUpload already starts with a transformation like w_ or q_ or c_)
  if (afterUpload.startsWith("w_") || afterUpload.startsWith("q_") || afterUpload.startsWith("f_") || afterUpload.startsWith("c_")) {
     return url; // already transformed
  }
  
  return `${beforeUpload}${transformString}/${afterUpload}`;
}
