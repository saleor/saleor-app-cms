import React from "react";

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

function Pim() {
    const { data: products, isLoading } = useStrapiProducts();
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
