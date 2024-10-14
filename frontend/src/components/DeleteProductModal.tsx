import React, { useEffect } from 'react';
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
  onError: (msg: string) => void;
  onConfirm: (data: FormData) => void;
  productData: Articulo | null;
}

const DeleteProductModal: React.FC<ModalProps> = ({ show, onHide, onConfirm, onError, productData }) => {
  const { handleSubmit, setValue } = useForm<FormData>();

  useEffect(() => {
    if (productData) {
      setValue('id', productData.id);
      setValue('cliente', productData.cliente);
      setValue('codigo', productData.codigo);
      setValue('descripcion', productData.descripcion);
      setValue('precio', productData.precio);
    }
  }, [productData, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/articulos/${data.id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        onConfirm(data);
      } else {
        onError('Error al enviar los datos');
      }
    } catch (error: Object | any) {
      onError('Error:' + error.message || error);
    }
  };

  if (!show) return null;
  if (!productData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center transition-all duration-300 ease-in-out animate-fade-in-down">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg ">
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">¿Está seguro de eliminar el siguiente producto?</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} role='form'>
          <div className="mb-4 flex flex-col items-start">
            <span><strong>Código:</strong> <span className='ml-4 capitalize'>{productData.codigo}</span></span>
            <span><strong>Descripción:</strong> <span className='ml-4 capitalize'>{productData.descripcion}</span></span>
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
      </div >
    </div >
  );
};

export default DeleteProductModal;
