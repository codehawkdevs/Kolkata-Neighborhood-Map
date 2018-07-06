/**
 * Copyright (c) 2018 Subhadeep Dey
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */


/**
 * ======================================================
 * Fetch current weather data and show the welcome modal.
 * ======================================================
 */
window.addEventListener("load", () => {

    // Fetch the current weather data from OpenWeatherMap.
    const apiEndpoint = "https://api.openweathermap.org/data/2.5/weather?q=Kolkata,IN&appid=9394141b4a982828532b32f51ea24531";

    $.getJSON(apiEndpoint, (data) => {
        // Append the received weather data to the <div> with the id `weather` in `index.html`.
        $(".weather").append(`
                    <img src='https://openweathermap.org/img/w/${data.weather[0].icon}.png' class='img-responsive pull-left'>
                    ${data.main.temp - 273.15} &#176;C | ${data.weather[0].main}`);
    }).fail(() => alert("Cannot fetch weather data from the servers. Please try again later."));  // Error handling.

    // Load the welcome modal when the page loads.
    $("#welcome-modal").modal("show");
});


/**
 * ==============================================================================
 * Get the Wikipedia article of the concerned place and handle errors (if any).
 * ==============================================================================
 * Part of this code has been brought from Udacity's "Intro to AJAX" course.
 * Course link: https://in.udacity.com/course/intro-to-ajax--ud110
 */
function getWikiData(place) {

    // Error handling
    let wikiRequestTimeOut = setTimeout(() => alert("Cannot fetch data from Wikipedia at the moment. Please try again later."), 8000);

    let wikiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${place.wikiArticle}&format=json&callback=wikiCallback`;

    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: (response) => {
            let articleList = response[1];
            let url = `https://en.wikipedia.org/wiki/${articleList[0]}`;
            place.url = url;
            place.extract = response[2];
            clearTimeout(wikiRequestTimeOut);
        }
    });
}


let map;

/**
 * ==============================================================================
 * Initialize the map with custom styles.
 * ==============================================================================
 */
function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: {
            lat: 22.572645,
            lng: 88.363892,
        },
        zoom: 12,
        gestureHandling: "cooperative",
        styles: styles,     // `styles` is located in the file `config.js` in the current directory.
    });

    // Apply bindings to the ViewModel.
    ko.applyBindings(new viewModel());
}


/**
 * ==========
 * ViewModel
 * ==========
 */
let viewModel = function() {
    let largeInfoWindow = new google.maps.InfoWindow();

    /**
     * The variable `places` is defined in the file `model.js` which is
     * located inside the directory `js` inside the root directory.
     */
    this.places = ko.observableArray(places);

    for (let place of this.places()) {

        // Get Wikipedia data of the current place.
        getWikiData(place);

        // Position the markers.
        let marker = new google.maps.Marker({
            map: map,
            title: place.name,
            icon: place.icon,
            animation: google.maps.Animation.DROP,
            position: {
                lat: place.lat,
                lng: place.lng,
            },
        });

        place.marker = marker;

        // Handling of "click" event on a specific marker.
        marker.addListener("click", () => {

            // Let the marker bounce when it is clicked.
            marker.setAnimation(google.maps.Animation.BOUNCE);

            // Show the infowindow when the marker is clicked.
            this.wikiInfoWindow(place, marker, largeInfoWindow);

            // Stop the animation after 800 ms.
            setTimeout(() => place.marker.setAnimation(null), 800);
        });
    }

    // Render content in the infowindow.
    this.wikiInfoWindow = (place, marker, infoWindow) => {
        infoWindow.marker = marker;
        let jsonUrl, imageData;
        jsonUrl = `https://en.wikipedia.org/w/api.php?action=query&origin=*&prop=pageimages&format=json&piprop=original&titles=${place.wikiArticle}`;

        // Make an asynchronous request to get featured image of the concerned article from Wikipedia.
        $.getJSON(jsonUrl, (data) => {

            // Get the link to the Wikipedia article's featured image and store it in the variable `imageData`.
            for (let pageId in data.query.pages) {
                imageData = data.query.pages[pageId].original.source;
            }

            /**
             * =================================================================================================================
             *  Set content in the infowindow.
             * =================================================================================================================
             * In the following statements, `place.url` and `place.extract` are extracted from the function `getWikiData()`.
             * They are essentially being used to get the URL and the first paragraph of the article, respectively.
             */
            infoWindow.setContent(`
                    <div>
                        <h1><a target='_blank' href='${place.url}'>${marker.title}</a></h1>
                    </div>

                    <div>
                        <img src='${imageData}' class='img-responsive' style='width: 100%; height: 270px;'>
                        <p>${place.extract[0]}</p>
                        <hr>
                        <p>
                            Brought to you by
                            <img src='https://png.icons8.com/windows/15/000000/wikipedia.png'> Wikipedia.
                            Explore more on <a target='_blank' href='https://www.google.com/search?q=${marker.title}'>Google</a>.
                        </p>
                    </div>`);

            // Open the infowindow on the specified marker.
            infoWindow.open(map, marker);
        }).fail(() => alert("Cannot contact Wikipedia servers at the moment. Please try again later."));  // Error handling.
    };


    // Open the place marker's infowindow when a place is clicked from the list.
    this.wikiInfo = (place) => {

        // Render information received from Wikipedia on the infowindow.
        this.wikiInfoWindow(place, place.marker, largeInfoWindow);

        // Let the marker bounce when the place is selected from the list.
        place.marker.setAnimation(google.maps.Animation.BOUNCE);

        // Stop the bouncing of marker after 800 ms.
        setTimeout(() => place.marker.setAnimation(null), 800);
    };

    // Search and filter available place(s).
    this.inputLocation = ko.observable("");

    this.locationItem = ko.computed(() => {
        let text = this.inputLocation().toLowerCase();

        return ko.utils.arrayFilter(this.places(), (place) => {

            // If the place is found, then show it in the list as well as on the map.
            if (place.name.toLowerCase().indexOf(text) !== -1) {
                place.marker.setVisible(true);
                return true;
            }
            // If the place isn't found, then hide it from the list as well as from the map.
            else {
                place.marker.setVisible(false);
                return false;
            }
        });
    });
};
