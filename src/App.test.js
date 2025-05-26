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
  }));
  playSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'play').mockImplementation(() => Promise.resolve());
  pauseSpy = jest.spyOn(window.HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  global.WebSocket = origWebSocket;
  playSpy.mockRestore();
  pauseSpy.mockRestore();
});

test('renders lock icon', () => {
  render(<App />);
  const icon = screen.getByLabelText('locked');
  expect(icon).toBeInTheDocument();
  const idElement = screen.getByText(/Client ID:/i);
  expect(idElement).toBeInTheDocument();
});
test('shows generated client id', () => {
  render(<App />);
  const idElement = screen.getByText(/Client ID:/i);
  expect(idElement).toBeInTheDocument();
});

test('switches to unlocked icon and background on event', () => {
  const listeners = {};
  let sent;
  const mockSocket = {
    addEventListener: (event, cb) => {
      listeners[event] = cb;
    },
    send: jest.fn((arg) => { sent = arg; }),
    close: jest.fn(),
  };
  const origWebSocket = global.WebSocket;
  global.WebSocket = jest.fn(() => mockSocket);

  render(<App />);

  act(() => {
    listeners['open'] && listeners['open']();
  });
  const regData = JSON.parse(sent);

  act(() => {
    listeners['message']({ data: JSON.stringify({ event: 'unlocked', id: regData.id }) });
  });

  const icon = screen.getByLabelText('unlocked');
  expect(icon).toBeInTheDocument();
  const app = document.querySelector('.App.unlocked');
  expect(app).not.toBeNull();

  global.WebSocket = origWebSocket;
});

test('enabling audio does not re-register with the server', async () => {
  const listeners = {};
  const mockSocket = {
    addEventListener: (event, cb) => {
      listeners[event] = cb;
    },
    send: jest.fn(),
    close: jest.fn(),
  };
  const origWebSocket = global.WebSocket;
  global.WebSocket = jest.fn(() => mockSocket);

  render(<App />);

  act(() => {
    listeners['open'] && listeners['open']();
  });

  expect(mockSocket.send).toHaveBeenCalledTimes(1);

  await userEvent.click(screen.getByRole('button', { name: /enable audio/i }));

  expect(mockSocket.send).toHaveBeenCalledTimes(1);

  global.WebSocket = origWebSocket;
});
