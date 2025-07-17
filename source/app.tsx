import React, { useState } from 'react';
import SideNavBar from './components/SideNavBar.js';
import MainLayout from './components/MainLayout.js';
import { Box, useApp, useInput } from 'ink';
import { Option } from '@inkjs/ui';
import { navOptionsMap, navOptions, defaultNavOption } from './config/navigation.js';
import useCliDimensions from './helpers/useclidimensions.js';

export default function App() {
	const [columns, height] = useCliDimensions();
	const [navOption, setNavOption] = useState<Option>(defaultNavOption);
	const { exit } = useApp()
 
	useInput((input, key) => {
	  if (input === "q" || key.escape) {
		exit()
	  }
	})

	const handleNavChange = (option: string) => {
		setNavOption(navOptions.find(opt => opt.value === option) || defaultNavOption);
	}
	
	return (
		<Box width={columns} height={height}>
			<MainLayout>
				<SideNavBar options={navOptions} onChange={handleNavChange}/>
				{navOptionsMap.get(navOption)?.()}
			</MainLayout>
		</Box>
	);
}
