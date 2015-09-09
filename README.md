
barstool
========

Client-side visualisation of the [barnowl](https://github.com/reelyactive/barnowl)-[barnacles](https://github.com/reelyactive/barnacles)-[barterer](https://github.com/reelyactive/barterer) stack using AngularJS, D3js and socket.io.


Installation
------------

Simply clone the repository and open the index.html file in your favourite web browser.


Interface
---------

Barstool presents four interfaces : Transmitter, Receiver, Events and Location .

#### Transmitter Interface

The transmitter interface visualises the RSSI in real-time for each detected receivers. A line-chart is used for visualising the data.


| Option               | Description                 |
|:-------------------------|:------------------------------|
| API root       | Specifies where to pull the data from.  |
| Transmitter ID | Specifies which transmitter to track. | 
| RSSI window          | Specifies the lower and higher range of the graph. |
| Samples | Specifes how many samples the graph displays. |
| Linear Interpolation | Draws straight line between data points. |
| Basis Interpolation       | Smooths out extreme data points. | 
| Display receiver | Unless checked, the corresponding receiver won't be displayed. |
| ReceiversID | When clicked upon, brings the user to the corresponding receiver interface. |

#### Receiver Interface

The receiver interface visualises the latest, average and average fluctuation of the RSSI in real-time for each detected transmitters.


The receiver interface visualises the latest, average and fluctuation of the RSSI in real-time for each detected transmitters. A bar-chart is used for visualising the data.

| Option               | Description                 |
|:-------------------------|:------------------------------|
| API root       | Specifies where to pull the data from.  |
| Receiver ID | Specifies which receiver to decode. |
| Samples | Specifes how many samples to average over. |
| Max          | Maximum number of transmitters to be tracked. |
| TransmittersID | When clicked upon, brings the user to the corresponding transmitter interface. |

#### Events Interface

Coming soon!

#### Location Interface
The location interface visualize the real-time location of a transmitter through a heat map. The more red a cell is, the more likely the transmitter is located near it. The more black the cell is, the less likely the transmitter is located near it. Each transmitter's location is indicated by a colored disk; its radius is indicated by a halo of the same color. A 10m-scale is located at the botto left of the grid in order to help the users calibrate the relative receiver's relative position.

| Option               | Description                 |
|:-------------------------|:------------------------------|
| API root       | Specifies where to pull the data from.  |
| TransmitterID | Specifies which transmitter to locate. |
| Cells/Side | Specifes the resolution of the grid. |
| Considered          | Unless toggled on, the heat map won't take the receiver's data into consideration. |
| Visualized | Unless toggled on, the heat map won't show the receiver's radius. |
| X position      | Defines the transmitter's position by specifiying its distance in pixels from the left edge. |
| Y position      | Defines the transmitter's position by specifiying its distance in pixels from the upper edge. |
| Squares/metre | How many cells are contained in a meter. |
| minRSSI         | Below this threshold, the transmitter is considered to be absent. |
| maxRSSI | The RSSI associated to the transmitter when it's adjacent to a receiver. |
| Frequency | Defines the conversion RSSI to meter according to the emitted signal's frequency. (2400MHz = BlueTooth, 915MHz = reelyActive RFID) |
| Scale | Defines the conversion RSSI to meter. Potential for user defined conversion. |
| Perspective | Global : The heat map shows as much data as possible. Local : The heat map infers the most likely position.


What's next?
------------

* An event interface.
* Displaying blink rates.
* The option to choose the polling rate.


License
-------

MIT License

Copyright (c) 2015 reelyActive

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN 
THE SOFTWARE.
