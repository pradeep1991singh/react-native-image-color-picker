import React from 'react';

// mock this module to allow react-navigation to mock Linking
jest.mock('Linking', () => ({
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve()),
  getInitialURL: jest.fn(() => Promise.resolve())
}));

jest.mock('react-native-fetch-blob', () => ({
  fetch: jest.fn((type, url) => Promise.resolve())
}));

jest.mock('WebView', () => 'WebView');
