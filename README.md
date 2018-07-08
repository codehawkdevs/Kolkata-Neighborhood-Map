# Kolkata Neighborhood Map

A single page application featuring a map of popular places in Kolkata.

This Web application is a part of Udacity's Full Stack Web Developer II Nanodegree program.

## Salient Features

- Shows a list of popular places in Kolkata.
- It is a single-page application, meaning it does not refresh the page for each new request made.
- Uses the Wikipedia API to fetch and show information about the places asynchronously.
- Shows real-time weather of Kolkata.

## Demo

A working demo of this application can be found over [here](https://sdey96.github.io/Kolkata-Neighborhood-Map/).

## Source Tree

```
.
├── css
│   ├── bootstrap.min.css
│   ├── bootstrap.min.modal.css
│   └── main.css
├── img
│   ├── icons8-binoculars-48.png
│   └── kolkata.jpg
├── index.html
├── js
│   ├── app.js
│   ├── bootstrap.min.js
|   ├── config.js
│   ├── jquery-3.3.1.min.js
│   ├── knockout-3.4.2.js
│   └── model.js
├── LICENSE
└── README.md
```

### Description of Main Files Used in this Project

- `index.html` - Main file to open.
- `main.css` - Main stylesheet.
- `model.js` - Includes the models used in this project.
- `config.js` - Includes API key, maps styles and configuration.
- `app.js` - Includes the ViewModel.

## How to Run This Application?

Just open the file `index.html` and you are good to go.

## Libraries Used

- [Knockout.js](http://knockoutjs.com/)
- [jQuery](https://jquery.com/)
- [Bootstrap](https://getbootstrap.com/)

## APIs Used

- [Google Maps API](https://cloud.google.com/maps-platform/) to display the map and position markers.
- [MediaWiki action API](https://www.mediawiki.org/wiki/API:Main_page) to fetch content from Wikipedia.
- [OpenWeatherMap API](https://openweathermap.org/API) to fetch current weather data.

## License

This project is licensed under the MIT license found in the LICENSE file in the root directory of this project.
