barstool
========

Client-side visualisation of the [barnowl](https://github.com/reelyactive/barnowl)-[barnacles](https://github.com/reelyactive/barnacles)-[barterer](https://github.com/reelyactive/barterer) stack using AngularJS, D3js and socket.io.


Installation
------------

Simply clone the repository and open the index.html file in your favourite web browser.


Interface
---------

Barstool presents two interfaces : Transmitter and Receiver.

#### Transmitter Interface

The transmitter interface visualises the RSSI in real-time for each detected receivers. A line-chart is used for visualising the data. Among other options, the user can choose the range for the x and y axis in the interface. The update button restarts the visualisation with the chosen parameters. 

A snapshot of the transmitter interface : 

![Transmitter Interface](https://cloud.githubusercontent.com/assets/12238788/8973503/5003aa2a-3633-11e5-9563-a42d6f65fd4d.png)

#### Receiver Interface

The receiver interface visualises the latest and average RSSI in real-time for each detected transmitters. A bar-chart is used for visualising the data. Among other options, the user can choose the number of data points to aggregate in the average. The update button restarts the visualisation with the chosen parameters.

A snapshot of the receiver interface : 

![Receiver Interface](https://cloud.githubusercontent.com/assets/12238788/8973517/6a39ea8a-3633-11e5-9838-d8b70477e7c7.png)

Both interfaces offer a pause button for facilitating screenshots and a stop-discovering button to restrict the visualisation to the already detected devices.


What's next?
------------

* An event interface.
* The option to move and update between the transmitter and receiver interfaces through clicking on the transmitter/receiver we want to visualise in the other interface.
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


