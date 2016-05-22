const fs = require('fs');
let currentFile = null;

if (process.platform == 'darwin') {
	document.querySelector('#ctrlorcmd').textContent = '\u2318';
}

let dapp = document.querySelector('#app');
let content = document.querySelector('#content');

let renderMarkdown = function(str) {
	content.innerHTML = toMarkdown(str);
};

var openFile = function(path) {
	if (!path) return;
	fs.access(path, fs.R_OK, (e1) => {
		if (e1) {
			alert(`Error: Can't read file`);
			return;
		}
		if (currentFile) currentFile.close();
		currentFile = fs.watch(path, (event, filename) => {
			if (event == 'change') {
				fs.readFile(path, (e2, data) => {
					if (e2) {
						alert(e2);
						return;
					}
					renderMarkdown(data.toString());
				});
			}
		});
		fs.readFile(path, (e3, data) => {
			if (e3) {
				alert(e3);
				return;
			}
			renderMarkdown(data.toString());
		});
	});
};