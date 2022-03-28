import React from 'react';
import { render } from '@testing-library/react';

import Index from '../pages/index';

describe('Index', () => {
    it('should render successfully', () => {
        Object.defineProperty(window, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation(query => ({
              matches: false,
              media: query,
              onchange: null,
              addListener: jest.fn(), // Deprecated
              removeListener: jest.fn(), // Deprecated
              addEventListener: jest.fn(),
              removeEventListener: jest.fn(),
              dispatchEvent: jest.fn(),
            })),
          });
        const { baseElement } = render(<Index />);
        expect(baseElement).toBeTruthy();
    });
});
