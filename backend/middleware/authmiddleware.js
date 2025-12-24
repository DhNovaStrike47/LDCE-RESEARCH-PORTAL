const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    try {
        // 1. Get the token from the header
        let token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: "No token, authorization denied" });
        }

        // 2. Clean the token (Remove "Bearer " string)
        if (token.includes("Bearer ")) {
            token = token.split(" ")[1];
        }

        // 3. Decode the token to find the User ID
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. Attach user info to the request object
        req.user = decoded;

        console.log("✅ User ID Decoded:", req.user.id); // Check your terminal for this!

        next();
    } catch (err) {
        console.error("❌ Token Error:", err.message);
        res.status(401).json({ message: "Token is not valid" });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };