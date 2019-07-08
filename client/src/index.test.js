import React from 'react';
import ReactDOM from 'react-dom';

import './index';

jest.mock(
  './App',
  () =>
    function mockComponent() {
      return <div>Fake App</div>;
    },
);

jest.mock('react-dom', () => ({
  render: jest.fn(),
}));

jest.mock('react', () => ({
  createElement: () => 'fake react component',
}));

describe('index.js', () => {
  beforeEach(() => {
    jest.spyOn(document, 'getElementById').mockImplementation(() => 'fake dom element');
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it(`calls ReactDOM's render() method`, () => {
    expect(ReactDOM.render).toHaveBeenCalledTimes(1);
    expect(ReactDOM.render).toHaveBeenCalledWith('fake react component', null);
  });
});
