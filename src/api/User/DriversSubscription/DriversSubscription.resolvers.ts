const resolvers = {
    Subscription: {
      DriversSubscription: {
        subscribe: (_, __, context) => {
          return context.pubsub.asyncIterator("driverUpdate");
        }
      }
    }
  };
  export default resolvers;