import { createColumnHelper } from '@tanstack/react-table';
import React, { useState } from 'react';
import { Articulo } from '../App';
import ProductsTable from './ProductsTable';
import * as XLSX from 'xlsx';

interface ModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: (data: FormData) => void;
    onError: (msg: string) => void;
}

const ACCEPTED_FILE_EXTENSIONS = ['csv', 'xlsx', 'xls'];

const AddProductBulkModal: React.FC<ModalProps> = ({ show, onHide, onConfirm, onError }) => {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<Articulo[]>([]);

    const columnHelper = createColumnHelper<Articulo>();
    const columns = [
        columnHelper.accessor('id', {
            header: 'ID',
        }),
        columnHelper.accessor('descripcion', {
            id: 'descripcion',
            header: 'Descripción',
            minSize: 700,
            maxSize: 700,
        }),
        columnHelper.accessor('precio', {
            header: 'Precio',
        }),
        columnHelper.accessor('id', {
            id: 'action',
            header: 'Acción',
        }),
    ];

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`http://localhost:8000/api/v1/upload/`, {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                onConfirm(formData);
            } else {
                onError('Error al enviar los datos');
            }
        } catch (error) {
            onError(`Error: ${error}`);
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFile(null);
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            const fileName = selectedFile.name;
            const fileExtension = fileName.split('.').pop()?.toLowerCase();

            if (fileExtension && ACCEPTED_FILE_EXTENSIONS.includes(fileExtension)) {
                setFile(selectedFile);
                processFile(selectedFile);
            } else {
                onError('Por favor, seleccione un tipo de archivo válido (xlsx, xls, csv).');
                event.target.value = '';
                setFile(null);
                setData([]);
            }
        }
    };

    const processFile = (file: File) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = e.target?.result;
            if (!data) return;
            let parsedData: Articulo[] = [];

            const workbook = XLSX.read(new Uint8Array(data as ArrayBuffer), { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            parsedData = XLSX.utils.sheet_to_json(worksheet);

            setData(parsedData);
        };

        reader.readAsArrayBuffer(file);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-7xl  mt-14 ">
                <form role="form" onSubmit={onSubmit}>
                    <div className="text-center mb-4 flex flex-col items-center gap-4">
                        <h2 className="text-xl font-bold">Ingresar/Actualizar Productos</h2>
                        <label htmlFor="archivo">Archivo</label>
                        <input type="file" name="archivo" id="archivo" className="" onChange={handleFileChange} />
                    </div>
                    <div className="mb-4">
                        <ProductsTable columns={columns} data={data} />
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onHide} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700" disabled={file === null}>
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductBulkModal;
