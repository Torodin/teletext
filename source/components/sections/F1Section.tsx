import { Box, Text } from "ink";
import BigText from "ink-big-text";
import React, { useEffect, useState } from "react";
import SectionProps from "../../common/sectionprops.js";
import { fetchWithCache } from "../../helpers/fetchWithCache.js";
import { FlatCache } from "flat-cache";

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

interface Session {
    meeting_key: number
    session_key: number
    location: string
    date_start: string
    date_end: string
    session_type: string
    session_name: string
    country_key: number
    country_code: string
    country_name: string
    circuit_key: number
    circuit_short_name: string
    gmt_offset: string
    year: number
}

interface DriverResult {
    position?: number
    driver_number: number
    number_of_laps: number
    points: number
    dnf: boolean
    dns: boolean
    dsq: boolean
    gap_to_leader?: number
    duration?: number
    meeting_key: number
    session_key: number
}

interface Driver {
  broadcast_name: string
  country_code: string
  driver_number: number
  first_name: string
  full_name: string
  headshot_url: string
  last_name: string
  meeting_key: number
  name_acronym: string
  session_key: number
  team_colour: string
  team_name: string
}

function sortDriverResults(a: DriverResult, b: DriverResult) {
    if (a.position && b.position) {
        // Both have positions, sort by position in ascending order
        return a.position - b.position;
    } else {
        // Neither 'a' nor 'b' has a position, apply secondary sort by status
        const priorityA = getStatusPriority(a);
        const priorityB = getStatusPriority(b);
        return priorityA - priorityB;
    }
};

function getStatusPriority(driverResult: DriverResult) {
    if (driverResult.dnf) return 2; // DNF comes second
    if (driverResult.dns) return 3; // DNS comes third
    if (driverResult.dsq) return 4; // DSQ comes last
    return 1; // Any other status or no special status comes first
}

async function getLastMeeting(cache: FlatCache) {
    const url = `https://api.openf1.org/v1/meetings?meeting_key=latest`;

    return fetchWithCache<Meeting[], Meeting>(url, cache, meetings => meetings[0]);
}

async function getRaceSession(meeting_key: number, cache: FlatCache) {
    const url = `https://api.openf1.org/v1/sessions?meeting_key=${meeting_key}&session_type=Race`;

    return fetchWithCache<Session[], Session>(url, cache, sessions => sessions[0]);
}

async function getSessionResults(session_key: number, cache: FlatCache) {
    const url = `https://api.openf1.org/v1/session_result?session_key=${session_key}`;

    return fetchWithCache<DriverResult[]>(url, cache);
}

async function getSessionDrivers(session_key: number, cache: FlatCache) {
    const url = `https://api.openf1.org/v1/drivers?session_key=${session_key}`;

    return fetchWithCache<Driver[]>(url, cache);
}

export default function F1Section({maxLength, cache}: SectionProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [lastMetting, setLastMetting] = useState<Meeting>();
    const [sessionResults, setSessionResults] = useState<DriverResult[]>();
    const [drivers, setDrivers] = useState<Driver[]>();
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const lastMeeting = await getLastMeeting(cache);
                setLastMetting(lastMeeting);

                const raceSession = await getRaceSession(lastMeeting.meeting_key, cache);
                const sessionResult = await getSessionResults(raceSession.session_key, cache);
                const sessionDrivers = await getSessionDrivers(raceSession.session_key, cache);
                setSessionResults(sessionResult.sort(sortDriverResults));
                setDrivers(sessionDrivers);
            } catch (error) {
                setError(error instanceof Error ? error.message : "Unknown error!");
            } finally {
                setIsLoading(false);
            }
        }
        fetchData()
    }, []);

    if (isLoading && !lastMetting && !sessionResults?.length && !drivers?.length) {
        return (
            <Text>Cargando...</Text>
        );
    }
    else if (error) {
        return (
            React.createElement(Box, { flexDirection: "column", borderStyle: "round", borderColor: "red", padding: 1 },
                React.createElement(Text, { color: "red", bold: true }, "⚠️ Error fetching F1 data:"),
                React.createElement(Text, null, error)
            )
        )
    } 
    else if (lastMetting && sessionResults?.length && drivers?.length) {
        return(
            <>
                <BigText text="F1 last results" font="tiny" maxLength={maxLength}/>
                <Box flexDirection="row" gap={3}>
                    <Box flexDirection="column" width={22}>
                        <Text>Last metting was {lastMetting.meeting_name} at {lastMetting.circuit_short_name}</Text>
                    </Box>
                    <Box flexDirection="column">
                        <Text key='results-head' bold>
                            Pos - Number & Name - Points
                        </Text>
                        {
                            sessionResults.map(driverResult => {
                                const driver = drivers.find(driver => driverResult.driver_number === driver.driver_number)
                                return (
                                    <Box key={`${driverResult.driver_number}`} gap={1} justifyContent="space-between">
                                        <Text backgroundColor={driverResult.position === 1 ? 'magenta' : !driverResult.position ? 'red': 'black'}>
                                            {driverResult.position ? `${driverResult.position}` : driverResult.dnf ? "DNF" : driverResult.dns ? "DNS" : driverResult.dsq ? "DSQ" : ""}
                                        </Text>
                                        <Text color={`#${driver?.team_colour}`}>
                                            {driverResult.driver_number} | {driver?.broadcast_name}
                                        </Text>
                                        <Text>
                                            + {driverResult.points ? `${driverResult.points}` : 0}
                                        </Text>
                                    </Box>
                                )
                            })
                        }
                    </Box>
                </Box>
            </>
        );
    } else {
        return (
            <Text>There is no data available</Text>
        );
    }
}
