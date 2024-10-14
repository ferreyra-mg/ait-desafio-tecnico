import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ProductsTable from '../components/ProductsTable';
import { ColumnDef } from '@tanstack/react-table';
import React from 'react';

type Producto = {
    id: number;
    nombre: string;
    precio: number;
};

const datos: Producto[] = [
    { id: 1, nombre: 'Producto 1', precio: 100 },
    { id: 2, nombre: 'Producto 2', precio: 200 },
    { id: 3, nombre: 'Producto 3', precio: 300 },
    { id: 4, nombre: 'Producto 4', precio: 400 },
    { id: 5, nombre: 'Producto 5', precio: 500 },
    { id: 6, nombre: 'Producto 6', precio: 600 },
    { id: 7, nombre: 'Producto 7', precio: 700 },
    { id: 8, nombre: 'Producto 8', precio: 800 },
    { id: 9, nombre: 'Producto 9', precio: 900 },
    { id: 10, nombre: 'Producto 10', precio: 1000 },
    { id: 11, nombre: 'Producto 11', precio: 1100 },
];

const columnas: ColumnDef<Producto>[] = [
    {
        header: 'ID',
        accessorKey: 'id',
    },
    {
        header: 'Nombre',
        accessorKey: 'nombre',
    },
    {
        header: 'Precio',
        accessorKey: 'precio',
    },
];

describe('ProductsTable', () => {
    it('Muestra los encabezados correctamente', () => {
        render(<ProductsTable data={datos} columns={columnas} />);
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('Nombre')).toBeInTheDocument();
        expect(screen.getByText('Precio')).toBeInTheDocument();
    });

    it('Muestra el número correcto de filas en la primera página', () => {
        render(<ProductsTable data={datos} columns={columnas} />);
        const filas = screen.getAllByRole('row');
        // 1 fila de encabezado + 10 filas de datos
        expect(filas.length).toBe(11);
    });

    it('Muestra los datos que se le pasan en las filas', () => {
        render(<ProductsTable data={datos} columns={columnas} />);
        expect(screen.getByText('Producto 1')).toBeInTheDocument();
        expect(screen.getByText('100')).toBeInTheDocument();
    });

    it('Muestra la paginación correctamente', () => {
        render(<ProductsTable data={datos} columns={columnas} />);
        fireEvent.click(screen.getByText('>'));
        expect(screen.getByText('Producto 11')).toBeInTheDocument();
        expect(screen.queryByText('Producto 1')).not.toBeInTheDocument();
    });

    it('Deshabilita correctamente el botón [anterior] en la primera página', () => {
        render(<ProductsTable data={datos} columns={columnas} />);
        const botonAnterior = screen.getByText('<');
        expect(botonAnterior).toBeDisabled();
    });

    it('Deshabilita correctamente el botón de [siguiente] en la última página', () => {
        render(<ProductsTable data={datos} columns={columnas} />);
        fireEvent.click(screen.getByText('>>'));
        const botonSiguiente = screen.getByText('>');
        expect(botonSiguiente).toBeDisabled();
    });

    it('Se muestra correctamente cuando los datos viajan vacíos', () => {
        render(<ProductsTable data={[]} columns={columnas} />);
        expect(screen.getByText('Mostrando 0 de 0 Articulo(s)')).toBeInTheDocument();
    });

    it('Muestra correctamente los datos cuando caben dentro de una sola página', () => {
        const datosUnaPagina = datos.slice(0, 5);
        render(<ProductsTable data={datosUnaPagina} columns={columnas} />);
        expect(screen.getByText('Mostrando 5 de 5 Articulo(s)')).toBeInTheDocument();
        const botonSiguiente = screen.getByText('>');
        expect(botonSiguiente).toBeDisabled();
    });
});
