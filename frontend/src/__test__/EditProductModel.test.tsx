import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import "@testing-library/jest-dom";
import userEvent from '@testing-library/user-event';
import EditProductModal from '../components/EditProductModal';
import fetchMock from 'jest-fetch-mock';

describe('EditProductModal', () => {
    const mockOnHide = jest.fn();
    const mockOnConfirm = jest.fn();
    const mockProductData = {
        id: 1,
        cliente: 100,
        codigo: 'ABC123',
        descripcion: 'Producto de prueba',
        precio: 10.99,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renderiza el modal cuando show es true', () => {
        render(
            <EditProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        expect(screen.getByText('Modificar Producto')).toBeInTheDocument();
    });

    it('no renderiza el modal cuando show es false', () => {
        render(
            <EditProductModal
                show={false}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        expect(screen.queryByText('Modificar Producto')).not.toBeInTheDocument();
    });

    it('puebla el formulario con los datos del producto', () => {
        render(
            <EditProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        expect(screen.getByDisplayValue('ABC123')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Producto de prueba')).toBeInTheDocument();
        expect(screen.getByDisplayValue('10.99')).toBeInTheDocument();
    });

    it('llama a onHide cuando se hace clic en el botón cancelar', () => {
        render(
            <EditProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        fireEvent.click(screen.getByText('Cancelar'));
        expect(mockOnHide).toHaveBeenCalledTimes(1);
    });

    it('llama a onConfirm y hace fetch cuando se envía el formulario', async () => {
        fetchMock.enableMocks();
        fetchMock.mockResponseOnce(JSON.stringify({}), { status: 200 });

        render(
            <EditProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        fireEvent.click(screen.getByText('Confirmar'));

        await waitFor(() => {
            expect(mockOnConfirm).toHaveBeenCalledWith(mockProductData);
        });
    });

    it('muestra errores de validación para campos requeridos', async () => {
        render(
            <EditProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        // Clear the required fields
        await userEvent.clear(screen.getByLabelText('Código'));
        await userEvent.clear(screen.getByLabelText('Descripción'));
        await userEvent.clear(screen.getByLabelText('Precio'));

        fireEvent.click(screen.getByText('Confirmar'));

        await waitFor(() => {
            // expect(screen.getByText('Este campo es obligatorio')).toBeInTheDocument();
            expect(screen.getAllByText('Este campo es obligatorio')).toHaveLength(3);
        });
    });

    it('muestra un error de validación para el campo precio si es menor a 0.01', async () => {
        render(
            <EditProductModal
                show={true}
                onHide={mockOnHide}
                onConfirm={mockOnConfirm}
                productData={mockProductData}
            />
        );

        await userEvent.type(screen.getByLabelText("Precio"), "0");

        fireEvent.click(screen.getByText("Confirmar"));

        await waitFor(() => {
            expect(mockOnConfirm).not.toHaveBeenCalled();
            expect(mockOnHide).not.toHaveBeenCalled();
        });
    });
});
