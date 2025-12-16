# Quick Start Guide

## ✅ Project Scaffolding Complete!

Your Node.js Flood Segmentation project is now fully set up. Here's what has been created:

## 📂 Directory Structure

```
project-root/
├── config/              ← Configuration files
├── controllers/         ← Business logic
├── middleware/          ← File upload & error handling
├── models/             ← MongoDB schemas
├── routes/             ← Express routes (API + pages)
├── utils/              ← Image processing algorithm
├── views/              ← EJS templates (Tailwind CSS)
├── public/             ← Static files
├── uploads/            ← Temporary file storage
├── server.js           ← Main entry point
├── package.json        ← Dependencies
└── .env                ← Environment variables
```

## 🚀 Getting Started

### 1. Start MongoDB
```bash
mongod
```

### 2. Run the server
```bash
npm start
```
Or for development with auto-reload:
```bash
npm run dev
```

### 3. Open in browser
```
http://localhost:3000
```

## 📡 Key Endpoints

### Web Pages
- `GET /` - Home page
- `GET /upload` - Upload images
- `GET /results` - View results
- `GET /compare` - Compare images
- `GET /history` - View analysis history

### API Endpoints
```
POST   /api/images/upload              # Upload image
POST   /api/images/segment/:imageId    # Segment image
GET    /api/images/segmentation/:id    # Get results
GET    /api/images/history             # Get history

POST   /api/comparisons/compare        # Compare two images
GET    /api/comparisons/comparisons    # Get comparisons
GET    /api/comparisons/comparison/:id # Get specific comparison
```

## 🧮 Algorithm

The segmentation uses **HSV color space thresholding**:

```javascript
// RGB → HSV conversion
const { h, s, v } = rgbToHsv(r, g, b);

// Apply thresholds (water detection)
const isFlood = 
  h >= 0.063 && h <= 0.212 &&      // Hue (cyan-blue-green)
  s >= 0.021 && s <= 0.408 &&      // Saturation
  v >= 0.623 && v <= 1.000;        // Value (brightness)

// Calculate flood percentage
const floodPercentage = (floodPixels / totalPixels) * 100;

// Compare two images
const changePercentage = 
  (postFloodPixels - preFloodPixels) / preFloodPixels * 100;
```

## 💾 Database Schemas

### Image
```javascript
{
  filename: String,
  originalName: String,
  mimeType: String,
  size: Number,
  metadata: { width, height },
  uploadedAt: Date
}
```

### SegmentationResult
```javascript
{
  imageId: ObjectId,
  floodPixels: Number,
  totalPixels: Number,
  floodPercentage: Number,
  processingTime: Number,
  processedAt: Date
}
```

### Comparison
```javascript
{
  preImageId: ObjectId,
  postImageId: ObjectId,
  preFloodPixels: Number,
  postFloodPixels: Number,
  floodChangePercentage: Number,
  dateRange: { start, end }
}
```

## 📝 Usage Examples

### Upload & Segment Image (cURL)
```bash
# Upload
curl -X POST http://localhost:3000/api/images/upload \
  -F "image=@satellite.jpg"

# Segment
curl -X POST http://localhost:3000/api/images/segment/507f1f77bcf86cd799439011
```

### Compare Two Images
```bash
curl -X POST http://localhost:3000/api/comparisons/compare \
  -H "Content-Type: application/json" \
  -d '{
    "preSegmentationId": "507f1f77bcf86cd799439011",
    "postSegmentationId": "507f1f77bcf86cd799439012"
  }'
```

## 🔧 Configuration

Edit `.env` to customize:
```env
MONGODB_URI=mongodb://localhost:27017/flood-segmentation
PORT=3000
NODE_ENV=development
MAX_FILE_SIZE=10485760          # 10MB default
UPLOAD_DIR=./uploads
```

## 🧪 Testing

Validate against MATLAB masks:
1. Upload images from `archive/Image/`
2. Compare generated masks with `archive/Mask/`
3. Test before/after with `archive/Our data/`

## 📊 Important Files

| File | Purpose |
|------|---------|
| [utils/imageProcessing.js](utils/imageProcessing.js) | Core segmentation algorithm |
| [controllers/imageController.js](controllers/imageController.js) | Image upload/processing |
| [controllers/comparisonController.js](controllers/comparisonController.js) | Image comparison |
| [models/Image.js](models/Image.js) | Image schema |
| [models/SegmentationResult.js](models/SegmentationResult.js) | Results schema |
| [models/Comparison.js](models/Comparison.js) | Comparison schema |
| [routes/imageRoutes.js](routes/imageRoutes.js) | Image API routes |
| [routes/comparisonRoutes.js](routes/comparisonRoutes.js) | Comparison API routes |

## 🎨 Frontend

All UI templates use **Tailwind CSS** for responsive design:
- [views/index.ejs](views/index.ejs) - Home page
- [views/upload.ejs](views/upload.ejs) - Upload page
- [views/results.ejs](views/results.ejs) - Results display
- [views/compare.ejs](views/compare.ejs) - Comparison view
- [views/history.ejs](views/history.ejs) - History dashboard

## ⚙️ Next Steps

1. **Start the server**: `npm start`
2. **Open http://localhost:3000**
3. **Upload test image** from `archive/Image/`
4. **View segmentation results**
5. **Compare before/after images**
6. **Check MongoDB** for stored results

## 🐛 Troubleshooting

**MongoDB connection error?**
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`

**Image processing fails?**
- Verify image format (JPG, PNG, TIFF)
- Check file size (max 10MB default)
- Ensure Sharp is installed: `npm install sharp`

**Port already in use?**
- Change PORT in `.env`
- Or kill process: `lsof -ti:3000 | xargs kill -9`

## 📚 Documentation

For detailed API documentation, see [README.md](README.md)

## 🎯 Project Complete!

✅ Node.js + Express server configured
✅ MongoDB models created
✅ Flood segmentation algorithm implemented
✅ Image upload routes working
✅ Comparison functionality ready
✅ EJS templates built
✅ Tailwind CSS styling applied

Happy coding! 🚀
