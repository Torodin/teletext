import { Box, Text } from "ink";
import BigText from "ink-big-text";
import React, { useContext, useEffect, useState } from "react";
import SectionProps from "../../common/sectionprops.js";
import { authenticate } from "@google-cloud/local-auth";
import { OAuth2Client } from 'google-auth-library';
import { calendar_v3, google } from "googleapis";
import path from 'node:path'
import { FlatCache } from "flat-cache";
import { CacheContext } from "../../common/CacheContext.js";

// The scope for reading calendar events.
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
// The path to the credentials file.
const CREDENTIALS_PATH = path.join(process.cwd(), 'google_credentials.json');

async function listEvents(cache: FlatCache) {
    let auth = cache.getKey<OAuth2Client>('google_auth');

    if (!auth) {
        // Authenticate with Google and get an authorized client.
        auth = await authenticate({
            scopes: SCOPES,
            keyfilePath: CREDENTIALS_PATH,
        });
        cache.setKey('google_auth', auth);
        cache.save();
    }

    let events = cache.getKey<calendar_v3.Schema$Event[]>(`google_calendar_${auth._clientId}`);
    if (events) return events;

    // Create a new Calendar API client.
    const calendar = google.calendar({version: 'v3', auth});
    // Get the list of events.
    const result = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    });
    events = result.data.items ?? [];

    await cache.set(`google_calendar_${auth._clientId}`, result.data.items);
    cache.save();

    return events;
}

export default function GoogleCalendarSection({maxLength}: SectionProps) {
    const cache = useContext(CacheContext);

    const [isLoading, setIsLoading] = useState(true);
    const [upcommingEvents, setUpcommingEvents] = useState<calendar_v3.Schema$Event[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const upcommingEvents = await listEvents(cache);
            setUpcommingEvents(upcommingEvents);
            setIsLoading(false);
        }
        fetchData();
    }, []);

    if (isLoading) {
        return (
            <Text>
                Loading...
            </Text>
        )
    }

    if (!upcommingEvents?.length && !isLoading) {
        return (
            <Text>
                No upcomming events
            </Text>
        )
    }

    return (
        <>
            <BigText text="Next Events" font="tiny" maxLength={maxLength}/>
            <Box flexDirection="column">
                {
                    upcommingEvents.map(event => {
                        return (
                            <Box key={event.start?.date} gap={1} justifyContent="space-between">
                                <Text bold>{event.summary} - {event.start?.dateTime ?? event.start?.date}</Text>
                            </Box>
                        )
                    })
                }
            </Box>
        </>
    )
}
