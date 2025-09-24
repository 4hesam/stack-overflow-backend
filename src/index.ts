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
import { graphqlHTTP } from 'express-graphql';
import { schema } from './typeDefs/schema.js';
import { root } from './resolvers/index.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(authMiddleware); // اضافه کردن userId به request در auth

// GraphQL endpoint
app.use('/graphql', graphqlHTTP((req) => ({
  schema,
  rootValue: root,
  graphiql: true,
  context: { user: (req as any).user }, // این همان userId است که از authMiddleware میاد
})));

// PORT
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
