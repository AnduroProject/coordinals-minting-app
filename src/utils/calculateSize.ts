import { BIP32Interface } from "bip32";
import * as coordinate from "chromajs-lib";
import { Psbt } from "chromajs-lib";
import { outputSize } from "@/lib/constants";
import { utxo } from "@/types";

export async function calculateSize(
  psbt: Psbt,
  node: BIP32Interface,
  inputs: utxo[],
) {
  const instance = coordinate.Psbt.fromBuffer(psbt.toBuffer());

  for (let i = 0; i < instance.inputCount; i++) {
    const signer = node.derive(0).derive(inputs[i].derviation_index);
    instance.signInput(i, signer);
  }

  instance.finalizeAllInputs();

  const vBytes = instance.extractTransaction(true).virtualSize();

  return vBytes + outputSize;
}
