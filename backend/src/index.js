dotenv.config();
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';


import postsRouter from './routes/posts.js';
import authRouter from './routes/auth.js';
import registerAdminRouter from './routes/registerAdmin.js';
import categoriesRouter from './routes/categories.js';
import pagesRouter from './routes/pages.js';
import uploadRouter from './routes/upload.js';
import '../src/initDb.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/img', express.static('public/img'));


app.use('/api/posts', postsRouter);
app.use('/api/login', authRouter);
app.use('/api/register-admin', registerAdminRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/upload', uploadRouter);

export default app;
