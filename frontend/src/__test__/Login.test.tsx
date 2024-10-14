import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';
import { Login } from '../components/Login';

jest.mock('react-hook-form', () => ({
    useForm: jest.fn(),
}));

describe('Componente Login', () => {
    const mockOnSubmit = jest.fn();
    const mockRegister = jest.fn();
    const mockHandleSubmit = jest.fn();
    const mockErrors = {};

    beforeEach(() => {
        (useForm as jest.Mock).mockReturnValue({
            register: mockRegister,
            handleSubmit: mockHandleSubmit,
            formState: { errors: mockErrors },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Renderiza correctamente', () => {
        render(<Login onSubmit={mockOnSubmit} />);

        expect(screen.getByLabelText('Email:')).toBeInTheDocument();
        expect(screen.getByLabelText('Password:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('Llama a [onSubmit] cuando el formulario se envia correctamente.', async () => {
        mockHandleSubmit.mockImplementation((onSubmit) => (e: { preventDefault: () => void; }) => {
            e.preventDefault();
            onSubmit({ user: 'mail@mail.com', password: 'pass123' });
        });

        render(<Login onSubmit={mockOnSubmit} />);
        fireEvent.submit(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({ user: 'mail@mail.com', password: 'pass123' });
        });
    });

    it('Muestra mensajes de error si los campos están vacíos', () => {
        const mockErrors = {
            user: { message: 'El usuario es obligatorio' },
            password: { message: 'La contraseña es obligatoria' },
        };

        (useForm as jest.Mock).mockReturnValue({
            register: mockRegister,
            handleSubmit: mockHandleSubmit,
            formState: { errors: mockErrors },
        });

        render(<Login onSubmit={mockOnSubmit} />);

        expect(screen.getByText('El usuario es obligatorio')).toBeInTheDocument();
        expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument();
    });

    it('No muestra mensajes de error si los campos estan completos', () => {
        const mockErrors = {};

        (useForm as jest.Mock).mockReturnValue({
            register: mockRegister,
            handleSubmit: mockHandleSubmit,
            formState: { errors: mockErrors },
        });

        render(<Login onSubmit={mockOnSubmit} />);

        expect(screen.queryByText('El usuario es obligatorio')).not.toBeInTheDocument();
        expect(screen.queryByText('La contraseña es obligatoria')).not.toBeInTheDocument();
    });
});
