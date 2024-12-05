const mockQuery = jest.fn();
const mockConnect = jest.fn((callback) => callback && callback(null));
const mockEnd = jest.fn();

module.exports = {
    createConnection: jest.fn(() => ({
        query: mockQuery,
        connect: mockConnect,
        end: mockEnd,
    })),
    __mocks__: { mockQuery, mockConnect, mockEnd },
};