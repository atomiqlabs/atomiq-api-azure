"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const cosmos_1 = require("@azure/cosmos");
const functions_1 = require("@azure/functions");
const SwapperApi_1 = require("../SwapperApi");
const { COSMOS_CONNECTION_STRING, COSMOS_DATABASE_NAME } = process.env;
const client = new cosmos_1.CosmosClient(COSMOS_CONNECTION_STRING);
let containerEvents;
// On-chain events timer
function PollEventsTimer(timer, context) {
    return __awaiter(this, void 0, void 0, function* () {
        if (containerEvents == null) {
            const { container } = yield client.database(COSMOS_DATABASE_NAME).containers.createIfNotExists({
                partitionKey: "/id",
                id: "events",
                indexingPolicy: {
                    indexingMode: "none"
                }
            });
            containerEvents = container;
        }
        yield SwapperApi_1.swapper.init();
        const chains = SwapperApi_1.swapper.getSmartChains();
        const promises = [];
        for (let chain of chains) {
            promises.push((() => __awaiter(this, void 0, void 0, function* () {
                var _a;
                try {
                    const initialCursor = yield containerEvents.item(chain, chain).read();
                    if (initialCursor.statusCode !== cosmos_1.StatusCodes.NotFound && initialCursor.resource == null) {
                        throw new Error(`Stored cursor for ${chain} could not be read`);
                    }
                    const result = yield SwapperApi_1.swapper._pollChainEvents(chain, (_a = initialCursor.resource) === null || _a === void 0 ? void 0 : _a.value);
                    yield containerEvents.items.upsert({
                        id: chain,
                        value: result
                    });
                    context.log(`Successfully fetched new events for ${chain}, current pointer: `, result);
                }
                catch (e) {
                    context.error(`Failed to fetch new events for ${chain}!`);
                }
            }))());
        }
        yield Promise.all(promises);
    });
}
functions_1.app.timer("PollEventsTimer", {
    schedule: "*/15 * * * * *",
    handler: PollEventsTimer
});
//# sourceMappingURL=PollEventsTimer.js.map