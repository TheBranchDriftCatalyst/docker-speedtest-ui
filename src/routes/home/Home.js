/* @flow */
import React from 'react';
import { graphql, compose } from 'react-apollo';
import { round, get } from 'lodash';
import moment from 'moment';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import { LineChart, XAxis, Tooltip, Line, CartesianGrid, YAxis, ResponsiveContainer, ReferenceArea } from 'recharts';
import strsQuery from './strs.graphql';
import s from './Home.css';

const getAxisYDomain = (data, from, to, ref, offset) => {
  console.log('slicing data', data);
  const refData = data.slice(from - 1, to);
  let [bottom, top] = [refData[0][ref], refData[0][ref]];
  refData.forEach(d => {
    if (d[ref] > top) top = d[ref];
    if (d[ref] < bottom) bottom = d[ref];
  });

  return [(bottom | 0) - offset, (top | 0) + offset]; /* eslint-disable-line no-bitwise */
};

type SpeedTestSample = {
  download: number,
  upload: number,
  timestamp: string
};

type Props = {
  data: {
    SpeedTestResults: {
      data: Array<SpeedTestSample>,
      count: number | null,
      timing: string | number
    },
    loading: boolean
  }
};

class Home extends React.Component<Props> {
  state = {
    left: 'dataMin',
    right: 'dataMax',
    refAreaLeft: '',
    refAreaRight: '',
    top: 'dataMax+1',
    bottom: 'dataMin-1',
    top2: 'dataMax+20',
    bottom2: 'dataMin-20',
    animation: true
  };

  zoom = () => {
    let { refAreaLeft, refAreaRight } = this.state;
    const {
      data: { SpeedTestResults: data }
    } = this.props;
    if (refAreaLeft === refAreaRight || refAreaRight === '') {
      this.setState(() => ({
        refAreaLeft: '',
        refAreaRight: ''
      }));
      return;
    }

    // xAxis domain
    if (refAreaLeft > refAreaRight) [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    // yAxis domain
    const [bottom, top] = getAxisYDomain(data, refAreaLeft, refAreaRight, 'download', 1);
    const [bottom2, top2] = getAxisYDomain(data, refAreaLeft, refAreaRight, 'upload', 1);

    this.setState(() => ({
      refAreaLeft: '',
      refAreaRight: '',
      data: data.slice(),
      left: refAreaLeft,
      right: refAreaRight,
      bottom,
      top,
      bottom2,
      top2
    }));
  };

  zoomOut = () => {
    const {
      data: { SpeedTestResults }
    } = this.props;
    this.setState(() => ({
      data: SpeedTestResults.slice(),
      refAreaLeft: '',
      refAreaRight: '',
      left: 'dataMin',
      right: 'dataMax',
      top: 'dataMax+1',
      bottom: 'dataMin',
      top2: 'dataMax+50',
      bottom2: 'dataMin+50'
    }));
  };

  getDateFormat() {
    return 'MM/DD HH:mm';
  }

  render() {
    const { left, right, refAreaLeft, refAreaRight, top, bottom, left2, right2 } = this.state;
    const { data: { startPolling, SpeedTestResults: { data, count, loading } = {} } = {} } = this.props;

    if (loading) {
      return (
        <div className={s.root}>
          <div className={s.container}>Loading...</div>
        </div>
      );
    }

    startPolling(60000);

    return (
      <div className={s.root}>
        <div className={s.container}>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              onMouseDown={e => this.setState({ refAreaLeft: e.activeLabel })}
              onMouseMove={e => this.state.refAreaLeft && this.setState({ refAreaRight: e.activeLabel })}
              onMouseUp={this.zoom}
              data={data}
              margin={{ top: 5, right: 20, left: 10, bottom: 0 }}
            >
              <XAxis
                tickFormatter={v => moment(Number(get(data, [v, 'timestamp']))).format(this.getDateFormat())}
                tick={{ offset: -10, position: 'bottom' }}
                dataKey="index"
                // domain={['dataMin', 'dataMax']}
              />
              <YAxis
                tickFormatter={v => round(v, 2)}
                label={{ value: 'MBs', angle: -90, position: 'left', offset: 0 }}
                type="number"
                yAxisId={0}
                dataKey="download"
                // domain={['dataMin', 'dataMax']}
              />
              <Tooltip
                labelFormatter={v => `${moment(Number(get(data, [v, 'timestamp']))).format(this.getDateFormat())}`}
              />
              <CartesianGrid stroke="#f5f5f5" />
              <Line type="monotone" dataKey="upload" stroke="#ff7300" yAxisId={0} animationDuration={300} />
              <Line type="monotone" dataKey="download" stroke="#387908" yAxisId={0} animationDuration={300} />
              {refAreaLeft && refAreaRight ? (
                <ReferenceArea yAxisId={0} x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.1} />
              ) : null}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }
}

export default compose(
  withStyles(s),
  graphql(strsQuery, {
    options: {
      variables: {
        start: moment()
          .startOf('month')
          .format('x'),
        end: moment().format('x'),
        resample: 'none'
      }
    }
  })
)(Home);
