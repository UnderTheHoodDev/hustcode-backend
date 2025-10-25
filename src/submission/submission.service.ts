import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios'
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { CreateSubmissionDto } from './dtos/create-submission.dto';
import { SubmissionResultDto } from './dtos/submission-result.dto';

@Injectable()
export class SubmissionService {
    private readonly logger = new Logger(SubmissionService.name);
    private readonly judgeServiceUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
       this.judgeServiceUrl = this.configService.get<string>(
      'JUDGE_SERVICE_URL',
      'http://localhost:4000' // Default port, thay đổi theo judge service
    );     
    }

    async runCode(dto: CreateSubmissionDto): Promise<SubmissionResultDto> {
    try {
      this.logger.log(`Submitting code for language: ${dto.language.id} ${dto.language.version}`);

      // Gọi Judge Service
      const response = await firstValueFrom(
        this.httpService.post<SubmissionResultDto>(
          `${this.judgeServiceUrl}submission`,
          dto,
          {
            headers: {
              'Content-Type': 'application/json',
            },
            timeout: 30000, // 30 seconds timeout
          }
        ).pipe(
          catchError((error: AxiosError) => {
            this.logger.error('Error calling judge service:', error.message);
            this.logger.error('Response data:', error.response?.data);
            throw error;
          })
        )
      );

      const result = response.data;
      
      this.logger.log(`Submission completed with status: ${result.status}`);
      
      return result;

    } catch (error) {
      this.logger.error(`Failed to execute code: ${error.message}`, error.stack);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): HttpException {
    // Nếu đã là HttpException thì throw luôn
    if (error instanceof HttpException) {
      return error;
    }

    // Xử lý Axios errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || 'Judge service error';

      // Map status codes từ judge service
      switch (status) {
        case 400:
          return new HttpException(
            message || 'Invalid submission data',
            HttpStatus.BAD_REQUEST
          );
        case 404:
          return new HttpException(
            'Judge service endpoint not found',
            HttpStatus.NOT_FOUND
          );
        case 500:
          return new HttpException(
            'Judge service internal error',
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        case 503:
          return new HttpException(
            'Judge service is unavailable',
            HttpStatus.SERVICE_UNAVAILABLE
          );
        default:
          return new HttpException(
            message,
            status
          );
      }
    }

    // Connection errors (judge service không chạy hoặc không kết nối được)
    if (error.code === 'ECONNREFUSED') {
      return new HttpException(
        'Cannot connect to judge service. Please make sure it is running.',
        HttpStatus.SERVICE_UNAVAILABLE
      );
    }

    // Timeout errors
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return new HttpException(
        'Request to judge service timed out',
        HttpStatus.REQUEST_TIMEOUT
      );
    }

    // Generic error
    return new HttpException(
      'Internal server error while processing submission',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
  
}
