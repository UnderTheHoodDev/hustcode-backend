import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SubmissionService } from 'src/submission/submission.service';
import { SubmitProblemDto } from './dto/submit-problem.dto';
import { SubmissionStatus } from '@prisma/client';
import { SubmissionStatus as CompilerStatus } from '../submission/enum/submission-status.enum';

@Injectable()
export class ProblemSubmissionService {
  constructor(
    private prisma: PrismaService,
    private submissionService: SubmissionService,
  ) {}

  async submitProblem(submitDto: SubmitProblemDto, userId: string) {
    // 1. Validate problem exists and get its details
    const problem = await this.prisma.problem.findUnique({
      where: { id: submitDto.problemId },
      include: {
        testcases: {
          orderBy: { createdAt: 'asc' },
        },
        problemConstrain: true,
      },
    });

    if (!problem) {
      throw new NotFoundException(
        `Problem with ID ${submitDto.problemId} not found`,
      );
    }

    if (problem.testcases.length === 0) {
      throw new BadRequestException(
        'Problem has no testcases configured',
      );
    }

    if (!problem.problemConstrain) {
      throw new BadRequestException(
        'Problem has no constraints configured',
      );
    }

    // 2. Validate language exists
    const language = await this.prisma.language.findFirst({
      where: {
        name: submitDto.language.id,
      },
    });

    console.log('Selected language:', language);

    if (!language) {
      throw new BadRequestException(
        `Language ${submitDto.language.id} not found`,
      );
    }

    // 3. Create initial submission record with PENDING status
    const submission = await this.prisma.submission.create({
      data: {
        code: submitDto.source_code,
        languageId: language.id,
        userId: userId,
        problemId: problem.id,
        status: SubmissionStatus.PENDING,
        consumedTime: null,
        consumedMemory: null,
      },
    });

    // 4. Run code against all testcases
    let finalStatus: SubmissionStatus = SubmissionStatus.ACCEPTED;
    let maxTime = 0;
    let maxMemory = 0;
    const failedTestcaseIds: string[] = [];
    const testcaseResults: any[] = [];

    console.log('DEBUG: The number of testcase is', problem.testcases.length);

    try {
      for (const testcase of problem.testcases) {
        const result = await this.submissionService.runCode({
          source_code: submitDto.source_code,
          stdin: testcase.input,
          expected_output: testcase.output,
          cpu_time_limit: problem.problemConstrain.timeLimit / 1000, // Convert ms to seconds
          cpu_extra_time: 0.5,
          memory_limit: problem.problemConstrain.memoryLimit * 1024, // Convert MB to KB
          language: {
            id: language.name.toLowerCase(),
            version: submitDto.language.version,
          }
        });

        testcaseResults.push({
          testcaseId: testcase.id,
          status: result.status,
          time: result.time,
          memory: result.memory,
          stdout: result.stdout,
          stderr: result.stderr,
        });

        // Track time and memory
        if (result.time && result.time > maxTime) {
          maxTime = result.time;
        }
        if (result.memory && result.memory > maxMemory) {
          maxMemory = result.memory;
        }

        // Determine final status based on testcase results
        if (result.status !== CompilerStatus.Accepted) {
          failedTestcaseIds.push(testcase.id);
          
          // Map compiler status to submission status
          switch (result.status) {
            case CompilerStatus.CompileError:
              finalStatus = SubmissionStatus.COMPILATION_ERROR;
              break;
            case CompilerStatus.RuntimeError:
              finalStatus = SubmissionStatus.RUNTIME_ERROR;
              break;
            case CompilerStatus.TimeLimitExceeded:
              finalStatus = SubmissionStatus.TIME_LIMIT_EXCEEDED;
              break;
            case CompilerStatus.MemoryLimitExceeded:
              finalStatus = SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
              break;
            case CompilerStatus.WrongAnswer:
              if (finalStatus === SubmissionStatus.ACCEPTED) {
                finalStatus = SubmissionStatus.WRONG_ANSWER;
              }
              break;
          }

          // Stop on first compile/runtime error
          if (
            result.status === CompilerStatus.CompileError ||
            result.status === CompilerStatus.RuntimeError
          ) {
            break;
          }
        }
      }

      

      // 5. Update submission with final results
      const updatedSubmission = await this.prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: finalStatus,
          consumedTime: Math.round(maxTime * 1000), // Convert to ms
          consumedMemory: Math.round(maxMemory / 1024), // Convert KB to MB
          failedTests: {
            connect: failedTestcaseIds.map((id) => ({ id })),
          },
        },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
          language: true,
          failedTests: {
            select: {
              id: true,
              isSample: true,
            },
          },
        },
      });

      return {
        submission: updatedSubmission,
        testcaseResults,
      };
    } catch (error) {
      // Update submission status to RUNTIME_ERROR on unexpected errors
      await this.prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: SubmissionStatus.RUNTIME_ERROR,
        },
      });

      throw error;
    }
  }

  // Get User Submissions with Pagination and Filtering
  async getUserSubmissions(userId: string, params?: {
    skip?: number;
    take?: number;
    problemId?: string;
    status?: SubmissionStatus;
  }) {
    const where: any = { userId };

    if (params?.problemId) {
      where.problemId = params.problemId;
    }

    if (params?.status) {
      where.status = params.status;
    }

    const [submissions, total] = await Promise.all([
      this.prisma.submission.findMany({
        where,
        skip: params?.skip || 0,
        take: params?.take || 20,
        orderBy: { submittedAt: 'desc' },
        include: {
          problem: {
            select: {
              id: true,
              title: true,
              difficulty: true,
            },
          },
          language: true,
        },
      }),
      this.prisma.submission.count({ where }),
    ]);

    return {
      data: submissions,
      total,
      page: Math.floor((params?.skip || 0) / (params?.take || 20)) + 1,
      pageSize: params?.take || 20,
      totalPages: Math.ceil(total / (params?.take || 20)),
    };
  }

}
