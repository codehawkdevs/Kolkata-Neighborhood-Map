/**
 * Copyright (c) 2018 Subhadeep Dey
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let map;

/* Initialize the map with custom styles.
 * The styles have been downloaded from Snazzy Maps. For more information, kindly
 * visit their website, https://snazzymaps.com.
 */
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 22.572645,
            lng: 88.363892
        },
        zoom: 12,
        gestureHandling: "cooperative",
        styles: [{
            "featureType": "all",
            "elementType": "all",
            "stylers": [{
                "saturation": "32"
            }, {
                "lightness": "-3"
            }, {
                "visibility": "on"
            }, {
                "weight": "1.18"
            }]
        }, {
            "featureType": "administrative",
            "elementType": "labels",
            "stylers": [{
                "visibility": "simplified"
            }]
        }, {
            "featureType": "landscape",
            "elementType": "labels",
            "stylers": [{
                "visibility": "on"
            }]
        }, {
            "featureType": "landscape.man_made",
            "elementType": "all",
            "stylers": [{
                "saturation": "-70"
            }, {
                "lightness": "14"
            }]
        }, {
            "featureType": "poi",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "road",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "transit",
            "elementType": "labels",
            "stylers": [{
                "visibility": "off"
            }]
        }, {
            "featureType": "water",
            "elementType": "all",
            "stylers": [{
                "saturation": "100"
            }, {
                "lightness": "-14"
            }]
        }, {
            "featureType": "water",
            "elementType": "labels",
            "stylers": [{
                "visibility": "on"
            }, {
                "lightness": "12"
            }]
        }]
    });

    // Apply bindings to the ViewModel.
    ko.applyBindings(new viewModel());
}


/* Get Wikipedia article from the Wikipedia API and do error handling.
 * Part of this code has been brought from Udacity's "Intro to AJAX" course.
 * Course link: https://in.udacity.com/course/intro-to-ajax--ud110
 */
function getWikiData(location) {
    let wikiRequestTimeOut = setTimeout(function() {
        window.alert("Something went wrong. Please try again later.");
    }, 8000);

    let wikiUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + location.wikiArticle + "&format=json&callback=wikiCallback;";

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function(response) {
            let articleList = response[1];
            let url = "https://en.wikipedia.org/wiki/" + articleList[0];
            location.url = url;
            location.extract = response[2];

            clearTimeout(wikiRequestTimeOut);
        }
    });
}


// ViewModel
let viewModel = function() {
    let self = this;

    /* The variable `locations` is defined in the file `model.js` which is
     * located inside the directory `js` in the root directory.
     */
    self.locations = ko.observableArray(locations);
    let largeInfoWindow = new google.maps.InfoWindow();

    for (let location of self.locations()) {

        // Get Wikipedia data for the current location.
        getWikiData(location);

        // Position the markers.
        let marker = new google.maps.Marker({
            map: map,
            title: location.name,
            icon: location.icon,
            animation: google.maps.Animation.DROP,
            position: {
                lat: location.lat,
                lng: location.lng
            }
        });

        location.marker = marker;

        // Handling of "click" event on a specific marker.
        marker.addListener("click", function() {

            // Let the marker bounce when it is clicked.
            marker.setAnimation(google.maps.Animation.BOUNCE);

            // Show the infowindow when the marker is clicked.
            self.wikiInfoWindow(location, marker, largeInfoWindow);

            // Stop the animation after 800 ms.
            setTimeout(function() {
                location.marker.setAnimation(null);
            }, 800);
        });
    }

    // Render content in the infowindow.
    self.wikiInfoWindow = function(location, marker, infoWindow) {
        infoWindow.marker = marker;
        let jsonUrl, imageData, infoWindowHead, infoWindowBody, infoWindowFooter;

        jsonUrl = "https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=pageimages&format=json&piprop=original&titles=" + location.wikiArticle;

        // Make an asynchronous request to get featured image of the concerned article from Wikipedia.
        $.getJSON(jsonUrl, function(data){

            // Get the link to the featured image and store it in the variable `imageData`.
            for (let pageId in data.query.pages) {
                imageData = data.query.pages[pageId].original.source;
            }

            /* In the following statements, `location.url` and `location.extract` are extracted from the function `getWikiData()`.
             * They are essentially being used to get the URL and the first paragraph of the article, respectively.
             */
            infoWindowHead = "<div><h1><a target='_blank' href='" + location.url + "'>" + marker.title + "</a></h1></div>";
            infoWindowBody = "<div> <img src='" + imageData + "' class='img-responsive' style='width: 100%; height: 270px;'><p>" + location.extract[0] + "</p>";
            infoWindowFooter = "<hr><p>Brought to you by <img src='https://png.icons8.com/windows/15/000000/wikipedia.png'> Wikipedia. Explore more on <a target='_blank' href='https://www.google.com/search?q=" + marker.title + "'>Google</a>." + "</div>";

            // Set content in the infowindow.
            infoWindow.setContent(infoWindowHead + infoWindowBody + infoWindowFooter);

            // Open the infowindow on the specified marker.
            infoWindow.open(map, marker);
        });
    };


    // Open the infowindow when a specific location from the list  is clicked.
    self.wikiInfo = function(location) {

        // Render information received from Wikipedia on the infowindow.
        self.wikiInfoWindow(location, location.marker, largeInfoWindow);

        // Let the marker bounce when the location is selected from the list.
        location.marker.setAnimation(google.maps.Animation.BOUNCE);

        // Stop the bouncing of marker after 800 ms.
        setTimeout(function() {
            location.marker.setAnimation(null);
        }, 800);
    };

    // Search and filter available location(s).
    self.inputLocation = ko.observable("");

    self.locationItem = ko.computed(function() {
        let text = self.inputLocation().toLowerCase();

        return ko.utils.arrayFilter(self.locations(), function(location) {

            // If the location is found, then show it.
            if (location.name.toLowerCase().indexOf(text) !== -1) {
                location.marker.setVisible(true);
                return true;
            }
            // If the location isn't found, then hide it.
            else {
                location.marker.setVisible(false);
                return false;
            }
        });
    });
};


// Fetch current weather data and show modal.
window.addEventListener("load", function() {

    // Fetch the current weather data from OpenWeatherMap and append it to the <div> with the id `temperature`.
    const apiEndpoint = "https://api.openweathermap.org/data/2.5/weather?q=Kolkata,IN&appid=9394141b4a982828532b32f51ea24531";

    $.getJSON(apiEndpoint, function(data){
        let icon = data.weather[0].icon;
        let img = "<img src='https://openweathermap.org/img/w/" + icon + ".png' class='img-responsive pull-left'>";
        $(".temperature").append(img, data.main.temp-273.15 + "&#176;C | " + data.weather[0].main);
    });

    // Load the modal when the page loads.
    $("#myModal").modal("show");
});
