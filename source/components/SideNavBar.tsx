import { Option, Select } from "@inkjs/ui";
import { Box } from "ink";
import React from "react";

interface SideNavBarProps {
    options: Option[];
    onChange: (option: string) => void;
}

export default function SideNavBar({options, onChange}: SideNavBarProps) {
    return (
        <Box width={18} borderStyle={'single'}>
            <Select options={options} onChange={onChange}/>
        </Box>
    );
}
