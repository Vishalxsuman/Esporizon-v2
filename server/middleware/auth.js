export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization']
        const token = authHeader && authHeader.split(' ')[1]

        if (!token) {
            return res.status(401).json({ error: 'No token provided' })
        }

        const { default: admin } = await import('firebase-admin')
        const decodedToken = await admin.auth().verifyIdToken(token)
        req.user = decodedToken
        next()
    } catch (error) {
        console.error('Authentication error:', error)
        return res.status(403).json({ error: 'Invalid or expired token' })
    }
}
