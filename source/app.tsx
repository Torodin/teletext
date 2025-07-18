import React, { useEffect, useState } from 'react';
import SideNavBar from './components/SideNavBar.js';
import MainLayout from './components/MainLayout.js';
import { Box, useApp, useInput, Text } from 'ink';
import { Alert, Option } from '@inkjs/ui';
import { baseSections, defaultSection, SectionsMap, baseSectionsMap } from './config/navigation.js';
import useCliDimensions from './helpers/useclidimensions.js';

import fs from 'fs';
import path from 'path';
import PluginBase from './plugins/PluginBase.js';
import Plugin from './common/plugin.js';

export default function App() {
	const [columns, height] = useCliDimensions();
	const [sectionsMap, setSectionsMap] = useState(baseSectionsMap);
	const [sections, setSections] = useState(baseSections);
	const [selectedSection, setSelectedSection] = useState<Option>(defaultSection);
	const [isLoadingPlugins, setIsLoadingPlugins] = useState(true);
	const [pluginErrors, setPluginErrors] = useState<string[]>([]); // New state for plugin errors
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
			const pluginsDir = path.join('.', 'dist', 'plugins');
			const pluginFiles = fs.readdirSync(pluginsDir)
				.filter(file => file.endsWith('.js'))
				.filter(pluginFile => pluginFile !== 'PluginBase.js');

			for (const pluginFile of pluginFiles) {
				const pluginPath = path.join(process.cwd(),'dist', 'plugins', pluginFile);
				
				try {
					const pluginModule = await import(`file://${pluginPath}`);
					const plugin = pluginModule.default as Plugin;

					if (plugin) {
						loadedPlugins.set(
							{ label: plugin.sectionName, value: plugin.sectionKey },
							plugin.render
						);
					} else {
						console.warn(`Plugin ${pluginFile} is not a valid plugin. because ${Plugin instanceof PluginBase}`);
						errors.push(`Plugin ${pluginFile} is not a valid plugin. because ${Plugin instanceof PluginBase}`);
					}
				} catch (error) {
					console.error(`Failed to load plugin ${pluginFile}:`, error);
					errors.push(`Failed to load plugin "${pluginFile}": ${error}`);
				}
			} 

			return {loadedPlugins, errors}
		}

		loadPlugins().then(({loadedPlugins, errors}) => {
			setIsLoadingPlugins(false);
			setSectionsMap((prev) => {
				for (const [key, value] of loadedPlugins) {
					prev.set(key, value);
				}
				return new Map(prev)
			});
			setSections(Array.from(sectionsMap.keys()));
			setPluginErrors(errors);
		});
    }, []); // Run once on component mount

	useEffect(() => {        
		setMaxLength(Math.ceil((columns-22)/4));
	}, [columns]);

	const handleNavChange = (option: string) => {
		setSelectedSection(sections.find(opt => opt.value === option) || defaultSection);
	}

	const CurrentSection = sectionsMap.get(selectedSection);
	
	return !isLoadingPlugins ? (
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
				{pluginErrors.length > 0 ? (
					<Box flexDirection="column" marginTop={1} borderStyle="round" borderColor="red" padding={1}>
						{
							pluginErrors.map((error) => (
								<Alert variant="error">{error}</Alert>
							))
						}
					</Box>
				) : null}
			</MainLayout>
		</Box>
	): (
		<Box width={columns} height={height}>
			<MainLayout>
				<Text>Loading plugins...</Text>
			</MainLayout>
		</Box>
	);
}
