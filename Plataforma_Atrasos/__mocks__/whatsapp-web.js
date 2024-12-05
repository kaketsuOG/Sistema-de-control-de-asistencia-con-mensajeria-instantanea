module.exports = {
    Client: jest.fn(() => ({
        on: jest.fn(),
        initialize: jest.fn(),
        sendMessage: jest.fn(() => Promise.resolve()), // Simula envío exitoso
        destroy: jest.fn(),
    })),
};