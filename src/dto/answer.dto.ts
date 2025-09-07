export class CreateAnswerDto {
  questionId!: string;
  content!: string;
}

export class VoteAnswerDto {
  answerId!: string;
  value!: number; // 1 or -1
}
