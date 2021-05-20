const postsResolvers = require("./posts");
const usersResolvers = require("./users");

// resolvers resolves requested queries

module.exports = {
  Post: {
    likesCount: (parent) => parent.likes.length,
    commentsCount: (parent) => parent.comments.length,
  },
  Query: {
    ...postsResolvers.Query,
  },
  Mutation: {
    ...usersResolvers.Mutation,
    ...postsResolvers.Mutation,
  },
  Subscription: {
    ...postsResolvers.Subscription,
  },
};
