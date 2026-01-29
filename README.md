# Smart Uploader + Lambda Annotator

A full-stack microservice application for intelligent image processing and annotation using AWS Lambda, React, and NestJS. Features AI-powered edge detection, grayscale conversion, and automated annotation generation with serverless scalability.

---

## 1. Project Overview

### The Problem

Image processing pipelines are complex to build and expensive to maintain. Organizations need to process uploaded images—detecting edges, identifying contours, generating annotations—but managing GPU servers and scaling infrastructure is a distraction from core business goals.

### The Solution

This system combines a modern React upload interface with serverless AWS Lambda processing. Images are uploaded through a responsive UI, stored in S3, and processed by Lambda functions running OpenCV. Results include edge-detected versions, contour analysis, and machine-generated annotations—all without managing servers.

### Why It Matters

- **Zero server management**: Lambda handles scaling automatically during peak uploads
- **Cost efficiency**: Pay only for actual processing time, not idle servers
- **Rapid deployment**: Docker containers ensure consistent Lambda execution
- **Modern experience**: Drag-and-drop interface with real-time processing status
- **Extensible pipeline**: Add new processing steps by deploying additional Lambda functions

---

## 2. Real-World Use Cases

| Industry | Application |
|----------|-------------|
| **Quality Inspection** | Detect defects in manufacturing by analyzing product images |
| **Medical Imaging** | Preprocess X-rays and scans for edge detection and contrast enhancement |
| **Document Processing** | Extract boundaries and regions from scanned documents |
| **Security Systems** | Process surveillance frames for motion and object detection |
| **E-commerce** | Generate product image variations and background removal |
| **Geospatial Analysis** | Process satellite imagery for feature extraction |

---

## 3. Core Features

| Feature | Business Value |
|---------|----------------|
| **Drag & Drop Upload** | Intuitive file upload with real-time validation and progress tracking |
| **Edge Detection** | OpenCV Canny algorithm identifies boundaries and contours |
| **Grayscale Conversion** | Preprocess images for analysis pipelines |
| **Contour Analysis** | Detect and outline shapes within images |
| **Serverless Processing** | AWS Lambda scales automatically with upload volume |
| **Interactive Dashboard** | Preview original and processed images with overlay annotations |
| **Real-time Status** | Track processing progress from upload to completion |

---

## 4. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                Smart Uploader + Lambda Annotator                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────────────────┐  │
│  │   Frontend   │    │   Backend    │    │     AWS Services      │  │
│  │   (React)    │───►│   (NestJS)   │───►│                       │  │
│  │              │    │              │    │  ┌─────────────────┐  │  │
│  │ • Dropzone   │    │ • Upload API │    │  │    AWS S3       │  │  │
│  │ • Preview    │    │ • Status API │    │  │  (Image Store)  │  │  │
│  │ • Dashboard  │    │ • Annotations│    │  └────────┬────────┘  │  │
│  └──────────────┘    └──────────────┘    │           │           │  │
│                                          │  ┌────────▼────────┐  │  │
│                                          │  │  AWS Lambda     │  │  │
│                                          │  │  (OpenCV)       │  │  │
│                                          │  │                 │  │  │
│                                          │  │ • Edge Detect   │  │  │
│                                          │  │ • Grayscale     │  │  │
│                                          │  │ • Contours      │  │  │
│                                          │  └─────────────────┘  │  │
│                                          └───────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18, TypeScript | Modern upload interface with preview |
| **UI Framework** | Material UI (MUI) | Professional component library |
| **File Handling** | React Dropzone | Drag-and-drop file uploads |
| **Backend** | NestJS, TypeScript | REST API and AWS orchestration |
| **File Upload** | Multer | Server-side file handling |
| **Image Processing** | Python 3.9, OpenCV | Computer vision algorithms |
| **Numerical Computing** | NumPy, Pillow | Image manipulation |
| **Cloud Storage** | AWS S3 | Object storage for images |
| **Serverless** | AWS Lambda | Scalable image processing |
| **Infrastructure** | Serverless Framework | Infrastructure as Code |
| **Local Testing** | LocalStack | AWS emulation for development |

---

## 6. How the System Works

### Image Upload Flow

```
Select Image → Upload to Backend → Store in S3 → Trigger Lambda
```

1. **Select**: User drags or selects image via React Dropzone
2. **Validate**: Client validates file type and size
3. **Upload**: File sent to NestJS backend via multipart form
4. **Store**: Backend uploads to S3 with unique identifier
5. **Trigger**: S3 event triggers Lambda processing function

### Lambda Processing Flow

```
Receive Event → Download Image → Process with OpenCV → Store Results
```

1. **Receive**: Lambda invoked by S3 upload event
2. **Download**: Fetch original image from S3
3. **Process**: Apply edge detection, grayscale, contour analysis
4. **Generate**: Create annotation data from detected features
5. **Store**: Upload processed images and annotations back to S3
6. **Notify**: Update processing status in backend

### Result Retrieval Flow

```
Poll Status → Fetch Annotations → Display Overlay
```

1. **Poll**: Frontend checks processing status via API
2. **Complete**: Backend returns URLs for processed images
3. **Fetch**: Load original and annotated images
4. **Overlay**: Display annotations on interactive canvas

---

## 7. Setup & Run

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker & Docker Compose
- AWS CLI configured
- Serverless Framework CLI

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/smart-uploader-lambda-annotator.git
cd smart-uploader-lambda-annotator

# Install all dependencies
npm run install:all

# Configure environment files
cp frontend/env.example frontend/.env
cp backend/env.example backend/.env
cp lambda/env.example lambda/.env

# Start with Docker Compose (recommended)
docker-compose up -d
```

### Environment Configuration

```bash
# Frontend (.env)
REACT_APP_API_URL=http://localhost:3001
REACT_APP_S3_BUCKET=your-s3-bucket
REACT_APP_AWS_REGION=us-east-1

# Backend (.env)
PORT=3001
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket
AWS_LAMBDA_FUNCTION=image-processor
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Lambda (.env)
AWS_REGION=us-east-1
S3_BUCKET=your-s3-bucket
```

### Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | Upload interface |
| **Backend API** | http://localhost:3001 | REST API |
| **API Docs** | http://localhost:3001/api | Swagger documentation |

---

## 8. API & Usage

### Upload Image

```bash
curl -X POST http://localhost:3001/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/image.jpg"
```

**Response**:
```json
{
  "id": "uuid-12345",
  "status": "processing",
  "message": "Image uploaded successfully and processing started",
  "filename": "image.jpg",
  "originalUrl": "https://bucket.s3.amazonaws.com/uploads/uuid-12345-image.jpg"
}
```

### Check Processing Status

```bash
curl http://localhost:3001/api/upload/uuid-12345
```

**Response**:
```json
{
  "id": "uuid-12345",
  "status": "completed",
  "originalUrl": "https://...",
  "processedUrl": "https://...",
  "annotationsUrl": "https://..."
}
```

### Get Annotations

```bash
curl http://localhost:3001/api/upload/uuid-12345/annotations
```

**Response**:
```json
{
  "contours": [
    {"points": [[10, 20], [30, 40], [50, 60]], "area": 1500},
    {"points": [[100, 200], [130, 240]], "area": 800}
  ],
  "edges": {
    "count": 2450,
    "density": 0.15
  }
}
```

---

## 9. Scalability & Production Readiness

### Current Architecture Strengths

| Aspect | Implementation |
|--------|----------------|
| **Serverless Scaling** | Lambda automatically scales with upload volume |
| **Cost Efficiency** | Pay only for actual processing time |
| **Decoupled Services** | S3 events trigger processing asynchronously |
| **Type Safety** | Full TypeScript implementation frontend and backend |
| **Testing** | Jest for JavaScript, Pytest for Python Lambda |

### Production Enhancements (Recommended)

| Enhancement | Purpose |
|-------------|---------|
| **CloudWatch Monitoring** | Track Lambda execution metrics and errors |
| **Dead Letter Queue** | Handle failed processing jobs for retry |
| **API Gateway** | Add rate limiting and API key authentication |
| **CloudFront CDN** | Accelerate image delivery globally |
| **Step Functions** | Orchestrate multi-step processing pipelines |
| **GPU Instances** | Use AWS Batch for complex CV operations |

### Deployment

```bash
# Deploy to AWS
npm run deploy:prod

# Deploy Lambda function only
cd lambda && serverless deploy

# Deploy to staging
npm run deploy:staging
```

---

## 10. Screenshots & Demo

### Suggested Visuals

- [ ] Drag-and-drop upload interface
- [ ] Processing progress indicator
- [ ] Original vs. edge-detected comparison
- [ ] Contour overlay visualization
- [ ] Dashboard with multiple processed images

---

## Project Structure

```
smart-uploader-lambda-annotator/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── __tests__/      # Frontend tests
│   └── package.json
├── backend/                  # NestJS API server
│   ├── src/
│   │   ├── upload/         # Upload module
│   │   ├── images/         # Images module
│   │   ├── processing/     # Processing module
│   │   └── shared/         # Shared services
│   └── package.json
├── lambda/                   # AWS Lambda function
│   ├── handler.py          # Main Lambda function
│   ├── test_handler.py     # Unit tests
│   └── requirements.txt
├── infrastructure/          # Infrastructure as Code
│   └── localstack/         # LocalStack setup
├── docker-compose.yml
├── serverless.yml
└── README.md
```

---

## Testing

```bash
# Run all tests
npm test

# Frontend tests
npm run test:frontend

# Backend tests
npm run test:backend

# Lambda tests
npm run test:lambda

# E2E tests
npm run test:e2e
```

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

*Intelligent image processing with serverless scalability.*
