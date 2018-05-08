// @flow
import * as React from 'react';
import {css} from 'react-emotion';
import {Scrollbars} from 'react-custom-scrollbars';
import styled from 'react-emotion';

type Props = {|
  isNativeChild?: boolean,
  children: React.Element<*>
|}

const scrollbarStyles = css({
  // silver
  backgroundColor: 'rgba(241,240,250, .3)',
  borderRadius: '3px'
});

const StyledScrollbars = styled(Scrollbars)({
  ':hover': {
    [`.${scrollbarStyles}`]: {
      opacity: 1
    }
  },
  [`.${scrollbarStyles}`]: {
    opacity: 0,
    transition: 'opacity .2s ease-in'
  }
});

class SexyScrollbar extends React.Component<Props> {
  componentDidMount() {
    // FIXME remove when we get rid of aphrodite. necessary to get the correct height
    setTimeout(() => this.forceUpdate());
  }

  scrollRef = React.createRef();

  render() {
    const {children, isNativeChild} = this.props;
    const refProp = isNativeChild ? 'ref' : 'innerRef';
    return (
      <StyledScrollbars
        style={{height: this.scrollRef.current && this.scrollRef.current.getBoundingClientRect().height}}
        renderThumbVertical={(props) => <div {...props} className={scrollbarStyles} />}
      >
        {React.cloneElement(children, {[refProp]: this.scrollRef})}
      </StyledScrollbars>
    );
  }
}

export default SexyScrollbar;