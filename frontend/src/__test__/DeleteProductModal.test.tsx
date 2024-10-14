import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import DeleteProductModal from "../components/DeleteProductModal";
import fetchMock from "jest-fetch-mock";

describe("DeleteProductModal", () => {
    const mockOnHide = jest.fn();
    const mockOnConfirm = jest.fn();
    const mockOnError = jest.fn();

    const mockProductData = {
        id: 1,
        cliente: 100,
        codigo: "COD-PRUEBA",
        descripcion: "Descripcion del Producto de Prueba",
        precio: 100.01,
    };

    afterAll(() => {
        jest.resetAllMocks();
    });

    it("renderiza el modal cuando show es true y productData es proporcionado", () => {
        render(
            <DeleteProductModal
                show={true}
                onHide={mockOnHide}
                onError={mockOnError}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        expect(screen.getByText("¿Está seguro de eliminar el siguiente producto?")).toBeInTheDocument();
        expect(screen.getByText("COD-PRUEBA")).toBeInTheDocument();
        expect(screen.getByText("Descripcion del Producto de Prueba")).toBeInTheDocument();
    });

    it("no renderiza el modal cuando show es false", () => {
        render(
            <DeleteProductModal
                show={false}
                onHide={mockOnHide}
                onError={mockOnError}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        expect(screen.queryByText("¿Está seguro de eliminar el siguiente producto?")).not.toBeInTheDocument();
    });

    it("no renderiza el modal cuando productData es null", () => {
        render(
            <DeleteProductModal
                show={true}
                onHide={mockOnHide}
                onError={mockOnError}
                onConfirm={mockOnConfirm}
                productData={null}
            />
        );

        expect(screen.queryByText("¿Está seguro de eliminar el siguiente producto?")).not.toBeInTheDocument();
    });

    it("llama a onHide cuando se hace clic en el botón de cancelar", () => {
        const onHideMock = jest.fn();

        render(
            <DeleteProductModal
                show={true}
                onHide={onHideMock}
                onError={mockOnError}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

        expect(onHideMock).toHaveBeenCalledTimes(1);
        expect(mockOnConfirm).not.toHaveBeenCalled();
        expect(mockOnError).not.toHaveBeenCalled();
    });

    it("llama a onConfirm y fetch cuando se hace clic en el botón de confirmar", async () => {
        fetchMock.enableMocks();
        const fetch = fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });

        render(
            <DeleteProductModal
                show={true}
                onHide={mockOnHide}
                onError={mockOnError}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        fireEvent.submit(screen.getByRole("form"));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(mockOnConfirm).toHaveBeenCalledWith(mockProductData);
        });

        expect(mockOnError).not.toHaveBeenCalled();
        expect(mockOnHide).not.toHaveBeenCalled();
        fetch.mockClear();
    });

    it("maneja el error al realizar una llamada al API", async () => {
        fetchMock.enableMocks();
        fetchMock.mockRejectOnce(new Error("Error de red"));

        render(
            <DeleteProductModal
                show={true}
                onHide={mockOnHide}
                onError={mockOnError}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        fireEvent.submit(screen.getByRole("form"));

        await waitFor(() => {
            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
            expect(mockOnError).toHaveBeenCalledTimes(1);
        });

        expect(mockOnHide).not.toHaveBeenCalled();
    });

    it("maneja la respuesta no ok de fetch ", async () => {
        fetchMock.mockResponseOnce("", { status: 404 });

        render(
            <DeleteProductModal
                show={true}
                onHide={mockOnHide}
                onError={mockOnError}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        fireEvent.submit(screen.getByRole("form"));

        await waitFor(() => {
            expect(mockOnConfirm).toHaveBeenCalledTimes(1);
            expect(mockOnError).toHaveBeenCalledTimes(1);
        });

        expect(mockOnHide).not.toHaveBeenCalled();
    });
});
