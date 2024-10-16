import React from 'react';

const DownloadButton = () => {
    const handleDownload = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/download', {
                method: 'GET',
            });

            if (!response.ok || response.status !== 200) {
                throw new Error('No se pudo descargar el archivo. La respuesta de red no fue correcta.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'listado_de_articulos.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Hubo un problema con la operación fetch:', error);
        }
    };

    return (
        <button onClick={handleDownload} className='btn px-2 py-2 text-sm bg-green-600 text-white cursor-pointer'>
            Descargar Listado de Productos
        </button>
    );
};

export default DownloadButton;
