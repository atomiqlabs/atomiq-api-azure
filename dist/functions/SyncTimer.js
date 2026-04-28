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
// Swaps sync timer
function SyncTimer(timer, context) {
    return __awaiter(this, void 0, void 0, function* () {
        yield SwapperApi_1.swapper.init();
        yield SwapperApi_1.api.sync();
    });
}
functions_1.app.timer("SyncTimer", {
    schedule: "0 */5 * * * *",
    handler: SyncTimer
});
//# sourceMappingURL=SyncTimer.js.map