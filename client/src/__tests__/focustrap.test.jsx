import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useRef } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

const Modal = () => {
  const ref = useRef(null);
  useFocusTrap(ref);
  return (
    <div ref={ref} role="dialog">
      <button>one</button>
      <button>two</button>
    </div>
  );
};
const Page = ({ open }) => (
  <>
    <button>opener</button>
    {open && <Modal />}
  </>
);

describe('useFocusTrap', () => {
  it('focuses inside, wraps Tab both ways, and returns focus on close', () => {
    const { rerender } = render(<Page open={false} />);
    screen.getByText('opener').focus();
    rerender(<Page open />);
    const [one, two] = [screen.getByText('one'), screen.getByText('two')];
    expect(document.activeElement).toBe(one);
    two.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(one);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(two);
    rerender(<Page open={false} />);
    expect(document.activeElement).toBe(screen.getByText('opener'));
  });
});
