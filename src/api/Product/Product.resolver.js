const fakeProducts = [
  { id: "1", description: "Product 1", price: 100, clientId: "1" },
  { id: "2", description: "Product 2", price: 200, clientId: "2" },
  { id: "3", description: "Product 3", price: 300, clientId: "3" },
  { id: "4", description: "Product 4", price: 400, clientId: "1" }
];

module.exports = {
  Query: {
    products: () => fakeProducts,
    product: (parent, { id }) => fakeProducts.find(product => product.id === id)
  },
    Product: {
      client: () => {}
    }
  }