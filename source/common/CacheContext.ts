import { FlatCache } from "flat-cache";
import { createContext } from "react";

export const CacheContext = createContext(
    new FlatCache({
        ttl: 60 * 60 * 1000,
        lruSize: 5000,
        persistInterval: 5 * 1000 * 60,	
    })
);
