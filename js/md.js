{
	let parseX = function(markdown, func, prws) {
		for (var i = 0; i < markdown.length; i++) {
			var el = markdown[i];

			if (el.type === 'str')
				markdown.splice.apply(markdown, [i, 1].concat(func(el.str, prws)));
		}
	};

	let parseCodeBlock = function(code) {
		var markdown = [];
		var re = /```[^\S\n]*(\w*?)\r?\n([\s\S]+?)(?:\r?\n)?```/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			markdown.push({
				type: 'str',
				str: before
			}, {
				type: 'codeBlock',
				lang: block[1],
				code: block[2]
			});
			

		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let parseInlineCode = function(code) {
		var markdown = [];
		var re = /`([^`\r\n]+?)`/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			markdown.push({
				type: 'str',
				str: before
			}, {
				type: 'inlineCode',
				code: block[1]
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let parseKaTeX = function(code) {
		var markdown = [];
		var re = /(^|[^\\])\$\s*([\s\S]+?)\s*?\$/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			markdown.push({
				type: 'str',
				str: before + block[1]
			}, {
				type: 'KaTeX',
				code: block[2]
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let parseKaTeXDisplay = function(code) {
		var markdown = [];
		var re = /(^|[^\\])\$\$\s*([\s\S]+?)\s*?\$\$/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			markdown.push({
				type: 'str',
				str: before + block[1]
			}, {
				type: 'KaTeXDisplay',
				code: block[2]
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let parseHeader = function(code) {
		var markdown = [];
		var re = /(^|\n)(#+)(.+)(\n|$)/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			let ord = block[2].length;
			let text = block[3];

			if (ord > 6)
				before += block[1];

			markdown.push({
				type: 'str',
				str: before
			});
			if (ord <= 6) {
				markdown.push({
					type: `header`,
					text: text,
					ord: ord
				});
			}
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};
	let parseAltHeader = function(code) {
		var markdown = [];
		var re = /(^|\n)(.+)\n([=-]{3,})(\n|$)/;;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			let ord = block[3][0] == '=' ? 1 : 2;
			let text = block[2];

			markdown.push({
				type: 'str',
				str: before
			}, {
				type: `header`,
				text: text,
				ord: ord
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let parseQuote = function(code) {
		var markdown = [];
		var re = /(^|\n)>([^\n>]+(\n|$))+/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index -
				(block[0].substr(block.index.length - 1) == '\n' ? 1 : 0));
			code = code.substr(block.index + block[0].length);

			let text = block[0].match(/>\s*([\s\S]+)[\s\n]*/)[1];

			markdown.push({
				type: 'str',
				str: before
			}, {
				type: 'quote',
				text: parseMarkdown(text)
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let parseUnorderedLists = function(code) {
		var markdown = [];
		var re = /([^\n\S]*[*+-][^\n\S]*.+)([^\n\S]*[*+-]?[^\n\S]*.+(\n|$))+/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			let items = [];
			let lines = block[0].split('\n');
			let lre = /^(\s*)([*+-])?\s*(.+)/;
			for (let i of lines) {
				let ord = 0;
				let pord = 0;
				let m = i.match(lre);
				if (!m) continue;
				if (!m[2] && items[items.length - 1]) {
					items[items.length - 1].text += '\n' + m[3];
					continue;
				}
				for (let c of m[1]) {
					if (c == '\t') ord++;
					if (c == ' ') pord++;
				}
				ord += Math.floor(pord / 2);
				items.push({
					ord: ord,
					text: parseMarkdown(m[3])
				});
			}

			markdown.push({
				type: 'str',
				str: before
			}, {
				type: 'ulist',
				items: items
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let parseFormatting = function(code) {
		var markdown = [];
		var re = /(^|[\'\";\:\s!\,.\-\[\]\{}\(\)?])((\*\*|__|~~)|[\*_])(.+?)\2(?=$|[\'\";\:\s!\,.\-\[\]\{}\(\)?])/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index + block[1].length);
			code = code.substr(block.index + block[0].length);

			var type = (function() {
				if (block[2].length == 1 && block[2][0] != '~')
					return 'italic';
				else if (block[2].length == 2 && block[2][0] != '~')
					return 'bold';
				else
					return 'strikethrough';
			})();

			markdown.push({
				type: 'str',
				str: before
			}, {
				type: type,
				text: parseMarkdown(block[4], true)
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let parseLinksAndImages = function(code) {
		var markdown = [];
		var re = /(!)?\[([^\]\n]*)\]\((\S+)\)/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			let type = block[1] == '!' ? 'image' : 'link';


			markdown.push({
				type: 'str',
				str: before
			}, {
				type: type,
				alt: block[2],
				url: block[3]
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let parseURL = function(code) {
		var markdown = [];

		var el = document.createElement('div');
		el.innerHTML = linkifyStr(code, {
			defaultProtocol: 'https'
		});

		for (var index in el.childNodes) {
			var node = el.childNodes[index];
			if (!(node instanceof Node)) continue;

			if (node instanceof HTMLElement) {
				markdown.push({
					type: 'link2',
					str: node.textContent,
					url: node.href
				});
			} else {
				markdown.push({
					type: 'str',
					str: node.textContent
				});
			}
		}

		return markdown;
	};

	let parseColor = function(code) {
		var markdown = [];
		var re = /#([\da-f]{6})(?![\da-f])/i;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			markdown.push({
				type: 'str',
				str: before
			}, {
				type: 'color',
				hex: block[1]
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};
	let parseEnDash = function(code) {
		var markdown = [];
		var re = /--/;
		var block;
		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);
			markdown.push({
				type: 'str',
				str: before
			}, {
				type: 'endash'
			});
		}
		markdown.push({
			type: 'str',
			str: code
		});
		return markdown;
	};
	let parseEmDash = function(code) {
		var markdown = [];
		var re = /---/;
		var block;
		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);
			markdown.push({
				type: 'str',
				str: before
			}, {
				type: 'emdash'
			});
		}
		markdown.push({
			type: 'str',
			str: code
		});
		return markdown;
	};

	let parseNewlines = function(code) {
		var markdown = [];
		var re = /\n\n/;
		var block;

		while((block = code.match(re)) !== null) {
			var before = code.substr(0, block.index);
			code = code.substr(block.index + block[0].length);

			markdown.push({
				type: 'str',
				str: before
			}, {
				type: 'newline'
			});
		}

		markdown.push({
			type: 'str',
			str: code
		});

		return markdown;
	};

	let decodeEntities = function(s) {
		let div = document.createElement('div');
		return s.replace(/(&[\w\d#]+;)/g, function(m) {
			div.innerHTML = m;
			return div.textContent;
		});
	};
	let encodeEntities = function(s) {
		let div = document.createElement('div');
		div.textContent = s;
		return div.innerHTML;
	};
	// katex.renderToString doesn't want to work properly with error things so this should do
	let KaTeXNodeToHTML = function(code, display) {
		if (!katex) return code;
		let html = '';
		try {
			html = katex.renderToString(decodeEntities(code), { displayMode: !!display });
		} catch (err) {
			html = `<div class="md-katex-err">${err.toString().replace(/^ParseError: /i, '')}</div>`;
		}
		return html;
	};

	// turns markdown tokens into HTML
	var mdToHTML = function(md) {
		let html = '';
		for (let node of md) {
			switch (node.type) {
				case 'str':
					html += node.str;
					break;
				case 'codeBlock':
					let markup = node.code;
					if (Prism.languages[node.lang]) {
						// the hackiest way of turning text spaces into &nsbp;
						// (can't just do .replace on the markup as that'd replace the ones within HTML tags too)
						let p = Prism.highlight(decodeEntities(node.code), Prism.languages[node.lang]);
						let d = document.createElement('div');
						d.innerHTML = p;
						let children = d.childNodes;
						for (let i in children) {
							let tn = children[i];
							if (tn instanceof Text) {
								tn.textContent = tn.textContent.replace(/ /g, '\u00a0');
								tn.textContent = tn.textContent.replace(/\t/g, '\u00a0\u00a0\u00a0\u00a0');
							}
						}
						markup = d.innerHTML;
					}
					markup = markup.replace(/\n/g, '<br>');
					html += `<pre><code class="block language-${node.lang}" lang="${node.lang}">${markup}</code></pre>`;
					break;
				case 'inlineCode':
					html += `<code>${encodeEntities(node.code)}</code>`;
					break;
				case 'KaTeX':
					html += `<div class="md-katex">${KaTeXNodeToHTML(node.code)}</div>`;
					break;
				case 'KaTeXDisplay':
					html += `<div class="md-katex-display">${KaTeXNodeToHTML(node.code, true)}</div>`;
					break;
				case 'header':
					html += `<h${node.ord}>${toMarkdown(node.text)}</h${node.ord}>`;
					break;
				case 'quote':
					html += `<blockquote>${mdToHTML(node.text)}</blockquote>`;
					break;
				case 'bold':
					html += `<b>${mdToHTML(node.text)}</b>`;
					break;
				case 'italic':
					html += `<i>${mdToHTML(node.text)}</i>`;
					break;
				case 'strikethrough':
					html += `<s>${mdToHTML(node.text)}</s>`;
					break;
				case 'ulist':
					html += `<ul>`;
					let prev
					for (let i of node.items) {
						html += `<li>${mdToHTML(i.text)}</li>`;
					}
					html += `</ul>`;
					break;
				case 'link':
					html += `<a href="${node.url}" title="Open ${node.url}" target="_blank" class="md-hlnk">${node.alt}</a>`;
					break;
				case 'image':
					html += `<img src="${node.url}" alt="${node.alt}" title="${node.alt}">`;
				case 'color':
					html += `<span class="md-color" style="background-color: #${node.hex}"></span> #${node.hex}`;
					break;
				case 'paragraph':
					html += `<p>${node.str}</p>`;
					break;
				case 'endash':
					html += `&ndash;`;
					break;
				case 'emdash':
					html += `&mdash;`;
					break;
				case 'newline':
					html += `<br>`;
					break;
			}
		}
		return html;
	};

	var parseMarkdown = function(code) {
		var markdown = parseCodeBlock(code);

		parseX(markdown, parseUnorderedLists);
		parseX(markdown, parseHeader);
		parseX(markdown, parseAltHeader);
		parseX(markdown, parseInlineCode);
		parseX(markdown, parseKaTeXDisplay);
		parseX(markdown, parseKaTeX);
		parseX(markdown, parseQuote);
		parseX(markdown, parseFormatting);
		parseX(markdown, parseLinksAndImages);
		parseX(markdown, parseURL);
		parseX(markdown, parseColor);
		parseX(markdown, parseEmDash);
		parseX(markdown, parseEnDash);
		parseX(markdown, parseNewlines);

		return markdown;
	};
}

var toMarkdown = function(code) {
	return mdToHTML(parseMarkdown(code.trim()));
};