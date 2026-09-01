module.exports = {
  startQueue: async () => ({
    send: async () => {},
    work: async () => {},
    cancel: async () => {},
    createQueue: async () => {},
    schedule: async () => {},
  }),
  getQueue: () => ({
    send: async () => {},
    cancel: async () => {},
    createQueue: async () => {},
  }),
  stopQueue: async () => {},
};