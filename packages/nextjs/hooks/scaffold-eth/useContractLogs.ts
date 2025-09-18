import { useEffect, useState } from "react";
import { useTargetNetwork } from "./useTargetNetwork";
import { Address, Log } from "viem";
import { usePublicClient } from "wagmi";

export const useContractLogs = (address: Address) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const { targetNetwork } = useTargetNetwork();
  const client = usePublicClient({ chainId: targetNetwork.id });

  useEffect(() => {
    const fetchLogs = async () => {
      if (!client) return console.error("Client not found");
      try {
        const currentBlock = await client.getBlockNumber();
        const existingLogs = await client.getLogs({
          address: address,
          fromBlock: 0n,
          toBlock: currentBlock,
        });
        setLogs(existingLogs);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      }
    };
    fetchLogs();

    return client?.watchBlockNumber({
      onBlockNumber: async (_blockNumber, prevBlockNumber) => {
        try {
          const from = prevBlockNumber ?? 0n;
          const currentBlock = await client.getBlockNumber();
          const newLogs = await client.getLogs({
            address: address,
            fromBlock: from,
            toBlock: currentBlock,
          });
          setLogs(prevLogs => [...prevLogs, ...newLogs]);
        } catch (error) {
          console.error("Failed to fetch logs on new block:", error);
        }
      },
    });
  }, [address, client]);

  return logs;
};
