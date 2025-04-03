import { IndexingPolicy } from "@azure/cosmos";

export const indexingPolicy: IndexingPolicy = {
    indexingMode: "consistent",
    automatic: true,
    includedPaths: [
        { path: "/id" },
        { path: "/comments/id" }
    ]
} 