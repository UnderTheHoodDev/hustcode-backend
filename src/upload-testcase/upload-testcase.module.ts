import { Module } from '@nestjs/common';
import { UploadTestcaseService } from './upload-testcase.service';
import { UploadTestcaseController } from './upload-testcase.controller';

@Module({
  controllers: [UploadTestcaseController],
  providers: [UploadTestcaseService],
})
export class UploadTestcaseModule {}
