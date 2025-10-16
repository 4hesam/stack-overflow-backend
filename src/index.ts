
// import express from 'express';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import { graphqlHTTP } from 'express-graphql';
// import { schema } from './typeDefs/schema.js';
// import { root } from './resolvers/index.js';
// import { authMiddleware } from './middleware/auth.js';
// import { User } from './models/User.js';
// import { Question } from './models/Question.js';
// import { verifyToken } from './utils/token.js';

// dotenv.config();

// const app = express();

// // 🧩 Middleware
// app.use(cors());
// app.use(express.json());
// app.use(authMiddleware);

// // ✅ REST endpoint برای گرفتن اطلاعات کاربر لاگین‌شده
// app.get('/api/me', async (req, res) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

//     const token = authHeader.split(' ')[1];
//     if (!token) return res.status(401).json({ error: 'No token provided' });

//     const decoded = verifyToken(token);  // JWT بررسی می‌شود
//     const userId = decoded.userId;

//     // 🔹 استفاده از Mongoose به جای آرایه JSON
//     const userData = await User.findById(userId).lean();
//     if (!userData) return res.status(404).json({ error: 'User not found' });

//     const myQuestions = await Question.find({ author: userId }).lean();

//     console.log("decoded token:", decoded);
//     console.log("userData found:", userData);

//     return res.json({ user: userData, questions: myQuestions });
//   } catch (error: any) {
//     console.error('Error verifying token:', error);
//     return res.status(401).json({ error: 'Invalid or expired token' });
//   }
// });

// // ✅ GraphQL endpoint
// app.use(
//   '/graphql',
//   graphqlHTTP((req) => ({
//     schema,
//     rootValue: root,
//     graphiql: true,
//     context: { user: (req as any).user },
//   }))
// );

// // ✅ PORT
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

//// src/index.ts
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { authMiddleware } from './middleware/auth.js';
import { schema } from './typeDefs/schema.js';
import { root } from './resolvers/index.js';

dotenv.config();
await connectDB();

const app = express();
const PORT = process.env.PORT || 4000;
import cors from 'cors';

app.use(cors({
  origin: 'http://localhost:9000', // اجازه به فرانت‌اند شما
  credentials: true,               // اگر از کوکی یا Authorization استفاده می‌کنید
}));

// JWT Middleware قبل از graphqlHTTP اجرا شود
app.use(authMiddleware);

// مسیر GraphQL با context
app.use(
  '/graphql',
  graphqlHTTP((req) => ({
    schema,
    rootValue: root,
    context: { user: (req as any).user },
    graphiql: true,
  }))
);


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}/graphql`);
});
