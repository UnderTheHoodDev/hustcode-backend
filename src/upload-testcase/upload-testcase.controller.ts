import { Controller } from '@nestjs/common';
import { UploadTestcaseService } from './upload-testcase.service';

@Controller('upload-testcase')
export class UploadTestcaseController {
  constructor(private readonly uploadTestcaseService: UploadTestcaseService) {}
}
