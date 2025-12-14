import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNotEmpty, ValidateNested } from "class-validator";

export class SubmitLanguageDto {
  @ApiProperty({ example: 'python', description: 'Language ID' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ example: '3.10', description: 'Language version' })
  @IsString()
  @IsNotEmpty()
  version: string;
}

export class SubmitProblemDto {
  @ApiProperty({ 
    example: 'a, b = map(int, input().split())\nprint(a + b)',
    description: 'Source code to submit'
  })
  @IsString()
  @IsNotEmpty()
  source_code: string;

  @ApiProperty({ 
    example: 'cmioubiat0003ueb44panymo2',
    description: 'Problem ID to submit solution for'
  })
  @IsString()
  @IsNotEmpty()
  problemId: string;

  @ApiProperty({ type: SubmitLanguageDto })
  @ValidateNested()
  @Type(() => SubmitLanguageDto)
  language: SubmitLanguageDto;
}