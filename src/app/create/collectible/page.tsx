'use client';

import React, { useState } from 'react';
import Banner from '@/components/section/banner';
import ButtonLg from '@/components/ui/buttonLg';
import Input from '@/components/ui/input';
import ButtonOutline from '@/components/ui/buttonOutline';
import { useRouter } from 'next/navigation';
import { mintToken } from '@/utils/mint';
import Layout from '@/components/layout/layout';
import {
  ALYS_EXPLORER,
  ASSETTYPE,
  COORDINATE_EXPLORER,
  FEERATE,
  RECEIVER_ADDRESS,
} from '@/lib/constants';
import { alysAssetData, tokenData } from '@/types';
import useFormState from '@/lib/store/useFormStore';
import { toast } from 'sonner';
import { useConnector } from 'anduro-wallet-connector-react';
import {
  nftMintInfo,
  saveJsonData,
  storeTokenId,
  tokenId,
} from '@/lib/service/fetcher';
import { CloseCircle, Copy } from 'iconsax-react';
import { convertToSubstring } from '@/lib/utils';
import axios from 'axios';

const stepperData = ['Upload', 'Confirm'];
const SingleCollectible = () => {
  const router = useRouter();
  const [networkType, setnetworkType] = React.useState<string>('');
  const { walletState, signAndSendTransaction } =
    React.useContext<any>(useConnector);

  const {
    ticker,
    setTicker,
    headline,
    setHeadline,
    imageUrl,
    setImageUrl,
    setTxUrl,
    txUrl,
    reset,
  } = useFormState();

  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toaddress, setToaddress] = useState<string>('');
  const [showImage, setShowImage] = React.useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [txid, setTxid] = useState<string>('');
  const [imgSrc, setImgSrc] = useState('');
  const [, setCsrfToken] = useState(null);

  interface FormInputData {
    headline: string;
    ticker: string;
    imageUrl: string;
  }

  React.useEffect(() => {
    reset();
    setToaddress(localStorage.getItem('address') || '');
  }, [walletState, reset]);

  React.useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('/api/auth');
        setCsrfToken(response.data.authToken);
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };
    if (networkType !== '') {
      fetchCsrfToken();
    }
  }, [networkType]);

  React.useEffect(() => {
    if (walletState.connectionState == 'disconnected') {
      setError('Wallet is not connected.');
    } else {
      setError('');
      setIsLoading(false);
    }
    const chainId = localStorage.getItem('chainId');
    const walletconnection = localStorage.getItem('isWalletConnected');

    if (walletconnection === 'true') {
      if (chainId === '5') {
        setnetworkType('Coordinate');
      } else if (chainId === '6') {
        setnetworkType('Alys');
      }
    } else {
      setnetworkType('');
      if (step === 1) {
        router.push('/');
      }
    }
  }, [walletState, step, router]);

  /**
   * This function is used to handle delete action
   */
  const handleDelete = (): void => {
    setImageUrl('');
    setImgSrc('');
    setShowImage(false);
    setErrorMessage('');
  };

  /**
   * This function is used to handle error for image
   */
  const handleImageError = () => {
    setImgSrc('/default_asset_image.png');
    setShowImage(false);
  };

  /**
   * This function is used to handle load the image
   */
  const handleImageLoad = () => {
    setShowImage(true);
    setErrorMessage('');
  };

  /**
   * This function is used to handle the copy action
   */
  const handleCopy = () => {
    navigator.clipboard.writeText(txid).then(() => {
      setIsCopied(true);
      toast.success('Copied!');
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  /**
   * This function is used to validate the form inputs
   * @param inputData -inputData
   */
  const validateForm = (
    inputData: FormInputData,
  ): { isValid: boolean; error?: string } => {
    const { headline, ticker, imageUrl } = inputData;

    if (headline.trim().length === 0) {
      return { isValid: false, error: 'Headline is not provided.' };
    }
    if (headline.trim().length > 50) {
      return {
        isValid: false,
        error: 'Headline should be 50 characters long.',
      };
    }
    if (ticker.trim().length === 0) {
      return { isValid: false, error: 'Ticker is not provided.' };
    }
    if (ticker.trim().length > 7) {
      return { isValid: false, error: 'Ticker should be 7 characters long.' };
    }
    if (/[^a-zA-Z]/.test(ticker)) {
      return {
        isValid: false,
        error:
          'Ticker  contains special characters, numbers, or spaces that are not allowed',
      };
    }
    if (imageUrl.trim() === '') {
      return { isValid: false, error: 'Image is not provided.' };
    }
    if (errorMessage) {
      return { isValid: false };
    }

    return { isValid: true };
  };

  /**
   * This function is used to handle form submission
   * @param event -event
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    let mintId;
    const inputData: FormInputData = {
      headline,
      ticker,
      imageUrl,
    };
    const validationResult = validateForm(inputData);
    if (!validationResult.isValid) {
      setError(validationResult.error || 'Provide valid data');
      setIsLoading(false);
      return;
    } else {
      setError('');
    }

    const opReturnValues = [
      {
        image_url: imageUrl,
      },
    ];
    const data: tokenData = {
      address: RECEIVER_ADDRESS,
      opReturnValues,
      assetType: ASSETTYPE.NFTOFFCHAIN,
      headline,
      ticker,
      supply: 1,
    };

    const alysData: alysAssetData = {
      name: headline,
      symbol: ticker,
      image: imageUrl,
      supply: 1,
    };
    try {
      // Call the mintToken function with the required data
      if (networkType === 'Alys') {
        const token = await tokenId();
        mintId = token.tokenId + 1;
        await saveJsonData(alysData, mintId);
        const nftMintDetails = await nftMintInfo(toaddress, mintId);

        try {
          if (nftMintDetails.data.hash) {
            const mintingId = await storeTokenId(mintId);
            if (mintingId.data.error) {
              setError(mintingId.data.error);
              setStep(0);
              setIsLoading(false);
            } else {
              setTxid(nftMintDetails.data.hash);
              setTxUrl(ALYS_EXPLORER + 'tx/' + nftMintDetails.data.hash);
              setError('');
              setStep(1);
              setIsLoading(false);
            }
          } else {
            setError('Transaction Failed');
            setStep(0);
            setIsLoading(false);
          }
        } catch (error: any) {
          setIsLoading(false);
          setError('Transaction Failed');
        }
      } else {
        const transactionResult = await mintToken(data, FEERATE);
        if (transactionResult) {
          const result = await signAndSendTransaction({
            hex: transactionResult,
            transactionType: 'normal',
          });
          if (result && result.error) {
            const errorMessage =
              typeof result.error === 'string'
                ? result.error
                : result.error.result || 'An error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
            setStep(0);
            setIsLoading(false);
          } else {
            setError('');
            setStep(1);
            setTxid(result.result);
            setTxUrl(COORDINATE_EXPLORER + 'tx/' + result.result);
            setIsLoading(false);
          }
        }
      }
    } catch (error: any) {
      setError(error.message || 'An error occurred');
      return setIsLoading(false);
    }
  };

  /**
   * This function is used to reset the page
   */
  const triggerRefresh = () => {
    setStep(0);
    router.push('/create/collectible');
    reset();
  };

  /**
   * This function is used to show the page title
   * @param step -step
   * @param networktype -networktype
   */
  const getTitle = (step: any, networktype: any) => {
    if (step === 0) {
      if (networktype === 'Coordinate' || networktype === 'Alys')
        return 'Create Collectible';
    } else if (step === 1) {
      if (networktype === 'Coordinate' || networktype === 'Alys')
        return 'Collectible created successfully';
    }
    return '';
  };
  return (
    <Layout>
      <div className="flex flex-col w-full h-full bg-background items-center pb-[148px]">
        <div className="w-full flex flex-col items-center gap-16 z-50">
          <Banner
            title={getTitle(step, networkType)}
            image={'/background-2.png'}
            setStep={step}
            stepperData={stepperData}
          />
          {step == 0 && (
            <form onSubmit={handleSubmit}>
              <div className="w-[592px] items-start flex flex-col gap-16">
                <div className="flex flex-col gap-8 w-full">
                  <div className="input_padd">
                    <p className="text-profileTitle text-white text-neutral20 font-bold">
                      {networkType} Collectible
                    </p>
                  </div>
                  <div className="flex flex-col gap-6 w-full">
                    <Input
                      title="Name"
                      text="Collectable name"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                    />

                    <Input
                      title="Ticker"
                      text="Collectable ticker"
                      value={ticker}
                      onChange={(e) => {
                        setTicker(e.target.value);
                        setError('');
                      }}
                    />

                    <Input
                      title="Image url"
                      text="Image url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setImgSrc(e.target.value);
                        setErrorMessage('');
                        setError('');
                      }}
                    />
                    <div className="mt-2.5">
                      {imageUrl && (
                        <div className="relative inline-block">
                          <img
                            src={imgSrc}
                            alt="Token Logo Preview"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              objectFit: 'contain',
                              display: showImage ? 'block' : 'none',
                            }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                          />
                          {showImage ? (
                            <button
                              onClick={handleDelete}
                              className="absolute -top-2.5 -right-2.5 bg-background rounded-full"
                            >
                              <CloseCircle size={30} color="#F8F9FA" />
                            </button>
                          ) : (
                            errorMessage && (
                              <p className="text-red-500">{errorMessage}</p>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {walletState.connectionState == 'connected' ? (
                  <div className="w-full flex flex-row gap-8">
                    <ButtonOutline
                      title="Back"
                      onClick={() => {
                        router.push('/');
                        reset();
                      }}
                    />
                    <ButtonLg
                      type="submit"
                      isSelected={true}
                      isLoading={isLoading}
                      disabled={isLoading}
                    >
                      {isLoading ? '...loading' : 'Continue'}
                    </ButtonLg>
                  </div>
                ) : null}
              </div>
              <div className="text-red-500">{error}</div>
            </form>
          )}
          {step == 1 && (
            <div className="w-full max-w-[800px] flex flex-col gap-10 px-4">
              <div className="w-full flex flex-row items-center gap-8 justify-start">
                <img
                  src={imgSrc}
                  alt="background"
                  width={0}
                  height={160}
                  sizes="100%"
                  className="w-[280px] h-[280px] object-contain	bg-white rounded-3xl"
                />
                {/* } */}
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-3">
                    <p className="text-xl text-neutral50 font-bold">
                      Name: {headline}
                    </p>
                    <p className="text-xl text-neutral50 font-bold">
                      Symbol : {ticker}
                    </p>
                    <p className="text-xl text-neutral50 font-bold">
                      Supply {1}
                    </p>
                    <p className="text-xl text-neutral100 font-bold">
                      Tx Id : {convertToSubstring(txid, 6, 4)}
                      <button
                        onClick={handleCopy}
                        className={`text-brand p-1 hover:bg-gray-100 rounded ${
                          isCopied
                            ? 'cursor-not-allowed opacity-50'
                            : 'cursor-pointer'
                        }`}
                        disabled={isCopied}
                        aria-label="Copy transaction link"
                      >
                        <Copy size="16" />
                      </button>
                    </p>
                  </div>
                </div>
              </div>
              <div className="">
                <div className="text-neutral100 text-lg2">
                  <div className="text-neutral100 text-xl flex flex-row items-center justify-center">
                    <a href={txUrl} target="_blank" className="text-brand">
                      {networkType === 'Coordinate' && (
                        <p>View on Coordinate </p>
                      )}{' '}
                      {networkType === 'Alys' && <p>View on Alys</p>}{' '}
                    </a>
                  </div>
                </div>
              </div>
              <div className="flex flex-row gap-8">
                <ButtonOutline
                  title="Go home"
                  onClick={() => router.push('/')}
                />
                <ButtonLg
                  type="submit"
                  isSelected={true}
                  isLoading={isLoading}
                  onClick={() => triggerRefresh()}
                >
                  Create
                </ButtonLg>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SingleCollectible;
