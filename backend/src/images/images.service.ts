import { Injectable } from '@nestjs/common';
import { S3Service } from '../shared/s3.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ImagesService {
  constructor(
    private readonly s3Service: S3Service,
    private readonly uploadService: UploadService,
  ) {}

  async getAllImages() {
    return this.uploadService.getAllUploads();
  }

  async getImage(id: string) {
    return this.uploadService.getUploadStatus(id);
  }

  async deleteImage(id: string): Promise<boolean> {
    const upload = await this.uploadService.getUploadStatus(id);
    if (!upload) {
      return false;
    }

    try {
      // Extract S3 key from URL
      const urlParts = upload.originalUrl.split('/');
      const s3Key = urlParts.slice(-2).join('/'); // uploads/filename

      // Delete from S3
      await this.s3Service.deleteFile(s3Key);

      // Delete processed image if exists
      if (upload.processedUrl) {
        const processedUrlParts = upload.processedUrl.split('/');
        const processedS3Key = processedUrlParts.slice(-2).join('/');
        await this.s3Service.deleteFile(processedS3Key);
      }

      // Remove from memory (in real app, this would be a database operation)
      // For now, we'll just return true since we can't easily remove from the Map
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }
} 