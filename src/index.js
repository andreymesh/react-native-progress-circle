import React from 'react'
import {
  Easing,
  Animated,
  StyleSheet,
  Text,
  View,
  ViewPropTypes,
} from 'react-native'
import PropTypes from 'prop-types'

// compatability for react-native versions < 0.44
const ViewPropTypesStyle = ViewPropTypes
  ? ViewPropTypes.style
  : View.propTypes.style

const styles = StyleSheet.create({
  outerCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e3e3e3',
  },
  innerCircle: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  leftWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#f00',
  },
})

function calcInterpolationValuesForHalfCircle1(animatedValue, {shadowColor}) {
  const rotate = animatedValue.interpolate({
    inputRange: [0, 50, 50, 100, 200],
    outputRange: ['0deg', '180deg', '180deg', '180deg', '540deg'],
  });

  const backgroundColor = shadowColor;
  return {rotate, backgroundColor}
}

function calcInterpolationValuesForHalfCircle2(animatedValue,
                                               {color, shadowColor},) {
  const rotate = animatedValue.interpolate({
    inputRange: [0, 50, 50, 100, 150, 150, 200],
    outputRange: ['0deg', '0deg', '180deg', '360deg', '360deg', '180deg', '180deg'],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 50, 50, 100, 150, 150, 200],
    outputRange: [color, color, shadowColor, shadowColor, shadowColor, color, color],
  });
  return {rotate, backgroundColor}
}

function getInitialState(props) {
  const circleProgress = new Animated.Value(0);
  return {
    circleProgress,
    secondsElapsed: 0,
    text: props.updateText(0, props.seconds),
    interpolationValuesHalfCircle1: calcInterpolationValuesForHalfCircle1(
      circleProgress,
      props,
    ),
    interpolationValuesHalfCircle2: calcInterpolationValuesForHalfCircle2(
      circleProgress,
      props,
    ),
  }
}

export default class PercentageCircle extends React.PureComponent {
  static propTypes = {
    seconds: PropTypes.number,
    incrementTime: PropTypes.number.isRequired,
    decrementTime: PropTypes.number.isRequired,
    stop: PropTypes.bool.isRequired,
    radius: PropTypes.number.isRequired,
    color: PropTypes.string,
    shadowColor: PropTypes.string, // eslint-disable-line react/no-unused-prop-types
    bgColor: PropTypes.string,
    borderWidth: PropTypes.number,
    containerStyle: ViewPropTypesStyle,
    textStyle: Text.propTypes.style,
    updateText: PropTypes.func,
    onTimeElapsed: PropTypes.func,
  };

  static defaultProps = {
    color: '#f00',
    shadowColor: '#999',
    bgColor: '#e9e9ef',
    borderWidth: 2,
    seconds: 10,
    children: null,
    containerStyle: null,
    textStyle: null,
    onTimeElapsed: () => null,
    updateText: (elapsedSeconds, totalSeconds) =>
      (totalSeconds - elapsedSeconds).toString(),
  };

  constructor(props) {
    super(props);
    this.state = getInitialState(props);
    this.restartAnimation({finished: true});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.stop && !this.props.stop) {
      this.setState({...getInitialState(this.props)}, () => this.restartAnimation({finished: true}));
    }
    else if (!prevProps.stop && this.props.stop) {
      this.state.circleProgress.stopAnimation();
      this.setState({...getInitialState(this.props)})
    }
  }

  restartAnimation = (data) => {
    console.log('restartAnimation before if');
    console.log(!this.props.stop);
    console.log(data);
    this.state.circleProgress.setValue(0);
    if (!this.props.stop && data.finished) {
      console.log('restartAnimation');
      Animated.timing(this.state.circleProgress, {
        toValue: 100,
        duration: this.props.incrementTime,
        easing: Easing.linear,
      }).start(this.downAnimation)
    }
  };

  downAnimation = (data) => {
    console.log('downAnimation', data);
    if (!this.props.stop && data.finished) {
      console.log('downAnimation');
      Animated.timing(this.state.circleProgress, {
        toValue: 200,
        duration: this.props.decrementTime,
        easing: Easing.linear,
      }).start(this.restartAnimation)
    }
  };

  renderHalfCircle({rotate, backgroundColor}) {
    const {radius} = this.props;

    return (
      <View
        style={[
          styles.leftWrap,
          {
            width: radius,
            height: radius * 2,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.halfCircle,
            {
              width: radius,
              height: radius * 2,
              borderRadius: radius,
              backgroundColor,
              transform: [
                {translateX: radius / 2},
                {rotate},
                {translateX: -radius / 2},
              ],
            },
          ]}
        />
      </View>
    )
  }

  renderInnerCircle() {
    const radiusMinusBorder = this.props.radius - this.props.borderWidth
    return (
      <View
        style={[
          styles.innerCircle,
          {
            width: radiusMinusBorder * 2,
            height: radiusMinusBorder * 2,
            borderRadius: radiusMinusBorder,
            backgroundColor: this.props.bgColor,
            ...this.props.containerStyle,
          },
        ]}
      >
        {this.props.children}
      </View>
    )
  }

  render() {
    const {
      interpolationValuesHalfCircle1,
      interpolationValuesHalfCircle2,
    } = this.state
    return (
      <View
        style={[
          styles.outerCircle,
          {
            width: this.props.radius * 2,
            height: this.props.radius * 2,
            borderRadius: this.props.radius,
            backgroundColor: this.props.color,
          },
        ]}
      >
        {this.renderHalfCircle(interpolationValuesHalfCircle1)}
        {this.renderHalfCircle(interpolationValuesHalfCircle2)}
        {this.renderInnerCircle()}
      </View>
    )
  }
}
