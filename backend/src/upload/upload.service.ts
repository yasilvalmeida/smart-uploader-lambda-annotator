import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { S3Service } from '../shared/s3.service';
import { LambdaService } from '../shared/lambda.service';

export interface UploadResult {
  id: string;
  status: string;
  message: string;
  filename: string;
  originalUrl: string;
}

export interface UploadStatus {
  id: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  filename: string;
  originalUrl: string;
  processedUrl?: string;
  uploadedAt: string;
  processedAt?: string;
}

export interface Annotation {
  id: string;
  type: 'edge' | 'region' | 'point';
  coordinates: number[][];
  confidence: number;
  label?: string;
}

@Injectable()
export class UploadService {
  private uploads = new Map<string, UploadStatus>();

  constructor(
    private readonly s3Service: S3Service,
    private readonly lambdaService: LambdaService,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<UploadResult> {
    const id = uuidv4();
    const filename = `${id}-${file.originalname}`;

    // Create initial upload status
    const uploadStatus: UploadStatus = {
      id,
      status: 'uploading',
      filename: file.originalname,
      originalUrl: '',
      uploadedAt: new Date().toISOString(),
    };

    this.uploads.set(id, uploadStatus);

    try {
      // Upload to S3
      const s3Key = `uploads/${filename}`;
      const originalUrl = await this.s3Service.uploadFile(file.buffer, s3Key, file.mimetype);
      
      // Update status
      uploadStatus.originalUrl = originalUrl;
      uploadStatus.status = 'processing';
      this.uploads.set(id, uploadStatus);

      // Trigger Lambda processing
      await this.lambdaService.triggerProcessing(id, s3Key);

      return {
        id,
        status: 'success',
        message: 'Image uploaded successfully and processing started',
        filename: file.originalname,
        originalUrl,
      };
    } catch (error) {
      uploadStatus.status = 'error';
      this.uploads.set(id, uploadStatus);
      
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async getUploadStatus(id: string): Promise<UploadStatus | null> {
    return this.uploads.get(id) || null;
  }

  async getAnnotations(id: string): Promise<Annotation[]> {
    const upload = this.uploads.get(id);
    if (!upload) {
      return [];
    }

    // In a real implementation, this would fetch from a database
    // For now, return mock annotations
    return [
      {
        id: '1',
        type: 'edge',
        coordinates: [[100, 100], [200, 100], [200, 200], [100, 200]],
        confidence: 0.95,
        label: 'Edge Detection',
      },
      {
        id: '2',
        type: 'region',
        coordinates: [[150, 150], [250, 150], [250, 250], [150, 250]],
        confidence: 0.87,
        label: 'Region of Interest',
      },
    ];
  }

  async updateProcessingStatus(id: string, status: string, processedUrl?: string): Promise<void> {
    const upload = this.uploads.get(id);
    if (upload) {
      upload.status = status as any;
      if (processedUrl) {
        upload.processedUrl = processedUrl;
        upload.processedAt = new Date().toISOString();
      }
      this.uploads.set(id, upload);
    }
  }

  async getAllUploads(): Promise<UploadStatus[]> {
    return Array.from(this.uploads.values());
  }
} 