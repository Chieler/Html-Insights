document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({ action: "getDOM" }, (response) => {
        console.log("Full DOM Retrieval Response:", response);

        if (response && response.domTree && response.domTree.length > 0) {
            // Ensure unique IDs by adding a counter
            const uniqueNodes = new Set();
            const nodes = new vis.DataSet(
                response.domTree
                    .filter(node => {
                        // Ensure unique IDs
                        if (uniqueNodes.has(node.id)) {
                            console.warn(`Duplicate ID found: ${node.id}`);
                            return false;
                        }
                        uniqueNodes.add(node.id);
                        return true;
                    })
                    .map((node, index) => ({
                        // Modify ID to ensure uniqueness if needed
                        id: `${node.id}_${index}`,
                        label: `${node.tag}\n${(node.content || '').substring(0, 30)}`,
                        shape: 'circle',
                        

                    }))
            );

            const edges = new vis.DataSet(
                response.domTree
                .filter((node) => node.parent)
                .map((node) => ({
                    from: response.domTree.find(n => n.id === node.parent).id + '_' + 
                           response.domTree.findIndex(n => n.id === node.parent),
                    to: node.id + '_' + 
                        response.domTree.findIndex(n => n.id === node.id), 
                    color: { color: '#ff9900', highlight: '#ffcc00' }, 
                    arrows: 'to'
                        
                }))
            );

            const container = document.getElementById("network");
            const data = { nodes, edges };
            const options = {
                layout: {
                    hierarchical: {
                        direction: 'UD',
                        sortMethod: 'directed',
                        avoidOverlap: true,
                        levelSeparation: 300,
                    }
                },
                physics: {
                    enabled: false,
                  },
                  nodes: {
                    scaling: {
                      min: 15,
                      max: 35
                    }
                  },
                  interaction: {
                    hover: true, 
                    multiselect: false
                  }
            };

            try {
                new vis.Network(container, data, options);
            } catch (error) {
                console.error("Network creation error:", error);
                container.innerHTML = `Error creating network: ${error.message}`;
            }
        } else {
            console.error("No DOM data received");
            document.getElementById("network").innerHTML = "No DOM data found";
        }
    });
});
