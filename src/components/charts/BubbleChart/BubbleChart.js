// @flow
import * as React from 'react';
import { map } from 'lodash';
import chroma from 'chroma-js';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  ResponsiveContainer,
  // Label,
  Tooltip
  // Legend
} from 'recharts';

const AXES = {
  x: XAxis,
  y: YAxis,
  z: ZAxis
};
// import withStyles from 'isomorphic-style-loader/lib/withStyles';
// import s from './analyst-dashboard.scss';

// TODO:
// Add axis labels
// Extract the prop types into a type def file in this section.

type LabelProps = {
  viewBox: string | number,
  formatter: (val: number | string) => string,
  value: string | number,
  position:
    | 'top'
    | 'left'
    | 'right'
    | 'bottom'
    | 'inside'
    | 'outside'
    | 'insideLeft'
    | 'insideRight'
    | 'insideTop'
    | 'insideBottom'
    | 'insideTopLeft'
    | 'insideBottomLeft'
    | 'insideTopRight'
    | 'insideBottomRight'
    | 'insideStart'
    | 'insideEnd'
    | 'end'
    | 'center',
  offset: number,
  children: string | number,
  content: React.Node | (() => {}),
  id: string
};

type AxisDef = {
  dataKey: string, // This refers to DataSetDef.data[x][KEY]
  range: Array<number>, // bubblecharts require zaxis range defined
  name: string,
  type: 'number',
  label?: string | number | React.Node | LabelProps,
  unit?: string
};

type DataSetDef = {
  name: string,
  shape?: 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye' | React.Node | (() => React.Node),
  color?: string,
  data: Array<{}>
};

type DashboardProps = {
  data: Array<DataSetDef>,
  colorScale?: Array<strings>, // eslint-disable-line react/no-unused-prop-types
  onClick: ({}, {}) => void,
  children?: React.Node,
  axes: {
    x: AxisDef,
    y?: AxisDef,
    z?: AxisDef
  }
};

// @withStyles(s)
export default class BubbleChart extends React.PureComponent<DashboardProps, DashboardState> {
  /**
   * API mapped from: http://recharts.org/en-US/api/XAxis
   */
  static constructAxis(cfg: AxisDef, axis: 'x' | 'y' | 'z'): React.Node {
    const AxisComponent = AXES[axis];
    const { dataKey, type = 'number', unit, name, range, label } = cfg;
    return (
      <AxisComponent
        key={`${axis}-${name}`}
        type={type}
        label={label}
        dataKey={dataKey}
        range={range}
        name={name}
        unit={unit}
      />
    );
  }

  static defaultProps = {
    colorScale: 'Dark2',
    children: undefined
  };

  state = {
    colors: []
  };

  static getDerivedStateFromProps(props) {
    return {
      colors: chroma.scale(props.colorScale).colors(props.data.length)
    };
  }

  constructScatterPoints(dataCfg: DataSetDef, idx: number) {
    const { name, shape, data: dataset, color = this.state.colors[idx] } = dataCfg;
    return <Scatter key={`${name}-${idx}`} name={name} data={dataset} fill={color} shape={shape} />;
  }

  render() {
    const { data, axes, onClick, children } = this.props;
    return (
      <ResponsiveContainer height={700}>
        <ScatterChart onClick={onClick}>
          {map(axes, this.constructor.constructAxis)}
          {children}
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          {map(data, this.constructScatterPoints.bind(this))}
        </ScatterChart>
      </ResponsiveContainer>
    );
  }
}
