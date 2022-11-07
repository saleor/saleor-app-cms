import { NextApiHandler } from "next";
import { NEXT_PUBLIC_STRAPI_API_URL, NEXT_PUBLIC_STRAPI_AUTH_TOKEN } from "../../constants";

const handler: NextApiHandler = async (_, res) => {
  try {
    const response = await fetch(`${NEXT_PUBLIC_STRAPI_API_URL}/products`, {
      headers: { Authorization: `Bearer ${NEXT_PUBLIC_STRAPI_AUTH_TOKEN}` },
    });
    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500);
  }
};

export default handler;
