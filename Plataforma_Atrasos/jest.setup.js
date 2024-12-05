import '@testing-library/jest-dom';
// Limpieza y restauración después de cada prueba
afterEach(() => {
    jest.clearAllMocks(); // Limpia las llamadas y los resultados de los mocks
    jest.restoreAllMocks(); // Restaura los métodos originales para todos los mocks
    jest.resetAllMocks(); // Resetea el estado de todos los mocks
    jest.resetModules(); // Resetea los módulos para asegurar un entorno limpio
});

// Configuración para ignorar alertas y consolas específicas
global.console = {
    ...console,
    log: jest.fn(), // Silencia logs innecesarios en las pruebas
    error: jest.fn(), // Silencia errores específicos
    warn: jest.fn(), // Silencia advertencias
};

// Mockear `window.alert` y similares
global.alert = jest.fn();
global.confirm = jest.fn();
global.prompt = jest.fn();

// Opcional: Configuración adicional para pruebas en node o jsdom
if (typeof window !== 'undefined') {
    // Mock para API específicas de DOM si se ejecuta en entorno jsdom
    window.scrollTo = jest.fn();
    window.location = { assign: jest.fn() };
}

// Mock de temporizadores para evitar fugas de timers entre pruebas
jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');
jest.spyOn(global, 'setInterval');
jest.spyOn(global, 'clearTimeout');
jest.spyOn(global, 'clearInterval');