// Create Table of Contents
let chapters = [];

// get chapter for navigation
function loadChapters(callback) {
     let sending = browser.runtime.sendMessage({
	 msg: "getChapters"
     });
  return sending;  
}

// Inject the Table of Contents
function createTOC() {
    let TOC = document.getElementById('toc') || document.createElement('nav'),
	headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');

    // fix headings
    for(let heading of headings) {
	heading.id = heading.parentNode.getAttribute('name');
    }
    
    TOC.id = 'toc';
    TOC.classList.add('toc', 'toc-right');
    TOC.innerHTML = '';

    document.body.insertBefore(TOC, document.body.childNodes[0]);

    tocbot.init({
	// Where to render the table of contents.
	tocSelector: '#toc',
	// Where to grab the headings to build the table of contents.
	contentSelector: 'body',
	// Which headings to grab inside of the contentSelector element.
	headingSelector: 'h2, h3',
	// smooth it out
	scrollSmooth: true
    });
}

function wrapInner(parent, wrapper, attribute, attributevalue) {
    if (typeof wrapper === "string") {
        wrapper = document.createElement(wrapper);
    }
    var div = parent.appendChild(wrapper)
              .setAttribute(attribute, attributevalue);

    while (parent.firstChild !== wrapper) {
           wrapper.appendChild(parent.firstChild);
      }
}



// Wrap the insides of the <pre> tags in <code> tags for highlight.js
function wrapPre() {
    for(let el of document.querySelectorAll('pre')) {
	let orig = el.innerHTML;

	el.innerHTML = '<code class="lisp">' + orig + "</code>";
    }
}

// get the index of the currently viewed chapter
function findCurrentChapter() {
    let file = document.URL.split('/').pop().replace(/\#.*$/, '');
    let currentChapter = -1;
    for(let chapter in chapters) {
	if(chapters[chapter].url === file)
	    currentChapter = chapter;
    }
    return parseInt(currentChapter);
}

// go to previous chapter
function goToPrevious() {
    if(!chapters) return;
    let currentChapter = findCurrentChapter();
    if(currentChapter > 0) {
    	document.location.href =  chapters[currentChapter-1].url;
    }
}

// go to next chapter
function gotoNext() {
    if(!chapters) return;
    let currentChapter = findCurrentChapter();
    if(currentChapter < chapters.length - 1) {
    	document.location.href =  chapters[currentChapter+1].url;
    }
}


// set up the navigation shortcuts
function setUpNav() {
    document.addEventListener('keypress', (event) => {
	switch(event.keyCode) {
	case 37:
	    goToPrevious();
	    break;
	case 39:
	    gotoNext();
	    break;
	case 36:
	    document.location.href = 'index.html';
	    break;
	}
    });
}


loadChapters().then(newChapters => {
    chapters = newChapters;
});

// Let's apply that stuff.
wrapPre();
HighlightLisp.highlight_auto();
HighlightLisp.paren_match();
createTOC();
setUpNav();
