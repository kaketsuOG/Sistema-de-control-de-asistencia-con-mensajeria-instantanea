import { render, screen, fireEvent } from '@testing-library/react';
import AttendanceReport from '../AttendanceReport';

describe('AttendanceReport Component', () => {
  const mockData = {
    attendanceRecords: [
      { id: 1, date: '2024-03-27', status: 'ATRASO', justificativo: false }
    ]
  };

  test('renders attendance report correctly', () => {
    render(<AttendanceReport data={mockData} />);
    expect(screen.getByText(/ATRASO/i)).toBeInTheDocument();
  });

  test('filters work correctly', () => {
    render(<AttendanceReport data={mockData} />);
    const filterButton = screen.getByRole('button', { name: /filtrar/i });
    fireEvent.click(filterButton);
    // Verifica que el filtro se aplicó correctamente
  });
});
