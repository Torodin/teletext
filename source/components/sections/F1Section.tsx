import { Text } from "ink";
import BigText from "ink-big-text";
import React, { useEffect, useState } from "react";
import SectionProps from "./sectionprops.js";

interface Meeting {
  meeting_key: number
  circuit_key: number
  circuit_short_name: string
  meeting_code: string
  location: string
  country_key: number
  country_code: string
  country_name: string
  meeting_name: string
  meeting_official_name: string
  gmt_offset: string
  date_start: string
  year: number
}

export default function F1Section({maxLength}: SectionProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [lastMetting, setLastMetting] = useState<Meeting>();
    
    useEffect(() => {
        fetch("https://api.openf1.org/v1/meetings?meeting_key=latest")
        .then((response) => response.json())
        .then((mettingsData: Meeting[]) => {
            if (mettingsData && mettingsData.length > 0) {
                setLastMetting(mettingsData[0]);
                setIsLoading(false);
            }
        });
    }, []);

    if (isLoading && !lastMetting) {
        return (
            <Text>Cargando...</Text>
        );
    } else if (lastMetting) {
        return(
            <>
                <BigText text="F1 Statistics" font="tiny" maxLength={maxLength}/>
                <Text>Last metting was {lastMetting.meeting_name}</Text>
            </>
        );
    } else {
        return (
            <Text>There is no data available</Text>
        );
    }
}
