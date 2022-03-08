
let readOutLoud = false;

let markedTextElements = [];
let previousString = "";

let text = "";
let string = "";

const displayP = document.querySelector('.display-selected')

// The 2 functions below takes the range of your selection/ highlight and creates an array of all the elements the selection spans over,
// I use the array to see if it is the first time or after a reset that the user highlights text
// I found these functions here: https://stackoverflow.com/a/1483487 take a look if you are more interested in how they work
function rangeIntersectsNode(range, node) {
    var nodeRange;
    if (range.intersectsNode) {
        return range.intersectsNode(node);
    } else {
        nodeRange = node.ownerDocument.createRange();
        try {
            nodeRange.selectNode(node);
        } catch (e) {
            nodeRange.selectNodeContents(node);
        }

        return range.compareBoundaryPoints(Range.END_TO_START, nodeRange) == -1 &&
            range.compareBoundaryPoints(Range.START_TO_END, nodeRange) == 1;
    }
}

function getSelectedElementTags() {
    let range, sel, treeWalker, containerElement;
    sel = window.getSelection();
    if (sel.rangeCount > 0) {
        range = sel.getRangeAt(0);
    }

    if (range) {
        containerElement = range.commonAncestorContainer;
        if (containerElement.nodeType != 1) {
            containerElement = containerElement.parentNode;
        }

        treeWalker = window.document.createTreeWalker(
            containerElement,
            NodeFilter.SHOW_ELEMENT,
            function(node) { return rangeIntersectsNode(range, node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; },
            false
        );

        markedTextElements = [treeWalker.currentNode];
        while (treeWalker.nextNode()) {
            markedTextElements.push(treeWalker.currentNode);
        }

        // console.log(markedTextElements);
    }
}

// String formating function
function formatString(str) {
    string = str.replace(/<[^>]+>/g, ''); //Removes any elements (<a></a>) 
    string = string.replace(/\n/g, '. '); //Replaces newlines (\n) with a ". "
    // string = string.replace(/"/g, '\\"'); //Replaces "" with \" \"
    // string = string.replace(/'/g, "\\'"); //Replaces '' with \' \'
    // string = string.replace(/&/g, 'and'); //Replaces & with the word 'and'
    text = string
    displayP.innerText = text
    console.log(text)
}

//This is the 'core function' where most of the logic of this script is execuded
function getText(e) {
    let bool = true; //Setting a check variable for later use
    if(e.target.tagName == "A" && e.target != this.previousTarget){ //If an aTag was clicked and it was not the previously clicked element
        e.preventDefault()
        this.previousTarget = e.target //Setting the aTag as the previously clicked element
        window.getSelection().removeAllRanges()

    } else if(e.target.tagName != "A") { //If an aTag was not clicked then some resets happen
        bool = true;
        this.previousTarget = null

    } else if(e.target.tagName == "A" && e.target == this.previousTarget){ //Else if it was an atag that was previously clicked, this will allow aTags to be functional on the seccond click 
        bool = false
    }
    
    if(bool){
        
        let sel, range;
        let el = e.target; //get element
        if (window.getSelection && document.createRange) { //Compatibility for most browsers
            sel = window.getSelection();
            if(sel.toString() == ''){ //If text is clicked (no text was highlighted)
                range = document.createRange(); //range object
                range.selectNodeContents(el); //sets Range
                sel.removeAllRanges(); //remove all ranges from selection
                sel.addRange(range);//add Range to a Selection.
                if(sel.anchorNode.hasAttribute("data-readable")){ //If the clicked element has the 'readable' dataset set to 'true'
                    getSelectedElementTags()
                    formatString(sel.toString())
                    previousString = sel.toString()
                } else { //If the clicked element does not have the 'readable' dataset set to 'true'
                    displayP.innerText = ""
                    markedTextElements = [];
                    previousString = "";
                    sel.removeAllRanges();
                    return
                }
            } else {
                if (markedTextElements.length <= 0){ //If a text is highlighted for the first time or after a 'reset'
                    getSelectedElementTags()
                    formatString(sel.toString())
                    previousString = sel.toString()
                    console.log("1")
               
                } else if (previousString != sel.toString()){  //If a text is highlighted after previous highlighted text
                    getSelectedElementTags()
                    formatString(sel.toString())
                    previousString = sel.toString()
                    console.log("2")

                } else { //If clicked or highlighted text is clicked (Should reset)
                    markedTextElements = [];
                    displayP.innerText = ""
                    previousString = "";
                    sel.removeAllRanges();
                }
                
            }

        } else if (document.selection) { // Similar as the above condition, but for older IE versions
            sel = document.selection.createRange();
            if(sel.text == ''){
                range = document.body.createTextRange();//Creates TextRange object
                range.moveToElementText(el);//sets Range
                range.select(); //make selection.
                
                if(sel.anchorNode.hasAttribute("data-readable")){ //If the clicked element has the 'readable' dataset set to 'true'
                    getSelectedElementTags()
                    formatString(sel.text)
                    previousString = sel.text
                } else { //If the clicked element does not have the 'readable' dataset set to 'true'
                    displayP.innerText = ""
                    markedTextElements = [];
                    previousString = "";
                    sel.removeAllRanges();
                    return
                }
            } else {
                if (markedTextElements.length <= 0){
                    getSelectedElementTags()
                    formatString(sel.text)
                    previousString = sel.text
                } else if (previousString != sel.text){
                    getSelectedElementTags()
                    formatString(sel.text)
                    previousString = sel.text
                } else {
                    markedTextElements = [];
                    displayP.innerText = ""
                    previousString = "";
                    sel.removeAllRanges();
                }
            }
        }
    }
}

//Targeting the span tag in the 'activation' button
let span = document.querySelector('.span')

//Toggle function for turning the 'activation' on or off
function toggleTTS() {
    if(readOutLoud) {
        readOutLoud = false;
        //Removing the style tag for standard site usage
        document.querySelector('.selected-text-css').remove()
        document.onclick = null
        span.innerText = "Deactivated"
    } else {
        setTimeout(() => {
            readOutLoud = true;
            //Creating a style tag for adding the '::selection' psuedoclass to the page
            let style = document.createElement('style');
            style.type = 'text/css';
            style.classList.add('selected-text-css')
            style.innerHTML = '::selection{color: red;  background-color: yellow;}'
            document.getElementsByTagName('head')[0].appendChild(style);

            //Set eventlistener 'onclick' on the document to run the getText function
            document.onclick = getText;
        }, 100);
        span.innerText = "Activated"
    }
}



  