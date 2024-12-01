import { api } from "encore.dev/api";
import prisma from "../config/database";

interface SiteStatus {
    id: number;
    up: boolean;
    checkedAt: string;
}

// StatusResponse is the response type from the Status endpoint.
interface StatusResponse {
    sites: SiteStatus[];
}

// status checks the current up/down status of all monitored sites.
export const status = api(
    { expose: true, path: "/status", method: "GET" },
    async (): Promise<StatusResponse> => {
        const checks = await prisma.check.findMany({
            where: {}, // Optionally filter results here
            orderBy: [
                { siteId: "asc" },
                { checkedAt: "desc" }, // Order by site ID and latest checkedAt
            ],
            distinct: ["siteId"], // Fetch only the latest entry for each site
            select: {
                siteId: true,
                up: true,
                checkedAt: true,
                site: true
            },
        });
        // Transform the results into the desired format
        const results: SiteStatus[] = checks.map((check: any) => ({
            url: check.site.url,
            id: check.siteId,
            up: check.up,
            checkedAt: check.checkedAt,
        }));
        return { sites: results };
    }
);
