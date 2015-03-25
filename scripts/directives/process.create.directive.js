SU.directive('d3CreateProcess', function() {
    return {
        restrict: 'EA',
        scope: {
            tasks: '=',
            actions: '='
        },
        link: function(scope, element, attrs, $window, $rootScope) {

            console.log('directive was passed these actions', scope.actions);

            var canvas = d3.select(element[0])
                .html('') // Reset the canvas so that it redraws on init command
                .append('svg')
                .attr("width", '100%')
                //.style('background-color', 'red')
                .attr("height", '100%');


            var process_designer = {
                "init": function() {
                    this.destroy.canvas();
                    this.drawNodes();
                    this.drawLines();
                },
                config: {
                    task: {
                        // WHEN CREATING A TASK, THIS IS WHERE IT WILL APPEAR, (I.E 50 PIXELS FROM THE TOP & LEFT)
                        location_offset: 100,
                        radius: 70
                    },
                    buttons: {
                        radius: 20
                    },
                    circles: [
                        // CONFIG FOR THE TASK NODES
                        {
                            fill: 'purple'
                        },
                        // CONFIG FOR A BUTTON
                        {
                            css_classes: ['button_circle', 'hide'],
                            label_classes: ['button_label', 'hide'],
                            label_text: 'E',
                            x_offset: 70, // TODO: DRIVE THIS FROM THE CONFIG
                            fill: 'green',
                            radius: 20 // TODO: REPLACE WITH THIS; process_designer.config.task.radius
                        },
                        //CONFIG FOR A BUTTON 
                        {
                            css_classes: ['button_circle', 'hide'],
                            label_classes: ['button_label', 'hide'],
                            label_text: 'D',
                            y_offset: 70, // TODO: DRIVE THIS FROM THE CONFIG
                            fill: 'green',
                            radius: 20 // TODO: REPLACE WITH THIS; process_designer.config.task.radius
                        },
                        //CONFIG FOR A BUTTON 
                        {
                            css_classes: ['button_circle', 'hide'],
                            label_classes: ['button_label', 'hide'],
                            label_text: 'N & D',
                            x_offset: -70, // TODO: DRIVE THIS FROM THE CONFIG
                            fill: 'green',
                            radius: 20 // TODO: REPLACE WITH THIS; process_designer.config.task.radius
                        },
                        //CONFIG FOR A BUTTON 
                        {
                            css_classes: ['button_circle', 'hide'],
                            label_classes: ['button_label', 'hide'],
                            label_text: 'R',
                            y_offset: -70, // TODO: DRIVE THIS FROM THE CONFIG
                            fill: 'green',
                            radius: 20 // TODO: REPLACE WITH THIS; process_designer.config.task.radius
                        }


                    ]
                },
                updateTask: function(task_id, property, value) {
                    scope.tasks[task_id][property] = value;
                    // TODO: REMOVE ME
                    console.log('updated task id', task_id);
                },
                destroy: {
                    canvas: function() {
                        return canvas.html('');
                    },
                    all_lines: function() {
                        return canvas.selectAll('.dependency-line').remove();
                    }
                },
                translateElement: function(element, coordinates) {
                    coordinates.x = coordinates.x || 0;
                    coordinates.y = coordinates.y || 0;
                    return d3.select(element).attr("transform", "translate(" + coordinates.x + "," + coordinates.y + ")");
                },
                group: {
                    // NOTE: PASSING IN PROCESS DESIGNER LIKE THIS IS A LITTLE HACKY
                    create: function(process_designer, id) {
                        var g = canvas.append('g');

                        return g.attr('id', 'task-' + id)
                            .on("mouseover", _.partial(process_designer.group.showHideButton, g, false))
                            .on("mouseout", _.partial(process_designer.group.showHideButton, g, true))
                            .call(process_designer.handlers.drag.run());
                    },
                    showHideButton: function(g, value) {
                        var buttons = g.selectAll(".button_circle")[0] || [];
                        var labels = g.selectAll(".button_label")[0] || [];
                        var nodes = buttons.concat(labels);

                        _.each(nodes, function(element) {
                            var is_hidden = Array.prototype.slice.call(element.classList).indexOf("hide") > -1;
                            d3.select(element).classed('hide', value);
                        });
                    },
                    insertCircle: function(g, options) {
                        options = _.defaults(options, {
                            fill: "red",
                            radius: process_designer.config.task.radius,
                            x_offset: 0,
                            y_offset: 0,
                            offset: process_designer.config.task.location_offset,
                            css_classes: []
                        });

                        var circle = g.insert("circle");

                        // APPLY ALL DEFINED CLASSES
                        _.each(options.css_classes, function(css_class) {
                            circle.classed(css_class, true);
                        });

                        circle.attr("cx", options.offset + options.x_offset)
                            .attr("cy", options.offset + options.y_offset)
                            .attr("r", options.radius)
                            .style("fill", options.fill);
                    },
                    addLabel: function(g, options) {
                        options = _.defaults(options, {
                            label_colour: 'white',
                            x_offset: 0,
                            y_offset: 0,
                            offset: process_designer.config.task.location_offset,
                            label_text: '',
                            label_classes: [],
                        });

                        var text = g.append('text');

                        // APPLY ALL DEFINED CLASSES
                        _.each(options.label_classes, function(css_class) {
                            text.classed(css_class, true);
                        });

                        return text.style("fill", options.label_colour)
                            .attr("dx", options.offset + options.x_offset)
                            .attr("dy", options.offset + options.y_offset + 5) // REQUIRED JUST TO CENTER TEXT
                            .attr("text-anchor", "middle")
                            .text(function(d) {
                                return options.label_text;
                            });
                    }
                },
                handlers: {
                    drag: {
                        moveElementToMouseLocation: function(element, coordinates) {
                            return d3.select(element)
                                .attr("transform",
                                    "translate(" +
                                    // ADD CORDINATES OF THE CIRCLE INSIDE THE G(GROUP) ELEMENT
                                    (d3.event.x - element.children[0].attributes.cx.value) +
                                    "," +
                                    (d3.event.y - element.children[0].attributes.cy.value) +
                                    ")"
                                );
                        },
                        run: function() {

                            var drag_handler = this;

                            return d3.behavior.drag().on('dragstart', function() {
                                    d3.select(this.children[0]).style('fill', 'lightpurple');
                                })
                                .on('drag', function() {
                                    process_designer.destroy.all_lines();
                                    process_designer.drawLines();
                                    var element = this;

                                    drag_handler.moveElementToMouseLocation(element);

                                    // TODO: ADD MODULAR CONFIGURATION OF THIS TASK PREFIX
                                    var id = this.id.split('task-')[1]; // remove task prefix
                                    var scope_index = _.findIndex(scope.tasks, {
                                        'id': id
                                    });
                                    var coordinates = process_designer.getGroupNodeLocation(d3.select(this));
                                    process_designer.updateTask(scope_index, 'coordinates', coordinates);

                                })
                                .on('dragend', function() {
                                    d3.select(this.children[0]).style('fill', 'purple');
                                });
                        }
                    }
                },
                getGroupNodeLocation: function(group) {
                    var g_x = d3.transform(group.attr("transform")).translate[0];
                    var g_y = d3.transform(group.attr("transform")).translate[1];
                    return {
                        y: g_y + process_designer.config.task.location_offset,
                        x: g_x + process_designer.config.task.location_offset
                    };
                },
                drawLines: function() {
                    var process_designer = this;
                    _.each(scope.tasks, function(curr) {
                        var node = canvas.select('#task-' + curr.id);
                        var start = process_designer.getGroupNodeLocation(node);
                        _.each(curr.dependencies, function(id) {
                            var node = canvas.select('#task-' + id);
                            var end = process_designer.getGroupNodeLocation(node);

                            // Draw line between dependent nodes
                            canvas
                                .insert("line", ":first-child")
                                .classed('dependency-line', true)
                                .style("stroke", "black")
                                .style("stroke-width", "5")
                                .attr("x1", start.x)
                                .attr("y1", start.y)
                                .attr("x2", end.x)
                                .attr("y2", end.y);
                        });
                    });
                },
                drawNodes: function() {
                    var process_designer = this;
                    // CREATE A GROUP WITH A CIRCLE AND LABEL
                    _.each(scope.tasks, function(curr_node) {
                        var g = process_designer.group.create(process_designer, curr_node.id);
                        process_designer.translateElement(g[0][0], curr_node.coordinates || {});
                        _.each(process_designer.config.circles, function(config) {
                            process_designer.group.insertCircle(g, config);
                            process_designer.group.addLabel(g, _.extend({
                                label_text: curr_node.name
                            }, config));
                        });
                    });
                }
            };

            // Browser onresize event
            window.onresize = function() {
                scope.$apply();
            };

            // TODO: Watch for resize event  scope.render(scope.data);

            scope.$watch('tasks', function() {
                process_designer.init();
            }, true);

        }
    };
});