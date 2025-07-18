export default interface Plugin {
    sectionName: string;
    sectionKey: string;
    render: ({maxLength}: SectionProps) => React.ReactElement;
}
