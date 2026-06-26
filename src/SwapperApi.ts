import {BitcoinNetwork, SwapperFactory} from "@atomiqlabs/sdk";
import {StarknetInitializer} from "@atomiqlabs/chain-starknet";
import {SwapperApi} from "@atomiqlabs/sdk/api";
import {SolanaInitializerV2} from "@atomiqlabs/chain-solana";
import {AlpenInitializer, BotanixInitializer, CitreaInitializer, GoatInitializer} from "@atomiqlabs/chain-evm";
import {CosmosDBStorageManager, CosmosDBSwapPatchStorage} from "@atomiqlabs/storage-cosmosdb";

const {
    LOG_LEVEL, // 0, 1, 2, 3
    BITCOIN_NETWORK, // TESTNET, TESTNET4, MAINNET
    STARKNET_RPC,
    SOLANA_RPC,
    BOTANIX_RPC,
    CITREA_RPC,
    ALPEN_RPC,
    GOAT_RPC,
    COSMOS_CONNECTION_STRING,
    COSMOS_DATABASE_NAME,
    LP_API_AUTH_CERTIFICATE,
    LP_API_AUTH_PRIVATE_KEY
} = process.env;

if(LOG_LEVEL!=null) {
    (global as any).atomiqLogLevel = parseInt(LOG_LEVEL);
}

const bitcoinNetwork = BITCOIN_NETWORK==null || BITCOIN_NETWORK === "MAINNET"
    ? BitcoinNetwork.MAINNET
    : BITCOIN_NETWORK === "TESTNET4"
        ? BitcoinNetwork.TESTNET4
        : BitcoinNetwork.TESTNET3;

const chains = [
    StarknetInitializer,
    SolanaInitializerV2,
    BotanixInitializer,
    CitreaInitializer,
    AlpenInitializer,
    GoatInitializer
] as const;

const Factory = new SwapperFactory(chains);

export const swapper = Factory.newSwapper({
    chains: {
        STARKNET: STARKNET_RPC == null ? null! : {
            rpcUrl: STARKNET_RPC
        },
        SOLANA: SOLANA_RPC == null ? null! : {
            rpcUrl: SOLANA_RPC
        },
        BOTANIX: BOTANIX_RPC == null ? null! : {
            rpcUrl: BOTANIX_RPC
        },
        CITREA: CITREA_RPC == null ? null! : {
            rpcUrl: CITREA_RPC
        },
        ALPEN: ALPEN_RPC == null ? null! : {
            rpcUrl: ALPEN_RPC
        },
        GOAT: GOAT_RPC == null ? null! : {
            rpcUrl: GOAT_RPC
        }
    },
    bitcoinNetwork,
    swapStorage: chainId => new CosmosDBSwapPatchStorage(chainId, COSMOS_CONNECTION_STRING, COSMOS_DATABASE_NAME, false),
    chainStorageCtor: name => new CosmosDBStorageManager(name, COSMOS_CONNECTION_STRING, COSMOS_DATABASE_NAME),

    noEvents: true,
    noTimers: true,
    noSwapCache: true,
    dontCheckPastSwaps: true,

    signedKeyBasedAuth: LP_API_AUTH_CERTIFICATE==null || LP_API_AUTH_PRIVATE_KEY==null ? undefined : {
        certificate: LP_API_AUTH_CERTIFICATE,
        privateKey: LP_API_AUTH_PRIVATE_KEY
    }
});

export const api = new SwapperApi(swapper, {idempotentTxSubmission: true});
