import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({ region: process.env.AWS_REGION });
const BUCKET = "admin-profile-lmz-clinic";

export const handler = async (event) => {
  try {
    const userId = event.requestContext?.authorizer?.userId || "yiyanglin0102";

    const body = JSON.parse(event.body || "{}");
    const contentType = body.contentType || "";

    if (!/^image\/(png|jpe?g|webp)$/i.test(contentType)) {
      return { statusCode: 400, body: "Unsupported content type" };
    }

    const ext = contentType === "image/png" ? "png" :
                contentType === "image/webp" ? "webp" : "jpg";

    const key = `prod/profiles/${userId}/avatar-${Date.now()}.${ext}`;

    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      ACL: "private"
    });

    const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 }); // 60s

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadUrl, key })
    };
  } catch (e) {
    console.error(e);
    return { statusCode: 500, body: "Server error" };
  }
};
