import { Injectable } from '@nestjs/common';
import { LambdaService } from '../shared/lambda.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProcessingService {
  constructor(
    private readonly lambdaService: LambdaService,
    private readonly uploadService: UploadService,
  ) {}

  async triggerProcessing(id: string): Promise<boolean> {
    const upload = await this.uploadService.getUploadStatus(id);
    if (!upload) {
      return false;
    }

    try {
      // Extract S3 key from URL
      const urlParts = upload.originalUrl.split('/');
      const s3Key = urlParts.slice(-2).join('/'); // uploads/filename

      // Trigger Lambda processing
      await this.lambdaService.triggerProcessing(id, s3Key);

      // Update status to processing
      await this.uploadService.updateProcessingStatus(id, 'processing');

      return true;
    } catch (error) {
      console.error('Error triggering processing:', error);
      await this.uploadService.updateProcessingStatus(id, 'error');
      return false;
    }
  }

  async getProcessingStatus(id: string) {
    return this.uploadService.getUploadStatus(id);
  }
} 