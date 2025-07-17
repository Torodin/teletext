import { Box } from "ink";
import React from "react";
import { PropsWithChildren } from "react";

export default function MainLayout({children}: PropsWithChildren) {
    return <Box width="100%" height="100%">{children}</Box>;
}
