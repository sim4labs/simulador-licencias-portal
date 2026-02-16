'use client'

import { cn } from '@/lib/utils'

interface Column<T> {
  key: string
  header: string
  render: (row: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyExtractor: (row: T) => string
  emptyMessage?: string
  className?: string
}

export function DataTable<T>({ columns, data, keyExtractor, emptyMessage = 'No hay datos', className }: DataTableProps<T>) {
  return (
    <div className={cn('bg-white shadow rounded-lg overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.key} className={cn('px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map(row => (
                <tr key={keyExtractor(row)} className="hover:bg-gray-50">
                  {columns.map(col => (
                    <td key={col.key} className={cn('px-4 py-3 text-sm', col.className)}>
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
