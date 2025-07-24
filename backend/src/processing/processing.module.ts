import { Module } from '@nestjs/common';
import { ProcessingController } from './processing.controller';
import { ProcessingService } from './processing.service';
import { LambdaService } from '../shared/lambda.service';

@Module({
  controllers: [ProcessingController],
  providers: [ProcessingService, LambdaService],
})
export class ProcessingModule {} 