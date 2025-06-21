
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp, Search, Filter } from "lucide-react";

const tableVariants = cva(
  "w-full border-collapse",
  {
    variants: {
      variant: {
        default: "border border-slate-200 rounded-lg overflow-hidden",
        minimal: "border-0",
        striped: "border border-slate-200 rounded-lg overflow-hidden [&_tbody_tr:nth-child(even)]:bg-slate-50",
      },
      size: {
        sm: "text-sm",
        default: "",
        lg: "text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface Column<T> {
  key: keyof T | string;
  header: string;
  accessor?: (item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  mobileLabel?: string; // For mobile card view
}

export interface DataTableProps<T>
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof tableVariants> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  sortable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  actions?: (item: T) => React.ReactNode;
  onRowClick?: (item: T) => void;
  mobileCardView?: boolean;
}

type SortDirection = 'asc' | 'desc' | null;

/**
 * DataTable - Responsive data table with sorting, filtering, and pagination
 * 
 * @example
 * <DataTable
 *   data={projects}
 *   columns={[
 *     { key: 'name', header: 'Project Name', sortable: true },
 *     { key: 'status', header: 'Status', filterable: true },
 *     { key: 'created_at', header: 'Created', accessor: (item) => formatDate(item.created_at) }
 *   ]}
 *   searchable
 *   pagination
 *   actions={(item) => <ProjectActions project={item} />}
 * />
 * 
 * @example Mobile-optimized
 * <DataTable
 *   data={tasks}
 *   columns={columns}
 *   mobileCardView
 *   searchable
 * />
 */
export function DataTable<T extends Record<string, any>>({
  className,
  variant,
  size,
  data,
  columns,
  loading = false,
  searchable = false,
  filterable = false,
  sortable = true,
  pagination = false,
  pageSize = 10,
  emptyMessage = "No data available",
  emptyIcon,
  actions,
  onRowClick,
  mobileCardView = true,
  ...props
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [sortColumn, setSortColumn] = React.useState<string | null>(null);
  const [sortDirection, setSortDirection] = React.useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  // Filter and search data
  const filteredData = React.useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm) {
      result = result.filter((item) =>
        columns.some((column) => {
          const value = column.accessor 
            ? String(column.accessor(item))
            : String(item[column.key as keyof T]);
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        result = result.filter((item) => 
          String(item[key as keyof T]).toLowerCase() === value.toLowerCase()
        );
      }
    });

    // Apply sorting
    if (sortColumn && sortDirection) {
      result.sort((a, b) => {
        const aValue = String(a[sortColumn as keyof T]);
        const bValue = String(b[sortColumn as keyof T]);
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, sortColumn, sortDirection, filters, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = pagination 
    ? filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : filteredData;

  const handleSort = (columnKey: string) => {
    if (!sortable) return;
    
    if (sortColumn === columnKey) {
      setSortDirection(prev => 
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') {
        setSortColumn(null);
      }
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) return null;
    return sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const getUniqueValues = (columnKey: string) => {
    const values = data.map(item => String(item[columnKey as keyof T]));
    return [...new Set(values)].filter(Boolean);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-2">
          <div className="h-10 bg-slate-200 rounded" />
          <div className="h-8 bg-slate-100 rounded" />
          <div className="h-8 bg-slate-100 rounded" />
          <div className="h-8 bg-slate-100 rounded" />
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        {emptyIcon}
        <p className="text-slate-500 mt-2">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="flex flex-col sm:flex-row gap-4">
          {searchable && (
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {filterable && (
            <div className="flex gap-2">
              {columns.filter(col => col.filterable).map((column) => (
                <Select
                  key={String(column.key)}
                  value={filters[String(column.key)] || 'all'}
                  onValueChange={(value) => 
                    setFilters(prev => ({ ...prev, [String(column.key)]: value }))
                  }
                >
                  <SelectTrigger className="w-[150px]">
                    <Filter size={14} />
                    <SelectValue placeholder={`Filter ${column.header}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All {column.header}</SelectItem>
                    {getUniqueValues(String(column.key)).map((value) => (
                      <SelectItem key={value} value={value}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Desktop Table View */}
      <div className={cn("hidden md:block overflow-x-auto")}>
        <table className={cn(tableVariants({ variant, size }))}>
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "px-4 py-3 text-left font-medium text-slate-700",
                    column.sortable && sortable && "cursor-pointer hover:bg-slate-100",
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && getSortIcon(String(column.key))}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  "border-t border-slate-200",
                  onRowClick && "cursor-pointer hover:bg-slate-50",
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className="px-4 py-3">
                    {column.accessor ? column.accessor(item) : String(item[column.key as keyof T])}
                  </td>
                ))}
                {actions && (
                  <td className="px-4 py-3 text-right">
                    {actions(item)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      {mobileCardView && (
        <div className="md:hidden space-y-3">
          {paginatedData.map((item, index) => (
            <div
              key={index}
              className={cn(
                "bg-white border border-slate-200 rounded-lg p-4 space-y-2",
                onRowClick && "cursor-pointer hover:bg-slate-50"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <div key={String(column.key)} className="flex justify-between items-start">
                  <span className="text-sm font-medium text-slate-600">
                    {column.mobileLabel || column.header}:
                  </span>
                  <span className="text-sm text-slate-900 text-right flex-1 ml-2">
                    {column.accessor ? column.accessor(item) : String(item[column.key as keyof T])}
                  </span>
                </div>
              ))}
              {actions && (
                <div className="pt-2 border-t border-slate-100">
                  {actions(item)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-slate-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
