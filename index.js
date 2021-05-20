// dependency imports
const { ApolloServer, PubSub } = require("apollo-server");
const mongoose = require("mongoose");
require("dotenv").config();

// local imports
const typeDefs = require("./graphql/typeDefs");
const resolvers = require("./graphql/resolvers/index");

// publish or subscription
const pubsub = new PubSub();

const PORT = process.env.PORT || 5000;

// Apolloserver to create a server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ req, pubsub }),
});

// connecting to atlas
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Mongo server connected");
    return server.listen({ port: PORT });
  })
  .then((res) => console.log(`Server running at ${res.url}`))
  .catch((err) => console.log(err));
