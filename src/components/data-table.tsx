import React, { useState, useMemo } from 'react';
import {
  ColumnDef,
  flexRender,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  FilterFn,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePickerWithRange, DateRange } from '@/app/users/DateRangePicker';
import DataDownload from "../app/users/datadownload";

// Define your data type
interface UserData {
  name: string;
  email: string;
  status: string;
  datecreated: string; // Ensure this matches the format of your date field
}

// Define your columns
const columns: ColumnDef<UserData, any>[] = [
  {
    accessorKey: 'name',
    header: () => <div className='flex items-center'>Name</div>,
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'email',
    header: () => <div className='flex items-center'>Email</div>,
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'status',
    header: () => <div className='flex items-center'>Status</div>,
    cell: info => info.getValue(),
  },
  {
    accessorKey: 'datecreated',
    header: () => <div className='flex items-center'>Date Created</div>,
    cell: info => info.getValue(),
  },
];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const globalFilterFn: FilterFn<UserData> = (row, columnId, filterValue) => {
  if (columnId === 'status' && filterValue) {
    return row.getValue('status') === filterValue;
  }

  return (
    (row.getValue('name') as string).toLowerCase().includes(filterValue.toLowerCase()) ||
    (row.getValue('email') as string).toLowerCase().includes(filterValue.toLowerCase())
  );
};

export function DataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [date, setDate] = useState<DateRange | undefined>();

  const filteredData = useMemo(() => {
    if (!date) return data;
    return data.filter((item: UserData) => {
      const itemDate = new Date(item.datecreated);
      const fromDate = date.from ? new Date(date.from) : null;
      const toDate = date.to ? new Date(date.to) : null;
      if (fromDate && toDate) {
        return itemDate >= fromDate && itemDate <= toDate;
      }
      return true;
    });
  }, [data, date]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn,
  });

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setGlobalFilter(status);
    table.setGlobalFilter(status); // Setting status as the global filter value
  };

  const getSortingIcon = (columnId: string) => {
    const isSorted = sorting.find(sort => sort.id === columnId);
    if (!isSorted) return null;
    return isSorted.desc ? '↓' : '↑';
  };

  return (
    <>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center'>
          <Input
            placeholder='Search by name or email'
            value={globalFilter}
            onChange={event => setGlobalFilter(event.target.value)}
            className='max-w-sm'
          />
        </div>
        <div className='flex items-center justify-end'>
          <div className='mr-0'>
            {/* Status dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='outline' className='ml-auto'>
                  Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                {['Active', 'Pending', 'Inactive'].map(status => (
                  <DropdownMenuCheckboxItem
                    key={status}
                    className='capitalize'
                    checked={selectedStatus === status.toLowerCase()}
                    onCheckedChange={value => handleStatusChange(value ? status.toLowerCase() : '')}
                  >
                    {status}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className='ml-4'>
            <DatePickerWithRange date={date} setDate={setDate} />
          </div>
          <div className='ml-4'>
            <DataDownload data={filteredData} />
          </div>
          {/* Column visibility */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' className='ml-2'>
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {table
                .getAllColumns()
                .filter(column => column.getCanHide())
                .map(column => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className='capitalize'
                    checked={column.getIsVisible()}
                    onCheckedChange={value => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Table */}
      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className='cursor-pointer select-none'
                  >
                    <div className='flex items-center'>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getCanSort() && getSortingIcon(header.column.id)}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      <div className='flex items-center justify-end space-x-2 py-4'>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant='outline'
          size='sm'
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </>
  );
}
