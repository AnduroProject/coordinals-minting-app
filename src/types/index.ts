export type tokenData = {
  address: string;
  opReturnValues: any[];
  assetType: number;
  headline: string;
  ticker: string;
  supply: number;
};
export type alysAssetData = {
  name: string;
  symbol: string;
  image: any;
  supply :number;

};
export type TokenInfo ={
  //address: string;
  name: string;
  symbol: string;
  total_supply:string
}

export type collectionData = {
  address: string;
  opReturnValues: any[];
  assetType: number;
  headline: string;
  ticker: string;
  supply: number;
  traits: Attribute[];
  //traits optional, logo optional
};

export type utxo = {
  txid: string;
  vout: number;
  value: number;
  coinbase: boolean;
  height: number;
  derviation_index: number;
  confirmations: number;
  unspent_type:number

};


export type rpcResponse = {
  result: string;
  error: boolean;
  id: string;
  message: string;
};

type Attribute = {
  trait_type: string;
  value: string;
};

type Meta = {
  name: string;
};

export type MergedObject = {
  attributes: Attribute[];
  base64: string;
  fileName: string;
  meta: Meta;
  mimeType: string;
};
