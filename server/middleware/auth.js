import { jwtVerify, createRemoteJWKSet } from "jose";

const CLERK_JWKS = createRemoteJWKSet(
    new URL("https://funky-asp-9.clerk.accounts.dev/.well-known/jwks.json")
);

export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Missing token" });
        }

        const token = authHeader.split(" ")[1];

        const { payload } = await jwtVerify(token, CLERK_JWKS, {
            issuer: "https://funky-asp-9.clerk.accounts.dev",
        });

        req.user = {
            id: payload.sub,
            email: payload.email,
            // Helper for prediction engine compatibility
            user_id: payload.sub,
            uid: payload.sub
        };

        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err.message);
        return res.status(401).json({
            error: "Invalid or expired token",
            details: err.message,
        });
    }
};
