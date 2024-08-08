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

const stepperData = ["Details", "Upload", "Confirm"];

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
  const [step, setStep] = useState<number>(0);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [files, setFiles] = useState<
    { base64: string; mimeType: string; fileName: string }[]
  >([]);
  const [jsonData, setJsonData] = useState([]);
  // const [mergedArray, setMergedArray] = useState([]);
  const [jsonMetaData, setJsonMetaData] = useState<File | null>(null);

  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState({ value: 0, total: 0, message: "" });
  const [date, setDate] = React.useState<Date>();

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
  };

  useEffect(() => {
    if (jsonData && files && jsonData.length === files.length) {
      const merged = jsonData.map((item, index) => ({
        ...item,
        ...files[index],
      }));
      setMergedArray(merged);
    }
  }, [jsonData, files]); // Dependencies array, re-run effect when jsonData or files change

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

  const createTokenData = (item: any, isChecked: boolean): tokenData => {
    const opReturnValues = [
      {
        image_data: item.base64,
        mime: item.mimeType,
        ...(isChecked ? { traits: item.attributes } : {}),
      },
    ];

    return {
      address: RECEIVER_ADDRESS,
      opReturnValues,
      assetType: ASSETTYPE.NFTONCHAIN,
      headline: isChecked ? item.meta.name : item.fileName,
      ticker,
      supply: 1,
    };
  };

  const mintSingleToken = async (
    data: tokenData,
    index: number,
    total: number,
  ) => {
    try {
      const mintResponse = await mintToken(data, MOCK_MENOMIC, FEERATE);
      console.log("🚀 ~ mintSingleToken ~ mintResponse:", mintResponse);
      setProgress({
        value: index + 1,
        total,
        message: `Minting ${index + 1}/${total}`,
      });
    } catch (error) {
      console.log("🚀 ~ mintSingleToken ~ error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    if (!headline) {
      setError("headline not provided.");
      setIsLoading(false);
      return;
    }

    const jsonValidationError = validateJsonInput(isChecked);
    if (jsonValidationError) {
      setError(jsonValidationError);
      setIsLoading(false);
      return;
    }

    const validationError = validateInput(isChecked);
    if (validationError) {
      setError(validationError);
      setIsLoading(false);
      return;
    }

    const itemsToMint = isChecked ? mergedArray : files;
    setProgress({
      value: 0,
      total: itemsToMint.length,
      message: "Initializing...",
    });

    try {
      for (let i = 0; i < itemsToMint.length; i++) {
        const tokenData = createTokenData(itemsToMint[i], isChecked);
        await mintSingleToken(tokenData, i, itemsToMint.length);
      }
      setStep(2);
    } catch (error) {
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
                  <Input
                    title="Name"
                    text="Collection name"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                  {/* setHeadline */}
                  {/* <Input
                    title="Creater (optional)"
                    text="Collection create name"
                    value={setHeadline}
                    onChange={(e) => setHeadline(e.target.value)}
                  /> */}
                  {/* add to height description height  */}
                  <Input
                    title="Description"
                    text="Collection description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col w-full gap-8">
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
              </div>
              <div className="flex flex-row justify-between w-full gap-8">
                <ButtonOutline
                  title="Back"
                  onClick={() => router.push("/create")}
                />
                <ButtonLg
                  title="Continue"
                  isSelected={true}
                  onClick={() => setStep(1)}
                >
                  Continue
                </ButtonLg>
              </div>
              {error && <div className="text-red-500 -mt-3">{error}</div>}
            </div>
          )}
          {step == 1 && (
            <div className="w-[592px] items-start flex flex-col gap-16">
              <div className="flex flex-col w-full gap-4">
                <p className="font-bold text-profileTitle text-neutral50">
                  Upload your Collection
                </p>
                <p className="font-normal text-neutral200 text-lg2">
                  The NFTs you want to include for this brand or project. Please
                  name your files sequentially, like ‘1.png’, ‘2.jpg’, ‘3.webp’,
                  etc., according to their order and file type.
                </p>
                {files.length !== 0 ? (
                  <div className="flex flex-row w-full h-full gap-8 overflow-x-auto text-neutral00">
                    {files.map((item, index) => (
                      <div key={index} className="w-full h-full">
                        <CollectiblePreviewCard
                          image={item.base64}
                          key={index}
                          title={item.fileName}
                          onDelete={() => handleDeleteImage(index)}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <UploadFile
                    text="Accepted file types: WEBP (recommended), JPEG, PNG, SVG, and GIF."
                    handleImageUpload={handleCollectionImageUpload}
                    multiple
                  />
                )}
              </div>
              <div className="flex flex-col w-full gap-8">
                <div className="flex flex-row items-center justify-between">
                  <p className="font-bold text-profileTitle text-neutral50">
                    Include traits
                  </p>
                  <Toggle isChecked={isChecked} onChange={handleCheckBox} />
                </div>
                <p className="text-neutral100 text-lg2">
                  Extra data linked to each NFT in this collection that
                  describes or quantifies unique qualities.
                </p>
                <div className="flex flex-row rounded-xl border-neutral400 border w-[443px] gap-3 justify-center items-center py-3">
                  <DocumentDownload size={24} color="#ffffff" />
                  <button
                    className="text-lg font-semibold text-neutral50"
                    onClick={() => downloadJsonFile()}
                  >
                    Download sample .JSON for correct formatting
                  </button>
                </div>
                <div className={isChecked ? `flex` : `hidden`}>
                  {jsonData.length !== 0 && jsonMetaData ? (
                    <FileCard
                      onDelete={handleDelete}
                      fileName={jsonMetaData.name}
                      fileSize={jsonMetaData.size}
                    />
                  ) : (
                    <UploadFile
                      text="Accepted file types: .JSON"
                      handleImageUpload={handleJsonUpload}
                      acceptedFileTypes=".json"
                    />
                  )}
                </div>
              </div>
              {isLoading && (
                <div>
                  <progress value={progress.value} max={progress.total} />
                  <p>{progress.message}</p>
                  <p>{`${progress.value}/${progress.total} NFTs minted`}</p>
                </div>
              )}
              {/* <div className="text-red-500">{error}</div> */}
              <div className="flex flex-row w-full gap-8">
                <ButtonOutline title="Back" onClick={() => setStep(0)} />
                <ButtonLg
                  // type="submit"
                  isSelected={true}
                  onClick={() => handleSubmit()}
                  isLoading={isLoading}
                  // disabled={isLoading}
                >
                  {isLoading ? "...loading" : "Continue"}
                </ButtonLg>
              </div>
              {error && <div className="text-red-500 -mt-5">{error}</div>}
            </div>
          )}
          {/* launchpad step */}

          {step == 2 && (
            <div className="w-[800px] flex flex-col gap-16">
              <div className="flex flex-row items-center justify-start w-full gap-8">
                <img
                  src={imageBase64}
                  alt="background"
                  width={0}
                  height={160}
                  sizes="100%"
                  className="w-[280px] h-[280px] object-cover rounded-3xl"
                />
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-3xl font-bold text-neutral50">
                      {headline}
                    </p>
                    <p className="text-xl font-medium text-neutral100">
                      {ticker}
                    </p>
                  </div>
                  {/* <p className="text-neutral100 text-lg2">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Proin ac ornare nisi. Aliquam eget semper risus, sed commodo
                    elit. Curabitur sed congue magna. Donec ultrices dui nec
                    ullamcorper aliquet. Nunc efficitur mauris id mi venenatis
                    imperdiet. Integer mauris lectus, pretium eu nibh molestie,
                    rutrum lobortis tortor. Duis sit amet sem fermentum,
                    consequat est nec.
                  </p> */}
                </div>
              </div>
              <div className="relative flex flex-row w-full h-auto gap-8 overflow-x-auto">
                {mergedArray.map((item, index) => (
                  <div key={index} className="w-full h-full">
                    <CollectiblePreviewCard
                      image={item.base64}
                      key={index}
                      title={item.fileName}
                      onDelete={() => console.log("")}
                    />
                  </div>
                ))}
                {/* todo ene gradient iig zasah */}
                {/* <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-neutral600 via-transparent to-neutral600" /> */}
              </div>
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
