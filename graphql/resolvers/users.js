const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { UserInputError } = require("apollo-server");

const { validateRegister, validateLogin } = require("../../utils/validator");
const User = require("../../models/User");
require("dotenv").config();

// token generator function
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
    },
    process.env.TOKEN_SECRET,
    { expiresIn: `1h` }
  );
};

module.exports = {
  Mutation: {
    // login functionality
    async login(_, { username, password }) {
      const { errors, valid } = validateLogin(username, password);
      const user = await User.findOne({ username });

      if (!valid) {
        throw new UserInputError("Error", { errors });
      }

      if (!user) {
        errors.general = "User not found";
        throw new UserInputError("User not found", { errors });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        errors.general = "Username or password is not valid";
        throw new UserInputError("Invalid username or password", { errors });
      }

      const token = generateToken(user);
      return {
        ...user._doc,
        id: user._id,
        token,
      };
    },

    // registration functionality
    async register(
      _,
      { registerInput: { username, email, password, confirmPassword } }
    ) {
      const { valid, errors } = validateRegister(
        username,
        email,
        password,
        confirmPassword
      );
      if (!valid) {
        throw new UserInputError("Error", { errors });
      }

      const userName = await User.findOne({ username });
      const userMail = await User.findOne({ email });
      if (userName || userMail) {
        throw new UserInputError("User with email or user id already taken", {
          errors: {
            email: "User with email or user id already taken",
          },
        });
      }

      password = await bcrypt.hash(password, 12);

      const newUser = new User({
        email,
        username,
        password,
        createdAt: new Date().toISOString(),
      });
      const res = await newUser.save();

      const token = generateToken(res);
      return {
        ...res._doc,
        id: res._id,
        token,
      };
    },
  },
};
