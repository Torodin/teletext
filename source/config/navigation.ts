import { Option } from "@inkjs/ui";
import { ReactElement } from "react";
import F1Section from "../components/sections/F1Section.js";
import SectionProps from "../common/sectionprops.js";
import GoogleCalendarSection from "../components/sections/GoogleCalendarSection.js";

export type SectionsMap = Map<Option, ({maxLength}:SectionProps) => ReactElement>;

export const baseSectionsMap: SectionsMap = new Map([
  [ { label: 'Google Calendar', value: 'pane_two'}, GoogleCalendarSection ],
  [ { label: 'F1', value: 'pane_one' }, F1Section ],
])

export const baseSections: Option[] = Array.from(baseSectionsMap.keys());

export const defaultSection: Option = baseSections[0] as Option;
