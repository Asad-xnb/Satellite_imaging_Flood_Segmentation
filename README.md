# Satellite Imaging Flood Segmentation

A web application for analyzing satellite imagery to detect and quantify flood areas using HSV color space thresholding. Built with Node.js, Express, MongoDB, and EJS.

## Quick Start

```bash
npm install
npm start
# Visit http://localhost:3000
```

## Features

- 📤 **Image Upload**: Upload satellite images (JPG, PNG, TIFF)
- 🔍 **Flood Detection**: HSV color space thresholding algorithm
- 🎭 **Binary Masks**: Generate precise flood detection masks
- 📊 **Image Comparison**: Calculate flood change percentages over time
- 📈 **Statistics**: Detailed pixel counts and flood percentages
- 💾 **History**: Track all analyses with MongoDB
- 🎨 **Modern UI**: Responsive Tailwind CSS interface

## Installation

### Prerequisites
- Node.js 14+
- MongoDB (local or cloud)

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure `.env`:
   ```env
   MONGODB_URI=mongodb://localhost:27017/flood-segmentation
   PORT=3000
   NODE_ENV=development
   ```

3. Start MongoDB:
   ```bash
   mongod
   ```

4. Run the server:
   ```bash
   npm start
   ```

## How It Works

### Flood Segmentation Algorithm
The system uses HSV color space thresholding tuned for water detection:
- **Hue**: 0.063 - 0.212 (cyan-blue-green spectrum)
- **Saturation**: 0.021 - 0.408 (moderate saturation)
- **Value**: 0.623 - 1.000 (bright pixels)

### Comparison Formula
```
Flood Change % = (nnz(after) - nnz(before)) / nnz(before) × 100
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/images/upload` | Upload satellite image |
| POST | `/api/images/segment/:imageId` | Generate flood mask |
| GET | `/api/images/history` | Get segmentation history |
| POST | `/api/comparisons/compare` | Compare two segmented images |
| GET | `/api/comparisons/comparisons` | Get comparison history |

## Project Structure

```
.
├── config/              # Configuration
├── controllers/         # Business logic
├── models/             # MongoDB schemas
├── routes/             # Express routes
├── middleware/         # Custom middleware
├── utils/              # Image processing
├── views/              # EJS templates
├── public/             # Static files
├── uploads/            # Temporary storage
└── server.js           # Entry point
```

## Testing

Validate against MATLAB reference data in `archive/`:
- `archive/Image/` - Satellite images
- `archive/Mask/` - Pre-generated MATLAB masks
- `archive/Our data/` - Before/after flood samples

## License

MIT License - Copyright 2025 Hassan Altaf & Asad Zubair
