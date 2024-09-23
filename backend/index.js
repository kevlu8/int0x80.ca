const express = require('express');
const fs = require('fs');
const path = require('path');
var showdown = require('showdown'),
converter = new showdown.Converter({
	tables: true,
});

const app = express();

app.get('/' , (req, res) => {
	res.sendFile(path.join(__dirname, '..', 'front-tmp', 'index.html'));
});

app.get('/api/problems', (req, res) => {
	// read the problems directory
	fs.readdir(path.join(__dirname, '..', 'problems'), (err, files) => {
		if (err) {
			res.status(500).send('Internal server error');
		} else {
			res.send(files); /// TODO: organize the problems by the website (codeforces, dmoj, leetcode, etc.)
		}
	});
});

app.get('/api/problem/:pid', (req, res) => {
	// read file in problems/pid/editorial.md
	const pid = req.params.pid;
	const filename = path.join(__dirname, '..', 'problems', pid, 'editorial.md');
	fs.readFile(filename, 'utf8', (err, data) => {
		if (err) {
			res.status(404).send('Not found');
		} else {
			let htmldata = converter.makeHtml(data);
			// Link MathJax
			htmldata = "<script>MathJax = {tex: {inlineMath: [['$', '$']]},svg: {fontCache: 'global'}};</script><script id='MathJax-script' async src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'></script>" + htmldata;
			// Link highlight.js
			htmldata = "<script defer>hljs.highlightAll();</script>" + htmldata;
			htmldata = "<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css'><script src='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js'></script>" + htmldata;
			// ^ is this hacky? Yes. Do we care? ~~No~~ Absolutely not.
			res.send(htmldata);
		}
	});
});

app.get('/api/blogs', (req, res) => {
	// read the blogs directory
	fs.readdir(path.join(__dirname, '..', 'blogs'), (err, files) => {
		if (err) {
			res.status(500).send('Internal server error');
		} else {
			res.send(files);
		}
	});
});

app.get('/api/blog/:bid', (req, res) => {
	// read file in blogs/bid/blog.md
	const bid = req.params.bid;
	const filename = path.join(__dirname, '..', 'blogs', bid, 'blog.md');
	fs.readFile(filename, 'utf8', (err, data) => {
		if (err) {
			res.status(404).send('Not found');
		} else {
			let htmldata = converter.makeHtml(data);
			// Link MathJax
			htmldata = "<script>MathJax = {tex: {inlineMath: [['$', '$']]},svg: {fontCache: 'global'}};</script><script id='MathJax-script' async src='https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js'></script>" + htmldata;
			// Link highlight.js
			htmldata = "<script defer>hljs.highlightAll();</script>" + htmldata;
			htmldata = "<link rel='stylesheet' href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css'><script src='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js'></script>" + htmldata;
			// ^ is this hacky? Yes. Do we care? ~~No~~ Absolutely not.
			res.send(htmldata);
		}
	}
	);
});

// Run
app.listen(3000, () => {
	console.log('Server is running');
});