(function(){

    onePageScroll(".main", {
       sectionContainer: "section",
       easing: "ease",

       animationTime: 1000,
       pagination: true,
       updateURL: false,
       beforeMove: function(index) {},
       afterMove: function(index) {},
       loop: false,
       keyboard: true,
       responsiveFallback: false
    });



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
                layer_selector: false,

                search: true,
                center_lat: true,
                center_lon: true,
                cartodb_logo: false,
                infowindow: false,
                // time_slider: true,

                scrollwheel: false,
                fullscreen: true,
                // mobile_layout: true,


                title: false,
                // description: false,

                shareable: false,
        }
    }


    var ll = undefined;


    var hovered = false;
    var layers = {};

    // console.log("LAYERS");
    // console.log($scope._layers);
    var s;

    function Layer(options){
        var self = this;

        self.name           = options.name          || '';
        self.layer          = options.layer         || {};
        self.defaultShow    = options.defaultShow   || false;
        self.heatmap        = options.heatmap       || false,
        self.hoverInfo      = options.hoverInfo     || false;

        self.parent = d3.select('#layers');

        self.button = null;

        /**
         * Auto hide, then set to show
         */
        self.hide();
        self.visible = false;


        if(self.defaultShow === true){
            self.show();
            self.visible = true;
        }

        /**
         * Setup hover info
         */

        if(self.hoverInfo === true) {
            self.layer.on('featureOver', self.processMouseOver);
            self.layer.on('mouseout', self.processMouseOff);
        }



        return self;
    }

    Layer.prototype.constructor = Layer;

    Layer.prototype.makeLayerButton = function(){
        var self = this;

        self.button_wrapper = self.parent
            .append('div')
            .attr('class', 'layer-wrapper')
            .on('click', function(){
                /**
                 * Toggle Layer
                 */
                self.toggleLayer();
            })
            .on('mouseover', function(d){
                /**
                 * Show layer in case
                 */
                self.setLayerToOppositeState();
            })
            .on('mouseout', function(d){

                /**
                 * Set back current state
                 */
                self.setLayerToCurrentState();
            })
            ;

        self.button_wrapper.classed('selected', self.visible);

        self.button = self.button_wrapper
            .append('div')
            .attr('class', 'layer-content');

        self.title = self.button
            .append('span')
            .text(self.name);
    }

    Layer.prototype.processMouseOver = function(e, latlng, pos, data, subLayerIndex){
        /**
         * Remember this is not context of layer, not class
         */
        var self = this;

        /**
         * Remove all children (if previous hover)
         */
        self.hover_info_parent = d3.select('#map-info #info');
        self.hover_info_parent
            .html('');

        /**
         * Append child
         */
        self.hover_info = self.hover_info_parent
            .append('div')
            .attr('id', 'hover-info');

        self.hover_info
            .append('h1')
            .text(data.guce_account__guce_account_name);


        console.log(data)
        // var address_2 = "";

        // /**
        //  * Create Address_2
        //  */
        // try{
        //     if(data.guce_account__address__city !== undefined){
        //         address_2 += data.guce_account__address__city
        //     }

        //     if(data.guce_account__address__state_province !== undefined){
        //         address_2 += ", "
        //         address_2 += data.guce_account__address__state_province
        //     }

        //     if( data.guce_account__address__zip_code !== undefined){
        //         address_2 += " "
        //         address_2 += data.guce_account__address__zip_code
        //     }
        // } catch(e){}


        // hovered_data = {
        //     name: data.guce_account__guce_account_name || data.name,
        //     address_1: data.guce_account__address__street_1,
        //     address_2: address_2,
        //     type: data.type_of_program,
        //     department: data.department
        // };

        return self;
    }

    Layer.prototype.processMouseOff = function(){
        console.log("OFF");
        // console.log(self.hover_info_parent);
    }

    Layer.prototype.reset = function(){
        var self = this;

        /**
         * Force show
         * fixed heatmap issue
         */
        try{
        // if(self.heatmap === true){
            self.layer._reset();
        // }
        } catch(err){};

        return self;
    }

    Layer.prototype.show = function(){
        var self = this;

        /**
         * Hide Layer
         */
        self.layer.show();

        /**
         * Reset
         */
        self.reset();
    }

    Layer.prototype.hide = function(){
        var self = this;

        /**
         * Hide Layer
         */
        self.layer.hide();

        /**
         * Reset
         */
        self.reset();
    }

    Layer.prototype.setLayerToOppositeState = function(){
        var self = this;

        if (self.visible === true){
            self.hide();
        } else {
            self.show();
        }

        return self;
    }

    Layer.prototype.setLayerToCurrentState = function(){
        var self = this;

        if (self.visible === true){
            self.show();
        } else {
            self.hide();
        }

        return self;
    }

    Layer.prototype.toggleLayer = function(){
        var self = this;

        /**
         * Reverse
         */
        self.visible = !(self.visible);

        /**
         * Add or remove selected as need be
         */
        self.button_wrapper
            .classed("selected",
                !(self.button_wrapper.classed("selected"))
            )

        /**
         * Set to current state
         */
        self.setLayerToCurrentState();

        return self;
    }

    var ll = "";

    /**
     * Add map
     */
    cartodb
        .createVis('map', carto_settings.url, carto_settings.options)
        .done(function(vis, _layers) {

            ll = _layers;
            /**
             * Assign Layers
             */

            layers = {
                'Heatmap': new Layer({
                    name: 'Heatmap',
                    layer: _layers[2],
                    defaultShow: true,
                    heatmap: true,
                }),
                'Community Outreach': new Layer({
                    name: 'Community Outreach',
                    layer: _layers[1].getSubLayer(0),
                    defaultShow: true,
                    hoverInfo: true,
                }),
                'Homeless Shelters': new Layer({
                    name: 'Homeless Shelters',
                    layer: _layers[1].getSubLayer(1),
                    defaultShow: false,
                    hoverInfo: true,
                }),
                'D.C. Wards': new Layer({
                    name: 'D.C. Wards',
                    layer: _layers[1].getSubLayer(2),
                    defaultShow: false,
                }),
            };

            /**
             * Append layer buttons
             */
            for(var layer_key in layers){
                var layer = layers[layer_key];

                layer.makeLayerButton();

            }

            // var processMouseOver = function(e, latlng, pos, data, subLayerIndex){

            //     hovered = true;

            //     var address_2 = "";

            //     /**
            //      * Create Address_2
            //      */
            //     try{
            //         if(data.guce_account__address__city !== undefined){
            //             address_2 += data.guce_account__address__city
            //         }

            //         if(data.guce_account__address__state_province !== undefined){
            //             address_2 += ", "
            //             address_2 += data.guce_account__address__state_province
            //         }

            //         if( data.guce_account__address__zip_code !== undefined){
            //             address_2 += " "
            //             address_2 += data.guce_account__address__zip_code
            //         }
            //     } catch(e){}


            //     hovered_data = {
            //         name: data.guce_account__guce_account_name || data.name,
            //         address_1: data.guce_account__address__street_1,
            //         address_2: address_2,
            //         type: data.type_of_program,
            //         department: data.department
            //     };

            //     console.log(hovered_data);
            // };

            // var processMouseOff = function(e, latlng, pos, data, subLayerIndex){
            //     hovered = false;
            // };

            // /**
            //  * Hover layers
            //  */
            // layers['Community Outreach'].layer.on('featureOver', processMouseOver);
            // // community_engagement_0.on('mouseout', processMouseOff);

            // layers['Homeless Shelters'].layer.on('featureOver', processMouseOver);
            // // community_engagement_1.on('mouseout', processMouseOff);




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
            // vis.map.on('change:zoom', function() {
            //     // var heatmap = layers[2];

            //     /**
            //      * Only hide heatmap if not set my default
            //      */
            //     if ($scope.heatmap_enabled === true){
            //         return;
            //     }

            //     /**
            //      * If too zoomed in, hide layer
            //      */
            //     if(vis.map.getZoom() <= carto_settings.hide_heatmap_on){
            //         $scope._layers.heatmap.hide();
            //     }
            // });
        });


    // georgetownMapping.controller('mapping', function mapping($scope){

    //         $scope.hovered = false;
    //         $scope.heatmap_enabled = false;
    //         $scope._layers = {};



    //         // $scope._layers.push("A");



    //             // Object.keys($scope._layers)
    //                 //     .map(function (key) {

    //                 //         val = {
    //                 //             name: key,
    //                 //             layer: $scope._layers[key],
    //                 //             enabled: true
    //                 //         };

    //                 //         return val;
    //                 //     });

    //         // $scope.$scope._layers = $scope._layers;

    // });


    // console.log("LAYERS");
    // console.log($scope._layers);


})()
