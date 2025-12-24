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

module.exports = protect;