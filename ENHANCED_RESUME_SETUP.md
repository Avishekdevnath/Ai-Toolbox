# Enhanced Resume Processing Setup

This guide explains how to set up the enhanced resume processing system with OCR capabilities and online storage.

## Features Added

1. **OCR Processing**: Uses Tesseract.js for optical character recognition
2. **Google Drive Integration**: Stores files in Google Drive for backup
3. **MongoDB Storage**: Stores analysis results and file metadata
4. **Multiple File Format Support**: PDF, DOCX, TXT, and image files (JPEG, PNG, GIF, BMP, TIFF)
5. **Enhanced Error Handling**: Multiple fallback methods for text extraction

## Environment Variables Required

Create or update your `.env.local` file with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ai-toolbox
# or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ai-toolbox

# Google Drive API (Optional - for cloud storage)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
GOOGLE_DRIVE_FOLDER_ID=your-google-drive-folder-id

# Existing Gemini API Key
GOOGLE_AI_API_KEY=your-gemini-api-key
```

## Setup Instructions

### 1. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community
# Linux: sudo apt-get install mongodb

# Start MongoDB service
# Windows: Start MongoDB service from Services
# macOS/Linux: sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/atlas
2. Create a free cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env.local`

### 2. Google Drive Setup (Optional)

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create service account credentials
5. Download the JSON credentials file
6. Update `GOOGLE_APPLICATION_CREDENTIALS` path in `.env.local`
7. Create a folder in Google Drive and get its ID
8. Update `GOOGLE_DRIVE_FOLDER_ID` in `.env.local`

### 3. Install Dependencies

The required packages have been installed:
- `tesseract.js` - OCR processing
- `googleapis` - Google Drive integration
- `mongodb` - Database operations
- `multer` - File upload handling

## How It Works

### File Processing Flow

1. **File Upload**: User uploads a resume file
2. **Text Extraction**: 
   - First tries standard extraction (PDF.js, mammoth)
   - If that fails or returns minimal text, uses OCR
3. **Storage**: 
   - Stores file metadata and text in MongoDB
   - Optionally uploads file to Google Drive
4. **Analysis**: 
   - Sends text to Gemini AI for analysis
   - Stores analysis results in MongoDB
5. **Response**: Returns analysis with storage IDs for future retrieval

### Supported File Types

- **PDF**: Uses PDF.js with OCR fallback
- **DOCX**: Uses mammoth with OCR fallback
- **TXT**: Direct text extraction
- **Images**: JPEG, PNG, GIF, BMP, TIFF (OCR only)

### Error Handling

- Multiple fallback methods for text extraction
- Graceful degradation if Google Drive is not configured
- Detailed error messages for troubleshooting
- File size and type validation

## API Endpoints

### Enhanced Resume Analysis
- **POST** `/api/resume/enhanced` - Process file with OCR and storage
- **GET** `/api/resume/enhanced?analysisId=<id>` - Retrieve stored analysis

### Original Resume Analysis (Still Available)
- **POST** `/api/resume` - Text-only analysis

## Usage

1. Navigate to `/tools/resume-reviewer`
2. Upload a resume file (PDF, DOCX, TXT, or image)
3. Fill in industry, job title, and experience level
4. Click "Analyze Resume"
5. View results with enhanced processing

## Troubleshooting

### OCR Issues
- Ensure images are clear and high resolution
- Try converting PDFs to images if text extraction fails
- Check browser console for OCR errors

### MongoDB Issues
- Verify MongoDB is running
- Check connection string in `.env.local`
- Ensure network access for cloud MongoDB

### Google Drive Issues
- Verify credentials file path
- Check folder ID is correct
- Ensure Google Drive API is enabled

### File Upload Issues
- Check file size (10MB limit)
- Verify file type is supported
- Check browser console for errors

## Performance Notes

- OCR processing can take 10-30 seconds for complex documents
- Large files may take longer to process
- Results are cached in MongoDB for faster retrieval
- Google Drive upload is optional and doesn't block analysis

## Security Considerations

- Files are processed server-side
- Google Drive credentials should be kept secure
- MongoDB connection should use authentication
- File uploads are validated for type and size 