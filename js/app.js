// var ll = undefined;
(function() {


    var descriptions_by_account_name = {};

    Array.prototype.contains = function(obj) {
        var i = this.length;
        while (i--) {
            if (this[i] === obj) {
                return true;
            }
        }
        return false;
    }

    d3.select('#toTop').style('display', 'none');
    var appended = false;

    onscroll = function() {
        var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        if (scrollTop > 900) {
            if (!appended) {
                d3.select('#toTop').style('display', '');
                appended = true;
            }
        } else {
            if (appended) {
                d3.select('#toTop').style('display', 'none');
                appended = false;
            }
        }
    };

    var extra_data_url = 'js/extra_data.json';
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

    function Layer(options) {
        var self = this;
        self.name = options.name || '';
        self.layer = options.layer || {};
        self.defaultShow = options.defaultShow || false;
        self.heatmap = options.heatmap || false,
        self.hoverInfo = options.hoverInfo || false;
        self.glyphicon_class = options.glyphicon_class;

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
            .attr('class', 'layer-content')
            .attr('title', 'Display / Hide ' + self.name);

        self.glyphicon = self.button
            .append('span')
            .attr('class', self.glyphicon_class);
        self.title = self.button
            .append('span')
            .text('  ' + self.name);
    }
    Layer.prototype.processMouseOver = function(e, latlng, pos, data, subLayerIndex) {
        /**
         * Remember this is not context of layer, not class
         */
        var self = this;
        // console.log(data);
        // return;
        if (self.errors === true) {
            return;
        }

        /**
         * show container
         */
        self.hover_info_container = d3.select('#map-hover-info-container')
            .style('opacity', 1.0);

        self.hover_info_parent = d3.select('#map-hover-info');


        /**
         * Remove all children (if previous hover)
         */
        self.hover_info_parent
            .html('');

        self.hover_info = {}

        self.hover_info.name = self.hover_info_parent
            .append('div')
            .attr('id', 'hover-title')
            .append('h1')
            // .attr('id', 'hover-program-name')
            // .text('TODO no title');

        self.hover_info.caption = self.hover_info_parent
            .append('div')
            .attr('id', 'hover-caption')
            .append('h1')
            // .text('SITE CAPTION')


        self.hover_info.expanded = self.hover_info_parent
            .append('div')
            .attr('id', 'hover-info-expanded')

        self.hover_info.table = self.hover_info.expanded
            .append('table')

        var added = 0;
        for (var variable_name in data.content) {

            if ([
                'cartodb_id',
                'guce_account__address__city',
                'guce_account__address__state_province'
            ].contains(variable_name) === true) {
                continue;
            }

            var variable_content = data[variable_name];

            if (variable_name == 'campus') {
                variable_name = 'Campus Involved';
                continue;
            } else if (variable_name == 'department') {
                variable_name = 'Sponsoring Department';
            } else if (variable_name == 'guce_account__address__street_1') {
                variable_name = 'Street';
            } else if (variable_name == 'guce_account__address__zip_code') {
                variable_name = 'Zipcode';
                continue;
            } else if (variable_name == 'guce_account__parent_account') {
                variable_name = 'Account';
            } else if (variable_name == 'guce_account__dc_ward') {
                variable_name = 'D.C. Ward';
                continue;
            } else if (variable_name == 'guce_account__guce_account_name') {
                /**
                 * Switched
                 */
                // variable_name = 'Account Name';
                variable_name = 'Program Name';

                self.hover_info.name
                    .text(variable_content);


                /**
                 * link description...
                 */
                if(variable_content in descriptions_by_account_name){
                    var expanded_content = descriptions_by_account_name[variable_content];
                    // console.log(description)


                    self.hover_info.caption
                        .text(expanded_content['GUCE Program Name']);


                    self.learn_info = {};

                    self.learn_info.parent = d3.select('#learn-content');

                    self.learn_info.parent
                        .html('');

                    self.learn_info.title = self.learn_info.parent
                        .append('h1')
                        .text(variable_content);

                    self.learn_info.description = self.learn_info.parent
                        .append('p')
                        .attr('id', 'learn-description')
                        .text(expanded_content['Description']);

                } else {

                }
                continue;
            } else if (variable_name == 'guce_account__topics') {
                variable_name = 'Topics';
                continue;
            } else if (variable_name == 'guce_account__type_of_account') {
                variable_name = 'Type of Accuont';
            } else if (variable_name == 'guce_course_enrollment') {
                variable_name = 'Enrollment';
                continue;
            } else if (variable_name == 'guce_course_gu_course_number') {
                variable_name = 'Course';
            } else if (variable_name == 'guce_course_guce_course_name') {
                variable_name = 'Course Name';
            } else if (variable_name == 'guce_course_guce_department') {
                variable_name = 'Department';
            } else if (variable_name == 'guce_course_guce_program') {
                /**
                 * Switched
                 */
                // variable_name = 'Program';
                variable_name = 'Account';
            } else if (variable_name == 'guce_course_instructor_1') {
                variable_name = 'Instructor';
            } else if (variable_name == 'guce_course_instructor_2') {
                variable_name = 'Instructor II';
            } else if (variable_name == 'guce_course_semester') {
                variable_name = 'Semester';
            } else if (variable_name == 'guce_course_topics') {
                variable_name = 'Topics';
                continue;
            } else if (variable_name == 'guce_course_year') {
                variable_name = 'Course Year';
                continue;
            } else if (variable_name == 'guce_progr') {

                /**
                 * Switched
                 */

                // variable_name = 'Program Name';

                // self.hover_info.name
                //     .text(variable_content);

                variable_name = 'Account Name';
                // continue;
            } else if (variable_name == 'fields') {
                continue;
            } else if (variable_name == 'lat') {
                continue;
            } else if (variable_name == 'long') {
                continue;
            } else if (variable_name == 'parent_program') {
                variable_name = 'G.U. Program';
            } else if (variable_name == 'topics') {
                variable_name = 'Topics';
                continue;
            } else if (variable_name == 'type_of_program') {
                variable_name = 'Type';
            } else {
                console.log(variable_name, variable_content);
            }


            // variable_name = variable_name.split('_');

            // var row = self.hover_info.table
            //     .append('tr');

            // row.append('td')
            //     .attr('class', 'variable-name')
            //     .text(variable_name);

            // row.append('td')
            //     .attr('class', 'variable-content')
            //     .text(variable_content);

            added += 1;
        }



        /**
         * For Learn
         */
        self.learn = d3.select('#learn');
        // TODO
        // for (var variable_name in data.content) {

        //     if ([
        //         'cartodb_id',
        //         'guce_account__address__city',
        //         'guce_account__address__state_province'
        //     ].contains(variable_name) === true) {
        //         continue;
        //     }

        //     var variable_content = data[variable_name];

        //     if (variable_name == 'campus') {
        //         variable_name = 'Campus Involved';
        //     } else if (variable_name == 'department') {
        //         variable_name = 'Sponsoring Department';
        //     } else if (variable_name == 'guce_account__address__street_1') {
        //         variable_name = 'Street';
        //     } else if (variable_name == 'guce_account__address__zip_code') {
        //         variable_name = 'Zipcode';
        //     } else if (variable_name == 'guce_account__parent_account'){
        //         variable_name = 'Account';
        //     } else if (variable_name == 'guce_account__dc_ward') {
        //         variable_name = 'D.C. Ward';
        //     } else if (variable_name == 'guce_account__guce_account_name') {
        //         variable_name = 'Account Name';
        //     } else if (variable_name == 'guce_account__topics') {
        //         variable_name = 'Topics';
        //     } else if (variable_name == 'guce_account__type_of_account') {
        //         variable_name = 'Type of Accuont';
        //     } else if (variable_name == 'guce_course_enrollment') {
        //         variable_name = 'Enrollment';
        //     } else if (variable_name == 'guce_course_gu_course_number') {
        //         variable_name = 'Course';
        //     } else if (variable_name == 'guce_course_guce_course_name') {
        //         variable_name = 'Course Name';
        //     } else if (variable_name == 'guce_course_guce_department') {
        //         variable_name = 'Department';
        //     } else if (variable_name == 'guce_course_guce_program'){
        //         variable_name = 'Program';
        //     } else if (variable_name == 'guce_course_instructor_1') {
        //         variable_name = 'Instructor';
        //     } else if (variable_name == 'guce_course_instructor_2') {
        //         variable_name = 'Instructor II';
        //     } else if (variable_name == 'guce_course_semester') {
        //         variable_name = 'Semester';
        //     } else if (variable_name == 'guce_course_topics') {
        //         variable_name = 'Topics';
        //     } else if (variable_name == 'guce_course_year') {
        //         variable_name = 'Course Year';
        //     } else if (variable_name == 'guce_progr'){
        //         variable_name = 'Program Name';
        //     } else if (variable_name == 'fields'){
        //         variable_name = 'Fields';
        //     } else if (variable_name == 'lat') {
        //         continue;
        //     } else if (variable_name == 'long') {
        //         continue;
        //     } else if (variable_name == 'parent_program') {
        //         variable_name = 'G.U. Program';
        //     } else if (variable_name == 'topics') {
        //         variable_name = 'Topics';
        //     } else if (variable_name == 'type_of_program') {
        //         variable_name = 'Type';
        //     } else {
        //         console.log(variable_name, variable_content);
        //     }


        //     // variable_name = variable_name.split('_');

        //     var row = self.hover_info.table
        //         .append('tr');

        //     row.append('td')
        //         .attr('class', 'variable-name')
        //         .text(variable_name);

        //     row.append('td')
        //         .attr('class', 'variable-content')
        //         .text(variable_content);

        //     added += 1;
        // }



        /**
         * Hover Info Button
         */
        self.hover_info_button = self.hover_info_parent
            .append('a')
            .attr('href', '#learn')
        // .attr('class', 'blink')
        .append('div')
            .attr('id', 'learn-more')
            .append('h1')
            .text('Learn More');


        if (added == 0) {
            self.hover_info.name
                .text('todo, no content');

            self.hover_info_parent
                .html('');
        }

        return self;
    }
    Layer.prototype.processMouseOff = function() {
        // console.log("OFF");
        if (self.errors === true) {
            return;
        }

        // self.hover_info_container = d3.select('#map-hover-info-container')
        //     .style('opacity', 0.0);

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

    function loadJSON(file, callback) {
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', file, true);
        xobj.onreadystatechange = function() {
            if (xobj.readyState == 4 && xobj.status == "200") {
                callback(JSON.parse(xobj.responseText));
            }
        };
        xobj.send(null);
    }

    var main = function(json_data) {


        /**
         * Process link data
         */
        json_data.forEach(function(val, i, arr){
            /**
             * Link on 'GUCE Account Name'
             */

            // console.log(val['GUCE Account Name']);
            descriptions_by_account_name[val['GUCE Account Name']] = val;
        });



        // console.log(json_data);
        /**
         * Add map
         */
        cartodb
            .createVis('map', carto_settings.url, carto_settings.options)
            .done(function(vis, _layers) {
                // ll = _layers; // TODO for debug
                /**
                 * Clear layer buttons just incase... should only be happening on
                 * local dev machine
                 */
                d3.select('#layers').html('');

                /**
                 * Assign Layers
                 */
                var layers = {
                    'Heatmap': new Layer({
                        name: 'Heatmap',
                        layer: _layers[2],
                        defaultShow: true,
                        heatmap: true,
                        glyphicon_class: 'glyphicon glyphicon-fire'
                    }),
                    'Community Outreach': new Layer({
                        name: 'Community Outreach',
                        layer: _layers[1].getSubLayer(0),
                        defaultShow: false,
                        hoverInfo: true,
                        glyphicon_class: 'glyphicon glyphicon-user',
                        // link_data: json_data,
                    }),
                    // 'Homeless Shelters': new Layer({
                    //     name: 'Homeless Shelters',
                    //     layer: _layers[1].getSubLayer(1),
                    //     defaultShow: false,
                    //     hoverInfo: true,
                    //     glyhicon_class: 'glyphicon glyphicon-th-large',
                    // }),
                    'D.C. Wards': new Layer({
                        name: 'D.C. Wards',
                        layer: _layers[1].getSubLayer(1),
                        defaultShow: false,
                        glyphicon_class: 'glyphicon glyphicon-th-large',
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
                    // console.log(layers['Heatmap'].click_enabled);
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
    };

    loadJSON(extra_data_url, main);

})()
