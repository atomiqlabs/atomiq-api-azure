import {app, InvocationContext, Timer} from "@azure/functions";
import {api, swapper} from "../SwapperApi";

// Swaps sync timer
async function SyncTimer(timer: Timer, context: InvocationContext): Promise<void> {
    await swapper.init();
    await api.sync();
}

app.timer("SyncTimer", {
    schedule: "0 */5 * * * *",
    handler: SyncTimer
});
