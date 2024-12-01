import { api } from "encore.dev/api";
import { ping } from "./ping";
import prisma from "../config/database";
import { Site } from "../site/site";
import { CronJob } from "encore.dev/cron";
import { Subscription, Topic } from "encore.dev/pubsub";
// Check checks a single site.
export const check = api(
    { expose: true, method: "POST", path: "/check/:siteID" },
    async (p: { siteID: number }): Promise<{ up: boolean }> => {
        const s = await prisma.site.findUnique({
            where: { id: p.siteID },
        });
        if (!s) {
            throw new Error("Site not found");
        }
        return doCheck(s);
    },
);

async function doCheck(site: Site): Promise<{ up: boolean }> {
    const { up } = await ping({ url: site.url });
    // Publish a Pub/Sub message if the site transitions
    // from up->down or from down->up.
    const wasUp = await getPreviousMeasurement(site.id);
    if (up !== wasUp) {
        await TransitionTopic.publish({ site, up });
    }

    await prisma.check.create({
        data: {
            siteId: site.id,
            up,
            checkedAt: new Date(),
        },
    });
    return { up };
}
export const checkAll = api(
    { expose: true, method: "POST", path: "/check-all" },
    async (): Promise<void> => {
        const sites = await prisma.site.findMany();
        await Promise.all(sites.map(doCheck));
    },
);

// Check all tracked sites every 1 hour.
const cronJob = new CronJob("check-all", {
    title: "Check all sites",
    every: "1h",
    endpoint: checkAll,
});


// TransitionEvent describes a transition of a monitored site
// from up->down or from down->up.
export interface TransitionEvent {
    site: Site; // Site is the monitored site in question.
    up: boolean; // Up specifies whether the site is now up or down (the new value).
}

// TransitionTopic is a pubsub topic with transition events for when a monitored site
// transitions from up->down or from down->up.
export const TransitionTopic = new Topic<TransitionEvent>("uptime-transition", {
    deliveryGuarantee: "at-least-once",
});
async function getPreviousMeasurement(siteID: number): Promise<boolean> {
    const check = await prisma.check.findFirst({
        where: { siteId: siteID },
        orderBy: { checkedAt: 'desc' }, // Order by the latest checked_at
        select: { up: true }, // Select only the 'up' field
    });

    // Return the 'up' value if available, otherwise return true (default behavior)
    return check?.up ?? true;
}



const _ = new Subscription(TransitionTopic, "notification", {
    handler: async (event) => {
        const text = `************${event.site.url} is ${event.up ? "back up." : "down!"}************`;
        console.log(text)
    },
});