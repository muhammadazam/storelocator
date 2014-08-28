/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var map;
var storesLayer;
var markers = [];
var infoWindow;
var userLocation = null;
var directions;
var directionsService = new google.maps.DirectionsService();
var distanceService = new google.maps.DistanceMatrixService();

function load() {

    var MyStyles = [{"featureType":"road","stylers":[{"hue":"#5e00ff"},{"saturation":-79}]},{"featureType":"poi","stylers":[{"saturation":-78},{"hue":"#6600ff"},{"lightness":-47},{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"lightness":22}]},{"featureType":"landscape","stylers":[{"hue":"#6600ff"},{"saturation":-11}]},{},{},{"featureType":"water","stylers":[{"saturation":-65},{"hue":"#1900ff"},{"lightness":8}]},{"featureType":"road.local","stylers":[{"weight":1.3},{"lightness":30}]},{"featureType":"transit","stylers":[{"visibility":"simplified"},{"hue":"#5e00ff"},{"saturation":-16}]},{"featureType":"transit.line","stylers":[{"saturation":-72}]},{}];

    map = new google.maps.Map(document.getElementById("map"), {
        center: new google.maps.LatLng(40, -100),
        zoom: 4,
        mapTypeId: 'roadmap',
        mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU},
        panControlOptions: {position: google.maps.ControlPosition.TOP_RIGHT},
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        styles: MyStyles
    });

    storesLayer = new google.maps.FusionTablesLayer({
        query: {
            select: '\'Geocodable address\'',
            from: '1zFT18lMnLAhAtqoeaahsEEugSZpPCAxw64p6sS8g'
        },
    });
    storesLayer.setMap(map);

    infoWindow = new google.maps.InfoWindow();

    var input = document.getElementById('addressInput');
    var autoCompleteOptions = {
        types: ['(cities)'],
        componentRestrictions: {country: 'usa'}
    };
    var autocomplete = new google.maps.places.Autocomplete(input, autoCompleteOptions);
    autocomplete.bindTo('bounds', map);

    var placeMarker = new google.maps.Marker({
        anchorPoint: new google.maps.Point(0, -29),
        animation: google.maps.Animation.BOUNCE
    });

    google.maps.event.addListener(autocomplete, 'place_changed', function() {
        placeMarker.setVisible(false);
        var place = autocomplete.getPlace();
        if (!place.geometry) {
            return;
        }

        placeMarker.setIcon('http://maps.google.com/mapfiles/ms/icons/yellow-dot.png');
        userLocation = place.geometry.location;
        placeMarker.setPosition(place.geometry.location);
        placeMarker.setMap(map);
        placeMarker.setVisible(true);

        geoCodeUserLocation();
    });
    
    directions = new google.maps.DirectionsRenderer();
    directions.setMap(map);
    directions.setPanel(document.getElementById("directionsSection"));
}

function geoCodeUserLocation() {
    var address = document.getElementById("addressInput").value;
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({address: address}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            searchLocationsNear(results[0].geometry.location);
        } else {
            alert(address + ' not found');
        }
    });
}

function clearLocations() {
    $('.carousel').carousel(0);
    infoWindow.close();
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers.length = 0;
    userLocation = null;

    $("#list-group").html("");
    $("#resultSection").hide();
    
    clearDirections();
}

function searchLocationsNear(center) {
    clearLocations();

    userLocation = center;
    
    var query = "SELECT * from 1zFT18lMnLAhAtqoeaahsEEugSZpPCAxw64p6sS8g ORDER BY ST_DISTANCE(col1, LATLNG(" + center.lat() + ", " + center.lng() + " )) LIMIT 5";

    $.getJSON('https://www.googleapis.com/fusiontables/v1/query?sql=' + query,
            {
                key: 'AIzaSyBb8W23Vr0F_FnMzNsvTWtRwVvefL3E8C8'
            },
    function(resp) {
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < resp.rows.length; i++) {
            var row = resp.rows[i];
            var name = row[0];
            var address = row[1];
            var latlng = new google.maps.LatLng(
                    parseFloat(row[2]),
                    parseFloat(row[3])
                    );

            createMarker(latlng, name, address, i + 1);
            createOption(name, i, address);
            bounds.extend(latlng);
        }
        bounds.extend(center);
        map.fitBounds(bounds);
        $("#resultSection").show();
        $('.carousel').carousel(0)
        $("#list-group li").click(function() {
            var markerNum = $(this).attr("data-marker");
            if (markerNum != "") {
                google.maps.event.trigger(markers[markerNum], 'click');
            }
        });        
    });
}

function createMarker(latlng, name, address, index) {
    var image = 'images/red' + index + '.png';
    var html = "<b>" + name + "</b> <br/>" + address;
    html += "<hr/>";
    var marker = new google.maps.Marker({
        map: map,
        position: latlng,
        icon: image
    });
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(html);
        infoWindow.open(map, marker);
    });
    markers.push(marker);
}

function createOption(name, num, address) {
    $("#list-group").append(
            '<li class="list-group-item" data-marker="'+num+'">' +
                '<img src="images/red' + (num+1) + '.png"/>&nbsp;&nbsp;&nbsp;' +
                '<b>' + name + '</b>' +
                '<br/>' + 
                '<span style="color:#888;">' + address + '</span>' + 
                '<br/><br/>' + 
                '<div>' +
                    '<span><a href="#" onclick="caclDistance(' + num + ');">Distance</a></span>' +
                    '<span class="pull-right"><a href="#" onclick="getDirection(' + num + ');">Direction</a></span>' +
                '</div>' + 
            '</li>'
    );
}

function getDirection(num){
    if(userLocation != null){
        var marker = markers[num];
        
         var request = {
            origin: userLocation,
            destination: marker.getPosition(),
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directions.setDirections(response);
                directions.setMap(map);
                $('.carousel').carousel('next');
            }
            else{
                alert(status);
            }
        });
    }
}

function caclDistance(num){
    var marker = markers[num];
    var origin = userLocation;
    var destination = marker.getPosition();

    distanceService.getDistanceMatrix(
    {
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      durationInTraffic: true,
      avoidHighways: false,
      avoidTolls: false
    }, distanceMatrixCallback);
}

function distanceMatrixCallback(response, status) {
  if (status == google.maps.DistanceMatrixStatus.OK) {
    var origins = response.originAddresses;
    var destinations = response.destinationAddresses;

    for (var i = 0; i < origins.length; i++) {
      var results = response.rows[i].elements;
      for (var j = 0; j < results.length; j++) {
        var element = results[j];
        var distance = element.distance.text;
        var duration = element.duration.text;
        var from = origins[i];
        var to = destinations[j];
        $("#disFrom").html(from);
        $("#disTo").html(to);
        $("#disDistance").html(distance);
        $("#disDuration").html(duration);
      }
    }
    $('.carousel').carousel(2);
  }
  else{
      alert(status);
  }
}

function clearDirections(){
    $('.carousel').carousel('prev');
    directions.setMap(null);
}