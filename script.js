/////////////////////////////////////////LEGEND
var linear = d3.scale.linear()
  .domain([0,10,20])
  .range(["#23303e","#3d995f", "#f3d110"]);

var linear2 = d3.scale.linear()
  .domain([0,25,50])
  .range(["#23303e","#3d995f", "#f3d110"]);

var svg = d3.select("#legendChart svg");

svg.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(20,20)");

var legendLinear = d3.legend.color()
  .shapeWidth(25)
  .cells(10)
  .orient('horizontal')
  .labelFormat(d3.format(".0f"))
  .scale(linear);

var legendLinear2= d3.legend.color()
  .shapeWidth(25)
  .cells(10)
  .orient('horizontal')
  .labelFormat(d3.format(".0f"))
  .scale(linear2);

svg.select(".legendLinear")
  .call(legendLinear2);
////////////////////////////////////////////////



/////////////////////////////////////////FILTER MENU
var menu2 = d3.select("#menu2 select").on("change", change);
function change() {
  var selectedRegion = $("#sel1").val();
  
  if(selectedRegion != "all"){
    var selectedRegion = $("#sel1").val();
    var yearSelection = $("#yearSelection").val();
    $("#sel1").change(onSelectChange);
    
    function onSelectChange() {
      setRegion(selectedRegion);
    }
    
    var myJson = $.getJSON(
  "https://gist.githubusercontent.com/JesseCHowe/51d5b605c0264e5d43c53d83dcf4a43a/raw/2c136ecb6767dbc449f745a6279f3b21d9fec1ea/kcneighborhoods.json"
    );
    
  myJson.then(function(data) {
    var featuredata = $("#sel1").val();
    var bbox2 = turf.extent(data.features[featuredata].geometry);
    
    map.fitBounds(bbox2, {
      padding: 100
    });
    map.removeLayer("neighborghoods-click");
    map.addLayer({
      id: "neighborghoods-click",
      type: "line",
      source: "neighborhoods",
      layout: {},
      paint: {
        "line-color": "#ffffff",
        "line-opacity": 1,
      },
      filter: [
        "==",
        "Name",
        data.features[featuredata].properties.Name
      ]
    }, "waterway-label" );
    
    $("#sel1").change( $("#sel1").val(newset))
  });
  }
  else{
    map.flyTo({
      center: [-94.6, 39.03],
      zoom: 11
    });
    map.removeLayer("neighborghoods-click");

  }
  
}
////////////////////////////////////////////////


/////////////////////////////////////////MAP
mapboxgl.accessToken =
  "pk.eyJ1IjoiamVzc2Vob3dlIiwiYSI6Ikh1aXhQS1EifQ.6rFsZELfOthk6dfak3o6lw";

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v8",
  center: [-97.5164, 35.4676],
  zoom: 9
});

var geocoder = new MapboxGeocoder({
accessToken: mapboxgl.accessToken,
mapboxgl: mapboxgl
});
 
document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

map.on("load", function() {
  
  map.addSource("dispensaries", {
    type: "geojson",
    data: "https://gist.githubusercontent.com/JesseCHowe/93d402b8d13066ab4c8783cee6838d7f/raw/8f33d53eac4f23686081013d7015ab1d15f8b42f/CLEAN%2520-%2520Dispensaries.geojson",
    cluster: false,
    clusterMaxZoom: 22, // Max zoom to cluster points on
    clusterRadius: 10 // Radius of each cluster when clustering points (defaults to 50)
  });
  map.addSource("zip", {
    type: "geojson",
    data: "https://gist.githubusercontent.com/JesseCHowe/e1cfe815f163f5789ae92a1c80f746dc/raw/b0c3c63af19c16c63b4e0a1f7810f60bfff30a15/Oklahoma_Marijuana.json"
  });

  //Growers
  map.addLayer({
      id: "growers",
      type: "fill",
      source: "zip",
      layout: {},
      paint: {
        "fill-color": {
          property: "Marijuana Ok Watch Complete_Growers",
          stops: [
            [0, "#23303e"],
            [13, "#2e4f4d"],
            [26, "#377359"],
            [39, "#3d995f"],
            [52, "#84aa50"],
            [65, "#bdbd3c"],
            [78, "#f3d110"]
          ]
        },
        "fill-opacity": 0.5
      }
    }, "waterway-label" );
  //Processors
  map.addLayer({
      id: "processors",
      type: "fill",
      source: "zip",
      layout: {},
      paint: {
        "fill-color": {
          property: "Marijuana Ok Watch Complete_Processors",
          stops: [
            [0, "#23303e"],
            [8, "#2e4f4d"],
            [16, "#377359"],
            [24, "#3d995f"],
            [31, "#84aa50"],
            [39, "#bdbd3c"],
            [47, "#f3d110"]
          ]
        },
        "fill-opacity": 0.5
      }
    }, "waterway-label" );
  //Dispensaries
  map.addLayer({
      id: "dispensaries",
      type: "circle",
      source: "dispensaries",
      paint: {
        "circle-color": "#000",
        "circle-radius": 5,
        "circle-opacity": 1
      },
    }, "waterway-label" );

  map.setLayoutProperty('dispensaries', 'visibility', 'none');
  map.setLayoutProperty('processors', 'visibility', 'none');

    /*map.on('mousemove', 'dispensaries', function (f) {
new mapboxgl.Popup({className: 'popupCustom'})
    .setLngLat(f.lngLat)
    .setHTML('HTML THREE')
    .addTo(map);
});*/
    var popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false
    });
    map.on("mousemove", "growers", function(e) {
      map.getCanvas().style.cursor = 'pointer';
      popup.setLngLat(e.lngLat)
        .setHTML("<div class='container'>" + 
                 "<div class='card'>" +       
                 "<p><span class='business'><strong>" + 
                 e.features[0].properties.ZCTA5CE10 + 
                 "</strong></span>"+"</br>" +
                 e.features[0].properties['Marijuana Ok Watch Complete_City'] + ", OK" +
                 "<br/>" +
                 "Growers: <strong>" + e.features[0].properties['Marijuana Ok Watch Complete_Growers'] + "</strong>" +
                 "<br/>" +
                 "Processors: <strong>" + e.features[0].properties['Marijuana Ok Watch Complete_Processors'] + "</strong>" +
                 "<br/>" +
                 "Dispensaries: <strong>" + e.features[0].properties['Marijuana Ok Watch Complete_Dispensaries'] + "</strong>" +
                 "</p>" +
                 "</div>" + 
                 "</div>")
        .addTo(map);
  });
    map.on("mouseleave", "growers", function() {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });
  
    map.on('mouseenter', 'dispensaries', function(e) {
        // Change the cursor style as a UI indicator.
        map.getCanvas().style.cursor = 'pointer';

        // Populate the popup and set its coordinates
        // based on the feature found.
        popup.setLngLat(e.features[0].geometry.coordinates)
                    .setHTML("<div class='container'>" + 
                 "<div class='card'>" +       
                 "<p><span class='business'><strong>" + 
                 e.features[0].properties.Name + 
                 "</strong></span>"+"</br>" +
                 e.features[0].properties.Address + 
                 "<br/>" +
                 e.features[0].properties.City + ", OK" + 
                 "</p>" +
                 "</div>" + 
                 "</div>")
            .addTo(map);
    });
    map.on("mouseleave", "dispensaries", function() {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });
  
    map.on("mousemove", "processors", function(e) {
      map.getCanvas().style.cursor = 'pointer';
      popup.setLngLat(e.lngLat)
        .setHTML("<div class='container'>" + 
                 "<div class='card'>" +       
                 "<p><span class='business'><strong>" + 
                 e.features[0].properties.ZCTA5CE10 + 
                 "</strong></span>"+"</br>" +
                 e.features[0].properties['Marijuana Ok Watch Complete_City'] + ", OK" +
                 "<br/>" +
                 "Growers: <strong>" + e.features[0].properties['Marijuana Ok Watch Complete_Growers'] + "</strong>" +
                 "<br/>" +
                 "Processors: <strong>" + e.features[0].properties['Marijuana Ok Watch Complete_Processors'] + "</strong>" +
                 "<br/>" +
                 "Dispensaries: <strong>" + e.features[0].properties['Marijuana Ok Watch Complete_Dispensaries'] + "</strong>" +
                 "</p>" +
                 "</div>" + 
                 "</div>")
        .addTo(map);
    });
    map.on("mouseleave", "processors", function() {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });
});

map.scrollZoom.disable();
map.addControl(new mapboxgl.NavigationControl());

map.on('click', 'neighborghoods', function(e) {
  var coordinates = e.features[0].geometry.coordinates;
  var bbox = turf.extent(e.features[0].geometry);
  map.fitBounds(bbox, {
    padding: 100
  });
  var newset = e.features[0].properties.ID;
  $("#sel1").change( $("#sel1").val(newset))
});

////////////////////////////////////////////////

function showGrowers() {
  map.setLayoutProperty('processors', 'visibility', 'none');
  map.setLayoutProperty('dispensaries', 'visibility', 'none');
  map.setLayoutProperty('growers', 'visibility', 'visible');
  svg.select(".legendLinear").call(legendLinear2);
  d3.select("#legendChart").style("opacity","1");
  d3.selectAll("#legendChart p").html('Number of Growers');
    d3.selectAll(".sidebar button").classed('active', false);
  d3.select(".growers-button").classed('active', true);
}

function showProcessors() {
  map.setLayoutProperty('dispensaries', 'visibility', 'none');
  map.setLayoutProperty('growers', 'visibility', 'none');
  map.setLayoutProperty('processors', 'visibility', 'visible');
  //svg.select(".legendLinear").remove();
  svg.select(".legendLinear").call(legendLinear);
  d3.select("#legendChart").style("opacity","1");
  d3.selectAll("#legendChart p").html('Number of Processors');
    d3.selectAll(".sidebar button").classed('active', false);
  d3.select(".processors-button").classed('active', true);
}

function showDispensaries() {
  map.setLayoutProperty('processors', 'visibility', 'none');
  map.setLayoutProperty('growers', 'visibility', 'none');
  map.setLayoutProperty('dispensaries', 'visibility', 'visible');
  d3.select("#legendChart").style("opacity","0");
  d3.selectAll(".sidebar button").classed('active', false);
  d3.select(".dispensaries-button").classed('active', true);
}


  /*var popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false
  });*/

  
 /*map.on('mouseenter', 'dispensaries', function(e) {
    map.getCanvas().style.cursor = 'pointer';
    popup.setLngLat(e.features[0].geometry.coordinates)
      .setHTML("<div class='container'>" + 
               
               "<div class='card'>" +       
               "<p><span class='business'><strong>" + 
               e.features[0].properties.Name + 
               "</strong></span>"+"</br>" +
               e.features[0].properties.Address + 
               "<br/>" +
               e.features[0].properties.City + ", OK" + 
               "</p>" +
               "</div>" + 
               
               "</div>"
              )
      .addTo(map);
    });
  map.on("mouseleave", "dispensaries", function() {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });*/

