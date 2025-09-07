export class CreateQuestionDto {
  title!: string;
  content!: string;
}

export class QuestionPaginationDto {
  page!: number;
  limit!: number;
}

export class GetQuestionDto {
  id!: string;
}

export class VoteQuestionDto {
  questionId!: string;
  value!: number; // 1 or -1
}
