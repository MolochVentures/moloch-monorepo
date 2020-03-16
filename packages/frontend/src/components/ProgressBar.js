import React from "react";
import PropTypes from 'prop-types'
import cx from 'classnames'
import _ from 'lodash'
import { Progress, Grid } from "semantic-ui-react";
import { createShorthandFactory } from "semantic-ui-react/dist/es/lib/factories"
import { useKeyOnly, useValueAndKey, getUnhandledProps, getElementType } from "semantic-ui-react/dist/es/lib"


const isNil = (children) =>
  children === null || children === undefined || (Array.isArray(children) && children.length === 0)

const createHTMLDivision = createShorthandFactory('div', (val) => ({ children: val }))


class CustomProgressBar extends React.Component{
  static propTypes = {
     pair: PropTypes.arrayOf(PropTypes.shape({
       value: PropTypes.number,
       color: PropTypes.string
     }),)
  }

  calculatePercent = (val) => {
    const { percent, total, value } = this.props
    const computeValue = val || value;

    if (!_.isUndefined(percent)) return percent
    if (!_.isUndefined(total) && !_.isUndefined(computeValue)) return (computeValue / total) * 100
  }

  computeValueText = (percent) => {
    const { progress, total, value } = this.props

    if (progress === 'value') return value
    if (progress === 'ratio') return `${value}/${total}`
    return `${percent}%`
  }

  getPercent = (val) => {
    const { precision, progress, total, value } = this.props
    const computeValue = val || value;
    const percent = _.clamp(this.calculatePercent(computeValue), 0, 100)

    if (!_.isUndefined(total) && !_.isUndefined(computeValue) && progress === 'value') {
      return (computeValue / total) * 100
    }
    if (progress === 'value') return computeValue
    if (_.isUndefined(precision)) return percent
    return _.round(percent, precision)
  }

  isAutoSuccess = () => {
    const { autoSuccess, percent, total, value } = this.props

    return autoSuccess && (percent >= 100 || value >= total)
  }

  renderLabel = () => {
    const { children, content, label } = this.props

    if (!isNil(children)) return <div className='label'>{children}</div>
    if (!isNil(content)) return <div className='label'>{content}</div>
    return createHTMLDivision(label, {
      autoGenerateKey: false,
      defaultProps: { className: 'label' },
    })
  }

  renderProgress = (percent, skipFormat) => {
    const { precision, progress } = this.props

    if (!progress && _.isUndefined(precision)) {
      console.log('something is missing')
      return
    }
    const text = skipFormat ? percent : this.computeValueText(percent)
    return <div className='progress'>{text}</div>
  }

  render(){
    const {
      active,
      attached,
      className,
      color,
      disabled,
      error,
      indicating,
      inverted,
      size,
      success,
      warning,
      pair
    } = this.props

    const classes = cx(
      'ui',
      color,
      size,
      useKeyOnly(active || indicating, 'active'),
      useKeyOnly(disabled, 'disabled'),
      useKeyOnly(error, 'error'),
      useKeyOnly(indicating, 'indicating'),
      useKeyOnly(inverted, 'inverted'),
      useKeyOnly(success || this.isAutoSuccess(), 'success'),
      useKeyOnly(warning, 'warning'),
      useKeyOnly(pair, 'pair'),
      useValueAndKey(attached, 'attached'),
      'progress',
      className,
    )
    const ElementType = getElementType(Progress, this.props)
    if (pair) {
      const [ left, right ] = pair;
      const leftPercent = this.getPercent(left.value) || 0;
      const rightPercent = this.getPercent(right.value) || 0;
      console.log({leftPercent, rightPercent})

      return (<ElementType className={classes} data-left={Math.floor(leftPercent)} data-right={Math.floor(rightPercent)}>
          <div className={`bar bar--left bar--${left.color}`} style={{width: `${leftPercent}%`}}>
            {this.renderProgress(left.value, true)}
          </div>
          <div className={`bar bar--right bar--${right.color}`} style={{width: `${rightPercent}%`}}>
            {this.renderProgress(right.value, true)}
          </div>
          {this.renderLabel()}
        </ElementType>
      )
    }

    const percent = this.getPercent() || 0;
    return(
      <ElementType className={classes} data-percent={Math.floor(percent)}>
        <div className='bar' style={{ width: `${percent}%` }}>
          {this.renderProgress(percent)}
        </div>
        {this.renderLabel()}
      </ElementType>
    )
  }
}

const ProgressBar = ({ yes, no }) => {
  const total = parseInt(yes) + parseInt(no)
  return (
    <>
      <div style={{ position: "relative" }}>
        <CustomProgressBar precision={1} progress='value' pair={[{value: yes, color: 'green'},{value: no, color: 'red'}]} total={total} />
      </div>
      <Grid columns="equal" >
        <Grid.Column floated="left" id="amountYesNo"><p>{yes} Yes Votes</p></Grid.Column>
        <Grid.Column floated="right" textAlign="right" id="amountYesNo">
          <p>{no} No Votes</p>
        </Grid.Column>
      </Grid>
    </>
  );
};

export default ProgressBar;
