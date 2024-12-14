let debounceTimeout;
let elementCaptureListener = null;

const getClass = (Html) => {
    const regex = /class=\s*"([^"]*)"/;
    const result = Html.match(regex);
    return result ? result[1] : "No class";
};

const extractGroupedStyles = (element) => {
    const elementCss = getComputedStyle(element);
    return {
        layout: {
            display: elementCss.display,
            position: elementCss.position,
            width: elementCss.width,
            height: elementCss.height,
            float: elementCss.float,
            overflow: elementCss.overflow
        },
        box: {
            margin: elementCss.margin,
            padding: elementCss.padding,
            border: elementCss.border,
            borderRadius: elementCss.borderRadius,
            boxSizing: elementCss.boxSizing
        },
        typography: {
            color: elementCss.color,
            fontSize: elementCss.fontSize,
            fontFamily: elementCss.fontFamily,
            fontWeight: elementCss.fontWeight,
            textAlign: elementCss.textAlign,
            lineHeight: elementCss.lineHeight
        },
        background: {
            backgroundColor: elementCss.backgroundColor,
            backgroundImage: elementCss.backgroundImage
        }
    };
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "getID") {
        // Remove any existing listeners to prevent multiple bindings
        if (elementCaptureListener) {
            document.removeEventListener('mousedown', elementCaptureListener);
        }

        // Prevent context menu
        document.addEventListener("contextmenu", (event) => {
            event.preventDefault();
        });

        // Create a new listener function
        elementCaptureListener = (event) => {
            clearTimeout(debounceTimeout);
            debounceTimeout = setTimeout(() => {
                const element = event.target;
                const elementHtml = element.outerHTML;
                const elementId = element.id ? `ID: ${element.id}` : "No ID";
                const elementClass = getClass(elementHtml);
                
                // Extract grouped styles
                const temp = extractGroupedStyles(element);
                const css = JSON.stringify(temp, null, 4);

                console.log("Html: \n" + elementHtml);
                console.log(css);

                sendResponse({ 
                    id: elementId, 
                    class: elementClass, 
                    html: elementHtml, 
                    css: css 
                });
            }, 200);
        };

        // Add the listener
        document.addEventListener("mousedown", elementCaptureListener, { once: true });
        return true;
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
                // Process all node types
                nodes.push(...gatherDOMTree(childNode, nodeId));
            });
        }
        
        return nodes;
    };

    if (message.action === "analyzeDom") {
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
    }

    return true;
});