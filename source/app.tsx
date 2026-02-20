import React, { useEffect, useRef, useState } from 'react';
import SideNavBar from './components/SideNavBar.js';
import MainLayout from './components/MainLayout.js';
import { Box, useApp, useInput, Text } from 'ink';
import { Alert, Option } from '@inkjs/ui';
import { baseSections, defaultSection, SectionsMap, baseSectionsMap } from './config/navigation.js';
import useCliDimensions from './helpers/useclidimensions.js';

import fs from 'fs';
import path from 'path';
import Plugin from './common/plugin.js';
import { CacheContext } from './common/CacheContext.js';
import { FlatCache } from 'flat-cache';

const cache = new FlatCache({
	ttl: 60 * 60 * 1000,
	lruSize: 5000,
	persistInterval: 5 * 1000 * 60,	
})

export default function App() {
	const [columns, height] = useCliDimensions();
	const [maxLength, setMaxLength] = useState<number>(columns/6);

	//const [sectionsMap, setSectionsMap] = useState(baseSectionsMap);
	const sectionsMapRef = useRef(baseSectionsMap);
	const [sections, setSections] = useState(baseSections);
	const [selectedSection, setSelectedSection] = useState<Option>(defaultSection);

	const [isLoadingPlugins, setIsLoadingPlugins] = useState(true);
	const [pluginErrors, setPluginErrors] = useState<string[]>([]); // New state for plugin errors

	const { exit } = useApp()
 
	useInput((input, key) => {
	  if (input === "q" || key.escape) {
		exit()
	  }
	})

	useEffect(() => {
		const loadPlugins = async () => {
			const loadedPlugins: SectionsMap = new Map();
			const errors: string[] = [];
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
						// Map plugin with section
						loadedPlugins.set(
							{ label: plugin.sectionName, value: plugin.sectionKey },
							plugin.render
						);
					} else {
						console.warn(`Plugin ${pluginFile} is not a valid plugin.`);
						errors.push(`Plugin ${pluginFile} is not a valid plugin.`);
					}
				} catch (error) {
					console.error(`Failed to load plugin ${pluginFile}:`, error);
					errors.push(`Failed to load plugin "${pluginFile}": ${error}`);
				}
			} 

			return {loadedPlugins, errors};
		}

		loadPlugins().then(({ loadedPlugins, errors }) => {
			/*setSectionsMap((prev) => {
				const newMap = new Map(prev);
				for (const [key, value] of loadedPlugins) {
					newMap.set(key, value);
				}
				return newMap;
			});*/
			const sectionsMap = sectionsMapRef.current;
			for (const [key, value] of loadedPlugins) {
				sectionsMap.set(key, value);
			} 
			sectionsMapRef.current = sectionsMap
			setSections(Array.from(sectionsMap.keys()));
			setPluginErrors(errors);
			setIsLoadingPlugins(false);
		});
    }, []); // Run once on component mount

	useEffect(() => {        
		setMaxLength(Math.ceil((columns-22)/4));
	}, [columns]);

	const handleNavChange = (option: string) => {
		setSelectedSection(sections.find(opt => opt.value === option) || defaultSection);
	}

	const CurrentSection = sectionsMapRef.current.get(selectedSection);
	
	if (isLoadingPlugins) {
		return React.createElement(Text, null, "Cargando plugins...");
	}

	if (pluginErrors.length > 0 && sections.length === 0) {
		return React.createElement(Box, { flexDirection: "column" },
			React.createElement(Text, { color: "red" }, "Critical: Failed to load any plugins."),
			pluginErrors.map((err, i) => React.createElement(Text, { key: i }, err))
    	);
	}

	return (
		<Box width={columns} height={height}>
			<MainLayout>
				<CacheContext.Provider value={cache}>
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
								cache ? (
									<CurrentSection maxLength={maxLength}/>
								) : (
									<Alert variant="error">Section has not been loaded correctly because of cache manager for {selectedSection.value}</Alert>
								)
							) : (
								<Alert variant="error">Section has not been loaded correctly</Alert>
							)
						}
					</Box>
					{pluginErrors.length > 0 ? (
						<Box flexDirection="column" padding={1}>
							<Text color="red">Errors loading plugins:</Text>
							{
								pluginErrors.map((error) => (
									<Alert variant="error">{error}</Alert>
								))
							}
						</Box>
					) : null}
				</CacheContext.Provider>
			</MainLayout>
		</Box>
	);
}
