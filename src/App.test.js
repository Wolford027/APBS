import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LandingPage from './modules/Landing/views/LandingPage';

// Renders LandingPage directly rather than the full <App /> tree: App pulls
// in Dashboard -> Calendar.jsx -> @chakra-ui/react, which has an unrelated,
// pre-existing broken transitive dependency (@chakra-ui/utils/context) in
// this repo's node_modules, independent of anything tested here.
test('renders the landing page hero', () => {
  render(
    <MemoryRouter>
      <LandingPage />
    </MemoryRouter>
  );
  expect(screen.getByText(/payroll and attendance/i)).toBeInTheDocument();
});
