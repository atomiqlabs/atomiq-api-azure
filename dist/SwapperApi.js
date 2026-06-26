"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.swapper = void 0;
const sdk_1 = require("@atomiqlabs/sdk");
const chain_starknet_1 = require("@atomiqlabs/chain-starknet");
const api_1 = require("@atomiqlabs/sdk/api");
const chain_solana_1 = require("@atomiqlabs/chain-solana");
const chain_evm_1 = require("@atomiqlabs/chain-evm");
const storage_cosmosdb_1 = require("@atomiqlabs/storage-cosmosdb");
const { LOG_LEVEL, // 0, 1, 2, 3
BITCOIN_NETWORK, // TESTNET, TESTNET4, MAINNET
STARKNET_RPC, SOLANA_RPC, BOTANIX_RPC, CITREA_RPC, ALPEN_RPC, GOAT_RPC, COSMOS_CONNECTION_STRING, COSMOS_DATABASE_NAME, LP_API_AUTH_CERTIFICATE, LP_API_AUTH_PRIVATE_KEY } = process.env;
if (LOG_LEVEL != null) {
    global.atomiqLogLevel = parseInt(LOG_LEVEL);
}
const bitcoinNetwork = BITCOIN_NETWORK == null || BITCOIN_NETWORK === "MAINNET"
    ? sdk_1.BitcoinNetwork.MAINNET
    : BITCOIN_NETWORK === "TESTNET4"
        ? sdk_1.BitcoinNetwork.TESTNET4
        : sdk_1.BitcoinNetwork.TESTNET3;
const chains = [
    chain_starknet_1.StarknetInitializer,
    chain_solana_1.SolanaInitializerV2,
    chain_evm_1.BotanixInitializer,
    chain_evm_1.CitreaInitializer,
    chain_evm_1.AlpenInitializer,
    chain_evm_1.GoatInitializer
];
const Factory = new sdk_1.SwapperFactory(chains);
exports.swapper = Factory.newSwapper({
    chains: {
        STARKNET: STARKNET_RPC == null ? null : {
            rpcUrl: STARKNET_RPC
        },
        SOLANA: SOLANA_RPC == null ? null : {
            rpcUrl: SOLANA_RPC
        },
        BOTANIX: BOTANIX_RPC == null ? null : {
            rpcUrl: BOTANIX_RPC
        },
        CITREA: CITREA_RPC == null ? null : {
            rpcUrl: CITREA_RPC
        },
        ALPEN: ALPEN_RPC == null ? null : {
            rpcUrl: ALPEN_RPC
        },
        GOAT: GOAT_RPC == null ? null : {
            rpcUrl: GOAT_RPC
        }
    },
    bitcoinNetwork,
    swapStorage: chainId => new storage_cosmosdb_1.CosmosDBSwapPatchStorage(chainId, COSMOS_CONNECTION_STRING, COSMOS_DATABASE_NAME, false),
    chainStorageCtor: name => new storage_cosmosdb_1.CosmosDBStorageManager(name, COSMOS_CONNECTION_STRING, COSMOS_DATABASE_NAME),
    noEvents: true,
    noTimers: true,
    noSwapCache: true,
    dontCheckPastSwaps: true,
    signedKeyBasedAuth: LP_API_AUTH_CERTIFICATE == null || LP_API_AUTH_PRIVATE_KEY == null ? undefined : {
        certificate: LP_API_AUTH_CERTIFICATE,
        privateKey: LP_API_AUTH_PRIVATE_KEY
    }
});
exports.api = new api_1.SwapperApi(exports.swapper, { idempotentTxSubmission: true });
//# sourceMappingURL=SwapperApi.js.map