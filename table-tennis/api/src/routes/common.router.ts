import { Request, Response, Router } from "express";

export const router = Router({
  strict: true,
});

// Mismatch URL
router.use((req: Request, res: Response) => {
    res.status(404).send({ error: true, message: 'Check your URL please' });
});

// error handler middleware
router.use((error, req, res, next) => {
    res.status(error.status || 500).send({
        error: {
        status: error.status || 500,
        message: error.message || 'Internal Server Error',
        },
    });
})

