import {
  Controller,
  Get,
  Delete,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ImagesService } from './images.service';

@Controller('api/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get()
  async getAllImages() {
    return this.imagesService.getAllImages();
  }

  @Get(':id')
  async getImage(@Param('id') id: string) {
    const image = await this.imagesService.getImage(id);
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    return image;
  }

  @Delete(':id')
  async deleteImage(@Param('id') id: string) {
    const deleted = await this.imagesService.deleteImage(id);
    if (!deleted) {
      throw new NotFoundException('Image not found');
    }
    return { message: 'Image deleted successfully' };
  }
} 