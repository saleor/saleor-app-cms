import { NextApiHandler } from "next";

const { STRAPI_API_URL, STRAPI_AUTH_TOKEN } = process.env;

const handler: NextApiHandler = async (_, res) => {
  try {
    const response = await fetch(`${STRAPI_API_URL}/products`, {
      headers: { Authorization: `Bearer ${STRAPI_AUTH_TOKEN}` },
    });
    const result = await response.json();
    res.status(200).json(result);
  } catch (error) {
    res.status(500);
  }
};

export default handler;
