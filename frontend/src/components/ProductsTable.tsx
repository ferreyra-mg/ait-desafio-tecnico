import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
  PaginationState,
  getPaginationRowModel,
} from '@tanstack/react-table';
import React from 'react';
import { useState } from 'react';

interface TableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T, any>[];
}

function ProductsTable<T extends object>({ data, columns }: TableProps<T>) {

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      size: 50,
      minSize: 50,
      maxSize: 500,
    },
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    }
  });

  return (
    <div className="flex flex-col min-w-full">
      <table className="divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ width: `${header.getSize()}px` }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={`px-6 py-4 text-left whitespace-nowrap ${cell.column.id === 'descripcion' ? 'description-cell' : ''}`}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className='mt-2 flex justify-between'>
        <div>
          Mostrando {table.getRowModel().rows.length.toLocaleString()} de{' '}
          {table.getRowCount().toLocaleString()} Articulo(s)
        </div>
        <div className='flex items-center'>
          <button
            type='button'
            className='px-2 py-1 bg-gray-200 rounded'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            type='button'
            className='px-2 py-1 bg-gray-200 rounded mx-1'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <span className='mx-2'>
            Página{' '}
            <strong>
              {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
            </strong>
          </span>
          <button
            type='button'
            className='px-2 py-1 bg-gray-200 rounded mx-1'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            type='button'
            className='px-2 py-1 bg-gray-200 rounded'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductsTable;
