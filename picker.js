var outgoing_wikipedia = false

var ingoing_wikipedia = false

var selected_prime_node_wikipedia = []

var selected_non_prime_outgoing_wikipedia = []

var selected_non_prime_ingoing_wikipedia = []

var selected_edges_outgoing_wikipedia = []

var selected_edges_ingoing_wikipedia = []

var outgoing_reddit = false

var ingoing_reddit = false

var selected_prime_node_reddit = []

var selected_non_prime_outgoing_reddit = []

var selected_non_prime_ingoing_reddit = []

var selected_edges_outgoing_reddit = []

var selected_edges_ingoing_reddit = []

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

    console.log(tab_res)

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

    console.log(tab_res)

    return tab_res
}

