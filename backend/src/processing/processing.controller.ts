import {
  Controller,
  Post,
  Get,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ProcessingService } from './processing.service';

@Controller('api/process')
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  @Post(':id')
  async triggerProcessing(@Param('id') id: string) {
    const result = await this.processingService.triggerProcessing(id);
    if (!result) {
      throw new NotFoundException('Image not found');
    }
    return { message: 'Processing triggered successfully' };
  }

  @Get(':id/status')
  async getProcessingStatus(@Param('id') id: string) {
    const status = await this.processingService.getProcessingStatus(id);
    if (!status) {
      throw new NotFoundException('Image not found');
    }
    return { status: status.status };
  }
} 