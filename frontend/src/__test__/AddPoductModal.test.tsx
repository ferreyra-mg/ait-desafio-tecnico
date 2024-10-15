import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import AddProductModal from "../components/AddProductModal";
import fetchMock from "jest-fetch-mock";

describe("AddProductModal", () => {
    const mockOnHide = jest.fn();
    const mockOnConfirm = jest.fn();
    const mockOnError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        fetchMock.resetMocks();
    });

    it("Renderiza el modal cuando show es true", () => {
        render(
            <AddProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                cliente_id={1}
                onError={mockOnError}
            />
        );
        expect(screen.getByText("Agregar Nuevo Producto")).toBeInTheDocument();
    });

    it("No renderiza el modal cuando show es false", () => {
        render(
            <AddProductModal
                show={false}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                cliente_id={1}
                onError={mockOnError}
            />
        );
        expect(screen.queryByText("Agregar Nuevo Producto")).not.toBeInTheDocument();
    });

    it("Llama a onHide cuando se hace clic en el botón cancelar", () => {
        render(
            <AddProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                cliente_id={1}
                onError={mockOnError}
            />
        );
        fireEvent.click(screen.getByText("Cancelar"));
        expect(mockOnHide).toHaveBeenCalledTimes(1);
    });

    it("Llama a onConfirm con los datos del formulario cuando se hace clic en el botón confirmar", async () => {
        fetchMock.enableMocks();
        fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });

        render(
            <AddProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                cliente_id={1}
                onError={mockOnError}
            />
        );

        await userEvent.type(screen.getByLabelText("Código"), "12345");
        await userEvent.type(screen.getByLabelText("Descripción"), "Test Product");
        await userEvent.type(screen.getByLabelText("Precio"), "10.99");

        fireEvent.submit(screen.getByRole("form"));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(fetchMock).toHaveBeenCalledWith("http://193.168.15.3:9000/api/v1/articulos/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    codigo: "12345",
                    descripcion: "Test Product",
                    precio: 10.99,
                    cliente: 1, // Debe ir ultimo por la forma en que se construye el body con el [handleInputChange]
                }),
            });
            expect(mockOnConfirm).toHaveBeenCalledWith({
                cliente: 1,
                codigo: "12345",
                descripcion: "Test Product",
                precio: 10.99,
            });
        });

        fetchMock.mockClear();
    });

    it("Muestra un mensaje de error cuando el fetch no devuelve un status 200", async () => {
        fetchMock.enableMocks();
        fetchMock.mockResponseOnce(JSON.stringify({}), { status: 400 });

        render(
            <AddProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                cliente_id={1}
                onError={mockOnError}
            />
        );

        await userEvent.type(screen.getByLabelText("Código"), "12345");
        await userEvent.type(screen.getByLabelText("Descripción"), "Test Product");
        await userEvent.type(screen.getByLabelText("Precio"), "10.99");

        fireEvent.submit(screen.getByRole("form"));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(mockOnError).toHaveBeenCalledTimes(1);
        });

        fetchMock.mockClear();
    });

    it("Muestra un mensaje de error cuando el fetch falla", async () => {
        fetchMock.enableMocks();
        fetchMock.mockRejectOnce(new Error("Error de red"));

        render(
            <AddProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                cliente_id={1}
                onError={mockOnError}
            />
        );

        await userEvent.type(screen.getByLabelText("Código"), "12345");
        await userEvent.type(screen.getByLabelText("Descripción"), "Test Product");
        await userEvent.type(screen.getByLabelText("Precio"), "10.99");

        fireEvent.submit(screen.getByRole("form"));

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledTimes(1);
            expect(mockOnError).toHaveBeenCalledTimes(1);
        });

        fetchMock.mockClear();
    });

    it("Muestra mensajes de error para los campos requeridos", async () => {
        render(
            <AddProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                cliente_id={1}
                onError={mockOnError}
            />
        );

        fireEvent.click(screen.getByText("Confirmar"));

        await waitFor(() => {
            expect(screen.getAllByText("Este campo es obligatorio")).toHaveLength(2);
        });
    });

    it("Muestra un mensaje de error para el campo precio si el valor es menor a 0.01", async () => {
        render(
            <AddProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                cliente_id={1}
                onError={mockOnError}
            />
        );

        await userEvent.type(screen.getByLabelText("Precio"), "0");

        fireEvent.click(screen.getByText("Confirmar"));

        await waitFor(() => {
            expect(screen.getByText("El precio debe ser mayor a cero")).toBeInTheDocument();
            expect(mockOnConfirm).not.toHaveBeenCalled();
            expect(mockOnHide).not.toHaveBeenCalled();
            expect(mockOnError).not.toHaveBeenCalled();
        });
    });
});
