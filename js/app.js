var ll = undefined;

(function() {


    // var conn = new jsforce.Connection({ accessToken: '{!$Api.Session_Id}' });
    // var query = "SELECT Id, Name, Phone, Title from Contact ORDER BY Name ASC LIMIT 1000";


    // console.log(conn);
    // console.log(quer);


    // return

    // onePageScroll(".main", {
    //    sectionContainer: "section",
    //    easing: "ease",

    //    animationTime: 500,
    //    pagination: true,
    //    updateURL: false,
    //    beforeMove: function(index) {},
    //    afterMove: function(index) {},
    //    loop: false,
    //    keyboard: true,
    //    responsiveFallback: false
    // });



    var carto_url = 'https://gtucommunityoutreach.cartodb.com/api/v2/viz/f433ec36-445c-11e5-b6a9-0e0c41326911/viz.json';

    var carto_settings = {
        hide_heatmap_on: 13,
        url: 'https://gtucommunityoutreach.cartodb.com/api/v2/viz/f433ec36-445c-11e5-b6a9-0e0c41326911/viz.json',
        options: {
            shareable: false,
            title: false,
            description: false,
            search: false,
            zoomControl: true,
            loaderControl: false,

            // center_lat: true,
            // center_lon: true,
            center: [38.9007, -77.0164],
            // center: [-42.27730877423707, 172.63916015625],
            zoom: 12,
            cartodb_logo: false,
            infowindow: false,
            time_slider: false,
            layer_selector: false,
            // legends: true,
            https: false,
            scrollwheel: false,
            fullscreen: true,
            // mobile_layout: true,
            force_mobile: false,
            // gmaps_base_type: true,
            // gmaps_style: true,
            no_cdn: false,
        }
    }



    var hovered = false;
    var layers = {};

    function Layer(options) {
        var self = this;

        self.name = options.name || '';
        self.layer = options.layer || {};
        self.defaultShow = options.defaultShow || false;
        self.heatmap = options.heatmap || false,
        self.hoverInfo = options.hoverInfo || false;

        self.parent = d3.select('#layers');

        self.button = null;

        self.visible = true;
        self.errors = false;
        self.click_enabled = false;

        /**
         * Auto hide, then set to show
         */

        try {
            self.hide();
        } catch (err) {

            console.log('Error in hiding layer' + err);

            self.errors = true
        }

        self.visible = false;


        if (self.defaultShow === true) {
            self.show();
            self.visible = true;
        }

        /**
         * Setup hover info
         */

        if (self.hoverInfo === true) {
            self.layer.on('featureOver', self.processMouseOver);
            self.layer.on('mouseout', self.processMouseOff);
        }



        return self;
    }

    Layer.prototype.constructor = Layer;

    Layer.prototype.makeLayerButton = function() {
        var self = this;

        self.button_wrapper = self.parent
            .append('div')
            .attr('class', 'layer-wrapper')
            .on('click', function() {
                /**
                 * Toggle Layer
                 */
                self.toggleLayer();

                self.click_enabled = true;
            })
            .on('mouseover', function(d) {
                /**
                 * Show layer in case
                 */
                self.setLayerToOppositeState();
            })
            .on('mouseout', function(d) {

                /**
                 * Set back current state
                 */
                self.setLayerToCurrentState();
            });

        self.button_wrapper.classed('selected', self.visible);

        self.button = self.button_wrapper
            .append('div')
            .attr('class', 'layer-content');

        self.title = self.button
            .append('span')
            .text(self.name);
    }

    Layer.prototype.processMouseOver = function(e, latlng, pos, data, subLayerIndex) {
        /**
         * Remember this is not context of layer, not class
         */
        var self = this;

        // console.log(data);

        if (self.errors === true) {
            return;
        }

        /**
         * Remove all children (if previous hover)
         */
        self.hover_info_parent = d3.select('#map-info #info');
        self.hover_info_parent
            .html('');

        /**
         * Append child
         */
        self.info_main = self.hover_info_parent
            .append('div')
            .attr('id', 'info-min');

        self.info_main
            .append('h1')
            .text(data.guce_account__guce_account_name);

        self.info_main
            .append('h2')
            .text(data.guce_account__address__street_1);

        self.info_extended = self.hover_info_parent
            .append('div')
            .attr('id', 'info-extended');


        description = ''


        if (data.guce_progr != undefined) {
            description += 'Georgetown University\'s'
            description += ' ' + data.guce_progr
            description += ' volunteers here'
        } else if(data.guce_course_instructor_1 != undefined){
            description += 'is aided by Georgetown University\'s'
            description += ' ' + data.guce_course_instructor_1
            description += ' in the course'
            description += ' ' + guce_course_gu_course_number
            description += ' -'
            description += ' ' + guce_course_guce_course_name
        }

        self.info_extended
            .append('p')
            .text(description)


        function addTopics(d){
            var topics = d.split('; ');


            if (topics.length > 0) {
                self.info_extended
                    .append('h3')
                    .attr('class', 'left-justify')
                    .text('Topics Include:');

                self.topic_list = self.info_extended
                    .append('ul')
                    .attr('class', 'left-justify')
                    .attr('id', 'topic-list');


                for (var i_topic in topics) {

                    var topic = topics[i_topic];

                    self.topic_list
                        .append('li')
                        .text(topic);
                }

            }
        }

        if (data.guce_course_topics != undefined) {
            addTopics(data.guce_course_topics);
        } else if( data.guce_account__topics != undefined){
            addTopics(data.guce_account__topics);
        }


        // iterate thru topics

        // console.log(data)

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

    Layer.prototype.processMouseOff = function() {
        console.log("OFF");

        if (self.errors === true) {
            return;
        }

        // console.log(self.hover_info_parent);
    }

    Layer.prototype.reset = function() {
        var self = this;

        /**
         * Force show
         * fixed heatmap issue
         */
        try {
            // if(self.heatmap === true){
            self.layer._reset();
            // }
        } catch (err) {};

        return self;
    }

    Layer.prototype.show = function() {
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

    Layer.prototype.hide = function() {
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

    Layer.prototype.setLayerToOppositeState = function() {
        var self = this;

        if (self.visible === true) {
            self.hide();
        } else {
            self.show();
        }

        return self;
    }

    Layer.prototype.setLayerToCurrentState = function() {
        var self = this;

        if (self.visible === true) {
            self.show();
        } else {
            self.hide();
        }

        return self;
    }

    Layer.prototype.toggleLayer = function() {
        var self = this;

        /**
         * Reverse
         */
        self.visible = !(self.visible);


        /**
         * Add or remove selected as need be
         */
        self.button_wrapper
            .classed("selected", !(self.button_wrapper.classed("selected")))

        /**
         * Set to current state
         */
        self.setLayerToCurrentState();

        return self;
    }

    Layer.prototype.forceShow = function() {
        var self = this;

        self.visible = true;

        self.click_enabled = true;

        self.button_wrapper
            .classed("selected", true)

        /**
         * Set to current state
         */
        self.setLayerToCurrentState();

        return self;

    }

    Layer.prototype.forceHide = function() {
        var self = this;

        self.visible = false;

        self.button_wrapper
            .classed("selected", false)

        /**
         * Set to current state
         */
        self.setLayerToCurrentState();

        return self;

    }


    /**
     * Add map
     */
    cartodb
        .createVis('map', carto_settings.url, carto_settings.options)
        .done(function(vis, _layers) {

            ll = _layers; // TODO for debug

            /**
             * Assign Layers
             */
            layers = undefined;
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
                    defaultShow: false,
                    hoverInfo: true,
                }),
                // 'Homeless Shelters': new Layer({
                //     name: 'Homeless Shelters',
                //     layer: _layers[1].getSubLayer(1),
                //     defaultShow: false,
                //     hoverInfo: true,
                // }),
                'D.C. Wards': new Layer({
                    name: 'D.C. Wards',
                    layer: _layers[1].getSubLayer(1),
                    defaultShow: false,
                }),
            };

            /**
             * Append layer buttons
             */
            for (var layer_key in layers) {
                var layer = layers[layer_key];

                layer.makeLayerButton();

            }

            /**
             * Hide heatmap when zoomed in
             */
            vis.map.on('change:zoom', function() {
                /**
                 * Only hide heatmap if not set my default
                 */


                console.log(layers['Heatmap'].click_enabled);
                if (layers['Heatmap'].click_enabled === true) {
                    return;
                }

                /**
                 * If too zoomed in, hide layer
                 */
                if (vis.map.getZoom() <= carto_settings.hide_heatmap_on) {
                    layers['Heatmap'].forceHide();
                    layers['Community Outreach'].forceShow();
                    layers['D.C. Wards'].forceShow();

                }
            });
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
