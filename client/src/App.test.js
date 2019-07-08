import axios from 'axios';
import React from 'react';

import App from './App';

const mockData = require('../../shared/apiResponse.mock');

jest.mock('axios', () => ({
  CancelToken: {
    source: jest.fn(),
  },
  get: jest.fn(),
  isCancel: jest.fn(),
}));

jest.useFakeTimers();


describe('App.js', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockData });
    axios.CancelToken.source.mockReturnValue({ token: 'fake signal', cancel: jest.fn() });
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => cb());
  });

  afterEach(() => {
    jest.resetAllMocks();
    window.requestAnimationFrame.mockRestore();
  });
  it('initial render should contain a form and the .images-list div, empty', () => {
    const wrapper = mount(<App />);

    expect(wrapper).toMatchSnapshot();
    expect(wrapper.find('form').length).toBe(1);
    expect(wrapper.find('.images-list').length).toBe(1);
    expect(wrapper.find('.images-list').children().length).toBe(0);
  });

  it('should ignore if searching with an empty query', async () => {
    App.prototype.searchImages = jest.fn();
    const wrapper = mount(<App />);
    const mockFormSubmitEvent = {
      preventDefault: jest.fn(),
    };

    const form = wrapper.find('form').at(0);
    const searchBox = form.find('input[type="search"]').at(0);
    searchBox.instance().value = '';
    searchBox.simulate('change');

    form.simulate('submit', mockFormSubmitEvent);

    await wrapper.instance().forceUpdate();
    wrapper.update();

    expect(wrapper).toMatchSnapshot();
    expect(App.prototype.searchImages).not.toHaveBeenCalled();
  });

  it('makes a search communicating with a given API URL', async () => {
    const wrapper = mount(<App />);

    const mockFormSubmitEvent = {
      preventDefault: jest.fn(),
    };

    const form = wrapper.find('form').at(0);
    const searchBox = wrapper.find('form input[type="search"]').at(0);
    const imagesList = wrapper.find('.images-list');
    const imagesListDOM = imagesList.instance();

    jest.spyOn(imagesListDOM, 'scrollHeight', 'get').mockImplementation(() => 300);
    jest.spyOn(imagesListDOM, 'offsetHeight', 'get').mockImplementation(() => 300);
    jest.spyOn(imagesListDOM, 'scrollTop', 'get').mockImplementation(() => 0);

    searchBox.instance().value = 'some value';

    searchBox.simulate('change');
    form.simulate('submit', mockFormSubmitEvent);

    expect(imagesList.text()).toBe('Loading...');

    await wrapper.instance().forceUpdate();
    wrapper.update();

    expect(mockFormSubmitEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledWith(process.env.REACT_APP_GIPHY_SERVER, {
      params: {
        limit: 5,
        offset: 0,
        rating: 'g',
        lang: 'en',
        q: 'some value',
      },
      cancelToken: 'fake signal',
    });

    let images = wrapper.find('.images-list').find('Image');
    let firstImage = images.at(0);

    expect(images.length).toBe(2);
    expect(firstImage.state('loaded')).toBe(false);

    firstImage.simulate('load');

    await wrapper.instance().forceUpdate();
    wrapper.update();

    images = wrapper.find('.images-list').find('Image');
    firstImage = images.at(0);

    expect(firstImage.state('loaded')).toBe(true);

    expect(wrapper).toMatchSnapshot();
  });

  it('loads new images on scroll', async () => {
    const wrapper = mount(<App />);

    const mockFormSubmitEvent = {
      preventDefault: jest.fn(),
    };

    axios.get.mockResolvedValue({ data: mockData });
    axios.CancelToken.source.mockReturnValue({ token: 'fake signal', cancel: jest.fn() });

    const form = wrapper.find('form').at(0);
    const searchBox = wrapper.find('form input[type="search"]').at(0);

    searchBox.instance().value = 'some value';
    searchBox.simulate('change');

    form.simulate('submit', mockFormSubmitEvent);

    await wrapper.instance().forceUpdate();
    wrapper.update();

    expect(mockFormSubmitEvent.preventDefault).toHaveBeenCalledTimes(1);
    expect(axios.get).toHaveBeenCalledTimes(2);
    expect(axios.get).toHaveBeenCalledWith(process.env.REACT_APP_GIPHY_SERVER, {
      params: {
        limit: 5,
        offset: 0,
        rating: 'g',
        lang: 'en',
        q: 'some value',
      },
      cancelToken: 'fake signal',
    });
    expect(axios.get).toHaveBeenCalledWith(process.env.REACT_APP_GIPHY_SERVER, {
      params: {
        limit: 2,
        offset: 2,
        rating: 'g',
        lang: 'en',
        q: 'some value',
      },
      cancelToken: 'fake signal',
    });

    const imagesList = wrapper.find('.images-list');
    const imagesListDOM = imagesList.instance();

    jest.spyOn(imagesListDOM, 'scrollHeight', 'get').mockImplementation(() => 600);
    jest.spyOn(imagesListDOM, 'offsetHeight', 'get').mockImplementation(() => 300);
    jest.spyOn(imagesListDOM, 'scrollTop', 'get').mockImplementation(() => 300);

    imagesList.simulate('scroll');

    jest.runAllTimers();

    expect(axios.get).toHaveBeenCalledTimes(3);
    expect(axios.get).toHaveBeenCalledWith(process.env.REACT_APP_GIPHY_SERVER, {
      params: {
        limit: 2,
        offset: 4,
        rating: 'g',
        lang: 'en',
        q: 'some value',
      },
      cancelToken: 'fake signal',
    });
    expect(wrapper).toMatchSnapshot();
  });
});
