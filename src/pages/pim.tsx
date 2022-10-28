import { useAppBridge } from "@saleor/app-sdk/app-bridge";
import { SALEOR_AUTHORIZATION_BEARER_HEADER, SALEOR_DOMAIN_HEADER } from "@saleor/app-sdk/const";
import React from "react";

import { CreateSaleorProductBody } from "./api/product";

type Product = {
    id: string;
    attributes: {
        name: string;
        createdAt: string;
        publishedAt: string;
        updatedAt: string;
    };
};

type StrapiOkResponse = {
    data: Product[];
};

const useStrapiProducts = () => {
    const [products, setProducts] = React.useState<undefined | Product[]>(undefined);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | undefined>(undefined);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/fetch-products");
            const result = (await response.json()) as StrapiOkResponse;
            setProducts(result.data);
            setIsLoading(false);
        } catch (e: unknown) {
            setIsLoading(false);
            setError(e as string);
        }
    };

    React.useEffect(() => {
        fetchProducts();
    }, []);

    return { data: products, isLoading, error };
};

const useAddSaleorProduct = () => {
    const [data, setData] = React.useState(undefined);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<undefined | string>(undefined);

    const { appBridgeState } = useAppBridge();

    const addProduct = async (body: CreateSaleorProductBody) => {
        try {
            setIsLoading(true);
            const response = await fetch("/api/products/create", {
                method: "POST",
                headers: [
                    ["content-type", "application/json"],
                    [SALEOR_DOMAIN_HEADER, appBridgeState?.domain!],
                    [SALEOR_AUTHORIZATION_BEARER_HEADER, appBridgeState?.token!],
                ],
                body: JSON.stringify(body),
            });
            const result = await response.json();
            setIsLoading(false);
            setData(result);
        } catch (e: unknown) {
            setError(e as string);
            setIsLoading(false);
        }
    };

    return [{ data, isLoading, error }, addProduct];
};

function Pim() {
    const { data: products, isLoading } = useStrapiProducts();
    const [{ data }] = useAddSaleorProduct();
    return (
        <div>
            <h1>Products from Strapi:</h1>
            {isLoading && <h6>Loading...</h6>}
            <ul>
                {products?.map((product) => (
                    <li key={product.attributes.name}>{product.attributes.name}</li>
                ))}
            </ul>
        </div>
    );
}

export default Pim;
