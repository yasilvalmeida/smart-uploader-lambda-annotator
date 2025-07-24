import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadModule } from './upload/upload.module';
import { ImagesModule } from './images/images.module';
import { ProcessingModule } from './processing/processing.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UploadModule,
    ImagesModule,
    ProcessingModule,
  ],
})
export class AppModule {} 