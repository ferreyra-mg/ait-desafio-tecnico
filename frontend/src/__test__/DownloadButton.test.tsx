import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DownloadButton from '../components/DownloadProductsList';
import fetchMock from "jest-fetch-mock";
import "@testing-library/jest-dom";

global.URL.createObjectURL = jest.fn(() => 'test-url');

describe('DownloadButton', () => {

    fetchMock.enableMocks();

    afterEach(() => {
        jest.clearAllMocks();
        fetchMock.resetMocks();
    });

    it('renderiza el botón correctamente', () => {
        render(<DownloadButton />);
        const button = screen.getByText('Descargar Listado de Productos');
        expect(button).toBeInTheDocument();
    });

    it('maneja la descarga correctamente', async () => {
        render(<DownloadButton />);
        const button = screen.getByText('Descargar Listado de Productos');

        fireEvent.click(button);

        // Espera a que la llamada fetch se resuelva
        await screen.findByText('Descargar Listado de Productos');

        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8000/api/v1/download', {
            method: 'GET',
        });
    });

    it('maneja el error de red', async () => {
        // Simula un error de red
        (fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.reject(new Error('La respuesta de red no fue correcta'))
        );

        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        render(<DownloadButton />);
        const button = screen.getByText('Descargar Listado de Productos');

        fireEvent.click(button);

        // Espera a que la llamada fetch sea rechazada
        await screen.findByText('Descargar Listado de Productos');

        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Hubo un problema con la operación fetch:',
            new Error('La respuesta de red no fue correcta')
        );

        consoleErrorSpy.mockRestore();
    });
});
