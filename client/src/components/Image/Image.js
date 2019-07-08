import PropTypes from 'prop-types';
import React from 'react';

class Image extends React.PureComponent {
  static propTypes = {
    images: PropTypes.object.isRequired,
    title: PropTypes.string,
  };

  state = {
    loaded: false,
  };

  render() {
    const { loaded } = this.state;
    const { images, title } = this.props;

    return (
      <picture
        className={`image${loaded ? '' : ' loading'}`}
        onLoad={() => this.setState({ loaded: true })}
      >
        <source alt={title} media="(min-width: 480px)" srcSet={images.original.url} />
        <img alt={title} src={images.fixed_width.url} />
      </picture>
    );
  }
}

export default Image;
