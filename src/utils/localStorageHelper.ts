import { USED_UTXO_KEY } from "@/lib/constants";

export function saveUsedUtxo(txid: string) {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      USED_UTXO_KEY,
      JSON.stringify({ txid, timestamp: Date.now() }),
    );
  }
}

export function checkUsedUtxo(txid: string): boolean {
  if (typeof window === "undefined") return false;

  const usedUtxoString = localStorage.getItem(USED_UTXO_KEY);
  console.log("🚀 ~ checkUsedUtxo ~ usedUtxoString:", usedUtxoString);
  if (!usedUtxoString) return false;

  const usedUtxo = JSON.parse(usedUtxoString);
  if (usedUtxo.txid === txid && Date.now() - usedUtxo.timestamp < 30000) {
    // 30000 ms = 30 second
    return true;
  }
  return false;
}

export function getSavedUtxo(): string | null {
  if (typeof window === "undefined") return null;

  const usedUtxoString = localStorage.getItem(USED_UTXO_KEY);
  if (!usedUtxoString) return null;

  const usedUtxo = JSON.parse(usedUtxoString);
  return usedUtxo.txid;
}
