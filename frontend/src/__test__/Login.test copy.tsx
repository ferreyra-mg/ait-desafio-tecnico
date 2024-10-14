import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';
import { Login } from '../components/Login';

// Mocking useForm to control form state in tests
jest.mock('react-hook-form', () => ({
    useForm: jest.fn(),
}));

describe('Login Component', () => {
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

    it('renders the login form correctly', () => {
        render(<Login onSubmit={mockOnSubmit} />);

        expect(screen.getByLabelText('Email:')).toBeInTheDocument();
        expect(screen.getByLabelText('Password:')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('calls the onSubmit function when the form is submitted', async () => {
        mockHandleSubmit.mockImplementation((onSubmit) => (e: { preventDefault: () => void; }) => {
            e.preventDefault();
            onSubmit({ user: 'test@example.com', password: 'password' });
        });

        render(<Login onSubmit={mockOnSubmit} />);
        fireEvent.submit(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(mockOnSubmit).toHaveBeenCalledWith({ user: 'test@example.com', password: 'password' });
        });
    });

    it('displays error messages when fields are empty', () => {
        const mockErrors = {
            user: { message: 'User is required' },
            password: { message: 'Password is required' },
        };

        (useForm as jest.Mock).mockReturnValue({
            register: mockRegister,
            handleSubmit: mockHandleSubmit,
            formState: { errors: mockErrors },
        });

        render(<Login onSubmit={mockOnSubmit} />);

        expect(screen.getByText('User is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
    });

    it('does not display error messages when fields are filled', () => {
        const mockErrors = {};

        (useForm as jest.Mock).mockReturnValue({
            register: mockRegister,
            handleSubmit: mockHandleSubmit,
            formState: { errors: mockErrors },
        });

        render(<Login onSubmit={mockOnSubmit} />);

        expect(screen.queryByText('User is required')).not.toBeInTheDocument();
        expect(screen.queryByText('Password is required')).not.toBeInTheDocument();
    });
});
