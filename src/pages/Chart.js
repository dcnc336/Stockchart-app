import React from "react";

import { ChartCanvas, Chart } from "react-stockcharts";
import PropTypes from "prop-types";
import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { OHLCTooltip, SingleValueTooltip } from "react-stockcharts/lib/tooltip";
import {
	CrossHairCursor,
	EdgeIndicator,
	MouseCoordinateX,
	MouseCoordinateY,
} from "react-stockcharts/lib/coordinates";

import {
	SARSeries,
	CandlestickSeries,
    BarSeries,
} from "react-stockcharts/lib/series";
import { change, elderRay } from "react-stockcharts/lib/indicator";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import { fitWidth } from "react-stockcharts/lib/helper";

import { last  } from "react-stockcharts/lib/utils";

const candlesAppearance = {
    wickStroke: "#000000",
    fill: function fill(d) {
      return d.close > d.open ? "#15cd0b" : "#f11818";
    },
    stroke: "#000000",
    candleStrokeWidth: 1,
    widthRatio: 0.8,
    opacity: 1,
}

// const linesAppearance = {
//     wickStroke: "#000000",
//     fill: function fill(d) {
//       return d.close > d.open ? "#15cd0b" : "#f11818";
//     },
//     stroke: "#000000",
//     candleStrokeWidth: 1,
//     widthRatio: 0.8,
//     opacity: 1,
// }


class ChartPage extends React.Component {
    render(){
        const { type, width, initialData } = this.props;
        const elder = elderRay();
        const changeCalculator = change();
        const calculatedData = changeCalculator(elder(initialData));
        const accelerationFactor = .02;
        const maxAccelerationFactor = .2;
        const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(d => d.date);
        const {
            data,
            xScale,
            xAccessor,
            displayXAccessor,
        } = xScaleProvider(calculatedData);
        console.log(data);
        const xExtents = [
            xAccessor(last(data)),
            xAccessor(data[0])
        ];
    
        return (
            <>
                <ChartCanvas height={700}
                    ratio={1}
                    width={width-40}
                    margin={{ left: 50, right: 50, top: 10, bottom: 30 }}
                    type={type}
                    seriesName="MSFT"
                    data={data}
                    xScale={xScale}
                    xAccessor={xAccessor}
                    displayXAccessor={displayXAccessor}
                    xExtents={xExtents}
                >
        
                    <Chart 
                        id={1} yExtents={d => [d.high, d.low]}
                        origin={(w,h) => [0,h-700]}
                        height={500}
                    >
                        <YAxis axisAt="left" orient="left" ticks={5} />
                        <CandlestickSeries {...candlesAppearance}/>
                        <EdgeIndicator itemType="last" orient="right" edgeAt="right"
                            yAccessor={d => d.close} fill={d => d.close > d.open ? "#6BA583" : "#FF0000"}/>

                        <SARSeries yAccessor={d => d.sar}/>
                        <MouseCoordinateY
                            at="right"
                            orient="right"
                            displayFormat={format(".2f")} />
                        <OHLCTooltip origin={[-40, 0]}/>
                        <SingleValueTooltip
                            yLabel={`SAR (${accelerationFactor}, ${maxAccelerationFactor})`}
                            origin={[-40, 20]}/>
                    </Chart>
                    <CrossHairCursor />
                    <Chart 
                        id={2} 
                        yExtents={[0, d => d.returns]}
                        origin={(w,h) => [0,h-200]}
                        height={200}
                    >
                        <XAxis axisAt="bottom" orient="bottom"/>
                        <YAxis axisAt="right" orient="right" ticks={5} />
                        <BarSeries
                            yAccessor={d => d.returns}
                            baseAt={(xScale, yScale, d) => yScale(0)}
						    fill={d => d.states == 0? "#bd35f3": (d.states==1? "#2df5ed" : (d.states == 2? "#f1f52d": '#ff7a19'))}
                        />
                        <MouseCoordinateX
                            at="bottom"
                            orient="bottom"
                            displayFormat={timeFormat("%Y-%m-%d")} />
                        <MouseCoordinateY
                            at="right"
                            orient="right"
                            displayFormat={format(".2f")} />
                        <SingleValueTooltip
                            yLabel={`SAR (${accelerationFactor}, ${maxAccelerationFactor})`}
                            origin={[-40, 20]}/>
                    </Chart>
                    <CrossHairCursor />
                </ChartCanvas>
            </>
        );
    }
}

ChartPage.defaultProps = {
	type: "svg",
};

ChartPage.propTypes = {
	initialData: PropTypes.array.isRequired,
	width: PropTypes.number.isRequired,
	type: PropTypes.oneOf(["svg", "hybrid"]).isRequired,
};

ChartPage = fitWidth(ChartPage);

export default ChartPage;
