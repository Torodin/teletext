import React from "react";
import { Text } from "ink";
import SectionProps from "../common/sectionprops.js";
import Plugin from "../common/plugin.js";

const plugin: Plugin = {
    sectionName: "Example Section",
    sectionKey: "example_section",
    render: ({ maxLength }: SectionProps) => (
        <Text>
            This is an example plugin section. It can display content up to a maximum length of {maxLength}.
        </Text>
    )
}

export default plugin;
