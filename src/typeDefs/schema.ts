import { buildSchema } from "graphql";

export const schema = buildSchema(`
  type User {
    id: ID!
    username: String!
    email: String!
  }

  type Question {
    id: ID!
    title: String!
    content: String!
    author: User!
    createdAt: String!
    voteCount: Int!
  }

  type Answer {
    id: ID!
    content: String!
    question: Question!
    author: User!
    createdAt: String!
    voteCount: Int!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  # ------------------------
  # INPUT TYPES
  # ------------------------
  input RegisterInput {
    username: String!
    email: String!
    password: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateQuestionInput {
    title: String!
    content: String!
  }

  input CreateAnswerInput {
    questionId: ID!
    content: String!
  }

  input QuestionPaginationInput {
    page: Int!
    limit: Int!
  }

  input VoteQuestionInput {
    questionId: ID!
    value: Int!
  }

  input VoteAnswerInput {
    answerId: ID!
    value: Int!
  }

  # ------------------------
  # QUERIES & MUTATIONS
  # ------------------------
  type Query {
    me: User
    questions(input: QuestionPaginationInput!): [Question!]!
    question(input: GetQuestionInput!): Question
  }

  input GetQuestionInput {
    id: ID!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createQuestion(input: CreateQuestionInput!): Question!
    createAnswer(input: CreateAnswerInput!): Answer!
    voteQuestion(input: VoteQuestionInput!): Question!
    voteAnswer(input: VoteAnswerInput!): Answer!
  }
`);
