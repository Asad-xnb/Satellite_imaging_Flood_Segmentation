const sharp = require('sharp');

/**
 * Convert RGB color to HSV (Hue, Saturation, Value)
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {object} {h, s, v} - HSV values normalized 0-1
 */
function rgbToHsv(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const v = max;

  if (delta !== 0) {
    s = delta / max;

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  return { h, s, v };
}

/**
 * Segment flood regions in satellite image using HSV thresholding
 * Matches MATLAB segmentFlood.m thresholds
 * @param {Buffer} imageBuffer - Image buffer
 * @param {object} options - Thresholds and options
 * @returns {Promise<object>} {binaryMask, maskedImage, floodPixels, totalPixels}
 */
async function segmentFlood(imageBuffer, options = {}) {
  // MATLAB thresholds from segmentFlood.m
  const thresholds = {
    hMin: 0.063,
    hMax: 0.212,
    sMin: 0.021,
    sMax: 0.408,
    vMin: 0.623,
    vMax: 1.0,
    ...options.thresholds
  };

  try {
    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height, channels } = metadata;

    // Convert to raw pixel data (RGB)
    const pixelData = await sharp(imageBuffer)
      .raw()
      .toBuffer();

    // Create binary mask and masked image
    const binaryMask = Buffer.alloc(width * height);
    const maskedImage = Buffer.alloc(pixelData.length);
    maskedImage.set(pixelData);

    let floodPixels = 0;

    // Process each pixel
    for (let i = 0; i < pixelData.length; i += 3) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];

      // Convert RGB to HSV
      const { h, s, v } = rgbToHsv(r, g, b);

      // Apply thresholds (all conditions must be met)
      const isFlood =
        h >= thresholds.hMin &&
        h <= thresholds.hMax &&
        s >= thresholds.sMin &&
        s <= thresholds.sMax &&
        v >= thresholds.vMin &&
        v <= thresholds.vMax;

      const pixelIndex = Math.floor(i / 3);

      if (isFlood) {
        binaryMask[pixelIndex] = 255; // White for flood
        floodPixels++;
      } else {
        binaryMask[pixelIndex] = 0; // Black for non-flood
        // Zero out non-flood pixels in masked image
        maskedImage[i] = 0;
        maskedImage[i + 1] = 0;
        maskedImage[i + 2] = 0;
      }
    }

    // Convert binary mask to PNG
    const maskPng = await sharp(binaryMask, {
      raw: { width, height, channels: 1 }
    })
      .png()
      .toBuffer();

    // Convert masked image back to PNG
    const maskedPng = await sharp(maskedImage, {
      raw: { width, height, channels: 3 }
    })
      .png()
      .toBuffer();

    return {
      success: true,
      binaryMask: maskPng,
      maskedImage: maskedPng,
      floodPixels,
      totalPixels: width * height,
      floodPercentage: (floodPixels / (width * height)) * 100,
      dimensions: { width, height }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate flood increase percentage between two segmentations
 * Formula: (nnz(BWpost) - nnz(BWpre)) / nnz(BWpre) * 100
 * @param {number} preFloodPixels - Flood pixel count before
 * @param {number} postFloodPixels - Flood pixel count after
 * @returns {number} Percentage change
 */
function calculateFloodChange(preFloodPixels, postFloodPixels) {
  if (preFloodPixels === 0) {
    return postFloodPixels > 0 ? 100 : 0;
  }
  return ((postFloodPixels - preFloodPixels) / preFloodPixels) * 100;
}

module.exports = {
  rgbToHsv,
  segmentFlood,
  calculateFloodChange
};
