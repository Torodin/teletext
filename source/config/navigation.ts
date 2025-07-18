import { Option } from "@inkjs/ui";
import { ReactElement } from "react";
import AnotherSection from "../components/sections/AnotherSection.js";
import F1Section from "../components/sections/F1Section.js";
import SectionProps from "../components/sections/sectionprops.js";

type NavConfig = Map<Option, ({maxLength}:SectionProps) => ReactElement>;

export const navOptionsMap: NavConfig = new Map([
  [ { label: 'F1', value: 'pane_one' }, F1Section ],
  [ { label: 'Another', value: 'pane_two'}, AnotherSection ]
])

export const navOptions: Option[] = Array.from(navOptionsMap.keys());

export const defaultNavOption: Option = navOptions[0] as Option;
