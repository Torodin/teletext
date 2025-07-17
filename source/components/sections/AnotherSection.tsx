import { Box, Text } from "ink";
import BigText from "ink-big-text";
import React from "react";

export default function AnotherSection() {
    return (
        <Box
            borderStyle={'single'}
            flexDirection={'column'}
            paddingLeft={4}
            paddingRight={4}
        >
            <BigText text="Another Section"/>
            <Text>I'm the second content area</Text>
        </Box>
    )
}
