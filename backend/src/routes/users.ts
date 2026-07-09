import { Router, Request, Response } from 'express';

const router = Router();

// Get current user
router.get('/me', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
        subscription: 'free',
        createdAt: new Date(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update profile
router.put('/profile', (req: Request, res: Response) => {
  try {
    const { name, bio } = req.body;

    res.json({
      success: true,
      data: {
        id: 'user-123',
        email: 'user@example.com',
        name: name || 'John Doe',
        bio: bio || '',
        subscription: 'free',
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
