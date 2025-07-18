import { Text } from "ink";
import BigText from "ink-big-text";
import React from "react";
import SectionProps from "../../common/sectionprops.js";

export default function AnotherSection({maxLength}: SectionProps) {
    return (
        <>
            <BigText text="Another" font="tiny" maxLength={maxLength}/>
            <Text>I'm the second content area</Text>
        </>
    )
}
