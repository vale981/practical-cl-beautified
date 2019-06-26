function fetchChapters() {
    return browser.storage.local.get('chapters').then(chapters => {
	if(chapters.hasOwnProperty('chapters'))
	    return Promise.resolve(chapters.chapters);

	return fetch("http://www.gigamonkeys.com/book/index.html").then(function(response) {
        return response.text().then(text => {
	  const regex = /li><a\shref='(.*?)'>(.*?)</gm;
	    let chapters = [];
	    let m;
	    do {
		m = regex.exec(text);
		if (m) {
		    console.log(m[1], m[2]);
		    chapters.push({
			url: m[1],
			name: m[2]
		    });
		}
	    } while (m);
	    browser.storage.local.set({'chapters': chapters});
	    return chapters;
	});
    });});
}

function handleMessage(message, sender) {
    if (message.msg == "getChapters") {
	return fetchChapters();
    }

    return true;
}

browser.runtime.onMessage.addListener(handleMessage);
