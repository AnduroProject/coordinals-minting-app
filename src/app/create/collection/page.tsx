"use client";

import React, { useState, useEffect } from "react";
import Banner from "@/components/section/banner";
import Header from "@/components/layout/header";
import Input from "@/components/ui/input";
import UploadFile from "@/components/section/uploadFile";
import ButtonLg from "@/components/ui/buttonLg";
import { useRouter } from "next/navigation";
import ButtonOutline from "@/components/ui/buttonOutline";
import Layout from "@/components/layout/layout";
import UploadCardFill from "@/components/atom/cards/uploadCardFill";
import useFormState from "@/lib/store/useFormStore";
import { DocumentDownload } from "iconsax-react";
import Toggle from "@/components/ui/toggle";
import FileCard from "@/components/atom/cards/fileCard";
import { tokenData } from "@/types";
import {
  ASSETTYPE,
  FEERATE,
  RECEIVER_ADDRESS,
  MOCK_MENOMIC,
  exampleJson,
} from "@/lib/constants";
import { mintToken } from "@/utils/mint";
import CollectiblePreviewCard from "@/components/atom/cards/collectiblePreviewCard";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useConnector } from "anduro-wallet-connector-react";

const stepperData = ["Upload", "Confirm"];

const CollectionDetail = () => {
  const router = useRouter();
  const {
    ticker,
    setTicker,
    headline,
    setHeadline,
    imageBase64,
    setImageBase64,
    setImageMime,
    mergedArray,
    setMergedArray,
    description,
    setDescription,
    reset,
  } = useFormState();
  const { signTransaction, sendTransaction, signAndSendTransaction } =
    React.useContext<any>(useConnector);
  const [step, setStep] = useState<number>(0);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileData, setFileData] = useState<File | null>(null);
  const [files, setFiles] = useState<
    { base64: string; mimeType: string; fileName: string }[]
  >([]);
  const [jsonData, setJsonData] = useState([]);
  // const [mergedArray, setMergedArray] = useState([]);
  const [jsonMetaData, setJsonMetaData] = useState<File | null>(null);

  const [error, setError] = useState<string>("");
  const [errorData, setErrorData] = useState<string[]>([]); 
  const [progress, setProgress] = useState({ value: 0, total: 0, message: "" });
  const [date, setDate] = React.useState<Date>();
  const [excelData, setExcelData] = useState<any[]>([]);
  const [Data, setData] = useState<any[]>([]);


  const handleCheckBox = () => {
    setIsChecked(!isChecked);
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;
        const mime = base64
          .split(",")[0]
          .split(":")[1]
          .split(";")[0]
          .split("/")[1];
        setImageBase64(base64);
        setImageMime(mime);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (indexToDelete: number) => {
    setFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== indexToDelete),
    );
  };

  const handleDelete = () => {
    setImageBase64("");
    setFileData(null);
    setErrorData([]); 
    setError("")
    };

  // useEffect(() => {
  //   if (jsonData && files && jsonData.length === files.length) {
  //     const merged = jsonData.map((item, index) => ({
  //       ...item,
  //       ...files[index],
  //     }));
  //     setMergedArray(merged);
  //   }
  // }, [jsonData, files]); // Dependencies array, re-run effect when jsonData or files change

  // useEffect

  const handleCollectionImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles).map((file) => {
        return new Promise<{
          base64: string;
          mimeType: string;
          fileName: string;
        }>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = () => {
            const fileName = file.name;
            const base64 = reader.result as string;
            const mimeType = base64
              .split(",")[0]
              .split(":")[1]
              .split(";")[0]
              .split("/")[1];
            resolve({ base64, mimeType, fileName });
          };

          reader.onerror = (error) => {
            reject(error);
          };

          reader.readAsDataURL(file);
        });
      });

      Promise.all(fileArray)
        .then((fileData) => {
          setFiles((prevFiles) => [...prevFiles, ...fileData]);
        })
        .catch((error) => {
          console.error("Error reading files:", error);
        });
    }
  };

  const validateJsonStructure = (jsonData: any[]): string | null => {
    if (!Array.isArray(jsonData)) {
      return "JSON data must be an array";
    }

    for (let i = 0; i < jsonData.length; i++) {
      const item = jsonData[i];
      if (!item || typeof item !== "object") {
        return `Item at index ${i} is not an object`;
      }

      if (!item.meta || typeof item.meta !== "object" || !item.meta.name) {
        return `Item at index ${i} does not have a valid meta object with a name property`;
      }
    }

    return null;
  };

  const validateJsonInput = (isChecked: boolean): string | null => {
    if (isChecked) {
      if (!(jsonData && files && jsonData.length === files.length)) {
        return "Images or JSON upload count doesn't match";
      }
      if (mergedArray.length === 0) {
        return "No items to mint";
      }

      // Validate JSON structure
      const jsonValidationError = validateJsonStructure(jsonData);
      if (jsonValidationError) {
        return jsonValidationError;
      }
    } else {
      if (files.length === 0) {
        return "No files uploaded";
      }
    }
    return null;
  };

  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setJsonMetaData(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          try {
            const jsonData = JSON.parse(e.target.result);
            setJsonData(jsonData); // Assuming setJsonData is a state setter function
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const validateInput = (isChecked: boolean): string | null => {
    if (isChecked) {
      if (!(jsonData && files && jsonData.length === files.length)) {
        return "Images count and JSON traits upload count doesn't match";
      }
      if (mergedArray.length === 0) {
        return "No items to mint";
      }
    } else {
      if (files.length === 0) {
        return "No files uploaded";
      }
    }
    return null;
  };

  const createTokenData = (item: any): tokenData => {
    const [sNo, assetType, headline, ticker, imageUrl, supply] = item;
    console.log("___ITEM DATA", item)
    const opReturnValues = [
      {
        image_url: imageUrl,
      },
    ];

    return {
      address: RECEIVER_ADDRESS,
      opReturnValues,
      assetType: String(assetType) === "0" ? ASSETTYPE.TOKEN : ASSETTYPE.NFTOFFCHAIN,
      headline: headline,
      ticker,
      supply: parseInt(supply),
    };
  };

  const mintSingleToken = async (
    data: tokenData,
    index: number,
    total: number,
  ) => {
    try {
      console.log("MINTING DATA", data)
      const mintResponse = await mintToken(data, MOCK_MENOMIC, FEERATE);
      console.log("🚀 ~ mintSingleToken ~ mintResponse:", mintResponse);
      if (mintResponse) {

        const result = await signAndSendTransaction({
          hex: mintResponse,
          transactionType: "normal",
        });

        console.log("🚀 ~ sendTransactionresult ~ res:", result);
        if (result && result.error) {
          setError(result.error)
          toast.error(result.error)
          setStep(2)
        } else {
          setError("")
          setIsLoading(false);
        //  setStep(2)

        }

      }
      // setProgress({
      //   value: index + 1,
      //   total,
      //   message: `Minting ${index + 1}/${total}`,
      // });
    } catch (error) {
      console.log("🚀 ~ mintSingleToken ~ error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");


    if (excelData.length === 0) {
      setError("Please upload an Excel file!");
      return;
    }
    const cleanedData = excelData.filter((row) => {
      const excludedHeaders = ["S.No", "s.no", "S.NO", "S.no"];
      return row.length > 0 && !excludedHeaders.includes(row[0]);
    });
    setData(cleanedData)

    console.log("Cleaned Data:", cleanedData);
    const errors = []; // Array to store error messages
    for (let i = 0; i < cleanedData.length; i++) {
      const row = cleanedData[i];
      const [sNo, assetType, headline, ticker, imageUrl, supply] = row;

      const rowErrors = [];
      console.log("asset Data:", typeof (assetType));

      if (String(assetType) !== "0" && String(assetType) !== "1") {
        rowErrors.push(
          ` (S.No: ${sNo}): Asset Type must be either 0 or 1.`
        );
      }
      if (!supply) {
        rowErrors.push(` (S.No: ${sNo}): Supply cannot be empty.`);
      }
      if (supply === 0) {
        rowErrors.push(` (S.No: ${sNo}): Supply cannot be 0.`);
      }
      if (parseInt(supply) >= 2100000000000000) {
        rowErrors.push(
          `(S.No: ${sNo}): Max supply is 2100000000000000.`
        );
      }

      if (ticker && ticker.length > 7) {
        rowErrors.push(
          `(S.No: ${sNo}): Ticker must be no longer than 7 characters.`
        );
      }
      if (!imageUrl) {
        rowErrors.push(` (S.No: ${sNo}): ImageUrl cannot be empty.`);
      }

      if (!headline || headline.trim() === "") {
        rowErrors.push(` (S.No: ${sNo}): Headline cannot be empty.`);
      }


      errors.push(...rowErrors);
    }
    if (errors.length > 0) {
      console.error("Validation Errors:", errors);
      setErrorData(errors);
      setIsLoading(false);
      return;
    }
    //setIsLoading(false);
    setErrorData([]);

    console.log("All rows are valid. Proceeding with further processing...");

    // const jsonValidationError = validateJsonInput(isChecked);
    // if (jsonValidationError) {
    //   setError(jsonValidationError);
    //   setIsLoading(false);
    //   return;
    // }

    // const validationError = validateInput(isChecked);
    // if (validationError) {
    //   setError(validationError);
    //   setIsLoading(false);
    //   return;
    // }

    // setProgress({
    //   value: 0,
    //   total: cleanedData.length,
    //   message: "Initializing minting...",
    // });
    try {
      for (let i = 0; i < cleanedData.length; i++) {
        const tokenData = createTokenData(cleanedData[i]);
        await mintSingleToken(tokenData, i, cleanedData.length);
      }
      setStep(2);
    } catch (error:any) {
      setError(error.message || "An error occurred");
      toast.error(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  const triggerRefresh = () => {
    setStep(0);
    reset();
    router.push("/create");
  };
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("__FILE", file)
      setFileData(file)
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];

        const sheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        console.log("Parsed Excel Data:", sheetData);

        setExcelData(sheetData);
      };
      reader.readAsArrayBuffer(file); // Read the file as binary
    }
  };


  const downloadJsonFile = () => {
    const jsonString = JSON.stringify(exampleJson, null, 2);

    // Create a Blob with the JSON data
    const blob = new Blob([jsonString], { type: "application/json" });

    // Create a temporary URL for the Blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample.json";

    // Programmatically click the link to trigger the download
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex flex-col w-full h-max bg-background pb-[148px]">
        <Header />
        <div className="flex flex-col items-center gap-16 z-50">
          <Banner
            title={
              step == 0 || step == 3
                ? "Create collection"
                : "Your Collection is successfully created!"
            }
            image={"/background-2.png"}
            setStep={step}
            stepperData={stepperData}
          />
          {step == 0 && (
            <div className="w-[592px] items-start flex flex-col gap-16">
              <div className="flex flex-col w-full gap-8">
                <p className="font-bold text-profileTitle text-neutral50">
                  Details
                </p>
                <div className="flex flex-col w-full gap-6">
                  <div className="flex flex-row rounded-xl border-neutral400 border w-[443px] gap-3 justify-center items-center py-3">
                    <DocumentDownload size={24} color="#ffffff" />
                    <button
                      className="text-lg font-semibold text-neutral50"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = "/SAMPLEDATA.xlsx"; // Path to the file in the public folder
                        link.download = "SAMPLE DATA.xlsx"; // Name of the downloaded file
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                    >
                      Download sample .XLSX for correct formatting
                    </button>
                  </div>
                  {fileData ? (
                    <FileCard
                      onDelete={handleDelete}
                      fileName={fileData.name}
                      fileSize={fileData.size}
                    />
                  ) : (
                    <UploadFile
                      text="Accepted file types: .xlsx, .xls"
                      handleImageUpload={handleFileUpload}
                      acceptedFileTypes=".xlsx, .xls"
                    />
                  )}

                  {/* <Input
                    title="Name"
                    text="Collection name"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  /> */}
                  {/* setHeadline */}
                  {/* <Input
                    title="Creater (optional)"
                    text="Collection create name"
                    value={setHeadline}
                    onChange={(e) => setHeadline(e.target.value)}
                  /> */}
                  {/* add to height description height  */}
                  {/* <Input
                    title="Description"
                    text="Collection description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  /> */}
                </div>
              </div>
              {/* <div className="flex flex-col w-full gap-8">
                <p className="font-bold text-profileTitle text-neutral50">
                  Collection logo (Optional)
                </p>
                {imageBase64 ? (
                  <UploadCardFill image={imageBase64} onDelete={handleDelete} />
                ) : (
                  <UploadFile
                    text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                    handleImageUpload={handleImageUpload}
                  />
                )}
              </div> */}
                {isLoading && (
                <div>
                  <progress value={progress.value} max={progress.total} />
                  <p>{progress.message}</p>
                  <p>{`${progress.value}/${progress.total} NFTs minted`}</p>
                </div>
              )}
              <div className="flex flex-row justify-between w-full gap-8">
                <ButtonOutline
                  title="Back"
                  onClick={() => router.push("/create")}
                />
                <ButtonLg
                  title="Continue"
                  isSelected={true}
                  onClick={() => handleSubmit()}
                //onClick={() => setStep(1)}
                >
                  Continue
                </ButtonLg>
              </div>
              {error && <div className="text-red-500 -mt-3">{error}</div>}
              {errorData.length > 0 && (
                <div className="text-red-500 -mt-3">
                  {errorData.map((err, idx) => (
                    <div key={idx} >
                      {err}
                    </div>
                  ))}
                </div>
              )}
            
            </div>
          )}

          {/* launchpad step */}

          {step == 2 && (
            <div className="w-[800px] flex flex-col gap-16">
              <div className="flex flex-row gap-8">
                <ButtonOutline
                  title="Go home"
                  onClick={() => router.push("/")}
                />
                <ButtonLg isSelected={true} onClick={() => triggerRefresh()}>
                  Create Again
                </ButtonLg>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CollectionDetail;
