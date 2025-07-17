import { Box, Text } from "ink";
import BigText from "ink-big-text";
import React from "react";
import useCliDimensions from "../../helpers/useclidimensions.js";

export default function F1Section() {
    const [columns] = useCliDimensions();
    return(
        <Box
            borderStyle={'single'}
            flexDirection={'column'}
            justifyContent='center'
            paddingLeft={4}
            paddingRight={4}
        >
            <BigText text="F1 Statistics" font="tiny" maxLength={columns-20}/>
            <Text>I'm the first content area</Text>
        </Box>
    );
}
