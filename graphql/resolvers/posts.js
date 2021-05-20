const { AuthenticationError, UserInputError } = require("apollo-server");
const Post = require("../../models/Post");
const authValidate = require("../../utils/authValidate");

module.exports = {
  Query: {
    async getPosts() {
      try {
        const posts = await Post.find().sort({ createdAt: -1 });
        return posts;
      } catch (err) {
        throw new Error(err);
      }
    },
    async getPost(_, { postId }) {
      try {
        const post = await Post.findById(postId);
        if (post) {
          return post;
        } else {
          throw new Error("Post not found");
        }
      } catch (err) {
        throw new Error(err);
      }
    },
  },
  Mutation: {
    async createPost(_, { body }, context) {
      const user = authValidate(context);

      if (body.trim() === "") {
        throw new UserInputError("Body cannot be empty", {
          errors: {
            body: "Post body cannot be empty",
          },
        });
      }

      const newPost = new Post({
        body,
        user: user.id,
        username: user.username,
        createdAt: new Date().toISOString(),
      });

      const post = await newPost.save();
      context.pubsub.publish("NEW_POST", {
        newPost: post,
      });

      return post;
    },

    async deletePost(_, { postId }, context) {
      const user = authValidate(context);

      try {
        const post = await Post.findById(postId);
        if (user.username === post.username) {
          await post.delete();
          return "Post deleted successfully";
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } catch (err) {
        throw new Error(err);
      }
    },

    createComment: async (_, { postId, body }, context) => {
      const { username } = authValidate(context);

      if (body.trim() === "") {
        throw new UserInputError("Body cannot be empty", {
          errors: {
            body: "Post body cannot be empty",
          },
        });
      }

      const post = await Post.findById(postId);

      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString(),
        });
        await post.save();
        return post;
      }
    },

    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = authValidate(context);

      const post = await Post.findById(postId);

      if (post) {
        const commentIndex = await post.comments.findIndex(
          (comment) => comment.id === commentId
        );

        if (post.comments[commentIndex].username === username) {
          post.comments.splice(commentIndex, 1);
          await post.save();
          return post;
        } else {
          throw new AuthenticationError("Action not allowed");
        }
      } else {
        throw new UserInputError("Post deleted or does not exist");
      }
    },

    likePost: async (_, { postId }, context) => {
      const { username } = authValidate(context);

      const post = await Post.findById(postId);
      if (post) {
        const liked = post.likes.find((like) => like.username === username);
        if (liked) {
          post.likes = post.likes.filter((like) => like.username !== username);
        } else {
          post.likes.push({
            username,
            createdAt: new Date().toISOString(),
          });
        }
        await post.save();
        return post;
      } else {
        throw new UserInputError("Post not found");
      }
    },
  },
  Subscription: {
    newPost: {
      subscribe: (_, __, { pubsub }) => pubsub.asyncIterator("NEW_POST"),
    },
  },
};
