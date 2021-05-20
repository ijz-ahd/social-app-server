const { AuthenticationError } = require("apollo-server");
const jwt = require("jsonwebtoken");

module.exports = (context) => {
  const authHeader = context.req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      try {
        const user = jwt.verify(token, process.env.TOKEN_SECRET);
        return user;
      } catch (err) {
        throw new AuthenticationError("Session expired");
      }
    }
    throw new Error("Authorization token must be valid");
  }
  throw new Error("Authorization header must be provided");
};
