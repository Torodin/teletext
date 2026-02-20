export default interface Plugin {
    sectionName: string;
    sectionKey: string;
    render: (props: SectionProps) => React.ReactElement;
}
