import {Container, CosmosClient, StatusCodes} from "@azure/cosmos";
import {app, InvocationContext, Timer} from "@azure/functions";
import {swapper} from "../SwapperApi";

const {
    COSMOS_CONNECTION_STRING,
    COSMOS_DATABASE_NAME
} = process.env;

const client = new CosmosClient(COSMOS_CONNECTION_STRING);

let containerEvents: Container;

// On-chain events timer
async function PollEventsTimer(timer: Timer, context: InvocationContext): Promise<void> {
    if(containerEvents==null) {
        const {container} = await client.database(COSMOS_DATABASE_NAME).containers.createIfNotExists({
            partitionKey: "/id",
            id: "events",
            indexingPolicy: {
                indexingMode: "none"
            }
        });
        containerEvents = container;
    }

    await swapper.init();

    const chains = swapper.getSmartChains();
    const promises: Promise<void>[] = [];
    for (let chain of chains) {
        promises.push((async() => {
            try {
                const initialCursor = await containerEvents.item(chain, chain).read();
                if (initialCursor.statusCode !== StatusCodes.NotFound && initialCursor.resource == null) {
                    throw new Error(`Stored cursor for ${chain} could not be read`);
                }

                const result = await swapper._pollChainEvents(chain, initialCursor.resource?.value);

                await containerEvents.items.upsert({
                    id: chain,
                    value: result
                });
                context.log(`Successfully fetched new events for ${chain}, current pointer: `, result);
            } catch (e) {
                context.error(`Failed to fetch new events for ${chain}!`);
            }
        })());
    }

    await Promise.all(promises);
}

app.timer("PollEventsTimer", {
    schedule: "*/15 * * * * *",
    handler: PollEventsTimer
});
