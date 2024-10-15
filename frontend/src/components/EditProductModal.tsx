import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Articulo } from '../App';

interface FormData {
    id: number;
    cliente: number;
    codigo: string;
    descripcion: string;
    precio: number;
}

interface ModalProps {
    show: boolean;
    onHide: () => void;
    onConfirm: (data: FormData) => void;
    productData: Articulo | null;
}

const EditProductModal: React.FC<ModalProps> = ({ show, onHide, onConfirm, productData }) => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>();
    const [formValues, setFormValues] = useState<FormData>({
        id: 0,
        cliente: 0,
        codigo: '',
        descripcion: '',
        precio: 0,
    });

    useEffect(() => {
        if (productData) {
            setFormValues({
                id: productData.id,
                cliente: productData.cliente,
                codigo: productData.codigo,
                descripcion: productData.descripcion,
                precio: productData.precio,
            });
            setValue('id', productData.id);
            setValue('cliente', productData.cliente);
            setValue('codigo', productData.codigo);
            setValue('descripcion', productData.descripcion);
            setValue('precio', productData.precio);
        }
    }, [productData, setValue]);

    const onSubmit = async (data: FormData) => {
        try {
            const response = await fetch(`http://193.168.15.3:9000/api/v1/articulos/${data.id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                onConfirm(data);
            } else {
                console.error('Error al enviar los datos');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
        setValue(name as keyof FormData, value);
    };

    if (!show) return null;
    if (!productData) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold">Modificar Producto</h2>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-4">
                        <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-1">Código</label>
                        <input
                            type="text"
                            id="codigo"
                            value={formValues.codigo}
                            {...register('codigo', { required: 'Este campo es obligatorio' })}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.codigo ? 'border-red-500' : 'border-gray-300'}`}
                            autoFocus={true}
                        />
                        {errors.codigo && <p className="mt-1 text-sm text-red-500">{errors.codigo.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                        <textarea
                            id="descripcion"
                            rows={3}
                            value={formValues.descripcion}
                            {...register('descripcion', { required: 'Este campo es obligatorio' })}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.descripcion ? 'border-red-500' : 'border-gray-300'}`}
                        ></textarea>
                        {errors.descripcion && <p className="mt-1 text-sm text-red-500">{errors.descripcion.message}</p>}
                    </div>
                    <div className="mb-4">
                        <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                        <input
                            type="number"
                            id="precio"
                            value={formValues.precio}
                            step="0.01"
                            {...register('precio', {
                                required: 'Este campo es obligatorio',
                                min: { value: 0.01, message: 'El precio debe ser mayor a cero' },
                                valueAsNumber: true,
                            })}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.precio ? 'border-red-500' : 'border-gray-300'}`}
                        />
                        {errors.precio && <p className="mt-1 text-sm text-red-500">{errors.precio.message}</p>}
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onHide} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                            Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductModal;