var georgetownMapping = angular.module('georgetownMapping', []);

var carto_url = 'https://gtucommunityoutreach.cartodb.com/api/v2/viz/f433ec36-445c-11e5-b6a9-0e0c41326911/viz.json';

var carto_settings = {
    hide_heatmap_on: 13,
    url: 'https://gtucommunityoutreach.cartodb.com/api/v2/viz/f433ec36-445c-11e5-b6a9-0e0c41326911/viz.json',
    options: {
            center: [38.9007, -77.0164],
            // center: [-42.27730877423707, 172.63916015625],
            zoom: 12,
            zoomControl: true,
            loaderControl: false,

            search: true,
            center_lat: true,
            center_lon: true,
            cartodb_logo: false,
            infowindow: false,
            // time_slider: true,

            layer_selector: true,
            scrollwheel: false,
            fullscreen: true,
            // mobile_layout: true,


            title: false,
            // description: false,

            shareable: false,
    }
}


var ll = undefined;


georgetownMapping.controller('mapping', function mapping($scope){

        $scope.hovered = false;
        $scope.heatmap_enabled = false;

        /**
         * Add map
         */
        cartodb
            .createVis('map', carto_settings.url, carto_settings.options)
            .done(function(vis, layers){

                // TODO debug
                ll = layers;

                var _layers = {
                    community_engagement: layers[1],
                    heatmap: layers[2],
                };

                var processMouseOver = function(e, latlng, pos, data, subLayerIndex){

                    $scope.hovered = true;

                    var address_2 = "";

                    /**
                     * Create Address_2
                     */
                    try{
                        if(data.guce_account__address__city !== undefined){
                            address_2 += data.guce_account__address__city
                        }

                        if(data.guce_account__address__state_province !== undefined){
                            address_2 += ", "
                            address_2 += data.guce_account__address__state_province
                        }

                        if( data.guce_account__address__zip_code !== undefined){
                            address_2 += " "
                            address_2 += data.guce_account__address__zip_code
                        }
                    } catch(e){}


                    $scope.hovered_data = {
                        name: data.guce_account__guce_account_name || data.name,
                        address_1: data.guce_account__address__street_1,
                        address_2: address_2,
                        type: data.type_of_program,
                        department: data.department
                    }

                    // console.log($scope.hovered_data);

                    $scope.$apply();
                }

                var processMouseOff = function(e, latlng, pos, data, subLayerIndex){

                    $scope.hovered = false;

                    $scope.$apply();
                }

                var community_engagement_0 = _layers.community_engagement.getSubLayer(0);
                community_engagement_0.on('featureOver', processMouseOver);
                // community_engagement_0.on('mouseout', processMouseOff);


                var community_engagement_1 = _layers.community_engagement.getSubLayer(1);
                community_engagement_1.on('featureOver', processMouseOver);
                // community_engagement_1.on('mouseout', processMouseOff);




                // add the tooltip show when hover on the point
                // vis.addOverlay({
                //     type: 'tooltip',
                //     position: 'top|center',
                //     template: '<p>{{guce_account__guce_account_name}}</p>'
                // });

                // vis.addOverlay({
                //     type: 'infobox',
                //     template: '<h3>{{guce_progr}}</h3></p>',
                //     width: 200,
                //     position: 'bottom|right'
                // });

                // community_engagement.set({
                //     'interactivity': ['cartodb_id', 'campus'], //['cartodb_id', 'campus', 'description']
                // });



                /**
                 * Hide heatmap when zoomed in
                 */
                vis.map.on('change:zoom', function() {
                    // var heatmap = layers[2];

                    /**
                     * Only hide heatmap if not set my default
                     */
                    if ($scope.heatmap_enabled === true){
                        return;
                    }

                    /**
                     * If too zoomed in, hide layer
                     */
                    if(vis.map.getZoom() <= carto_settings.hide_heatmap_on){
                        _layers.heatmap.hide();
                    }
                });
            });




});
