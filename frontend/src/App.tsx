import { useState } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import './App.css'
import { SubmitHandler } from 'react-hook-form'
import { Login } from './components/Login'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [clienteId, setClienteId] = useState(0);

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

  return (
    <>
      <Toaster />
      {!isLoggedIn && <Login onSubmit={onSubmit} />}
    </>
  )
}

export default App
