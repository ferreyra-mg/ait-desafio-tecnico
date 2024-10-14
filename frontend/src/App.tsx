import './App.css'
import toast, { Toaster } from 'react-hot-toast'
import { Login } from './components/Login'
import { SubmitHandler } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import ProductsTable from './components/ProductsTable';
import EditProductModal from './components/EditProductModal';
import DeleteProductModal from './components/DeleteProductModal';
import AddProductBulkModal from './components/AddProductBulkModal';
import AddProductModal from './components/AddProductModal';
import React from 'react';

export type Articulo = {
  id: number;
  codigo: string;
  descripcion: string;
  cliente: number;
  precio: number;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddBulkModal, setShowAddBulkModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Articulo | null>(null);
  const [selectedProductToDelete, setSelectedProductToDelete] = useState<Articulo | null>(null);
  const [datos, setDatos] = useState<Articulo[]>([]);
  const [clienteId, setClienteId] = useState(0);

  useEffect(() => {
    fetchProducts()
  }, [clienteId, isLoggedIn]);

  const fetchProducts = () => {
    if (isLoggedIn) {
      fetch('http://localhost:8000/api/v1/articulos')
        .then(response => response.json())
        .then(data => setDatos(data))
        .catch(error => console.error('Error fetching articulos:', error));
    }
  };

  const onSubmit: SubmitHandler<{ user: string; password: string }> = (data) => {
    if (data.user === 'admin' && data.password === 'admin') {
      fetch('http://localhost:8000/api/v1/clientes/')
        .then(response => response.json())
        .then(data => {
          if (data.length > 0) {
            setClienteId(data[0].id);
            toast.success('Inicio de sesión exitoso!');
            setIsLoggedIn(true);
          } else {
            toast.error('No se encontraron clientes. Por favor, inténtelo de nuevo.');
          }
        })
        .catch(error => console.error('Error fetching articulos:', error));
    } else {
      toast.error('Credenciales inválidas. Por favor, inténtelo de nuevo.');
    }
  };

  const columnHelper = createColumnHelper<Articulo>();
  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('descripcion', {
      header: 'Nombre',
      cell: info => info.getValue().toUpperCase(),
      minSize: 700,
    }),
    columnHelper.accessor('precio', {
      header: 'Precio',
      cell: info => info.getValue().toFixed(2),
    }),
    columnHelper.accessor('id', {
      id: 'action',
      header: 'Acción',
      cell: info => (
        <>
          <button
            className='btn px-2 py-2 text-sm bg-blue-900 text-white cursor-pointer'
            onClick={() => {
              const id = info.getValue();
              const producto = datos.find(item => item.id === id) || null;
              setSelectedProductToEdit(producto);
              setShowEditModal(true);
            }}
          >
            Editar
          </button>
          <button
            className='btn px-2 py-2 text-sm bg-red-600 text-white cursor-pointer ml-2'
            onClick={() => {
              const id = info.getValue();
              const producto = datos.find(item => item.id === id) || null;
              setSelectedProductToDelete(producto);
              setShowDeleteModal(true);
            }}
          >
            Eliminar
          </button>
        </>
      ),
    }),
  ];

  const onHideEditModal = () => {
    setShowEditModal(false);
    setSelectedProductToEdit(null);
  };

  const onConfirmEditModal = () => {
    setShowEditModal(false);
    setSelectedProductToEdit(null);
    fetchProducts();
  };

  const onHideAddModal = () => {
    setShowAddModal(false);
  };

  const onHideAddBulkModal = () => {
    setShowAddBulkModal(false);
  };

  const onConfirmAddModal = () => {
    setShowAddModal(false);
    fetchProducts();
  };

  const onHideDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const onConfirmDeleteModal = () => {
    setShowDeleteModal(false);
    fetchProducts();
  };

  const onError = (error: string) => {
    toast.error(error);
  };

  return (
    <>
      <Toaster />

      {/* Modales */}
      {showEditModal && <EditProductModal show={showEditModal} onHide={onHideEditModal} onConfirm={onConfirmEditModal} productData={selectedProductToEdit} />}
      {isLoggedIn && showDeleteModal && selectedProductToDelete && <DeleteProductModal show={showDeleteModal} onHide={onHideDeleteModal} onConfirm={onConfirmDeleteModal} productData={selectedProductToDelete} onError={onError} />}

      {/* Contenido principal */}
      <div className="min-h-screen min-w-full flex justify-start flex-col gap-4">
        {!isLoggedIn && <Login onSubmit={onSubmit} />}



        <div className='flex justify-end gap-4'>
          {isLoggedIn && <button className="btn px-2 py-2 text-sm bg-blue-900 text-white cursor-pointer" onClick={() => setShowAddModal(true)}>Agregar Producto</button>}
          {isLoggedIn && <button className="btn px-2 py-2 text-sm bg-blue-900 text-white cursor-pointer" onClick={() => setShowAddBulkModal(true)}>Agregar Productos de manera Masiva</button>}
        </div>
        {isLoggedIn && showAddModal && clienteId > 0 && <AddProductModal show={showAddModal} onHide={onHideAddModal} onConfirm={onConfirmAddModal} cliente_id={clienteId} />}
        {isLoggedIn && showAddBulkModal && clienteId > 0 && <AddProductBulkModal show={showAddBulkModal} onHide={onHideAddBulkModal} onConfirm={onConfirmAddModal} onError={onError} />}
        {isLoggedIn && datos.length > 0 && <ProductsTable data={datos} columns={columns} />}

      </div>
    </>
  )
} export default App