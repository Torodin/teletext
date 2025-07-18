import React, { useEffect, useState } from 'react';
import SideNavBar from './components/SideNavBar.js';
import MainLayout from './components/MainLayout.js';
import { Box, useApp, useInput } from 'ink';
import { Alert, Option } from '@inkjs/ui';
import { baseSections, defaultSection, sectionsMap } from './config/navigation.js';
import useCliDimensions from './helpers/useclidimensions.js';

export default function App() {
	const [columns, height] = useCliDimensions();
	const [sections] = useState(baseSections);
	const [selectedSection, setSelectedSection] = useState<Option>(defaultSection);
	const [maxLength, setMaxLength] = useState<number>(columns/6);   
	const { exit } = useApp()
 
	useInput((input, key) => {
	  if (input === "q" || key.escape) {
		exit()
	  }
	})

	useEffect(() => {        
		setMaxLength(Math.ceil((columns-22)/4));
	}, [columns]);

	const handleNavChange = (option: string) => {
		setSelectedSection(sections.find(opt => opt.value === option) || defaultSection);
	}

	const CurrentSection = sectionsMap.get(selectedSection);
	
	return (
		<Box width={columns} height={height}>
			<MainLayout>
				<SideNavBar options={sections} onChange={handleNavChange}/>
				<Box 
					borderStyle={'single'}
					flexDirection={'column'}
					justifyContent='center'
					width="100%"
					paddingLeft={2}
					paddingRight={2}
				>
					{ 
						CurrentSection ? (
							<CurrentSection maxLength={maxLength} />
						) : (
							<Alert variant="error">Section not found</Alert>
						)
					}
				</Box>
			</MainLayout>
		</Box>
	);
}
