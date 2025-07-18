import React from "react";
import { Text } from "ink";
import PluginBase from "./PluginBase.js";
import SectionProps from "../source/common/sectionprops.js";

export default class PluginExample extends PluginBase {
    override sectionName = "Example Section";
    override sectionKey = "example_section";
    override render({ maxLength }: SectionProps) {
        return (
            <Text>
                This is an example plugin section. It can display content up to a maximum length of {maxLength}.
            </Text>
        );
    }
}
