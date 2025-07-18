import { Text } from "ink";
import BigText from "ink-big-text";
import React from "react";
import SectionProps from "./sectionprops.js";

export default function F1Section({maxLength}: SectionProps) {
    return(
        <>
            <BigText text="F1 Statistics" font="tiny" maxLength={maxLength}/>
            <Text>I'm the first content area</Text>
        </>
    );
}
