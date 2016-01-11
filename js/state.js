/**
 * Copyright reelyActive 2015
 * We believe in an open Internet of Things
 */


/* --- GENERAL --- */


  // Parameters
  REFRESH_SECONDS = 1; // Polling rate and refresh display rate.
  WHEREIS_QUERY = '/whereis/transmitter/'; // Specifying the query.
  WHATAT_QUERY = '/whatat/receiver/'; // Specifying the query.
  COLORS_ARRAY = ['#0770a2',
                          '#ff6900',
                          '#aec844',
                          '#5a5a5a',
                          '#ffc712'];

  // User default values
  DEFAULT_API_ROOT = 'http://www.hyperlocalcontext.com';
  DEFAULT_SOCKET_URL = DEFAULT_API_ROOT + '/reelyactive';
  DEFAULT_MIN_RSSI = 0;
  DEFAULT_MAX_RSSI = 200;
  DEFAULT_MAX_SAMPLES = 10;

  // Misc
  cCOlOR_TRANSMITTER = 0;
  cCOlOR_LOCATION = 0;

/* --- TRANSMITTER --- */

  // Parameters
  TRANSMITTER_CANVAS_W = 1000;
  TRANSMITTER_CANVAS_H = 500;

  // User default values
  DEFAULT_TRANSMITTER_ID = '1005ecab005e';


/* --- RECEIVER --- */

  // Parameters
  RECEIVER_CANVAS_W = 1000;
  RECEIVER_CANVAS_H = 350;
  RECEIVER_PADDING = 30;
  RECEIVER_BARSW = 10; // Pixels for the bars side.
  RECEIVER_BARS_TRANSMITTERS = 3; // Number of bars per transmitter.
  RECEIVER_BARS_SPACE = 2; // Pixels between bars.
  RECEIVER_TRANSMITTER_SPACE = 3; // Pixels between transmitters.

  // User default values
  DEFAULT_RECEIVER_ID = '001bc50940810013';
  DEFAULT_MAX_TRANSMITTERS = 20; // Each transnmitter is adding 30 pixels to the svg canvas.
  
/* --- EVENT --- */

  // Parameters
  MAX_NUMBER_OF_EVENTS = 10;

  // User default values

/* --- Location --- */

  // Parameters
  PATH_LOSS_EXPONENT = 2;
  LINEAR_FACTOR = 0.1; 
  LOCATION_SIDE = 800; // Number of pixels for one side of the SVG canvas.
  MINIMUM_CIRCLE_SIZE = 7;
  SCALE_WIDTH = 10;
  // User default values
  DEFAULT_SCALE = 'home'
  DEFAULT_LOCATION_MAXRSSI = 185;
  DEFAULT_LOCATION_MINRSSI = 100;
  DEFAULT_CELL_SIDE = 40;
  DEFAULT_LOCATION_ID = '1005ecab005e';
  DEFAULT_FREQUENCY = 2400;
  DEFAULT_MERGER = 'global';



 
 
angular.module('state', [ 'ui.bootstrap', 'btford.socket-io' ])
 
  // ----- Interaction controller -----
  .controller("InteractionCtrl", function($scope) {

    $scope.tabs = [ { active: true }, { active: false }, { active: false }, { active: false } ];

    $scope.transmitterConnectivity = true;
    $scope.setTransmitterConnectivity = function(isConnected) {$scope.transmitterConnectivity = isConnected;}

    $scope.receiverConnectivity = true;
    $scope.setReceiverConnectivity = function(isConnected) {$scope.receiverConnectivity = isConnected;}
    
    $scope.eventConnectivity = true;
    $scope.setEventConnectivity = function(isConnected) {$scope.eventConnectivity = isConnected;}

    $scope.locationConnectivity = true;
    $scope.setLocationConnectivity = function(isConnected) {$scope.locationConnectivity = isConnected;}

    $scope.transmitterId = DEFAULT_TRANSMITTER_ID;
    $scope.updateTransmitter = false; // When the value changes, the transmitter updates.
    $scope.getUpdateTransmitter = function() {return $scope.updateTransmitter;}

    $scope.receiverId = DEFAULT_RECEIVER_ID;
    $scope.updateReceiver = false; // When the value changes, the receiver updates.
    $scope.getUpdateReceiver = function() {return $scope.updateReceiver;}
    

    $scope.goToTransmitterTab = function(newTransmitterId) {
      $scope.transmitterId = newTransmitterId; // Update the receiverId.
      $scope.tabs[1].active = false;
      $scope.tabs[0].active = true;
      $scope.updateTransmitter = !$scope.updateTransmitter; // Makes transmitter controller update.
      console.log('Following the transmitter!');
    }

    $scope.goToReceiverTab = function(newReceiverId) {
      $scope.receiverId = newReceiverId; // Update the receiverId.
      $scope.tabs[0].active = false;
      $scope.tabs[1].active = true;
      $scope.updateReceiver = !$scope.updateReceiver; // Makes receiver controller update.
      console.log('Following the receiver!');
    }

  })
 
 
  // ----- Socket.io factory -----
  .factory('Socket', function(socketFactory) {
    return socketFactory( { ioSocket: io.connect(DEFAULT_SOCKET_URL) } );
  })
 
 
  // ----- Socket.io controller -----
  .controller('SocketCtrl', function($scope, Socket) {
    $scope.isEventsSettingsCollapsed = true;
    $scope.socket = { url: DEFAULT_SOCKET_URL,
                      appearances: 0,
                      displacements: 0,
                      disappearances: 0,
                      keepalives: 0 };
    $scope.events = [];
 
    Socket.on('appearance', function(event) {
      $scope.socket.appearances++;
      event.type = 'appearance';
      addEvent(event);
    });
    Socket.on('displacement', function(event) {
      $scope.socket.displacements++;
      event.type = 'displacement';
      addEvent(event);
    });
    Socket.on('disappearance', function(event) {
      $scope.socket.disappearances++;
      event.type = 'disappearance';
      addEvent(event);
    });
    Socket.on('keep-alive', function(event) {
      $scope.socket.keepalives++;
      event.type = 'keep-alive';
      addEvent(event);
    });
    Socket.on('error', function(err, data) {
      console.log('Socket Error: ' + err + ' - ' + data);
    });
 
    function addEvent(event) {
      $scope.events.push(event);
      if($scope.events.length > MAX_NUMBER_OF_EVENTS) {
        $scope.events.shift();
      }
    }
  })
 
 
  // ----- Transmitter Samples service -----
  .service('transmitterSamples', function($http, $interval) {

    var samples;
    var url = null;
    var isConnected = true;
 
    poll();
 
    function poll(callback) {
      if(!url) {
        return;
      }
      $http.defaults.headers.common.Accept = 'application/json';

      $http.get(url)
        .success(function(data, status, headers, config) {
          var sample = data.devices;
          samples = sample;
          isConnected = true;
        })
        .error(function(data, status, headers, config) {
          isConnected = false;
          console.log('Error polling ' + url);
        });
    }

    $interval(poll, REFRESH_SECONDS * 1000);
 
    return {
      getConnectionStatus: function() {return isConnected;},
      getLatest: function() { return samples; },
      setUrl: function(newUrl) { url = newUrl; }
    };
  })
 
 
  // ----- Chart controller (Transmitter) -----
  .controller('ChartCtrl', [ '$scope', '$interval', 'transmitterSamples',
                             function($scope, $interval, transmitterSamples) {
    // Context
    $scope.apiRoot = DEFAULT_API_ROOT;

    // Data
    $scope.rssiSamples = {}; // This is the data passed to the directive.
    $scope.rssiSeconds = 0;
      
    // Meta-Data
    $scope.receivers = {};
    $scope.numReceivers = 0;
    $scope.interpolate = 'basis';

    // Misc
    $scope.isTransmitterSettingsCollapsed = true;

    // Accessible to the User. Display preferences.
    $scope.isDiscovering = true;
    $scope.minRSSI = DEFAULT_MIN_RSSI;
    $scope.maxRSSI = DEFAULT_MAX_RSSI;
    $scope.isPaused = false;
    $scope.maxNumberOfSamplesAccessible = DEFAULT_MAX_SAMPLES;
    $scope.maxNumberOfSamples = DEFAULT_MAX_SAMPLES;
    $scope.updateChart = true; // Each time this value changes, the chart is being updated.
    
    // Watching when we are switching to the transmitter tab from another tab.
    $scope.$watch($scope.getUpdateTransmitter, function() { 
      $scope.updateFromUser();
      console.log("Displaying the new transmitter!");
    });


    
    // User updates settings
    $scope.updateFromUser = function () {

      $scope.updateChart = !$scope.updateChart; // Tricking the directive to update.
      transmitterSamples.setUrl($scope.apiRoot + WHEREIS_QUERY + $scope.transmitterId);
      $scope.maxNumberOfSamples = $scope.maxNumberOfSamplesAccessible;

      // Resetting the model.
      $scope.rssiSamples = {};
      $scope.receivers = {};
      $scope.numReceivers = 0;
      $scope.rssiSeconds = 0;
    }

    // Poll the Transmitter Samples service and then update the data.
    $interval(updateFromService , REFRESH_SECONDS * 1000);

    // Updating the data.
    function updateFromService() {


        $scope.setTransmitterConnectivity(transmitterSamples.getConnectionStatus()); // Displaying whether we are connected.

        if(!$scope.isPaused) { // If not on paused, update latest attribute.

        var sample = transmitterSamples.getLatest(); // Using the service to get most recent data.

        if(sample && sample[$scope.transmitterId]) { // Checking data integrity.
          if($scope.isDiscovering) { 
            updateReceivers(sample); // Update the receivers if on discovery mode.
          }
          updateRssiArray(sample); // Update the data.
          $scope.rssiSeconds += REFRESH_SECONDS; // Refresh the time.
        }

        
        for(var receiverTemp in $scope.receivers) {
          var indexOfLatest = $scope.rssiSamples[receiverTemp].length - 1;
          $scope.receivers[receiverTemp].latest = $scope.rssiSamples[receiverTemp][indexOfLatest].rssi;
        }
      }

      // Update the array of receivers
      function updateReceivers(sample) {
        for(var cRadio = 0;
            cRadio <  sample[$scope.transmitterId].radioDecodings.length;
            cRadio++) {
          var receiverTemp = sample[$scope.transmitterId].radioDecodings[cRadio].identifier.value;
          if(!(receiverTemp in $scope.receivers)) {
            var colorTemp = COLORS_ARRAY[cCOlOR_TRANSMITTER++ % COLORS_ARRAY.length];
            $scope.receivers[receiverTemp] = { color: colorTemp, isDrawn: false, isDisplayed: true, latest: 0, receiverId: receiverTemp };
          }
        }
      }

      // Update the array of RSSI samples
      function updateRssiArray(sample) {
        for(var receiverTemp in $scope.receivers) {
          var updated = false;
          var seconds = $scope.rssiSeconds;
   
          // Try to update the rssi corresponding to the receiver.
          for(var cRadio = 0;
              cRadio < sample[$scope.transmitterId].radioDecodings.length;
              cRadio++) {
            if(sample[$scope.transmitterId].radioDecodings[cRadio].identifier.value === receiverTemp) {
              var rssi = sample[$scope.transmitterId].radioDecodings[cRadio].rssi;
   
              if($scope.rssiSamples[receiverTemp]) {
                $scope.rssiSamples[receiverTemp].push({ seconds: seconds,
                                                        rssi: rssi });
              }
              else {
                $scope.rssiSamples[receiverTemp] = [];
                $scope.rssiSamples[receiverTemp].push({ seconds: seconds,
                                                        rssi: rssi });
              }
   
              updated = true; 
              break;
            }
          }
            
          // If it failed to be updated, push 0 as default.
          if(!updated) {
            if($scope.rssiSamples[receiverTemp]) {
              $scope.rssiSamples[receiverTemp].push({ seconds: seconds,
                                                      rssi: 0 });
            }
            else {
              $scope.rssiSamples[receiverTemp] = [];
              $scope.rssiSamples[receiverTemp].push({ seconds: seconds,
                                                      rssi: 0 });
            }
          }
   
          // If it has reached the maximum number of samples, drop the oldest one.
          if($scope.rssiSamples[receiverTemp].length > $scope.maxNumberOfSamples) {
            $scope.rssiSamples[receiverTemp].shift();
          }
        }   
      }
    }

  }])
 
 
  // ----- Linear Chart directive (Transmitter) ------
  .directive('linearChart',  function($parse, $window) {
    return {
      restrict: "EA",
      template: "<svg width='" + TRANSMITTER_CANVAS_W + "' height='" + TRANSMITTER_CANVAS_H+ "'></svg>",
      link:
        function(scope, elem, attrs) {

          var chartDataExp = $parse(attrs.chartData); // Getting a data accesor from the controller.
          var updateChartExp = $parse(attrs.updateChart); // Used to communicate "update" to the directive.
 
          var dataToPlot = chartDataExp(scope); // Getting the data.

          // Parameters
          var padding = 40;
          var canvasH = TRANSMITTER_CANVAS_H;
          var canvasW = TRANSMITTER_CANVAS_W;

          // Scales and axis.
          var xScale; // Dynamic
          var yScale, xAxisGen, yAxisGen, lineFun; // Static

          // SVG canvas.
          var d3 = $window.d3;
          var rawSvg = elem.find('svg');
          var svg = d3.select(rawSvg[0]);
          
          initChart();
 
          // Update coming from the service. Affecting dynamic content.
          scope.$watch(chartDataExp, function(newVal, oldVal) {

            dataToPlot = newVal; // Updating the data that needs to be plotted.

            if(!scope.isPaused) { // If not paused, dynamically update chart and drawings.
              dynamicUpdateChart();
            }

          }, true);
 
          // Update coming from the user. Affecting static content.
          scope.$watch(updateChartExp, function(newVal, oldVal) {

            staticUpDateChart();
            lineFun.interpolate(scope.interpolate);

          }, true);
 
          // Initialise the chart (only required once).
          function initChart() {
            xScale = d3.scale.linear()
              .domain([0,1])
              .range([padding, canvasW - padding]);
 
            yScale = d3.scale.linear()
              .domain([scope.minRSSI, scope.maxRSSI])
              .range([canvasH - padding, padding]);
 
            xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(1);
 
            yAxisGen = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .ticks(8);
 
            lineFun = d3.svg.line()
              .x(function(d) { return xScale(d.seconds); })
              .y(function(d) { return yScale(d.rssi); })
              .interpolate("basis");
 
            svg.append("svg:g")
              .attr("class", "x axis")
              .attr("transform", "translate(0, " + (canvasH - padding) + ")")
              .call(xAxisGen);
 
            svg.append("svg:g")
              .attr("class", "y axis")
              .attr("transform", "translate(" + padding + ",0)")
              .call(yAxisGen);
 
          }
            
          // Update the static content of the chart
          function staticUpDateChart() {

            svg.selectAll("*").remove(); // Erase previous svg
 
            yScale = d3.scale.linear()
              .domain([scope.minRSSI, scope.maxRSSI])
              .range([canvasH - padding , padding]);
 
            yAxisGen = d3.svg.axis()
              .scale(yScale)
              .orient("left")
              .ticks(8);
 
            xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(Math.min(scope.maxNumberOfSamples, scope.rssiSeconds) - 1);
            
            svg.append("svg:g")
              .attr("class", "x axis")
              .attr("transform", "translate(0, " + (canvasH - padding) + ")")
              .call(xAxisGen);
 
            svg.append("svg:g")
              .attr("class", "y axis")
              .attr("transform", "translate(" + padding + ",0)")
              .call(yAxisGen);
          }  
 
          // Update the dynamic content of the chart
          function dynamicUpdateChart() {
            var beginDomain = Math.max(1, scope.rssiSeconds - scope.maxNumberOfSamples);
            var endDomain = Math.max(1, scope.rssiSeconds - 1);
 
            xScale = d3.scale.linear()
              .domain([beginDomain,endDomain])
              .range([padding, canvasW - padding]);
 
            xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(Math.min(scope.maxNumberOfSamples, scope.rssiSeconds) - 1);
 
            svg.selectAll("g.x.axis").call(xAxisGen);

            dynamicDrawReceivers();

                      // Plot each receiver line
            function dynamicDrawReceivers() {
              for(var receiverTemp in scope.receivers) {
                var isDisplayed = scope.receivers[receiverTemp].isDisplayed;
                var color = scope.receivers[receiverTemp].color;
                var isDrawn = scope.receivers[receiverTemp].isDrawn;
   
                if(isDisplayed) {
                  if(isDrawn) { //If already drawn, then we just update the data.
                    svg.selectAll("." + 'path_' + receiverTemp)
                      .attr({ d: lineFun(dataToPlot[receiverTemp]) }); 
                  }
                  else { // If not drawn, then we draw it.
                    svg.append("svg:path")
                      .attr({
                        d: lineFun(dataToPlot[receiverTemp]),
                        "stroke": color,
                        "stroke-width": 2,
                        "fill": "none",
                        "class": 'path_' + receiverTemp
                      });
                    scope.receivers[receiverTemp].isDrawn = true;
                  }
                }
                else {
                  if(isDrawn) { // If not displayed, then we need to remove the drawn receivers.
                    svg.selectAll("." + 'path_' + receiverTemp).remove();
                    scope.receivers[receiverTemp].isDrawn = false;
                  }
                }
              }
            }


          }
 

        }
    }
  })


  // ----- Receiver Samples service -----
  .service('receiverSamples', function($http, $interval) {
    var samples;
    var url = null;
    var isConnected = true;
 
    poll();
 
    function poll() {
      if(!url) {
        return;
      }
      $http.defaults.headers.common.Accept = 'application/json';
      $http.get(url)
        .success(function(data, status, headers, config) {
          var sample = data.devices;
          samples = sample;
          isConnected = true;
        })
        .error(function(data, status, headers, config) {
          isConnected = false;
          console.log('Error polling ' + url);
        });
    }
    $interval(poll, REFRESH_SECONDS * 1000);
 
    return {
      getConnectionStatus: function() {return isConnected;},
      getLatest: function() { return samples; },
      setUrl: function(newUrl) { url = newUrl; }
    };
  })
 

  // ----- Bar controller (Receiver) -----
  .controller('BarCtrl', [ '$scope', '$interval', 'receiverSamples', 
                           function($scope, $interval, receiverSamples) {
    // Context
    $scope.apiRoot = DEFAULT_API_ROOT;

    // Data
    $scope.rssiSamples = {};
    $scope.displayData = {}; // Data passed to the directive.

    // Meta-Data
    $scope.transmitters = {};
    $scope.numTransmitters = 0;
 
    // Misc
    $scope.isReceiverSettingsCollapsed = true;

    // Accessible to the User. Display preference.
    $scope.isDiscovering = true;
    $scope.isPaused = false;

    $scope.maxNumberOfTransmittersAccessible = DEFAULT_MAX_TRANSMITTERS;
    $scope.maxNumberOfTransmitters = DEFAULT_MAX_TRANSMITTERS;
    $scope.maxNumberOfSamplesAccessible = DEFAULT_MAX_SAMPLES;
    $scope.maxNumberOfSamples = DEFAULT_MAX_SAMPLES;

    $scope.updateChart = true; // Each time this value changes, the chart is being updated.       


    // Handling the transition to the receiverTab.
    $scope.$watch($scope.getUpdateReceiver, function() { 
      $scope.updateFromUser();
    });

    // User updates settings
    $scope.updateFromUser = function() {

      $scope.updateChart = !$scope.updateChart; // Tricks the directory to update.
      receiverSamples.setUrl($scope.apiRoot + WHATAT_QUERY + $scope.receiverId);
      $scope.rssiSamples = {};
      $scope.displayData = {};
      $scope.transmitters = {};
      $scope.numTransmitters = 0;
      $scope.maxNumberOfSamples = $scope.maxNumberOfSamplesAccessible;
      $scope.maxNumberOfTransmitters = $scope.maxNumberOfTransmittersAccessible;
    }


    // Poll the Receiver Samples service for the latest data.
    $interval(updateFromService , REFRESH_SECONDS * 1000);

    // Update the data.
    function updateFromService() {

      if(!$scope.isPaused) {
        var sample = receiverSamples.getLatest(); // Getting the latest data.
        $scope.setReceiverConnectivity(receiverSamples.getConnectionStatus()); // Displaying whether we are connected.

        // Updating transmitters.
        if($scope.isDiscovering && ($scope.numTransmitters <= $scope.maxNumberOfTransmitters)) { // Conditionning on max transmitters and discovery mode.
          updateTransmitters(sample); // Update transmitters.
        }

        updateRssiSamples(sample); // Updating the rssi.
        updateDisplayData(); // Updating and processing the data passed to the directive.
      }

      // Update the array of transmitters.
      function updateTransmitters(sample) {
        for(var transmitterTemp in sample) {
          if(!(transmitterTemp in $scope.transmitters) && ($scope.numTransmitters < $scope.maxNumberOfTransmitters)) {
            $scope.transmitters[transmitterTemp]; // Adding new transmitters as they come.
            $scope.transmitters[transmitterTemp] = { value : transmitterTemp};
            $scope.numTransmitters++; // Incrementing the number of receivers.
          }
        }
      }

      // Update the array of RSSI samples.
      function updateRssiSamples(sample) {
        for(var transmitterTemp in $scope.transmitters) {
          if(!(transmitterTemp in $scope.rssiSamples)) {
            $scope.rssiSamples[transmitterTemp];
            $scope.rssiSamples[transmitterTemp] = [];
          }
          if(sample[transmitterTemp]) {
            for(var cRadio = 0;
                cRadio < sample[transmitterTemp].radioDecodings.length;
                cRadio++) {
              var radioDecodingReceiver = sample[transmitterTemp].radioDecodings[cRadio].identifier.value;
              if(radioDecodingReceiver === $scope.receiverId) {
                var rssi = sample[transmitterTemp].radioDecodings[cRadio].rssi;
                $scope.rssiSamples[transmitterTemp].push(rssi);
                updated = true;
                break;
              }
            }
          }
          else {
            $scope.rssiSamples[transmitterTemp].push(0);
          }
          if($scope.rssiSamples[transmitterTemp].length > $scope.maxNumberOfSamples) {
            $scope.rssiSamples[transmitterTemp].shift();
          }
        }
      }


      // Compute the instability index.
      function computeInstability(transmitterTemp) {

        var sum = 0;
        var num = 0;

        if($scope.rssiSamples[transmitterTemp].length < 2) { // If there isn't enough data to compute it.
          return 0;
        }

        for(var cRadio = 0; cRadio < $scope.rssiSamples[transmitterTemp].length - 1; cRadio++) {
          sum = sum + Math.abs($scope.rssiSamples[transmitterTemp][cRadio] - $scope.rssiSamples[transmitterTemp][cRadio + 1]);
          num++;
        }


        return Math.round(sum/num);

      }

      // Compute the average value of the RSSI samples.
      function computeAverage(transmitterTemp) {
        var sum = 0;
        var num = 0;
        for(var cRadio = 0; cRadio < $scope.rssiSamples[transmitterTemp].length; cRadio++) {
          sum = sum + $scope.rssiSamples[transmitterTemp][cRadio];
          num++;
        }
        return Math.round(sum/num);
      }

      // Update the displayed values.
      function updateDisplayData() {

        for(var transmitterTemp in $scope.transmitters) {

          if(!(transmitterTemp in $scope.displayData)) { 
            $scope.displayData[transmitterTemp]; // If new transmitter, creating its key.
          }

          var averageTemp = computeAverage(transmitterTemp);
          var mostRecentTemp = $scope.rssiSamples[transmitterTemp][$scope.rssiSamples[transmitterTemp].length -1 ];
          var instabilityTemp = computeInstability(transmitterTemp);
          $scope.displayData[transmitterTemp] = { average: averageTemp,
                                                  latest: mostRecentTemp,
                                                  transmitter: transmitterTemp,
                                                  instability : instabilityTemp
                                                };
        }
      }
    }

  }])
 
  // ----- Bar Chart directive (Receiver) -----
  .directive('barChart',  function($parse, $window) {
    return {
      restrict: "EA",
      template: "<svg width='" + RECEIVER_CANVAS_W  + "' height='" + RECEIVER_CANVAS_H  + "'></svg>",
      link:
        function(scope, elem, attrs) {

          var chartDataExp = $parse(attrs.chartData); // Getting an accessor to the data.
          var updateChartExp = $parse(attrs.updateChart); // Tells the chart to update.

          var dataToPlot = chartDataExp(scope); // Extracting the data.

          var sortedData = []; // The recepient for the data that will actually be displayed.


          // Display parameters (constant).
          var canvasH = RECEIVER_CANVAS_H;
          var canvasW = RECEIVER_CANVAS_W;

          var barsW = 10;
          var numBarsPerTransmitter = 3;
          var spaceBetweenBarsPerTransmitter = 2;
          var spaceBetweenTransmitters = 3;

          var pixelsPerTransmitter = (barsW + spaceBetweenTransmitters) * numBarsPerTransmitter + spaceBetweenTransmitters;


          var labelW = 150;
          var padding = RECEIVER_PADDING;


          // Scales and Axis.
          var xAxis, xScale, yScale, xAxisGen, yAxisGen;
          var xAxisW = canvasW - labelW - padding;
          var xAxisY = canvasH - padding;



          // SVG canvas.
          var d3 = $window.d3;
          var rawSvg = elem.find('svg');
          var svg = d3.select(rawSvg[0]);



          initChart(); // Called once.
 

          // Update coming from the service. Affecting dynamic content.
          scope.$watch(chartDataExp, function(newVal, oldVal) {

            dataToPlot = newVal; // Refreshing the data.
            sortDataByAverage(); // Sorting the data.

            if(!(scope.isPaused) && (sortedData.length > 0)) {
              dynamicUpdateChart(); // If we indeed have data and not paused, update chart.
            }
          }, true);
 
          // Update coming from the user. Affecting static content.
          scope.$watch(updateChartExp, function() {
            staticUpdateChart();
          }, true);
 

          // Initialise the chart (only required once)
          function initChart() {

            xScale = d3.scale.linear()
              .domain([0,200])
              .range([0, xAxisW]);
 
            xAxisGen = d3.svg.axis()
              .scale(xScale)
              .orient("bottom")
              .ticks(10);
 
            xAxis = svg.append("svg:g")
              .attr("class", "x axis")
              .attr("transform","translate(" + labelW + "," +  xAxisY + ")")
              .call(xAxisGen);
          }
      

          function staticUpdateChart() {

            svg.selectAll("*").remove(); // Removing all the elements.
            canvasH = RECEIVER_CANVAS_H; // Resetting the canvas.
            svg.attr("height", canvasH); // Enlarging the canvas.

            initChart();
          }


          // Update the content of the chart
          function dynamicUpdateChart() {

            // Expanding the canvas if needed.
            if(sortedData.length * pixelsPerTransmitter + padding > canvasH) {
              canvasH = (sortedData.length) * pixelsPerTransmitter + padding; // Setting new canvasH.
              svg.attr("height", canvasH); // Enlarging the canvas.

              xAxis.attr("transform","translate(" + labelW + "," +  (canvasH - padding)+ ")") // Adjusting the xAxis.
              .call(xAxisGen);
            }

            svg.selectAll(".averageBars")
              .data(sortedData)
              .attr("width", function(d, i) {
                return xScale(d.average);
              })
              .text(function (d) { return d.latest; })
              .enter()
              .append("rect")
              .attr("class", "averageBars")
              .attr("x", labelW)
              .attr("y", function(d, i) {
                return i * pixelsPerTransmitter;
              })
              .attr("height", barsW)
              .attr("width", function(d, i) {
                return xScale(d.average);
              })
              .attr("fill", "#0770a2")
              .append("svg:title")
              .text(function (d) { return d.latest; });

            svg.selectAll(".latestBars")
                .data(sortedData)
                .attr("width", function(d, i) {
                  return xScale(d.latest);
                })
              .enter()
              .append("rect")
              .attr("class", "latestBars")
              .attr("x", labelW)
              .attr("y", function(d, i) {
                return i * pixelsPerTransmitter + barsW + spaceBetweenBarsPerTransmitter;
              })
              .attr("height", barsW)
              .attr("width", function(d, i) {
                return xScale(d.latest);
              })
              .attr("fill", "#ff6900");

            svg.selectAll(".instability")
                .data(sortedData)
                .attr("width", function(d, i) {
                  return xScale(d.instability);
                })
              .enter()
              .append("rect")
              .attr("class", "instability")
              .attr("x", labelW)
              .attr("y", function(d, i) {
                return i * pixelsPerTransmitter + 2 * (barsW + spaceBetweenBarsPerTransmitter);
              })
              .attr("height", barsW)
              .attr("width", function(d, i) {
                return xScale(d.instability);
              })
              .attr("fill", "#5a5a5a");

            // Adding the transmitters label.
            svg.selectAll(".labels")
              .data(sortedData)
              .text(function(d) {
                return "Id " + d.transmitter;
              })
              .enter()
              .append("text")
              .attr("class", "labels")
              .attr("font-family", "sans-serif")
              .attr("font-size", "14px")
              .attr("fill", "#498e49")
              .attr("x", 0)
              .attr("y", function(d, i) {
                return i * pixelsPerTransmitter + barsW ;
              })
              .text(function(d) {
                return "Id " + d.transmitter;
              })
              .on("click", function(d,i) {
                scope.goToTransmitterTab(sortedData[i].transmitter);
              });


            svg.selectAll(".average")
              .data(sortedData)
              .text(function(d) {
                return "Avg " + d.average;
              })
              .enter()
              .append("text")
              .attr("class", "average")
              .attr("font-family", "sans-serif")
              .attr("font-size", "12px")
              .attr("fill", "#0770a2")
              .attr("x", 0)
              .attr("y", function(d, i) {
                return i * pixelsPerTransmitter + 2 * barsW + spaceBetweenBarsPerTransmitter;
              })
              .text(function(d) {
                return "Avg " + d.average;
              });
              
            svg.selectAll(".instant")
              .data(sortedData)
              .text(function(d) {
                return "Now " + d.latest;
              })
              .enter()
              .append("text")
              .attr("class", "instant")
              .attr("font-family", "sans-serif")
              .attr("font-size", "12px")
              .attr("fill", "#ff6900")
              .attr("x", 47)
              .attr("y", function(d, i) {
                return i * pixelsPerTransmitter + 2 * barsW + spaceBetweenBarsPerTransmitter;
              })
              .text(function(d) {
                return "Now " + d.latest;
              });


            svg.selectAll("._instability") // Had to add the "_" in front for some reason.
              .data(sortedData)
              .text(function(d) {
                return "Fluc " + d.instability;
              })
              .enter()
              .append("text")
              .attr("class", "_instability")
              .attr("font-family", "sans-serif")
              .attr("font-size", "12px")
              .attr("fill", "#5a5a5a")
              .attr("x", 100)
              .attr("y", function(d, i) {
                return i * pixelsPerTransmitter + 2 * barsW + spaceBetweenBarsPerTransmitter;
              })
              .text(function(d) {
                return "Fluc " + d.instability;
              });
          }

 
          // --- Helper functions ---

          // Sort the array by average RSSI
          function sortDataByAverage() {
            sortedData = [];
            for(var receiverTemp in dataToPlot) {
              sortedData.push(dataToPlot[receiverTemp]);
            } 
            sortedData.sort(function (a,b) {
              return b.average - a.average;
            });
          }
        }
      }
  })

  // ----- Transmitter Samples service -----
  .service('locationSamples', function($http, $interval) {

    var samples;
    var url = null;
    var isConnected = true;
 
    poll();
 
    function poll(callback) {
      if(!url) {
        return;
      }
      $http.defaults.headers.common.Accept = 'application/json';

      $http.get(url)
        .success(function(data, status, headers, config) {
          var sample = data.devices;
          samples = sample;
          isConnected = true;
        })
        .error(function(data, status, headers, config) {
          isConnected = false;
          console.log('Error polling ' + url);
        });
    }

    $interval(poll, REFRESH_SECONDS * 1000);
 
    return {
      getConnectionStatus: function() {return isConnected;},
      getLatest: function() { return samples; },
      setUrl: function(newUrl) { url = newUrl; }
    };
  })

  // ----- Location controller -----
  .controller("LocationCtrl", ['$scope','$interval', 'locationSamples', 
                                function($scope,  $interval, locationSamples) {

    // Context
    $scope.apiRoot = DEFAULT_API_ROOT;
    $scope.locationId = DEFAULT_LOCATION_ID; // Need to be moved to the interaction controller at some point.

    // Data
    $scope.rssiSamples = {};
    $scope.rssiSeconds = 0;

    // Meta-Data
    $scope.receivers = {};
    $scope.numReceivers = 0;


    // Map parameters
    $scope.numberOfCellsPerSideAccessible = DEFAULT_CELL_SIDE;
    $scope.numberOfCellsPerSide = $scope.numberOfCellsPerSideAccessible;
    $scope.squaresPerMeter = 1;
    $scope.frequencyMHz = DEFAULT_FREQUENCY;
    $scope.scale = DEFAULT_SCALE; 
    $scope.merger = DEFAULT_MERGER; // TWO mergers: global vs local. Right now, only local got implemented.

    $scope.maxRSSI = DEFAULT_LOCATION_MAXRSSI;
    $scope.minRSSI = DEFAULT_LOCATION_MINRSSI;

    // Real-time parameters
    $scope.isDiscovering = true;
    $scope.isPaused = true;


    // Misc
    $scope.isLocationSettingsCollapsed = true;



    $scope.updateFromUser = function () {

      $scope.updateChart = !$scope.updateChart; // Tricking the directive to update.
      locationSamples.setUrl($scope.apiRoot + WHEREIS_QUERY + $scope.locationId);
      $scope.rssiSamples = {};
      $scope.receivers = {};
      $scope.numReceivers = 0;
      $scope.numberOfCellsPerSide = $scope.numberOfCellsPerSideAccessible;

    }

    // Calling this once. Need to be removed once we can land on the location tab from other tabs.
    $scope.updateFromUser();

    function updateFromService() {

      $scope.setLocationConnectivity(locationSamples.getConnectionStatus()); 

      if(!$scope.isPaused) {
        var sample = locationSamples.getLatest(); // Getting the latest data.
   
        if(sample && sample[$scope.locationId]) { // Making sure the data is well-defined
           
          if($scope.isDiscovering) { 
            updateReceivers(sample); // Updating the meta-data model.
          }
   
          updateRssiArray(sample); // Updating the data model.
          $scope.rssiSeconds += REFRESH_SECONDS; // Updating the data model.
   
        }
      
        for(var receiverTemp in $scope.receivers) {
          var indexOfLatest = $scope.rssiSamples[receiverTemp].length -1;
          $scope.receivers[receiverTemp].latest = $scope.rssiSamples[receiverTemp][indexOfLatest].rssi;
        }
      }


      function updateReceivers(sample) {
   
            for(var cRadio = 0; cRadio <  sample[$scope.locationId].radioDecodings.length; cRadio++) {
              var receiverTemp = sample[$scope.locationId].radioDecodings[cRadio].identifier.value;
              if(!(receiverTemp in $scope.receivers)) {
                var colorTemp = COLORS_ARRAY[cCOlOR_LOCATION++ % COLORS_ARRAY.length];
                $scope.receivers[receiverTemp] = {color : colorTemp, isDrawn : false, isConsidered : true, isConsideredDrawn : false,
                  isDisplayed : true, latest : 0, receiverId : receiverTemp, xCoordinate : Math.floor(Math.random() * LOCATION_SIDE), 
                  yCoordinate : Math.floor(Math.random() * LOCATION_SIDE)};
              }
            }
        }

      function updateRssiArray(sample) {
   
          for(var receiverTemp in $scope.receivers) {
   
            var updated = false;
            var seconds = $scope.rssiSeconds;
   
            // Try to update the rssi corresponding to the receiver.
            for(var cRadio = 0; cRadio < sample[$scope.locationId].radioDecodings.length; cRadio++) {
   
              if(sample[$scope.locationId].radioDecodings[cRadio].identifier.value === receiverTemp) {
                var rssi = sample[$scope.locationId].radioDecodings[cRadio].rssi;
   
                if($scope.rssiSamples[receiverTemp]) { // If already defined.
                  $scope.rssiSamples[receiverTemp].push({seconds : seconds, rssi : rssi });
                }
                else { // If not defined yet.
                  $scope.rssiSamples[receiverTemp] = [];
                  $scope.rssiSamples[receiverTemp].push({seconds : seconds, rssi : rssi });
                }
   
                updated = true; 
                break;
              }
            }
            
            // If it failed to be updated, push 0 as default.
            if(!updated) {
              if($scope.rssiSamples[receiverTemp]) { // If already defined.
                $scope.rssiSamples[receiverTemp].push({seconds : seconds, rssi : 0 });
              }
              else { // If not defined yet.
                $scope.rssiSamples[receiverTemp] = [];
                $scope.rssiSamples[receiverTemp].push({seconds : seconds, rssi : 0 });
              }
            }
   
            // If it has reached the maximum number of samples, drop the oldest one.
            if($scope.rssiSamples[receiverTemp].length > $scope.maxNumberOfSamples) {
              $scope.rssiSamples[receiverTemp].shift();
            }
          }  

      }


    }


    $interval(updateFromService , REFRESH_SECONDS * 1000);

  }])

.directive('locationChart',  function($parse, $window) {
    return {
      restrict: "EA",
      template: "<svg width='" + LOCATION_SIDE  + "' height='" + LOCATION_SIDE + "'></svg>",
      link:
        function(scope, elem, attrs) {
    
          var chartDataExp = $parse(attrs.chartData); // Function that returns the data.
          var updateChartExp = $parse(attrs.updateChart); // Will be used for watching updates.
 
          var dataToPlot = chartDataExp(scope); // Getting the data.

          // svg Canvas
          var svgW = LOCATION_SIDE;
          var svgH = LOCATION_SIDE;

          // Map parameters 
          var cellsPerMeter = scope.squaresPerMeter;
          var pixelsPerCellSide = svgW / scope.numberOfCellsPerSide; // Number of pixels on the side of a cell.
          var totalNumberOfCells = scope.numberOfCellsPerSide * scope.numberOfCellsPerSide; // Total number of cells.

          // Data
          var cells;
          var cellArray = [];
          var maxValue = 0;

          // svg canvas.
          var d3 = $window.d3;
          var rawSvg = elem.find('svg');
          var svg = d3.select(rawSvg[0]);

 
          // Update coming from the service. Affecting dynamic content.
          
          scope.$watch(chartDataExp, function(newVal, oldVal) {
  
            dataToPlot = newVal;

            if(!scope.isPaused) {
              dynamicUpdateChart();
            }
          }, true);
 
          // Update coming from the user. Affecting static content.
          
          scope.$watch(updateChartExp, function(newVal, oldVal) {
            staticUpdateChart();
          }, true);
          


          initChart();


          function initChart() {

            // Redefining all the scales and parameters upon the update.
            cellsPerMeter = scope.squaresPerMeter;
            pixelsPerCellSide = svgW / scope.numberOfCellsPerSide; // Number of pixels on the side of a cell.
            totalNumberOfCells = scope.numberOfCellsPerSide * scope.numberOfCellsPerSide; // Total number of cells.

            // The actual initialization.
            
            initData();
            initCells();
            initLine();

            function initData() {
              for(var cCell = 0; cCell < totalNumberOfCells; cCell++) {
                cellArray.push(cCell/totalNumberOfCells);
              }
            }

            function initCells() {
              svg.selectAll("rect")
                .data(cellArray)
                .enter()
                .append("rect")
                .attr("x", function(d,i) {
                  return getXPixel(i);
                })
                .attr("y", function(d,i) {
                  return getYPixel(i);
                })
                .attr("width",pixelsPerCellSide-1)
                .attr("height",pixelsPerCellSide-1)
                .style("fill", function(d,i) {
                  return valueToColor(d);
                });
            }

            function initLine() {

              svg.append("path")
                .attr("d", " M 10 " + (svgH - 20) + " L " + (10 + 10 * cellsPerMeter * pixelsPerCellSide )+ " " + (svgH - 20) + "")
                .attr("stroke", "white")
                .attr("class","myLine")
                .attr("font-weight", "bold")
                .attr("stroke-width", SCALE_WIDTH)
                .attr("fill", "none");

              svg.append("text")
                .attr("x", 2)
                .attr("y", svgH - 30)
                .style("font-weight", "bold")
                .attr("font-size","20px")
                .attr("fill", "white")
                .text("10 m");
               
            }

          }


          function staticUpdateChart() {
            svg.selectAll("*").remove(); // Removing everything.
            cellArray = []; // Resetting the data.
            initChart(); // Re-initializating the chart.
          }


          function dynamicUpdateChart() {

            cellsPerMeter = scope.squaresPerMeter; // Updating in real time (can be changed)
            drawReceivers();
            updateData();
            updateCells();
            updateLine();

            function updateCells() {
              svg.selectAll("rect")
                .data(cellArray)
                .style("fill", function(d,i) {
                  return valueToColor(d);
                });
            }

            function updateLine() {

              svg.select(".myLine")
                .attr("d", " M 10 " + (svgH - 20) + " L " + (10 + 10 * cellsPerMeter * pixelsPerCellSide )+ " " + (svgH - 20) + "");

            }

            function drawReceivers() {

              for(var receiverTemp in scope.receivers) {
   
                var isDisplayed = scope.receivers[receiverTemp].isDisplayed;
                var color = scope.receivers[receiverTemp].color;
                var isDrawn = scope.receivers[receiverTemp].isDrawn;
                var rssi = scope.receivers[receiverTemp].latest;
                var isConsidered = scope.receivers[receiverTemp].isConsidered;
                var isConsideredDrawn = scope.receivers[receiverTemp].isConsideredDrawn;

                var radiusMeter = rssiToMeter(rssi);
                var radius = metersToPixels(radiusMeter);
                radius = Math.max(radius,0);

                var xCoordinate = scope.receivers[receiverTemp].xCoordinate;
                var yCoordinate = scope.receivers[receiverTemp].yCoordinate;

                if(isConsidered) {
   
                  if(isConsideredDrawn) {
                    svg.selectAll("." + 'center_' + receiverTemp)
                      .attr("r", Math.max(pixelsPerCellSide / 4, MINIMUM_CIRCLE_SIZE))
                      .attr("cx", xCoordinate)
                      .attr("cy", yCoordinate);
                  }
                  else {
                    svg.append("circle")
                    .attr("class", 'center_' + receiverTemp)
                    .attr("cx", xCoordinate)
                    .attr("cy", yCoordinate)
                    .attr("r", Math.max(pixelsPerCellSide / 4, MINIMUM_CIRCLE_SIZE))
                    .style("fill", color);
                    scope.receivers[receiverTemp].isConsideredDrawn = true;
                  }
                }
   
                else {
                  if(isConsideredDrawn) {
                    svg.selectAll("." + 'center_' + receiverTemp).remove();
                    scope.receivers[receiverTemp].isConsideredDrawn = false;
                  }
                }                


                if(isDisplayed) {
   
                  if(isDrawn) {
                    svg.selectAll("." + 'circle_' + receiverTemp)
                      .attr("r", radius)
                      .attr("cx", xCoordinate)
                      .attr("cy", yCoordinate);
                  }
                  else {
                    svg.append("circle")
                    .attr("class", 'circle_' + receiverTemp)
                    .attr("cx", xCoordinate)
                    .attr("cy", yCoordinate)
                    .attr("r", radius)
                    .style("fill", color)
                    .style("fill-opacity",0.2)
                    .style("stroke", color)
                    .style("stroke-width", 5)
                    .style("opacity", 0.7);
                    scope.receivers[receiverTemp].isDrawn = true;
                  }
                }
   
                else {
                  if(isDrawn) {
                    svg.selectAll("." + 'circle_' + receiverTemp).remove();
                    scope.receivers[receiverTemp].isDrawn = false;
                  }
                }
              }
            }
          }


          function updateData() {

            maxValue = 0; // Resetting the max value.

            // For each cell.
            for(var cCell = 0; cCell < totalNumberOfCells; cCell++) {

              var colorValueFinal = 0;
              var xEmitter = getXPixel(cCell);
              var yEmitter = getYPixel(cCell);

              var colorValueArray = []; // Serves to aggregate the color values.

              // Gather the contribution from each considered receiver.
              for(var receiverTemp in scope.receivers) {

                if(scope.receivers[receiverTemp].isConsidered) {

                  var xReceiver = scope.receivers[receiverTemp].xCoordinate;
                  var yReceiver = scope.receivers[receiverTemp].yCoordinate;
                  var rssi = scope.receivers[receiverTemp].latest;

                  var colorValue = getColor(xEmitter, yEmitter, xReceiver, yReceiver, rssi); // Getting the value.
                  colorValueArray.push(colorValue); // Adding the value.
                }
              }

              // Merging the values.
              colorValueFinal = mergeColorValueArray(colorValueArray);

              // The actual update.
              cellArray[cCell] = colorValueFinal;

              maxValue = Math.max(colorValueFinal, maxValue);
            }

            // Normalizing with the maxValue.
          if(scope.merger === 'global') {
            for(var cCell = 0; cCell < totalNumberOfCells; cCell++) {
              cellArray[cCell] = cellArray[cCell]/maxValue;
            }
          }          

        }

          // ***** HELPER FUNCTIONS *****

          function getColor(xEmitter, yEmitter, xReceiver, yReceiver, rssi) {

            var receiverRadiusMeter = rssiToMeter(rssi);
            var pixelDistance = getDistanceInPixels(xEmitter, yEmitter, xReceiver, yReceiver);
            var distanceFromReceiverMeter = pixelsToMeters(pixelDistance);

            // The following is our function which takes the radius in meter
            // And the distance from the receiver in meter and outputs a value between 0 and 1.

            if(receiverRadiusMeter === -1) {
              return -1;
            }
            else {
              return  Math.max(rssi/scope.maxRSSI - (LINEAR_FACTOR  * rssi/scope.maxRSSI * Math.abs(receiverRadiusMeter - distanceFromReceiverMeter)),0);
            }
          }


          function mergeColorValueArray(colorValueArray) {

            var result = 1;
            var dirty = false;
            var zeros = 0;

            if(scope.merger === 'local') {

              for(var cArray = 0; cArray < colorValueArray.length; cArray++) {
                if(colorValueArray[cArray] != -1){
                  result = result * colorValueArray[cArray];
                  dirty = true;
                }
                else{
                  zeros++;
                }
              }

              result = Math.pow(result,1/(colorValueArray.length - zeros));

              if(dirty){
                return result;
              }
              else
              {
                return 0;
              }
            }

            if(scope.merger === 'global') {
              for(var cArray = 0; cArray < colorValueArray.length; cArray++) {
                if(colorValueArray[cArray] != -1) {
                  result = result + colorValueArray[cArray];
                  dirty = true;
                }
                else{
                  zeros++;
                }

              }

            if(dirty){
                return result/(colorValueArray.length - zeros);
              }
              else
              {
                return 0;
              }

            }


          }

          // --- Getters ---

          // Takes the index of the cell and returns its position in X.
          function getXPixel(index) {
            return ((pixelsPerCellSide * index) % svgW);
          }

          // Takes the index of the cell and returns its position in Y.
          function getYPixel(index) {
            return pixelsPerCellSide * Math.floor((index/ (svgW/pixelsPerCellSide)));
          }

          function getDistanceInPixels(xEmitter, yEmitter, xReceiver, yReceiver){
            return Math.sqrt(Math.pow(xEmitter- xReceiver,2) + Math.pow(yEmitter- yReceiver,2));

          }

          // --- Scalers ---

          // Takes a value from 0 to 1 and returns a color between Black (0) and Red (1).
          function valueToColor(value) {

            var h = Math.round((1 - value) * 100);
            var s = 100
            var l = Math.round(value * 50)
            var color = "hsl(" + h + ", 100%, " + l + "%)";

            return color;
          }

          // Depends on cellsPerMeter and pixelsPerCellSide.
          function metersToPixels(nMeters) {
            var nCells = nMeters * cellsPerMeter;
            var nPixels = nCells * pixelsPerCellSide;
            return nPixels;
          }
          // Depends on cellsPerMeter and pixelsPerCellSide.
          function pixelsToMeters(nPixels) {
            var nCells = nPixels/pixelsPerCellSide;
            var nMeters = nCells/cellsPerMeter;
            return nMeters;
          }
        
          // Depends on the chosen frequency (2400 vs 915 MHz) and the chosen scale.
          function rssiToMeter(rssi) {

            // BlueTooth
            if(scope.frequencyMHz === 2400) {
              if(scope.scale === 'log') {
                if(rssi > 180) {
                  return 1;
                }
                if(rssi < 100) {
                  return -1;
                }
                return Math.pow(10,(185-rssi)/(10 * PATH_LOSS_EXPONENT));
              }

              if(scope.scale === 'home') {
                if(rssi > 180) {
                  return 1;
                }
                if(rssi < 100) {
                  return -1;
                }
                return 20 - (rssi - 100)/4  + 1;
              }
            }

            if(scope.frequencyMHz === 915) {
              if(scope.scale === 'log') {
                if(rssi > 185) {
                  return 1;
                }
                if(rssi < 135) {
                  return -1;
                }
                return Math.pow(10,(185-rssi)/(10 * PATH_LOSS_EXPONENT));
              }

              if(scope.scale === 'home') {
                if(rssi > 185) {
                  return 1;
                }
                if(rssi < 135) {
                  return -1;
                }
                return 20 - (rssi - 135)/2.5  + 1;
              }
            }
          }       
      
      }
    }
  });
