// Singleton to share the Socket.io instance across the app
// without circular dependency issues.
let _io = null;

export const setIO = (io) => {
  _io = io;
};

export const getIO = () => _io;
