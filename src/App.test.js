import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

let origWebSocket;
let playSpy;
let pauseSpy;

beforeEach(() => {
  origWebSocket = global.WebSocket;
  global.WebSocket = jest.fn(() => ({
    addEventListener: jest.fn(),
    send: jest.fn(),
    close: jest.fn(),
    readyState: 1,
  }));
  global.WebSocket.OPEN = 1;
  playSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  pauseSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  global.WebSocket = origWebSocket;
  playSpy.mockRestore();
  pauseSpy.mockRestore();
});

test('shows registration form initially', () => {
  render(<App />);
  expect(screen.getByPlaceholderText(/event id/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /lock/i })).toBeInTheDocument();
  expect(screen.queryByLabelText('locked')).toBeNull();
});

test('registers when lock button clicked', async () => {
  const mockSocket = { addEventListener: jest.fn(), send: jest.fn(), close: jest.fn(), readyState: 1 };
  global.WebSocket = jest.fn(() => mockSocket);
  global.WebSocket.OPEN = 1;
  render(<App />);
  await userEvent.type(screen.getByPlaceholderText(/event id/i), 'abc');
  await userEvent.click(screen.getByRole('button', { name: /lock/i }));
  expect(mockSocket.send).toHaveBeenCalledTimes(1);
  const sent = JSON.parse(mockSocket.send.mock.calls[0][0]);
  expect(sent).toEqual({ event: 'register', id: 'abc' });
  expect(screen.getByLabelText('locked')).toBeInTheDocument();
});

test('switches to unlocked icon and background on event', async () => {
  const listeners = {};
  const mockSocket = {
    addEventListener: (event, cb) => { listeners[event] = cb; },
    send: jest.fn(),
    close: jest.fn(),
    readyState: 1,
  };
  global.WebSocket = jest.fn(() => mockSocket);
  global.WebSocket.OPEN = 1;

  render(<App />);
  act(() => { listeners['open'] && listeners['open'](); });
  await userEvent.type(screen.getByPlaceholderText(/event id/i), 'abc');
  await userEvent.click(screen.getByRole('button', { name: /lock/i }));
  act(() => {
    listeners['message']({ data: JSON.stringify({ event: 'unlocked', id: 'abc' }) });
  });
  const icon = screen.getByLabelText('unlocked');
  expect(icon).toBeInTheDocument();
  const app = document.querySelector('.App.unlocked');
  expect(app).not.toBeNull();
});

test('enabling audio does not re-register with the server', async () => {
  const mockSocket = { addEventListener: jest.fn(), send: jest.fn(), close: jest.fn(), readyState: 1 };
  global.WebSocket = jest.fn(() => mockSocket);
  global.WebSocket.OPEN = 1;
  render(<App />);
  await userEvent.type(screen.getByPlaceholderText(/event id/i), 'abc');
  await userEvent.click(screen.getByRole('button', { name: /lock/i }));
  expect(mockSocket.send).toHaveBeenCalledTimes(1);
  await userEvent.click(screen.getByRole('button', { name: /enable audio/i }));
  expect(mockSocket.send).toHaveBeenCalledTimes(1);
});
