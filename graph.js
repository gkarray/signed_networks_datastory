document.load()

data = {
    "nodes": [
        {"id": 1},
        {"id": 2},
        {"id": 3},
        {"id": 4},
    ],

    "links": [
        {"source": 1, "target": 3, "sign": 1},
        {"source": 2, "target": 3, "sign": -1},
        {"source": 3, "target": 1, "sign": 1}
    ]
}

$('#zoomingEnable').css("display", "inline-block");
$("#forceGravity").css("display", "inline-block");
$("#forceGravityLabel").css("display", "inline-block");
$("#circleRadius").css("display", "none");
$("#circleRadiusLabel").css("display", "none");
$("#arcDistance").css("display", "none");
$("#arcDistanceLabel").css("display", "none");

var canvas = document.getElementById("graphCanvas");
var context = canvas.getContext("2d");

canvas.height = graphCanvasHeight;
canvas.width = graphCanvasWidth;

var forceGravity = document.getElementById("forceGravity").value;

var transform = d3.zoomIdentity;

var simulation = d3.forceSimulation()
    .force("charge", d3.forceManyBody().strength(forceGravity))
    .force("center", d3.forceCenter(graphCanvasWidth / 2, graphCanvasHeight / 2))
    .force("link", d3.forceLink())
    .force("x", d3.forceX())
    .force("y", d3.forceY());

var color = d3.scaleOrdinal()
    .range(d3.schemeCategory20);

d3.json(data, function (data) {

    // Max value of d.value
    var max_val = d3.max(data.links, function (d) {
        return d.value;
    });

    // Scale to scale the opacity of the edges by d.value
    var valueScale = d3.scaleLinear()
        .domain([0, max_val])
        .range([0.05, 1]);

    // Max value of d.incoming
    var max_inc = d3.max(data.nodes, function (d) {
        return d.incoming;
    });

    // Scale to scale the radius of the nodes by d.incoming
    var radiusScale = d3.scaleLinear()
        .domain([0, max_inc])
        .rangeRound([3, 9])
        .nice();

    // Nest nodes by d.cluster
    var vertices = d3.nest()
        .key(function (d) {
            return d.cluster;
        })
        .entries(data.nodes);

    // Nest edges by d.value
    var lines = d3.nest()
        .key(function (d) {
            return d.value;
        })
        .entries(data.links);

    simulation
        .nodes(data.nodes)

    simulation.force("link")
        .links(data.links);


    // Function for drawing a link
    function drawLink(d) {
        var opacity;

        // Set edge opacity based on selected cluster and d.value
        if (!selectedCluster || !clickedNode) {
            opacity = valueScale(d.value);
        } else if (d.source.cluster === selectedCluster) {
            opacity = valueScale(d.value);
        } else {
            opacity = valueScale(d.value) / 2;
        }

        context.beginPath();
        context.moveTo(d.source.x, d.source.y);
        context.lineTo(d.target.x, d.target.y);
        context.strokeStyle = "rgba(0, 0, 0, " + opacity + ")";
        context.stroke();
    }

    // Function for drawing a node
    function drawNode(d) {
        var fill;
        var fillRGB = hexToRgb(color(d.cluster));
        var strokeColor;
        var radius = nodeRadius(d);

        // Set node opacity based on selected cluster
        if (clickedNode) {
            if (d.id === clickedNode.id) {
                fill = "red";
                radius += 2;
            } else if (!clickedNode.cluster || d.cluster === clickedNode.cluster) {
                fill = color(d.cluster);
            } else {
                fill = "rgba(" + fillRGB.r + ", " + fillRGB.g + ", " + fillRGB.b + ", 0.95)";
            }
        } else if (clickedCell) {
            if (d.id === clickedCell.source || d.id === clickedCell.target) {
                fill = "red";
                radius += 2;
            } else {
                fill = color(d.cluster);
            }
        } else {
            fill = color(d.cluster);
        }

        if (!selectedCluster || !clickedNode) {
            strokeColor = "#000";
        } else if (d.cluster === selectedCluster) {
            strokeColor = "#000";
        } else {
            strokeColor = "#7f7f7f";
        }

        context.fillStyle = fill;
        context.beginPath();
        context.arc(d.x, d.y, radius, 0, Math.PI * 2, true);
        context.fill();
        context.strokeStyle = strokeColor;
        context.lineWidth = 1;
        context.stroke();
        context.closePath();
    }

    function dragsubject() {
        var x = transform.invertX(d3.event.x);
        var y = transform.invertY(d3.event.y);
        var dx;
        var dy;

        for (var i = data.nodes.length - 1; i >= 0; --i) {
            node = data.nodes[i];
            dx = x - node.x;
            dy = y - node.y;

            if (dx * dx + dy * dy < searchRadius * searchRadius) {
                node.x = transform.applyX(node.x);
                node.y = transform.applyY(node.y);

                return node;
            }
        }
    }

    function nodeRadius(node) {
        if (node.incoming <= 0) {
            return 2;
        } else {
            return radiusScale(node.incoming);
        }
    }
});

// Simple function that changes hex to rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function simInit() {
    $("#radialLayoutButton").click(function () {
        stopSimulation = true;
    });

    $("#arcLayoutButton").click(function () {
        stopSimulation = true;
    });
}

simInit();


function deleteSelectedNode() {
    if (clickedNode) {
        deleteNode = true;
        deletedNodes[clickedNode.id] = true;
        if (showSVG) {
            draw()
        }
    }
}

function disableGraph() {
    $("#graphs").css("display", "none");
    $("#graphDownload").css("display", "none");
    $("#graphLayoutControls").css("display", "none");
    $("#graphNodeControls").css("display", "none");
    $("#graphControls").css("display", "none");
    $("#graphInfo").css("display", "none");
    $('#zoomingEnable').css("display", "none");
}

function enableGraph() {
    if (firstCanvasEnable) {
        renderForce();
        firstCanvasEnable = false
    } else {
        switch (currentLayout) {
            case "force":
                renderForce();
                break;
            case "radial":
                renderRadial();
                break;
            case "arc":
                renderArc();
                break;
        }
    }
    $("#graphs").css("display", "");
    $("#graphDownload").css("display", "");
    $("#graphLayoutControls").css("display", "");
    $("#graphNodeControls").css("display", "");
    $("#graphControls").css("display", "");
    $("#graphInfo").css("display", "");
    $('#zoomingEnable').css("display", "inline-block")
}

function enableSVG() {
    showSVG = true;
    if (clickedNode) {
        draw()
    }
}

function disableSVG() {
    showSVG = false;
    d3.selectAll("#graphs > svg > *").remove();
    d3.selectAll("#graphs > svg").remove();
    // Maybe resize Canvas whenever SVG is disabled?
}

function renderForce() {
    currentLayout = "force";
    renderGraphCanvasForce();
}

function renderRadial() {
    currentLayout = "radial";
    renderGraphCanvasRadial();
}

function renderArc() {
    currentLayout = "arc";
    renderGraphCanvasArc();
}

function downloadGraph() {
    ReImg.fromCanvas(document.getElementById('graphCanvas')).toPng();
    ReImg.fromCanvas(document.getElementById('graphCanvas')).downloadPng(matrixFileName + "Graph.png");
}

function enableZooming() {
    zoomEnabled = !zoomEnabled;
}
