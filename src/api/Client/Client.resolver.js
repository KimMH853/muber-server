const fakeClients = [
  { id: "1", name: "Alice", age: 28 },
  { id: "2", name: "Bob", age: 35 },
  { id: "3", name: "Charlie", age: 42 }
];



module.exports = {
  Query: {
    clients: () => fakeClients,
    client: (parent, { id }) => fakeClients.find(client => client.id === id),
  },
  Client: {
    products: (client) => fakeProducts.filter(product => product.clientId === client.id)
  },
  Mutation: {
    addClient: (parent, { name, age }) => {
      const newClient = { id: String(fakeClients.length + 1), name, age };
      fakeClients.push(newClient);
      return newClient;
    }
  }
}