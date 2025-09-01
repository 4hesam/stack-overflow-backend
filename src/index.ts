import express from "express";
import { ApolloServer } from "apollo-server-express";
import 'dotenv/config';
import { connectDB } from "./config/db.js";
import { typeDefs } from "./typeDefs/index.js";
import { resolvers } from "./resolvers/index.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();

// اتصال به MongoDB
await connectDB();

// ایجاد Apollo Server با context auth
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// شروع Apollo Server
await server.start();
server.applyMiddleware({ app });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}${server.graphqlPath}`);
});