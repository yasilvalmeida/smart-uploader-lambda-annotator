import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and GIF are allowed.');
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    return this.uploadService.uploadImage(file);
  }

  @Get(':id')
  async getUploadStatus(@Param('id') id: string) {
    const status = await this.uploadService.getUploadStatus(id);
    if (!status) {
      throw new NotFoundException('Upload not found');
    }
    return status;
  }

  @Get(':id/annotations')
  async getAnnotations(@Param('id') id: string) {
    const annotations = await this.uploadService.getAnnotations(id);
    if (!annotations) {
      throw new NotFoundException('Annotations not found');
    }
    return annotations;
  }
} 