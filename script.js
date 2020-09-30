let width = 800,
  height = 400,
  barWidth = width / 275;

  //this is the little box than comes up when you put your mouse
let tooltip = d3
  .select('.visHolder')
  .append('div')
  .attr('id', 'tooltip')
  .style('opacity', 0);
//this is the white bar that covers the blue line your are on
let overlay = d3
  .select('.visHolder')
  .append('div')
  .attr('class', 'overlay')
  .style('opacity', 0);
//this is the main svg container
let svgContainer = d3
  .select('.visHolder')
  .append('svg')
  .attr('width', width + 100)
  .attr('height', height + 60);
//here json will fetch data which it will pass into the function
d3.json(
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json',
  function (data) {
    //adding the text for 'Gross Domestic Product'
    svgContainer
      .append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -200)
      .attr('y', 80)
      .text('Gross Domestic Product');
    //adding text for more info at the bottom
    svgContainer
      .append('text')
      .attr('x', width / 2 + 120)
      .attr('y', height + 50)
      .text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf')
      .attr('class', 'info');
//here item is every is each array with date and gdp
    let years = data.data.map(function (item) {
      let quarter;
      //temp is the month(there are only 4 months so 4 quaters)
      let temp = item[0].substring(5, 7);

      if (temp === '01') {
        quarter = 'Q1';
      } else if (temp === '04') {
        quarter = 'Q2';
      } else if (temp === '07') {
        quarter = 'Q3';
      } else if (temp === '10') {
        quarter = 'Q4';
      }
      // so years returns the date and the quarter
      return item[0].substring(0, 4) + ' ' + quarter;
    });
    //get eah date in the formal format
    let yearsDate = data.data.map(function (item) {
      return new Date(item[0]);
    });
    // xMax is the last date 
    let xMax = new Date(d3.max(yearsDate));
    //not sure about this line adding-removing it doesnt do much
    xMax.setMonth(xMax.getMonth() + 3);
   // scaleTIme() alligns the different dates with a scale of time
   // so domain is the min year from yearsDate (above) and xMax is the maxDate(above)
    let xScale = d3
      .scaleTime()
      .domain([d3.min(yearsDate), xMax])
      .range([0, width]);
//for the bottom xAxis scaled to x
    let xAxis = d3.axisBottom().scale(xScale);
// appending the xAxis to the svgcontainer
//the transform property places it in the bottom center (60 is too push a bit too right, 400 is to be a the bottom)
    svgContainer 
      .append('g')
      .call(xAxis)
      .attr('id', 'x-axis')
      .attr('transform', 'translate(60, 400)');
// gets the gdp of each array
    let GDP = data.data.map(function (item) {
      return item[1];
    });

    let scaledGDP = [];
//max gdp
    let gdpMax = d3.max(GDP);
//linearScale 
    let linearScale = d3.scaleLinear().domain([0, gdpMax]).range([0, height]);

    scaledGDP = GDP.map(function (item) {
      return linearScale(item);
    });
console.log(scaledGDP)
    let yAxisScale = d3.scaleLinear().domain([0, gdpMax]).range([height, 0]);

    let yAxis = d3.axisLeft(yAxisScale);

    svgContainer
      .append('g')
      .call(yAxis)
      .attr('id', 'y-axis')
      .attr('transform', 'translate(60, 0)');

    d3.select('svg')
      .selectAll('rect')
      .data(scaledGDP)
      .enter()
      .append('rect')
      .attr('data-date', function (d, i) {
        return data.data[i][0];
      })
      .attr('data-gdp', function (d, i) {
        return data.data[i][1];
      })
      .attr('class', 'bar')
      .attr('x', function (d, i) {
        return xScale(yearsDate[i]);
      })
      .attr('y', function (d) {
        return height - d;
      })
      .attr('width', barWidth)
      .attr('height', function (d) {
        return d;
      })
      .style('fill', '#33adff')
      .attr('transform', 'translate(60, 0)')
      .on('mouseover', function (d, i) {
        overlay
          .transition()
          .duration(1)
          .style('height', d + 'px')
          .style('width', barWidth + 'px')
          .style('opacity', 0.9)
          .style('left', i * barWidth + 0 + 'px')
          .style('top', height - d + 'px')
          .style('transform', 'translateX(60px)');
        tooltip.transition().duration(200).style('opacity', 0.9);
        tooltip
          .html(
            years[i] +
              '<br>' +
              '$' +
              GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') +
              ' Billion'
          )
          .attr('data-date', data.data[i][0])
          .style('left', i * barWidth + 30 + 'px')
          .style('top', height - 100 + 'px')
          .style('transform', 'translateX(60px)');
      })
      .on('mouseout', function () {
        tooltip.transition().duration(200).style('opacity', 0);
        overlay.transition().duration(200).style('opacity', 0);
      });
  }
);