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
const functions_1 = require("@azure/functions");
const SwapperApi_1 = require("../SwapperApi");
const LP_RELOAD_TIME = 5 * 60 * 1000;
let lastLpReloadTime = null;
let lpReloadPromise = null;
// Wire up SwapperApi endpoints
for (const [name, endpoint] of Object.entries(SwapperApi_1.api.endpoints)) {
    const handler = (request, context) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            // Initiate the swapper if not initialized
            if (!SwapperApi_1.swapper.isInitialized()) {
                lastLpReloadTime = Date.now();
                yield SwapperApi_1.swapper.init();
            }
            // Reload LPs once every 5 minutes when request comes
            if (lastLpReloadTime == null || lastLpReloadTime + LP_RELOAD_TIME < Date.now()) {
                if (lpReloadPromise != null) {
                    context.log("LP reload triggered!");
                    lpReloadPromise = SwapperApi_1.swapper.intermediaryDiscovery.reloadIntermediaries().catch(context.error).then(() => {
                        context.log("LP reload completed!");
                        lpReloadPromise = null;
                        lastLpReloadTime = Date.now();
                    });
                }
            }
            let param;
            if (endpoint.type === "GET") {
                param = {};
                request.query.forEach((value, name) => param[name] = value);
            }
            else {
                param = yield request.json();
            }
            const result = yield endpoint.callbackRaw(param);
            return {
                status: 200,
                body: JSON.stringify(result)
            };
        }
        catch (err) {
            context.error(err);
            return {
                status: 400,
                body: JSON.stringify({ error: err.message })
            };
        }
    });
    functions_1.app.http(name, {
        methods: [endpoint.type],
        authLevel: 'anonymous',
        handler
    });
    console.log(`  ${endpoint.type} /${name}`);
}
//# sourceMappingURL=ApiFunctions.js.map