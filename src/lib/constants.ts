export const rpcUrl = "http://seed3.coordinate.mara.technology",
  rpcPort = 18332;

export const maraUrl =
  "http://btc-testnet-wallet.mara.technology:9130/unspents/list?address=&xpub=";

//export const apiurl= "http://192.168.1.112:4001/unspents/whitelist";
export const apiurl= "http://btc-testnet-wallet.mara.technology:9130/unspents/whitelist";
  
export const alysBaseURL = "http://testnet.alyscan.io/api/v2/tokens";
export const appBaseUrl = "http://localhost:3000";

export const nftContractAddress= "0xBdB3dbeC70B4Bcb4A0E8FA9AF18980Af38FA826e"
export const tokenContractAddress= "0x894554AE5373d7C3456009d21e4bf7B407Ab8752"

export const privateKey= "2dd20bf2585b6a1947315762ee8660990d064ab2dc3f4cf1a365a35a53a8f252"
export const chromaBookApi = "http://btcalys.xyz:8545"
export const fileSizeLimit = 3145728; //3MB in binary

//native segwit
export const outputSize = 31,
  inputSize = 72;

export const ASSETTYPE = {
  TOKEN: 0,
  NFTOFFCHAIN: 1,
  NFTONCHAIN: 2,
};

export const USED_UTXO_KEY = "used_utxo";

export const MOCK_MENOMIC = process.env.NEXT_PUBLIC_MOCK_MENOMIC ?? "";

export const RECEIVER_ADDRESS = process.env.NEXT_PUBLIC_RECEIVER_ADDRESS ?? "";

export const RPC_USERNAME = "marachain";
export const RPC_PASSWORD = "marachain";

export const FEERATE = 10;

export const WALLET_URL =
  "chrome-extension://aieohakdobeceddbemhdmlklalainiaf/index.html";

export const exampleJson = [
  {
    meta: {
      name: "Bitcoin Punk #1",
    },
    attributes: [
      {
        trait_type: "Background",
        value: "Gray",
      },
      {
        trait_type: "Wings",
        value: "None",
      },
      {
        trait_type: "Body",
        value: "Ordinal",
      },
      {
        trait_type: "Clothes",
        value: "Varsity GreenBeige",
      },
      {
        trait_type: "Mouth",
        value: "Pink Normal",
      },
      {
        trait_type: "Eyes",
        value: "7",
      },
      {
        trait_type: "Glass",
        value: "Yellow",
      },
      {
        trait_type: "HeadWear",
        value: "Simple Color",
      },
      {
        trait_type: "Accessories",
        value: "None",
      },
    ],
  },
  {
    meta: {
      name: "Bitcoin Punk #2",
    },
    attributes: [
      {
        trait_type: "Background",
        value: "Yellow Normal",
      },
      {
        trait_type: "Wings",
        value: "None",
      },
      {
        trait_type: "Body",
        value: "Ordinal",
      },
      {
        trait_type: "Clothes",
        value: "Hooded Jacket Black",
      },
      {
        trait_type: "Mouth",
        value: "Pink Normal",
      },
      {
        trait_type: "Eyes",
        value: "5",
      },
      {
        trait_type: "Glass",
        value: "3D Class",
      },
      {
        trait_type: "HeadWear",
        value: "Purple Thug Hat",
      },
      {
        trait_type: "Accessories",
        value: "Gum",
      },
    ],
  },
  {
    meta: {
      name: "Bitcoin Punk #3",
    },
    attributes: [
      {
        trait_type: "Background",
        value: "Blue Normal",
      },
      {
        trait_type: "Wings",
        value: "None",
      },
      {
        trait_type: "Body",
        value: "Green",
      },
      {
        trait_type: "Clothes",
        value: "Founder Gray Hoodie",
      },
      {
        trait_type: "Mouth",
        value: "Pink Happy",
      },
      {
        trait_type: "Eyes",
        value: "11",
      },
      {
        trait_type: "Glass",
        value: "None",
      },
      {
        trait_type: "HeadWear",
        value: "Purple Thug Hat",
      },
      {
        trait_type: "Accessories",
        value: "None",
      },
    ],
  },
  {
    meta: {
      name: "Bitcoin Punk #4",
    },
    attributes: [
      {
        trait_type: "Background",
        value: "Gray",
      },
      {
        trait_type: "Wings",
        value: "None",
      },
      {
        trait_type: "Body",
        value: "Ordinal",
      },
      {
        trait_type: "Clothes",
        value: "Varsity GreenBeige",
      },
      {
        trait_type: "Mouth",
        value: "Pink Normal",
      },
      {
        trait_type: "Eyes",
        value: "7",
      },
      {
        trait_type: "Glass",
        value: "Yellow",
      },
      {
        trait_type: "HeadWear",
        value: "Simple Color",
      },
      {
        trait_type: "Accessories",
        value: "None",
      },
    ],
  },
  {
    meta: {
      name: "Bitcoin Punk #5",
    },
    attributes: [
      {
        trait_type: "Background",
        value: "Gray",
      },
      {
        trait_type: "Wings",
        value: "None",
      },
      {
        trait_type: "Body",
        value: "Ordinal",
      },
      {
        trait_type: "Clothes",
        value: "Varsity GreenBeige",
      },
      {
        trait_type: "Mouth",
        value: "Pink Normal",
      },
      {
        trait_type: "Eyes",
        value: "7",
      },
      {
        trait_type: "Glass",
        value: "Yellow",
      },
      {
        trait_type: "HeadWear",
        value: "Simple Color",
      },
      {
        trait_type: "Accessories",
        value: "None",
      },
    ],
  },
];
