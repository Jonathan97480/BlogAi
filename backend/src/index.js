dotenv.config();
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';



import postsRouter from './routes/posts.js';
import ideaRouter from './routes/idea.js';
import iaEnrichRouter from './routes/iaEnrich.js';
import iaParamsRouter from './routes/iaParams.js';
import authRouter from './routes/auth.js';
import registerAdminRouter from './routes/registerAdmin.js';
import categoriesRouter from './routes/categories.js';
import pagesRouter from './routes/pages.js';
import uploadRouter from './routes/upload.js';
import apikeyRouter from './routes/apikey.js';
import apiV1Router from './routes/apiV1.js';
import socialLinkRouter from './routes/socialLink.js';
import settingsRouter from './routes/settings.js';
import '../src/initDb.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/img', express.static('public/img'));


app.use('/api/posts', postsRouter);
app.use('/api/idea', ideaRouter);
app.use('/api/ia', iaEnrichRouter);
app.use('/api/ia', iaParamsRouter);
app.use('/api/login', authRouter);
app.use('/api/register-admin', registerAdminRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/apikey', apikeyRouter);

app.use('/api/v1', apiV1Router);
app.use('/api/social', socialLinkRouter);
app.use('/api/settings', settingsRouter);

export default app;
