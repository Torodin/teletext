import React, { ReactElement } from "react";
import { Text } from "ink";
import SectionProps from "../source/common/sectionprops.js";

export default class PluginBase {
    sectionName: string = "Base Plugin Section";
    sectionKey: string = "base_plugin_section";
    render({}: SectionProps): ReactElement {
        return <Text>No content</Text>;
    }
}
