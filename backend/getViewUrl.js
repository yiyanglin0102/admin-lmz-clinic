import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = "admin-profile-lmz-clinic";

export const handler = async (event) => {
  try {
    const userId = event.requestContext?.authorizer?.userId || "yiyanglin0102";
    const key = event.queryStringParameters?.key;

    if (!key || !key.startsWith(`prod/profiles/${userId}/`)) {
      return { statusCode: 403, body: "Forbidden" };
    }

    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    const url = await getSignedUrl(s3, cmd, { expiresIn: 300 }); // 5 min

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Server error" };
  }
};
