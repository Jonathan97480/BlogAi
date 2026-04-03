import postsRouter from './src/routes/posts.js';
const layers = postsRouter.stack || [];
layers.forEach((l, i) => {
    if (l.route) {
        const methods = Object.keys(l.route.methods).join(',').toUpperCase();
        console.log(i, methods, l.route.path);
    }
});
process.exit(0);
