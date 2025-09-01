import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type User { id: ID!, username: String!, email: String!, reputation: Int! }
  type Question { id: ID!, title: String!, content: String!, author: User!, votes: Int!, answers: [Answer!] }
  type Answer { id: ID!, content: String!, author: User!, votes: Int!, isAccepted: Boolean! }

  type AuthPayload { token: String!, user: User! }

  type Query {
    me: User
    questions(page: Int, limit: Int): [Question!]!
    question(id: ID!): Question
  }

  type Mutation {
    register(username: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    createQuestion(title: String!, content: String!): Question!
    createAnswer(questionId: ID!, content: String!): Answer!
    voteAnswer(answerId: ID!, type: String!): Answer!
  }
`;