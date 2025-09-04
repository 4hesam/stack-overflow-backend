import { buildSchema } from 'graphql';

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

  type Query {
    me: User
    questions(page: Int!, limit: Int!): [Question!]!
    question(id: ID!): Question
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createQuestion(title: String!, content: String!): Question!
    createAnswer(questionId: ID!, content: String!): Answer!
    voteQuestion(questionId: ID!, value: Int!): Question!
    voteAnswer(answerId: ID!, value: Int!): Answer!
  }
`);
