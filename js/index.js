$(function(){
    // Map object creation using Simple Coordinate Reference System for non-geographical imagery.
    // MinZoom and maxZoom have to correspond to actual zoom levels we have prepared
    var map = L.map('map', {
        crs: L.CRS.Simple,
        minZoom: 1,
        maxZoom: 3,        
        // sets the center of a simple coordinate system
        center: [0.0, 0.0] 
    // sets the starting position and map zoom
    }).setView([0, 0], 1); 

    // Note the correspondence between tile directory structure and placeholders used in the URLs.
    // {z} is a placeholder for current zoom level and {x}, {y} for coordinates of a single tile
    // on a Simple CRS
    tileLayers = [
        MiddleEarthTileLayer = L.tileLayer('data/tiles/middleearth/{z}/tile_{x}_{y}.png', {
            attribution: "Middle Earth",
            noWrap: true
        }),
        GrayscaleMiddleEarthTileLayer = L.tileLayer('data/tiles/middleearthgrayscale/{z}/tile_{x}_{y}.png', {
            attribution: "Middle Earth in grayscale",
            noWrap: true
        })
    ];

    // We have the layers defined, but we also need to construct the layer GUI selection control.
    // errorTileUrl serves a failover tile that will replace any tile that failed to load or does
    // not exist. It is an one white pixel encoded in base64
    var maps = function() {
        var tempMaps = {};
        for(var i = 0; i < tileLayers.length; ++i)
        {    
            tileLayers[i].options.errorTileUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP4//8/AAX+Av4zEpUUAAAAAElFTkSuQmCC';
            tempMaps[tileLayers[i].options.attribution] = tileLayers[i];
        }
        return tempMaps;
    }();

    // add layers to map object
    map.layers = tileLayers; 
    // make first layer visible
    tileLayers[0].addTo(map); 
    // add selection control to map object
    L.control.layers(maps).addTo(map); 

    // Restrict panning only to the relevant coordinates by creating physical bounds.
    // Bounds have to be no smaller than the biggest zoom from all available layers.
    // In this example it will be Middle Earth layer in zoom 3 level, 2400x2424px.
    var southWestBound = map.unproject([0, 2400], map.getMaxZoom());
    var northEastBound = map.unproject([2424, 0], map.getMaxZoom());
    map.setMaxBounds(new L.LatLngBounds(southWestBound, northEastBound));

    var popup = L.popup(); // popup example

    // this map event example will show a popup every time map is clicked
    map.on('click', function(e){
        popup.setLatLng(e.latlng)
            .setContent("You clicked the map at " + e.latlng.toString())
            .openOn(map);
    });

    // example marker icon. It's possible to define the marker's and popup's anchor position
    var markerIcon = L.icon({
        iconUrl: "css/images/marker.png",
        iconsize: [35, 59],
        iconAnchor: [0, 47],
        popupAnchor: [19, -30]
    });
    
    // create marker and put it on map
    var marker = L.marker([-75, 103], {icon: markerIcon, draggable:'true'}).addTo(map);
   
    marker.bindPopup('<a href="https://en.wikipedia.org/wiki/Fornost#Fornost">Fornost</a>');
});