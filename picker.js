var outgoing = false

var ingoing = false

var selected_prime_node = []

var selected_non_prime_outgoing = []

var selected_non_prime_ingoing = []

var selected_edges_outgoing = []

var selected_edges_ingoing = []

function findOutgoingEdgesAndNodes(node, graph_renderer) {
    var edges = graph_renderer.edge_renderer.data_source.data
    var nodes = graph_renderer.node_renderer.data_source.data

    var tab_res = edges['start'].reduce(function(a, e, i) {
        if (e === node) {
            a[0].push(i);
            a[1].add(nodes['index'].indexOf(edges['end'][i]))
        }
        return a;
    }, [[], new Set()]); 

    return tab_res
}

function findIngoingEdgesAndNodes(node, graph_renderer) {
    var edges = graph_renderer.edge_renderer.data_source.data
    var nodes = graph_renderer.node_renderer.data_source.data

    var tab_res = edges['end'].reduce(function(a, e, i) {
        if (e === node) {
            a[0].push(i);
            a[1].add(nodes['index'].indexOf(edges['start'][i]))
        }
        return a;
    }, [[], new Set()]); 

    return tab_res
}

