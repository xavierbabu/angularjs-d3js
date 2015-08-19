'use strict';

// Chart Module
var $app = angular.module('ngCharts', []);

// chart container
$app.controller('chartContainer', [
	'$scope', 'chartFactory',
	function($scope, Charts) {
		// Getting data to display
		Charts.getData()
			.then(function(result, error) {
				if (error) {
					console.log('Unable to Retrieve the data');
				} else if (result.data) {
					$scope.data = result.data;
          $scope.page = 'table';
				}
			});

      // navigating tabs
      $scope.chooseTab = function(tab) {
        $scope.page = tab;
      };
	}
]);

// factory
$app.factory('chartFactory', [
	'$http',
	function(Ajax) {
		var Request = {
			getData: function() {
				return Ajax({method: 'GET', url:'data/stream.json'});
			}
		};

		// factory methods
		return Request;
	}
]);

// Bar Chart Directive
$app.directive('barsChart', function ($parse) {
    return {
			restrict: 'E',
			replace: false,
			scope: {data: '=chartData'},
			link: function (scope, element, attrs) {

      // chart area
      var margin = {top: 20, right: 20, bottom: 30, left: 140},
          width = 5200 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      var xRange = [];
      for(var i=0; i<scope.data.length; i++) {
        xRange.push(i*45);
      }

      // Scales
      var x = d3.scale.ordinal()
          .range(xRange);

      var y = d3.scale.linear()
          .range([height, 0]);

      // Axis
      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")
          .ticks(10);

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")
          .ticks(10);

      // Drawing Chart
      var svg = d3.select(element[0]).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .attr("class", "chart")
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(scope.data.map(function(d, i) { return i; }));
      y.domain([0, d3.max(scope.data, function(d) { return d.cpu_stats.cpu_usage.total_usage; })]);

      // Tooltip
      var tooltip = d3.select(element[0])                               
          .append('div')                                                
          .attr('class', 'tooltip');                                    
                 
        tooltip.append('div')                                           
          .attr('class', 'count');                                      

        tooltip.append('div')                                           
          .attr('class', 'percent'); 

      svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);


      svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Range");

      // Bars Chart
      svg.selectAll(".bar")
            .data(scope.data)
          .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d, i) {return x(i); })
            .attr("width", 30)
            .attr("height", function(d) { return 0; })
            .style('fill', 'steelblue')
            .attr('transform', 'translate(22515, ' + height + ') rotate(-180)')
            .attr("y", function(d) { return y(d.cpu_stats.cpu_usage.total_usage); })
            .on('mouseover', function(d) { // showing tooltip
              tooltip.select('.percent').html(d.cpu_stats.cpu_usage.total_usage);
              tooltip.select('.count').html('UPC Total Usage: ');
              tooltip.style('display', 'block');
            })
            .on('mouseout', function() { // hiding tooltip
              tooltip.style('display', 'none');
            })
            .transition()
              .delay(function(d, i) { return 50;})
              .attr('height', function(d) { return height - y(d.cpu_stats.cpu_usage.total_usage);});

         } 
      };
   });
