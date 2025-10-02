var AWS = require('aws-sdk');

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

/**
 * This function is used to upload the file to s3 bucket
 */
export async function uploadToS3(tokenId: any, mintData: any) {
  try {
    const payload: any = {
      Bucket: process.env.BUCKET_NAME,
      Key: `nft/${tokenId}.json`,
      Body: JSON.stringify(mintData),
      ContentType: 'application/json',
    };

    const s3 = new AWS.S3();
    // convert the callback-based function to a promise-based function provided by aws-sdk
    const uploadPromise = s3.upload(payload).promise();
    // wait for the promise to resolve
    const data = await uploadPromise;
    return {
      message: 'File uploaded successfully',
      data: {
        fileUrl: data.Location,
      },
    };
  } catch (error) {
    return { error: 'Failed to save meta data' };
  }
}

/**
 * This function is used to get the file from s3 bucket
 * @param tokenId -tokenId
 */

export async function getFileFromS3(tokenId: string) {
  try {
    const payload = {
      Bucket: process.env.BUCKET_NAME,
      Key: `nft/${tokenId}.json`,
    };
    // convert the callback-based function to a promise-based function provided by aws-sdk
    const s3 = new AWS.S3();
    const mintDataPromise = s3.getObject(payload).promise();
    const mintDataResponse = await mintDataPromise;
    const mintData = JSON.parse(mintDataResponse.Body.toString('utf-8'));
    return mintData;
  } catch (error) {
    return { error: 'Failed to fetch meta data' };
  }
}
