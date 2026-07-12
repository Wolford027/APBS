// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// jsdom doesn't implement these: Motion's reduced-motion detection needs
// matchMedia, and MUI's Autocomplete/Popper positioning needs Resize/
// IntersectionObserver. Without these, any test that renders a Motion or
// MUI Autocomplete component throws.
window.matchMedia = window.matchMedia || function (query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  };
};

window.ResizeObserver = window.ResizeObserver || class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

window.IntersectionObserver = window.IntersectionObserver || class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
