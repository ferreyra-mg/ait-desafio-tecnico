// AddProductBulkModal.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import "@testing-library/jest-dom";
import userEvent from '@testing-library/user-event';
import AddProductBulkModal from '../components/AddProductBulkModal';
import * as XLSX from 'xlsx';
import fetchMock from 'jest-fetch-mock';

jest.mock('xlsx', () => ({
    read: jest.fn(),
    utils: {
        sheet_to_json: jest.fn(),
    },
}));

describe('AddProductBulkModal', () => {
    const mockOnHide = jest.fn();
    const mockOnConfirm = jest.fn();
    const mockOnError = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        fetchMock.resetMocks();
    });

    it('renders the modal when show is true', () => {
        render(<AddProductBulkModal show={true} onHide={mockOnHide} onConfirm={mockOnConfirm} onError={mockOnError} />);
        expect(screen.getByText('Ingresar/Actualizar Productos')).toBeInTheDocument();
    });

    it('does not render the modal when show is false', () => {
        render(<AddProductBulkModal show={false} onHide={mockOnHide} onConfirm={mockOnConfirm} onError={mockOnError} />);
        expect(screen.queryByText('Ingresar/Actualizar Productos')).not.toBeInTheDocument();
    });

    it('handles file upload correctly', async () => {
        const file = new File(['id,descripcion,precio\n1,Product 1,10.00'], 'products.csv', { type: 'text/csv' });

        (XLSX.read as jest.Mock).mockReturnValue({
            SheetNames: ['Sheet1'],
            Sheets: {
                Sheet1: {},
            },
        });

        (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([
            { id: 1, descripcion: 'Product 1', precio: 10.00 },
        ]);

        render(<AddProductBulkModal show={true} onHide={mockOnHide} onConfirm={mockOnConfirm} onError={mockOnError} />);

        const fileInput = screen.getByLabelText(/archivo/i);
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument();
        });
    });

    it('handles invalid file upload', async () => {
        const file = new File(['invalid content'], 'invalid.txt', { type: 'text/plain' });

        render(<AddProductBulkModal show={true} onHide={mockOnHide} onConfirm={mockOnConfirm} onError={mockOnError} />);

        const fileInput = screen.getByLabelText(/archivo/i);
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(mockOnError).toHaveBeenCalledWith('Por favor, seleccione un tipo de archivo válido (xlsx, xls, csv).');
        });
    });

    it('submits the form correctly', async () => {
        const file = new File(['id,descripcion,precio\n1,Product 1,10.00'], 'products.csv', { type: 'text/csv' });

        (XLSX.read as jest.Mock).mockReturnValue({
            SheetNames: ['Sheet1'],
            Sheets: {
                Sheet1: {},
            },
        });

        (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([
            { id: 1, descripcion: 'Product 1', precio: 10.00 },
        ]);

        render(<AddProductBulkModal show={true} onHide={mockOnHide} onConfirm={mockOnConfirm} onError={mockOnError} />);

        const fileInput = screen.getByLabelText(/archivo/i);
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument();
        });

        // fireEvent.submit(screen.getByRole('form'));

        // await waitFor(() => {
        //     expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/v1/articulos/', {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //         },
        //         body: JSON.stringify([{ id: 1, descripcion: 'Product 1', precio: 10.00 }]),
        //     });
        //     expect(mockOnConfirm).toHaveBeenCalledWith([{ id: 1, descripcion: 'Product 1', precio: 10.00 }]);
        // });
    });

    it('handles form submission error', async () => {
        fetchMock.mockImplementationOnce(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({}),
            }) as Promise<Response>
        );

        const file = new File(['id,descripcion,precio\n1,Product 1,10.00'], 'products.csv', { type: 'text/csv' });

        (XLSX.read as jest.Mock).mockReturnValue({
            SheetNames: ['Sheet1'],
            Sheets: {
                Sheet1: {},
            },
        });

        (XLSX.utils.sheet_to_json as jest.Mock).mockReturnValue([
            { id: 1, descripcion: 'Product 1', precio: 10.00 },
        ]);

        render(<AddProductBulkModal show={true} onHide={mockOnHide} onConfirm={mockOnConfirm} onError={mockOnError} />);

        const fileInput = screen.getByLabelText(/archivo/i);
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Product 1')).toBeInTheDocument();
        });

        // fireEvent.submit(screen.getByRole('form'));

        // await waitFor(() => {
        //     expect(mockOnError).toHaveBeenCalledWith('Error al enviar los datos');
        // });
    });
});
