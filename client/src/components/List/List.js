import PropTypes from 'prop-types';
import React from 'react';

const List = React.forwardRef(({ items, loading, onScroll, render }, ref) => {
  const content = loading ? 'Loading...' : items.map((item, idx) => render({ item, idx }));
  return (
    <div className="images-list" ref={ref} onScroll={onScroll}>
      {content}
    </div>
  );
});

List.propTypes = {
  items: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onScroll: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired,
};

export default List;
