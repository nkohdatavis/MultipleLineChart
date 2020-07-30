// import { 
//   select, 
//   csv, 
//   scaleLinear, 
//   scaleTime,
//   extent, 
//   axisLeft,
//   axisBottom,
//   line,
//   curveBasis,
//   nest,
//   schemeCategory10,
//   scaleOrdinal
//   descending
// } from "https://unpkg.com/d3@5.7.0/dist/d3.min.js"; 

// import { dropdownMenu } from './dropdownMenu.js';
// import { scatterPlot } from './scatterPlot.js';
import { colorLegend } from './colorLegend.js';

const svg = d3.select('svg');

const width = +svg.attr('width');
const height = +svg.attr('height');

//accessor functions
const render = data => {
  const title = 'A Week of Temperature Around the World';

  const xValue = d => d.timestamp;
  const xAxisLabel = 'Time';

  const yValue = d => d.temperature;
  const yAxisLabel = 'Temperature';
  const circleRadius = 6;

  const colorValue = d => d.city;


  const margin = { top: 60, right: 160, bottom: 88, left: 105 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = d3.scaleTime()
    .domain(d3.extent(data, xValue))
    .range([0, innerWidth])
    .nice();

  // console.log(xScale.domain());
  // console.log(xScale.range());

  const yScale = d3.scaleLinear()
    .domain(d3.extent(data, yValue))
    .range([innerHeight, 0])
    .nice();

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  // console.log(yScale.domain());
  // console.log(yScale.range());

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const xAxis = d3.axisBottom(xScale)
    .tickSize(-innerHeight)
    .tickPadding(15);

  const yAxis = d3.axisLeft(yScale)
    .tickSize(-innerWidth)
    .tickPadding(10);

  const yAxisG = g.append('g').call(yAxis);

  yAxisG.selectAll('.domain').remove();

  yAxisG.append('text')
    .attr('class', 'axis-label')
    .attr('y', -60)
    .attr('x', -innerHeight / 2)
    .attr('fill', 'black')
    .attr('transform', `rotate(-90)`)
    .attr('text-anchor', 'middle')
    .text(yAxisLabel);

  const xAxisG = g.append('g').call(xAxis)
    .attr('transform', `translate(0,${innerHeight})`);

  xAxisG.select('.domain').remove();

  xAxisG.append('text')
    .attr('class', 'axis-label')
    .attr('y', 75)
    .attr('x', innerWidth / 2)
    .attr('fill', 'black')
    .text(xAxisLabel);

  const lineGenerator = d3.line()
    .x(d => xScale(xValue(d)))
    .y(d => yScale(yValue(d)))
    .curve(d3.curveBasis);

  // console.log(data);
  //  y value of the last entry in array
  const lastYValue = d =>
    yValue(d.values[d.values.length - 1]);


  //single line for each city
  // split array into multiple arrays
  const nested = d3.nest()
    .key(colorValue)
    .entries(data)
    .sort((a, b) =>
      d3.descending(lastYValue(a), lastYValue(b))
    );

  // console.log(nested);

  //isolated the last point in time index 168






  colorScale.domain(nested.map(d => d.key));


  //multiple path elements using data join
  g.selectAll('.line-path').data(nested)
    .enter().append('path')
    .attr('class', 'line-path')
    //d has key and values
    .attr('d', d => lineGenerator(d.values))
    //key is the city name
    .attr('stroke', d => colorScale(d.key));
  // g.append('path')
  //   .attr('class', 'line-path')
  //   .attr('d', lineGenerator(data));

  //bandwidth compute width of a single bar
  // 	g.selectAll('circle').data(data)
  //   	.enter().append('circle')
  //   		.attr('cy', d => yScale(yValue(d)))
  //   		.attr('cx', d => xScale(xValue(d)))
  //   		.attr('r', circleRadius);

  g.append('text')
    .attr('class', 'title')
    .attr('y', -10)
    .text(title);

  svg.append('g')
    .attr('transform', `translate(790,121)`)
    .call(colorLegend, {
      colorScale,
      circleRadius: 13,
      spacing: 30,
      textOffset: 14
    });
};

//Data Table
d3.csv('https://vizhub.com/curran/datasets/data-canvas-sense-your-city-one-week.csv')
  .then(data => {
    data.forEach(d => {
      d.temperature = +d.temperature;
      d.timestamp = new Date(d.timestamp);
    });
    render(data);
  });