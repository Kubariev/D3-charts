var chartOneHeight = '300px';
var chartOneWidth = '80%';
var chartTwoHeight = '500px';
var chartTwoWidth = '80%';
var dataChartOne = [
    { key: 'first', value: 16, valueTwo: 18 },
    { key: 'second', value: 17, valueTwo: 11 },
    { key: 'sdadas', value: 9, valueTwo: 12},
    { key: 'second', value: 21, valueTwo: 8 },
    { key: 'st', value: 6, valueTwo: 12},
    { key: 'third', value: 23, valueTwo: 14 }];
var dataChartTwo = {
    "name": "analytics","children": [
        {"name": "cluster","children": [
            {"name": "AgglomerativeCluster", "size": 3938},
            {"name": "CommunityStructure", "size": 3812},
            {"name": "HierarchicalCluster", "size": 671},
            {"name": "MergeEdge", "size": 743}]},
        {"name": "graph","children": [
            {"name": "BetweennessCentrality", "size": 3534},
            {"name": "LinkDistance", "size": 5731},
            {"name": "MaxFlowMinCut", "size": 7840},
            {"name": "ShortestPaths", "size": 5914},
            {"name": "SpanningTree", "size": 3416}]},
        {"name": "optimization","children": [
            {"name": "AspectRatioBanker", "size": 7074}]
        }]};

var hue = d3.scale.category10();
var luminance = d3.scale.sqrt()
    .domain([0, 1e6])
    .clamp(true)
    .range([90, 30]);
var mockedPie = [{
    "startAngle": 0,
    "endAngle": 1.2,
    "label": "label0"
}, {
    "startAngle": 1.2,
    "endAngle": 1.6,
    "label": "label2"
}, {
    "startAngle": 1.6,
    "endAngle": 2.5,
    "label": "label"
}, {
    "startAngle": 2.5,
    "endAngle": 2 * Math.PI,
    "label": "dsda"
}];
var chartOneStateChanged = false;
var chartChangeState = false;
var pickedColor = '#333';
var chackButtonState = function(state, attrTrue, attrFalse, name){
    var attr = chartOneStateChanged ?  attrFalse :  attrTrue;
    document.getElementsByName(name)[0].setAttribute("value", attr);
};

var getRandomColor = function() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color.toLocaleLowerCase();
};

var pickColor = function(color){
    pickedColor = color.toString();
};

var maxArray = function (data, param) {
    return Math.max.apply(Math,data.map(function(object){
        return object[param];
    }));
};

var totalValue = function (data, param) {
    var total = 0;
    data.forEach(function (item) {
        total += item[param];
    });
    return total;
};

function fill(d) {
    var p = d;
    while (p.depth > 1) p = p.parent;
    var c = d3.lab(hue(p.name));
    c.l = luminance(d.value);
    return c;
}

var convertDataBars = function (data , labelKey, valueKey) {
    var resultData = [];
    var maxValue = maxArray(data, valueKey);
    data.forEach(function(item, i){
        var height = item[valueKey]/maxValue*100;
        var width = 85/data.length;
        var positionX = 100/data.length;
        resultData[i] = {
            label: item[labelKey],
            labelX: i * positionX + (width / 2) + '%',
            height: height +'%',
            width: width +'%',
            x: i * positionX + '%',
            y: 85 - height +'%'
        };
    });
    return resultData;
};

var renderPie = function(data, labelKey, valueKey, chartId){
    var windowWidth = $(window).width()*0.8;
    $(chartId + ' svg').html('<g transform="translate(' + windowWidth/2 + ', 150)"></g>');
    var pie = d3.select(chartId + ' svg g');

    var arc = d3.svg.arc()
        .innerRadius(20)
        .outerRadius(parseInt(chartOneHeight)/2/1.2);

    pie.selectAll('path')
        .data(mockedPie)
        .enter()
        .append('path')
        .attr('d',arc)
        .style('fill', function (data,i) {
            return getRandomColor();
        })
        .on('click', function(data, i){
            d3.select(this).style('fill', pickedColor);
        });
};
var renderBars = function(data, labelKey, valueKey, chartId){
    $(chartId + ' svg').html('')
    var chartOne = d3.select(chartId + " svg")
        .attr("width", parseInt(chartOneWidth) + '%')
        .attr("height", parseInt(chartOneHeight) + 'px');
    chartOne.selectAll("rect")
        .data(convertDataBars(data, labelKey, valueKey))
        .enter()
        .append("rect")
        .attr("x", function(data){
            return data.x;
        })
        .attr("y", function(data){
            return data.y;
        })
        .attr("width", function(data){
            return data.width;
        })
        .attr("height", function(data){
            return data.height;
        })
        .attr("fill", function(data){
            return getRandomColor();
        })
        .on('click', function(data, i){
            d3.select(this).style('fill', pickedColor);
        });

    chartOne.selectAll("text")
        .data(convertDataBars(data, labelKey, valueKey))
        .enter()
        .append("text")
        .text(function(data) {
            return data.label;
        })
        .attr("text-anchor", "middle")
        .attr("x", function(data) {
            return data.labelX;
        })
        .attr("y", function(d) {
            return '95%';
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "24px")
        .attr("fill", "#333");
};

var renderPartChart = function(data, chartId){
    var windowWidth = $(window).width()*0.8;
    var svg = d3.select("#chartTwo").append("svg")
        .attr("width", parseInt(chartTwoWidth) + '%')
        .attr("height", parseInt(chartTwoHeight) + 'px')
        .append("g")
        .attr("id", "container")
        .attr("transform", "translate(" + windowWidth / 2 + "," + parseInt(chartTwoHeight) / 2 + ")");

    var part = d3.layout.partition()
        .size([2 * Math.PI, parseInt(chartTwoHeight) * parseInt(chartTwoHeight)])
        .value(function (data) {
            return data.size;
        });

    var fish = d3.fisheye.circular()
        .radius(parseInt(chartTwoHeight)/2)
        .distortion(2);

    var arc = d3.svg.arc()
        .startAngle(function (d) {return d.x;})
        .endAngle(function (d) { return d.x + d.dx - 0.01 / (d.depth + 0.5); })
        .innerRadius(function (d) {
            return parseInt(chartTwoHeight) / 2 / 5 * d.depth;
        })
        .outerRadius(function (d) {
            return parseInt(chartTwoHeight) / 2 / 5 * (d.depth + 1) - 1;
        });
    svg.append("circle")
        .attr("r", parseInt(chartTwoHeight) / 2)
        .style("opacity", 0);

    var node = part.nodes(dataChartTwo)
        .filter(function (d) {
            return (d.dx > 0.005);
        });

    var path = svg.data([dataChartTwo]).selectAll("path")
        .data(node)
        .enter().append("path")
        .attr("display", function (d) {
            return d.depth ? null : "none";
        })
        .attr("d", arc)
        .attr("fill-rule", "evenodd")
        .style("fill", function (d) {
            return fill(d);
        })
        .style("opacity", 1);
    svg.on("mousemove", function() {
        fish.focus(d3.mouse(this));
    });
};

var init = function() {
    pickedColor = getRandomColor();
    chackButtonState(chartOneStateChanged, "Switch to second value", "Switch to firts value", "updateButton");
    renderBars(dataChartOne, "key", "value" ,"#chartOne");
    renderPartChart(dataChartTwo,"#chartTwo");
};

function updateData(data, labelKey, valueKey, valueKeyTwo, chartId) {
    var val = chartOneStateChanged ?  valueKey :  valueKeyTwo;
    chartOneStateChanged = !chartOneStateChanged;
    chackButtonState(chartOneStateChanged, "Switch to second value", "Switch to firts value", "updateButton");
    var chart = d3.select(chartId + " svg");

    chart.selectAll("rect")
        .data(convertDataBars(data, labelKey, val))
        .transition()
        .duration(1000)
        .attr("x", function(data){
            return data.x;
        })
        .attr("y", function(data){
            return data.y;
        })
        .attr("width", function(data){
            return data.width;
        })
        .attr("height", function(data){
            return data.height;
        });
}
function changeGraph (){
    if (!chartChangeState) {
        renderPie(dataChartOne, 'key', 'value' ,'#chartOne');
        $('#changeData').css('display','none');
    }else{
        renderBars(dataChartOne, "key", "value" ,"#chartOne");
        $('#changeData').css('display','inline');
    };
    chartChangeState = !chartChangeState;
}
$(window).resize(function() {
    var windowWidth = $(window).width()*0.8;
    $('#chartOne g').attr('transform','translate(' + parseInt(windowWidth)/2 + ', 150)');
    $('#chartTwo g').attr('transform','translate(' + parseInt(windowWidth)/2 + ', 150)');
});

init();
