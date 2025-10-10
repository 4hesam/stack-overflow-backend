// import express from 'express';
// import cors from 'cors';
// import { graphqlHTTP } from 'express-graphql';
// import { connectDB } from './config/db.js';
// import { schema } from './typeDefs/schema.js';
// import { root } from './resolvers/index.js';
// import { authMiddleware } from './middleware/auth.js';

// const app = express();
// app.use(cors());
// app.use(express.json());
// app.use(authMiddleware);

// app.use('/graphql', graphqlHTTP((req) => ({
//   schema,
//   rootValue: root,
//   graphiql: true,
//   context: { user: (req as any).user },
// })));

// connectDB();

// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
//
//
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { graphqlHTTP } from 'express-graphql';
import { schema } from './typeDefs/schema.js';
import { root } from './resolvers/index.js';
import { authMiddleware } from './middleware/auth.js';
import { users, questions } from './config/db.js';
import { verifyToken } from './utils/token.js'; // ✅ از verifyToken به جای getUserFromToken استفاده می‌کنیم

dotenv.config();

const app = express();

// 🧩 Middleware
app.use(cors());
app.use(express.json());
app.use(authMiddleware);

// ✅ REST endpoint برای گرفتن اطلاعات کاربر لاگین‌شده
app.get('/api/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No authorization header' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token provided' });

    const decoded = verifyToken(token);  // اینجا JWT بررسی می‌شود
    const userId = decoded.userId;

    const userData = users.find(u => u.id === userId);
    if (!userData) return res.status(404).json({ error: 'User not found' });

    const myQuestions = questions.filter(q => q.authorId === userId);
console.log("decoded token:", decoded);
console.log("userData found:", userData);

    return res.json({ user: userData, questions: myQuestions });
  } catch (error: any) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});


// ✅ GraphQL endpoint
app.use(
  '/graphql',
  graphqlHTTP((req) => ({
    schema,
    rootValue: root,
    graphiql: true,
    context: { user: (req as any).user },
  }))
);

// ✅ PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
