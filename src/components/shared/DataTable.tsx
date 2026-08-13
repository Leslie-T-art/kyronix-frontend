import React, { useMemo, useState } from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  SearchIcon,
  SlidersHorizontalIcon } from
'lucide-react';
import { cn } from '../../utils/cn';
import type { ApiError } from '../../lib/api/errors';
import type { Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { can } from '../../lib/auth/roles';
import { Button } from '../ui/Button';
import { EmptyState, ErrorState, LoadingState } from './States';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right';
  sortable?: boolean;
  filterable?: boolean;
  roles?: Role[];
  value: (row: T) => string | number;
  render?: (row: T) => React.ReactNode;
}

export interface ExportColumn<T> {
  key: string;
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[] | null;
  rowKey: (row: T) => string;
  isLoading?: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  onRowClick?: (row: T) => void;
  searchPlaceholder?: string;
  exportName?: string;
  exportColumns?: ExportColumn<T>[];
  pageSize?: number;
}

const PAGE_SIZE = 10;

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  isLoading,
  error,
  onRetry,
  onRowClick,
  searchPlaceholder = 'Search records',
  exportName = 'export',
  exportColumns,
  pageSize = PAGE_SIZE
}: DataTableProps<T>) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<{key: string;dir: 'asc' | 'desc';} | null>(null);
  const [page, setPage] = useState(0);
  const [hidden, setHidden] = useState<string[]>([]);
  const [showColumns, setShowColumns] = useState(false);

  const roleColumns = useMemo(
    () => columns.filter((column) => !column.roles || user && column.roles.includes(user.role)),
    [columns, user]
  );
  const visibleColumns = roleColumns.filter((column) => !hidden.includes(column.key));

  const filtered = useMemo(() => {
    const data = rows ?? [];
    return data.filter((row) => {
      const matchesQuery =
      query.trim() === '' ||
      roleColumns.some((column) =>
      String(column.value(row)).toLowerCase().includes(query.trim().toLowerCase())
      );
      const matchesFilters = Object.entries(filters).every(
        ([key, value]) =>
        !value ||
        String(roleColumns.find((column) => column.key === key)?.value(row)) === value
      );
      return matchesQuery && matchesFilters;
    });
  }, [rows, query, filters, roleColumns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const column = roleColumns.find((item) => item.key === sort.key);
    if (!column) return filtered;
    return [...filtered].sort((a, b) => {
      const av = column.value(a);
      const bv = column.value(b);
      if (typeof av === 'number' && typeof bv === 'number') {
        return sort.dir === 'asc' ? av - bv : bv - av;
      }
      return sort.dir === 'asc' ?
      String(av).localeCompare(String(bv)) :
      String(bv).localeCompare(String(av));
    });
  }, [filtered, sort, roleColumns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, pageCount - 1);
  const paged = sorted.slice(currentPage * pageSize, currentPage * pageSize + pageSize);

  function toggleSort(key: string) {
    setSort((current) =>
    current?.key === key ?
    { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } :
    { key, dir: 'asc' }
    );
  }

  function exportCsv() {
    const columnsToExport = exportColumns ?? visibleColumns.map((column) => ({
      key: column.key,
      header: column.header,
      value: column.value
    }));
    const header = columnsToExport.map((column) => column.header).join(',');
    const body = sorted.
    map((row) =>
    columnsToExport.map((column) => `"${String(column.value(row) ?? '').replace(/"/g, '""')}"`).join(',')
    ).
    join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${exportName}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const filterColumns = roleColumns.filter((column) => column.filterable);

  return (
    <div className="rounded-xl border border-zinc-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-zinc-200 p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="h-9 w-56 rounded-xl border border-zinc-200 bg-white pl-9 pr-3 text-xs text-zinc-700 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy" />
            
          </div>
          {filterColumns.map((column) => {
            const options = Array.from(
              new Set((rows ?? []).map((row) => String(column.value(row))))
            ).sort();
            return (
              <select
                key={column.key}
                aria-label={`Filter by ${column.header}`}
                value={filters[column.key] ?? ''}
                onChange={(event) => {
                  setFilters((current) => ({ ...current, [column.key]: event.target.value }));
                  setPage(0);
                }}
                className="h-9 rounded-xl border border-zinc-200 bg-white px-3 text-xs text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy">
                
                <option value="">All {column.header.toLowerCase()}</option>
                {options.map((option) =>
                <option key={option} value={option}>
                    {option}
                  </option>
                )}
              </select>);

          })}
        </div>

        <div className="relative flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowColumns((value) => !value)}>
            <SlidersHorizontalIcon className="h-3.5 w-3.5" />
            Columns
          </Button>
          {user && can(user.role, 'export') &&
          <Button variant="outline" size="sm" onClick={exportCsv}>
              <DownloadIcon className="h-3.5 w-3.5" />
              Export
            </Button>
          }
          {showColumns &&
          <div className="absolute right-0 top-10 z-20 w-56 rounded-xl border border-zinc-200 bg-white p-2">
              {roleColumns.map((column) =>
            <label
              key={column.key}
              className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-xs text-zinc-600 hover:bg-zinc-50">
              
                  <input
                type="checkbox"
                checked={!hidden.includes(column.key)}
                onChange={() =>
                setHidden((current) =>
                current.includes(column.key) ?
                current.filter((key) => key !== column.key) :
                [...current, column.key]
                )
                }
                className="h-3.5 w-3.5 rounded border-zinc-300 text-navy focus:ring-navy" />
              
                  {column.header}
                </label>
            )}
            </div>
          }
        </div>
      </div>

      {isLoading && <LoadingState />}
      {!isLoading && error &&
      <ErrorState
        description={error.message}
        correlationId={error.correlationId}
        onRetry={onRetry} />

      }
      {!isLoading && !error && paged.length === 0 &&
      <EmptyState description="No records match the current search and filters." />
      }

      {!isLoading && !error && paged.length > 0 &&
      <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="sticky top-0 bg-zinc-50">
                <tr>
                  {visibleColumns.map((column) =>
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    'whitespace-nowrap border-b border-zinc-200 px-4 py-3 text-xs font-semibold text-zinc-500',
                    column.align === 'right' && 'text-right'
                  )}>
                  
                      {column.sortable === false ?
                  column.header :

                  <button
                    type="button"
                    onClick={() => toggleSort(column.key)}
                    className={cn(
                      'inline-flex items-center gap-1 rounded-xl transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy',
                      column.align === 'right' && 'flex-row-reverse'
                    )}>
                    
                          {column.header}
                          {sort?.key === column.key && (
                    sort.dir === 'asc' ?
                    <ArrowUpIcon className="h-3 w-3" /> :

                    <ArrowDownIcon className="h-3 w-3" />)
                    }
                        </button>
                  }
                    </th>
                )}
                </tr>
              </thead>
              <tbody>
                {paged.map((row) =>
              <tr
                key={rowKey(row)}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={() => onRowClick?.(row)}
                onKeyDown={(event) => {
                  if (onRowClick && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onRowClick(row);
                  }
                }}
                className={cn(
                  'border-b border-zinc-100 last:border-0',
                  onRowClick &&
                  'cursor-pointer transition-colors hover:bg-zinc-50 focus-visible:bg-zinc-50 focus-visible:outline-none'
                )}>
                
                    {visibleColumns.map((column) =>
                <td
                  key={column.key}
                  className={cn(
                    'h-14 px-4 text-xs text-zinc-600',
                    column.align === 'right' && 'tabular text-right'
                  )}>
                  
                        {column.render ? column.render(row) : String(column.value(row))}
                      </td>
                )}
                  </tr>
              )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-zinc-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Showing{' '}
              <span className="tabular font-medium text-navy">
                {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, sorted.length)}
              </span>{' '}
              of <span className="tabular font-medium text-navy">{sorted.length}</span> records
            </p>
            <div className="flex items-center gap-2">
              <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage(currentPage - 1)}>
              
                <ChevronLeftIcon className="h-3.5 w-3.5" />
                Previous
              </Button>
              <span className="tabular text-xs text-zinc-500">
                Page {currentPage + 1} of {pageCount}
              </span>
              <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage(currentPage + 1)}>
              
                Next
                <ChevronRightIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </>
      }
    </div>);

}
