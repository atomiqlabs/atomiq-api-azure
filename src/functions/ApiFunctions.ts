import {app, HttpRequest, InvocationContext} from "@azure/functions";
import {api, swapper} from "../SwapperApi";

const LP_RELOAD_TIME = 5*60*1000;

let lastLpReloadTime: number = null;
let lpReloadPromise: Promise<void> = null;

// Wire up SwapperApi endpoints
for (const [name, endpoint] of Object.entries(api.endpoints)) {
    const handler = async (request: HttpRequest, context: InvocationContext) => {
        try {
            // Initiate the swapper if not initialized
            if(!swapper.isInitialized()) {
                lastLpReloadTime = Date.now();
                await swapper.init();
            }

            // Reload LPs once every 5 minutes when request comes
            if(lastLpReloadTime==null || lastLpReloadTime + LP_RELOAD_TIME < Date.now()) {
                if(lpReloadPromise!=null) {
                    context.log("LP reload triggered!");
                    lpReloadPromise = swapper.intermediaryDiscovery.reloadIntermediaries().catch(context.error).then(() => {
                        context.log("LP reload completed!");
                        lpReloadPromise = null;
                        lastLpReloadTime = Date.now();
                    });
                }
            }

            let param: any;
            if(endpoint.type === "GET") {
                param = {};
                request.query.forEach((value, name) => param[name] = value);
            } else {
                param = await request.json();
            }

            const result = await endpoint.callbackRaw(param);

            return {
                status: 200,
                body: JSON.stringify(result)
            };
        } catch (err: any) {
            context.error(err);
            return {
                status: 400,
                body: JSON.stringify({error: err.message})
            };
        }
    };

    app.http(name, {
        methods: [endpoint.type],
        authLevel: 'anonymous',
        handler
    });
    console.log(`  ${endpoint.type} /${name}`);
}
