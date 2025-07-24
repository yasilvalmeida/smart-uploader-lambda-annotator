import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { S3Service } from '../shared/s3.service';
import { LambdaService } from '../shared/lambda.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, S3Service, LambdaService],
  exports: [UploadService],
})
export class UploadModule {} 