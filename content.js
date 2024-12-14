let debounceTimeout
const getClass = (Html)=>{
  const regex = /class=\s*"([^"]*)"/;
  const result = Html.match(regex);
  return result ? result[1] : "No class";
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getID") {
    document.addEventListener("contextmenu", (event) => {
      event.preventDefault(); // Prevent context menu from opening
    });
    document.addEventListener("mousedown", function(event) {
      clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(()=>{
        const element = event.target
        const elementHtml = element.outerHTML
        const elementId = element.id ? "ID: ${element.id}" : "No ID"
        const elementClass = getClass(elementHtml)
        const elementCss = getComputedStyle(element);
        const temp = {
          layout:{
            display: elementCss.display,
            position: elementCss.position,
            width: elementCss.width,
            height: elementCss.height,
            float: elementCss.float
          },
          box:{
            margin: elementCss.margin,
            padding: elementCss.padding,
            border: elementCss.border,
            boxSizing: elementCss.boxSizing
          },
          typography: {
            color: elementCss.color,
            fontSize: elementCss.fontSize,
            fontFamily: elementCss.fontFamily,
            fontWeight: elementCss.fontWeight,
            textAlign: elementCss.textAlign
          }
        }
        const css=JSON.stringify(temp, null, 4)
        console.log("Html: \n" + elementHtml)
        console.log(css)    
        sendResponse({ id: elementId, class: elementClass, html: elementHtml, css: css })  
      }, 200)
    }, { once: true })
    return true
  }
  const gatherDOMTree = (node, parentId = null) => {
    const nodes = [];
    const nodeId = node.id ||
        (node.nodeType === Node.ELEMENT_NODE
            ? `elem_${Math.random().toString(36).substr(2, 9)}`
            : `node_${Math.random().toString(36).substr(2, 9)}`);
    
    nodes.push({
        id: nodeId,
        parent: parentId,
        tag: node.nodeType === Node.ELEMENT_NODE
            ? node.tagName
            : `#${node.nodeType}`,
        content: node.textContent
            ? node.textContent.trim().substring(0, 50)
            : ''
    });

    if (node.childNodes && node.childNodes.length) {
        Array.from(node.childNodes).forEach(childNode => {
            // Process all node types, not just element nodes
            nodes.push(...gatherDOMTree(childNode, nodeId));
        });
    }
    
    return nodes;
};
  if(message.action==="analyzeDom"){
    console.log("DOM Analysis Triggered");
    const domTree = gatherDOMTree(document.body);
    
    console.log("Generated DOM Tree:", domTree);
    console.log("Tree Length:", domTree.length);

    chrome.runtime.sendMessage({
        action: "storeDOM", 
        data: domTree
    }, (response) => {
        console.log("StoreDOM Callback Response:", response);
    });

    sendResponse({ 
        status: "DOM analysis complete", 
        treeLength: domTree.length 
    });
  };  

});


