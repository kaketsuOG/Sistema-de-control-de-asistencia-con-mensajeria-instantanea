describe('Attendance System E2E Tests', () => {
  beforeEach(() => {
    // Simular inicio de sesión
    cy.request('POST', '/api/auth/login', {
      username: 'testuser',
      password: 'testpass'
    }).then((resp) => {
      window.localStorage.setItem('token', resp.body.token);
    });
  });

  it('should display attendance report', () => {
    cy.visit('/attendance');
    cy.get('[data-testid="attendance-table"]').should('be.visible');
    cy.contains('Reporte de Atrasos').should('be.visible');
  });

  it('should create new attendance record', () => {
    cy.visit('/attendance/new');
    cy.get('[data-testid="date-input"]').type('2024-03-27');
    cy.get('[data-testid="status-select"]').select('ATRASO');
    cy.get('[data-testid="submit-button"]').click();
    
    // Verificar que se creó el registro
    cy.contains('Registro creado exitosamente').should('be.visible');
  });
});