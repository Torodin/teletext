#!/usr/bin/env node
import React from 'react';
import {render} from 'ink';
import meow from 'meow';
import App from './app.js';

meow(
	`
	Usage
	  $ teletext

	Options
		--name  Your name

	Examples
	  $ teletext --name=Jane
	  Hello, Jane
`,
	{
		importMeta: import.meta
	},
);

process.stdout.write("\x1b[?1049h") // enter alternate buffer

render ( <App /> )
