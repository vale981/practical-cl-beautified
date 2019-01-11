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

function wrapInner(parent, wrapper, className) {
    if (typeof wrapper === "string")
        wrapper = document.createElement(wrapper);

    wrapper.classList.add(className);
    var div = parent.appendChild(wrapper);

    while(parent.firstChild !== wrapper)
        wrapper.appendChild(parent.firstChild);
}

function wrapPre() {
    for(let el of document.querySelectorAll('pre')) {
	wrapInner(el, 'code', 'lisp');
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

function setUpNumbering() {
    let chapter = findCurrentChapter();
    if (chapter >= 0) {
	document.documentElement.style['counter-reset'] = 'chapter ' + (chapter + 1);
    }
};

function collectFootnotes() {
    let footMap = [];

    // collect al footnotes into pairs
    for(let note of document.querySelectorAll('sup')) {
	let index = parseInt(note.innerText) - 1;

	// JS forces me to do that!
	if(footMap[index])
	    footMap[index].push(note);
	else
	    footMap[index] = [ note ];
    }

    return footMap;
}

function linkFootnotes() {
    function identifyAndLink(index, originid, targetid, origin, target) {
	origin.id = `foot${index}${originid}`;
	let link = document.createElement('a');
	target.id = `foot${index}${targetid}`;
	link.href = '#' + target.id;
	link.innerText = ++index;
	origin.innerHTML = '';
	origin.appendChild(link);
    };
    
    let footMap = collectFootnotes();

    for(let index in footMap) {
	let pair = footMap[index];
	if(pair && pair.length == 2) {
	    let first = pair[0];
	    let second = pair[1];

	    identifyAndLink(index, 1, 2, first, second);
	    identifyAndLink(index, 2, 1, second, first);
	}	    
    }
}

// Let's apply that stuff.
loadChapters().then(newChapters => {
    chapters = newChapters;
    setUpNumbering();
});

linkFootnotes();
wrapPre();
HighlightLisp.highlight_auto();
HighlightLisp.paren_match();
createTOC();
setUpNav();


