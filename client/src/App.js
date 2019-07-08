import axios from 'axios';
import React from 'react';

import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Image from './components/Image/Image';
import List from './components/List/List';

import './App.css';

const { REACT_APP_GIPHY_SERVER } = process.env;

const { CancelToken } = axios;
let cancelRequestToken;

class App extends React.Component {
  imagesListRef = React.createRef();
  searchRef = React.createRef();

  state = {
    data: [],
    lang: 'en',
    limit: 5,
    loading: false,
    offset: 0,
    rating: 'g',
    totalCount: 0,
  };

  scrollHandler = () => {
    window.requestAnimationFrame(() => {
      const { data, limit, offset } = this.state;
      const listEl = this.imagesListRef.current;
      const hasReachedBottom =
        Math.ceil(listEl.scrollTop + listEl.offsetHeight) >= listEl.scrollHeight;

      if (hasReachedBottom && data.length > 0) {
        this.setState(
          {
            offset: offset + limit,
          },
          () => {
            this.searchImages({ apiUrl: REACT_APP_GIPHY_SERVER });
          },
        );
      }
    });
  };

  submitHandler = (e) => {
    e.preventDefault();

    if (!this.searchRef.current.value.trim()) {
      return;
    }

    this.setState(
      {
        data: [],
        lang: 'en',
        limit: 5,
        loading: true,
        offset: 0,
        rating: 'g',
        totalCount: 0,
      },
      () => {
        this.searchImages({ apiUrl: REACT_APP_GIPHY_SERVER });
      },
    );
  };

  searchImages = ({ apiUrl }) => {
    const { data, lang, limit, offset, rating, totalCount } = this.state;

    /** Cancel any request running */
    if (cancelRequestToken) {
      cancelRequestToken.cancel();
      cancelRequestToken = null;
    }

    const search = this.searchRef.current.value;

    /** Create a new Abort signal */
    cancelRequestToken = CancelToken.source();

    return axios
      .get(apiUrl, {
        params: {
          limit,
          offset,
          rating,
          lang,
          q: search,
        },
        cancelToken: cancelRequestToken.token,
      })
      .then((response) => {
        this.setState(
          {
            data: data.concat(response.data.data),
            limit: response.data.pagination ? response.data.pagination.count : limit,
            loading: false,
            offset: response.data.pagination ? response.data.pagination.offset : offset + limit,
            totalCount: response.data.pagination
              ? response.data.pagination.total_count
              : totalCount,
          },
          () => {
            window.requestAnimationFrame(() => {
              const listEl = this.imagesListRef.current;
              if (listEl.scrollHeight === listEl.offsetHeight) {
                this.setState({ offset: this.state.offset + this.state.limit }, () => {
                  this.searchImages({ apiUrl });
                });
              }
            });
          },
        );
      })
      .catch((err) => {
        this.setState({ loading: false });
        if (axios.isCancel(err)) {
          return;
        }
        /** @todo: Handle error */
        console.error(err);
      });
  };

  render() {
    const { loading, data } = this.state;
    return (
      <ErrorBoundary>
        <form className="form" onSubmit={this.submitHandler}>
          <input name="search" placeholder="E.g. kittens" ref={this.searchRef} type="search" />
        </form>
        <List
          loading={loading}
          items={data}
          onScroll={this.scrollHandler}
          render={({ item, idx }) => <Image key={`images_${idx}`} {...item} />}
          ref={this.imagesListRef}
        />
      </ErrorBoundary>
    );
  }
}

export default App;
