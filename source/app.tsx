import React, { useEffect, useState } from 'react';
import SideNavBar from './components/SideNavBar.js';
import MainLayout from './components/MainLayout.js';
import { Box, useApp, useInput, Text } from 'ink';
import { Alert, Option } from '@inkjs/ui';
import { baseSections, defaultSection, SectionsMap, baseSectionsMap } from './config/navigation.js';
import useCliDimensions from './helpers/useclidimensions.js';

import fs from 'fs';
import path from 'path';
import PluginBase from '../plugins/PluginBase.js';

export default function App() {
	const [columns, height] = useCliDimensions();
	const [sectionsMap, setSectionsMap] = useState(baseSectionsMap);
	const [sections, setSections] = useState(baseSections);
	const [selectedSection, setSelectedSection] = useState<Option>(defaultSection);
	const [pluginErrors, setPluginErrors] = useState<string[]>(['hola']); // New state for plugin errors
	const [maxLength, setMaxLength] = useState<number>(columns/6);   
	const { exit } = useApp()
 
	useInput((input, key) => {
	  if (input === "q" || key.escape) {
		exit()
	  }
	})

	useEffect(() => {
		const loadPlugins = async () => {
			const loadedPlugins: SectionsMap = new Map();
			const errors = [];
			const pluginsDir = path.join(process.cwd(), 'plugins');
			const pluginFiles = fs.readdirSync(pluginsDir)
				.filter(file => file.endsWith('.js'))
				.filter(pluginFile => pluginFile !== 'PluginBase.js');

			for (const pluginFile of pluginFiles) {
				const pluginPath = path.join(pluginsDir, pluginFile);
				
				try {
					const pluginModule = await import(pluginPath);
					const Plugin = pluginModule.default;

					if (Plugin && Plugin instanceof PluginBase) {
						loadedPlugins.set(
							{ label: Plugin.sectionName, value: Plugin.sectionKey },
							Plugin.render
						);
					} else {
						console.warn(`Plugin ${pluginFile} is not a valid plugin.`);
					}
				} catch (error) {
					console.error(`Failed to load plugin ${pluginFile}:`, error);
					errors.push(`Failed to load plugin "${pluginFile}": ${error}`);
				}
			} 

			setSectionsMap(new Map([...baseSectionsMap, ...loadedPlugins]));
			setSections(Array.from(sectionsMap.keys()));
			setPluginErrors(errors);
		}

		loadPlugins();
    }, []); // Run once on component mount

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
					<Text>Numero de errores {pluginErrors.length}</Text>
					{ 
						CurrentSection ? (
							<CurrentSection maxLength={maxLength} />
						) : (
							<Alert variant="error">Section not found</Alert>
						)
					}
				</Box>
				{pluginErrors.length > 0 ? (
					<Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="red" padding={1}>
						<Alert variant="error">Plugin Loading Errors:</Alert>
						{
							pluginErrors.map((error) => (
								<Alert variant="error"> - {error}</Alert>
							))
						}
					</Box>
				) : null}
			</MainLayout>
		</Box>
	);
}
