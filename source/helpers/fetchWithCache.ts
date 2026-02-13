import { FlatCache } from "flat-cache";

/**
 * A generic helper to fetch, cache, and extract data.
 * @param url The API endpoint
 * @param cache Cache instance
 * @param extractor Optional function to transform or pick specific data from the result
 */
export async function fetchWithCache<T, R = T>(
    url: string,
    cache: FlatCache,
    extractor: (data: T) => R | undefined = (data) => data as unknown as R
): Promise<R> {
    let cacheData = await cache.get<T>(url);

    let data: T;
    if (cacheData)  {
        data = cacheData;
    } else {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Fetch failed: ${response.statusText}`);
        
        data = await response.json();
        await cache.set(url, data);
    }

    const result = extractor(data);

    if (result === undefined || result === null) {
        throw new Error(`No data found for URL: ${url}`);
    }

    return result;
}
