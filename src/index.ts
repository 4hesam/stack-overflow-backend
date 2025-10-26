import express, { Application } from "express";
import { ApolloServer } from "apollo-server-express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import { typeDefs } from "./typeDefs/schema.js";
import resolvers from "./resolvers/index.js";
import { authMiddleware } from "./middleware/auth.js";


// Load environment variables from .env file
dotenv.config();

const startServer = async () => {
  // Initialize Express app
  const app: any = express();

  // Connect to MongoDB
  await connectDB();

  // Initialize Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  // Start Apollo Server
  await server.start();
//authMiddleware
app.use(authMiddleware);

  // Apply Apollo middleware to Express
  server.applyMiddleware({ app, path: "/graphql" });

  // Start Express server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log("✅ MongoDB connected successfully!");
    console.log(
      `🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`
    );
  });
};

// Start everything
startServer().catch((err) => {
  console.error("❌ Server startup failed:", err);
});
