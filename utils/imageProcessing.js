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
 * Advanced water detection optimized for MUDDY/BROWNISH flood water
 * Pakistan flood water is typically brown/tan/ochre/beige colored
 * Refined algorithm with improved color discrimination
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<object>} {binaryMask, maskedImage, floodPixels, totalPixels}
 */
async function segmentFloodAdvanced(imageBuffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height, channels } = metadata;

    const pixelData = await sharp(imageBuffer)
      .raw()
      .toBuffer();

    const binaryMask = Buffer.alloc(width * height);
    const maskedImage = Buffer.alloc(pixelData.length);
    maskedImage.set(pixelData);

    let floodPixels = 0;

    // Process each pixel with refined muddy water detection
    for (let i = 0; i < pixelData.length; i += 3) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];

      const { h, s, v } = rgbToHsv(r, g, b);
      
      // Calculate additional metrics for better detection
      const rg_diff = Math.abs(r - g);  // Should be small for muddy water
      const rb_diff = r - b;  // Should be positive and moderate
      const gb_diff = g - b;  // Should be positive and moderate
      const brightness = (r + g + b) / 3;
      const chrominance = Math.sqrt(rb_diff * rb_diff + gb_diff * gb_diff);  // Color intensity

      // Refined muddy water detection:
      const isMuddyWater = 
        // Primary: Brown/tan range with low blue (most reliable)
        (h >= 0.02 && h <= 0.20 &&
         s >= 0.08 &&  // Some saturation
         v >= 0.15 && v <= 0.95 &&  // Wide brightness range
         rb_diff >= 15 &&  // Red clearly higher than blue
         gb_diff >= 10 &&  // Green higher than blue
         rg_diff <= 50 &&  // R and G relatively similar
         b <= 140 &&  // Blue component restrained
         chrominance >= 15) ||  // Enough color diversity
        
        // Secondary: Darker muddy water (sediment-heavy)
        (h >= 0.0 && h <= 0.25 &&
         v >= 0.10 && v <= 0.60 &&  // Dark to medium
         r >= 60 && g >= 50 &&  // Minimum R and G
         b <= Math.max(r, g) * 0.7 &&  // B significantly lower
         rb_diff >= 10 &&
         gb_diff >= 5 &&
         s >= 0.05) ||  // Even low saturation muddy water
        
        // Tertiary: Beige/tan water (lighter muddy)
        (h >= 0.05 && h <= 0.15 &&
         s >= 0.12 &&
         v >= 0.40 && v <= 0.90 &&
         r >= 100 && g >= 90 &&  // Decent R and G
         b <= 110 &&  // B notably lower
         rb_diff >= 20 &&
         gb_diff >= 15);

      const pixelIndex = Math.floor(i / 3);

      if (isMuddyWater) {
        binaryMask[pixelIndex] = 255;
        floodPixels++;
      } else {
        binaryMask[pixelIndex] = 0;
        maskedImage[i] = 0;
        maskedImage[i + 1] = 0;
        maskedImage[i + 2] = 0;
      }
    }

    const maskPng = await sharp(binaryMask, {
      raw: { width, height, channels: 1 }
    })
      .png()
      .toBuffer();

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
 * Segment flood regions in satellite image using HSV thresholding
 * NOW USES ADVANCED MULTI-CRITERIA DETECTION
 * @param {Buffer} imageBuffer - Image buffer
 * @param {object} options - Options
 * @returns {Promise<object>} {binaryMask, maskedImage, floodPixels, totalPixels}
 */
async function segmentFlood(imageBuffer, options = {}) {
  // Use advanced detection by default
  return segmentFloodAdvanced(imageBuffer);
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
  segmentFloodAdvanced,
  calculateFloodChange
};
