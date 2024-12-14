document.addEventListener("DOMContentLoaded", ()=>{
    const copyButtonHtml = document.getElementById("copyButtonHtml")
    const copyButtonCss = document.getElementById("copyButtonCss")
    copyButtonCss.addEventListener("click",() =>{
        copyTextCss();
    })
    copyButtonHtml.addEventListener("click", ()=>{
        copyTextHtml()
    })

    const displayElementInfo = (info)=>{
        document.getElementById("outputId").textContent = info.id
        document.getElementById("outputHtml").textContent = info.html
        document.getElementById("outputClass").textContent = info.class
        document.getElementById("outputCss").textContent = info.css
    }

    chrome.runtime.onMessage.addListener((message, sender, sendResponse)=>{
        if(message.action=="displayElementInfo"){
            displayElementInfo(message.data)
        }
    })
    document.getElementById("showTree").addEventListener("click", ()=>{
        chrome.tabs.query({active: true, currentWindow: true}, (tabs)=>{
            console.log("switch clicked")
            chrome.tabs.sendMessage(tabs[0].id, {action: "analyzeDom"}, ()=>{
                window.open(chrome.runtime.getURL(`tree.html?timestamp=${Date.now()}`));
                // chrome.tabs.create({ 
                //     url: chrome.runtime.getURL(`tree.html?timestamp=${Date.now()}`)
                // })
            })
        })
        
    })

    
    function copyTextCss(){
        const text = document.getElementById("outputCss")
        const range = document.createRange()
        range.selectNode(text)
        window.getSelection().removeAllRanges()
        window.getSelection().addRange(range);
        document.execCommand("copy")
    }

    function copyTextHtml(){
        const text = document.getElementById("outputHtml")
        const range = document.createRange()
        range.selectNode(text)
        window.getSelection().removeAllRanges()
        window.getSelection().addRange(range);
        document.execCommand("copy")
    }

})