import admin from 'firebase-admin';

const authMiddleware = async (req, res, next) => {

  console.log('Auth Middleware: Checking Authorization header...');
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('Auth Middleware: No Bearer token found in Authorization header.');
    return res.status(403).json({ message: 'Unauthorized: No token provided.' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    // Verify the ID token using the Firebase Admin SDK.
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    console.log(`Auth Middleware: Token verified for UID: ${decodedToken.uid}`);
    next();
  } catch (error) {
    console.error('Auth Middleware: Error verifying Firebase ID token:', error.message, error.code);
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ message: 'Unauthorized: Token expired.' });
    }
    return res.status(403).json({ message: 'Unauthorized: Invalid token.' });
  }
};

export default authMiddleware;
