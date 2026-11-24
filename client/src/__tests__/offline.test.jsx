import { test, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../services/authService', () => ({ authService: { getMe: vi.fn() } }));
import { authService } from '../services/authService';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/common/ProtectedRoute';

const app = () => render(
  <MemoryRouter initialEntries={['/']}>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<div>login page</div>} />
        <Route element={<ProtectedRoute />}><Route path="/" element={<div>home</div>} /></Route>
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);
afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });

test('signed in but offline: shows the offline screen, keeps the token', async () => {
  localStorage.setItem('token', 't');
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  authService.getMe.mockRejectedValue(new Error('Network Error'));
  app();
  expect(await screen.findByText("You're offline")).toBeTruthy();
  expect(localStorage.getItem('token')).toBe('t');
  expect(screen.queryByText('login page')).toBeNull();
});

test('online but the session is rejected: still goes to login', async () => {
  localStorage.setItem('token', 't');
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(true);
  authService.getMe.mockRejectedValue(new Error('401'));
  app();
  await waitFor(() => expect(screen.getByText('login page')).toBeTruthy());
});

test('back online: the offline screen clears by itself', async () => {
  localStorage.setItem('token', 't');
  const online = vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
  authService.getMe.mockRejectedValueOnce(new Error('Network Error'));
  app();
  await screen.findByText("You're offline");
  online.mockReturnValue(true);
  authService.getMe.mockResolvedValue({ user: { _id: '1', name: 'A' } });
  window.dispatchEvent(new Event('online'));
  expect(await screen.findByText('home')).toBeTruthy();
});
