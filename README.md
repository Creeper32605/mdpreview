# mdpreview
Previews markdown files and updates live.

_Some features are still missing (such as lists and tables)_

![Screenshot](https://i.imgur.com/GrwBwXA.png)

## Usage
_No packaged version yet because it's missing a lot of features_

This application runs on Electron (v1.1+), so the simplest way is the following:

```
npm install electron-prebuilt
cd path/to/cloned-repo
electron .
```

## Features
Supported Features

- inline code and code blocks
- headers
- quotes
- italic, bold, strikethrough

Extra Features

- inline KaTeX (`$..$`) and display KaTeX (`$$...$$`)
- hex colours have a preview box in front of them
- en dashes (`--`) and em dashes (`---`)