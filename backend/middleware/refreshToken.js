import jwt from 'jsonwebtoken';

export default function createRefreshHandler(prisma) {
  return async function refreshHandler(req, res) {
    const token = req.cookies?.refreshToken || req.headers['x-refresh-token'] || req.body?.refreshToken;
    if (!token) return res.status(401).json({ message: 'No refresh token provided' });

    try {
      const stored = await prisma.refreshToken.findUnique({ where: { token } });
      if (!stored || stored.revoked) return res.status(403).json({ message: 'Invalid refresh token' });

      const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;
      const payload = jwt.verify(token, secret);

      const user = await prisma.user.findUnique({ where: { id: payload.id } });
      if (!user) return res.status(404).json({ message: 'User not found' });

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '15m' });

      // Optionally rotate refresh tokens here (not implemented)

      return res.json({ token: accessToken });
    } catch (err) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
  };
}
