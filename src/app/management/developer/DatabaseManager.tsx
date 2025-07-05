"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Database, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw, 
  Users,
  Building2,
  FileText,
  AlertTriangle,
  User,
  ChevronDownIcon,
  ChevronUpIcon,
  CopyIcon
} from "lucide-react";
import {
  ColumnFiltersState,
  SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TableData {
  [key: string]: unknown;
}

interface TableConfig {
  name: string;
  displayName: string;
  icon: React.ComponentType<{ className?: string }>;
  columns: {
    header: string;
    accessorKey: string;
    cell?: (value: unknown, row: TableData) => React.ReactNode;
  }[];
  fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'select' | 'date' | 'password' | 'number';
    options?: string[];
    required?: boolean;
  }[];
}

const TABLE_CONFIGS: TableConfig[] = [
  {
    name: 'account',
    displayName: 'Accounts',
    icon: Users,
    columns: [
      { header: "Username", accessorKey: "username" },
      { header: "Role", accessorKey: "role" },
      { header: "Onboarded", accessorKey: "onboarded" },
      { header: "Organization", accessorKey: "organization.name" },
      { header: "Created", accessorKey: "createdAt", 
        cell: (value) => new Date(value as string).toLocaleDateString('th-TH') }
    ],
    fields: [
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'passwordHash', label: 'Password Hash', type: 'password', required: true },
      { name: 'onboarded', label: 'Onboarded', type: 'select', options: ['true', 'false'], required: true },
      { name: 'role', label: 'Role', type: 'select', options: ['UNAPPROVED', 'USER', 'ADMIN', 'DEVELOPER'], required: true },
      { name: 'organizationId', label: 'Organization ID', type: 'text' },
    ]
  },
  {
    name: 'organization',
    displayName: 'Organizations',
    icon: Building2,
    columns: [
      { header: "Name", accessorKey: "name" },
      { header: "Created", accessorKey: "createdAt",
        cell: (value) => new Date(value as string).toLocaleDateString('th-TH') }
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
    ]
  },
  {
    name: 'user',
    displayName: 'Users',
    icon: User,
    columns: [
      { header: "Name", accessorKey: "name" },
      { header: "Position", accessorKey: "position" },
      { header: "Phone", accessorKey: "phone" },
      { header: "Account ID", accessorKey: "accountId" }
    ],
    fields: [
      { name: 'name', label: 'Name', type: 'text' },
      { name: 'position', label: 'Position', type: 'text' },
      { name: 'phone', label: 'Phone', type: 'text' },
      { name: 'accountId', label: 'Account ID', type: 'text', required: true },
    ]
  },
  {
    name: 'medError',
    displayName: 'Medical Errors',
    icon: FileText,
    columns: [
      { header: "Event Date", accessorKey: "eventDate",
        cell: (value) => new Date(value as string).toLocaleDateString('th-TH') },
      { header: "Unit", accessorKey: "unit.label" },
      { header: "Severity", accessorKey: "severity.label" },
      { header: "Error Type", accessorKey: "errorType.label" },
      { header: "Reporter", accessorKey: "reporterName" }
    ],
    fields: [
      { name: 'eventDate', label: 'Event Date', type: 'date', required: true },
      { name: 'unitId', label: 'Unit ID', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'severityId', label: 'Severity ID', type: 'text', required: true },
      { name: 'errorTypeId', label: 'Error Type ID', type: 'text', required: true },
      { name: 'subErrorTypeId', label: 'Sub Error Type ID', type: 'text', required: true },
      { name: 'reporterAccountId', label: 'Reporter Account ID', type: 'text', required: true },
      { name: 'reporterUsername', label: 'Reporter Username', type: 'text', required: true },
      { name: 'reporterName', label: 'Reporter Name', type: 'text', required: true },
      { name: 'reporterPosition', label: 'Reporter Position', type: 'text', required: true },
      { name: 'reporterPhone', label: 'Reporter Phone', type: 'text', required: true },
      { name: 'reporterOrganizationId', label: 'Reporter Organization ID', type: 'text' },
    ]
  },
  {
    name: 'severity',
    displayName: 'Severities',
    icon: AlertTriangle,
    columns: [
      { header: "Code", accessorKey: "code" },
      { header: "Label", accessorKey: "label" }
    ],
    fields: [
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'label', label: 'Label', type: 'text', required: true },
    ]
  },
  {
    name: 'errorType',
    displayName: 'Error Types',
    icon: FileText,
    columns: [
      { header: "Code", accessorKey: "code" },
      { header: "Label", accessorKey: "label" }
    ],
    fields: [
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'label', label: 'Label', type: 'text', required: true },
    ]
  },
  {
    name: 'subErrorType',
    displayName: 'Sub Error Types',
    icon: FileText,
    columns: [
      { header: "Code", accessorKey: "code" },
      { header: "Label", accessorKey: "label" },
      { header: "Error Type ID", accessorKey: "errorTypeId" }
    ],
    fields: [
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'label', label: 'Label', type: 'text', required: true },
      { name: 'errorTypeId', label: 'Error Type ID', type: 'text', required: true },
    ]
  },
  {
    name: 'unit',
    displayName: 'Units',
    icon: Building2,
    columns: [
      { header: "Code", accessorKey: "code" },
      { header: "Label", accessorKey: "label" }
    ],
    fields: [
      { name: 'code', label: 'Code', type: 'text', required: true },
      { name: 'label', label: 'Label', type: 'text', required: true },
    ]
  }
];

// Simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function DatabaseManager() {
  const [activeTable, setActiveTable] = useState('account');
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<TableData | null>(null);
  const [formData, setFormData] = useState<TableData>({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [actionLoading, setActionLoading] = useState(false);

  const currentTableConfig = TABLE_CONFIGS.find(config => config.name === activeTable);
  const debouncedSearch = useDebounce(searchInput, 1000);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/developer/database/${activeTable}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error('ไม่สามารถดึงข้อมูลได้');
      }
    } catch {
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTable]);

  // Custom global filter function
  function globalStringFilter(row: { original: TableData }, _columnId: string, filterValue: string) {
    if (!filterValue) return true;
    const lower = filterValue.toLowerCase();
    return Object.values(row.original).some((value: unknown) => {
      if (typeof value === "string") return value.toLowerCase().includes(lower);
      if (typeof value === "object" && value && typeof value === "object" && "label" in value) return (value as { label: string }).label.toLowerCase().includes(lower);
      if (typeof value === "object" && value && typeof value === "object" && "name" in value) return (value as { name: string }).name.toLowerCase().includes(lower);
      return false;
    });
  }

  // Update globalFilter when debouncedSearch changes
  useEffect(() => {
    setGlobalFilter(debouncedSearch);
    setPage(0);
  }, [debouncedSearch]);

  const handleAdd = async () => {
    // Validation
    if (!currentTableConfig) return;
    
    const requiredFields = currentTableConfig.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]);
    
    if (missingFields.length > 0) {
      toast.error(`กรุณากรอกข้อมูลที่จำเป็น: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setActionLoading(true);
    try {
      // Prepare data for API
      const dataToSend = { ...formData };
      
      // Handle boolean fields
      if (dataToSend.onboarded !== undefined) {
        dataToSend.onboarded = dataToSend.onboarded === 'true';
      }

      const response = await fetch(`/api/developer/database/${activeTable}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success('เพิ่มข้อมูลสำเร็จ');
        setShowAddDialog(false);
        setFormData({});
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'เพิ่มข้อมูลไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Add error:', error);
      toast.error('เกิดข้อผิดพลาดในการเพิ่มข้อมูล');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!selectedRecord || !currentTableConfig) return;
    
    // Validation
    const requiredFields = currentTableConfig.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.name]);
    
    if (missingFields.length > 0) {
      toast.error(`กรุณากรอกข้อมูลที่จำเป็น: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setActionLoading(true);
    try {
      // Prepare data for API
      const dataToSend = { ...formData };
      
      // Handle boolean fields
      if (dataToSend.onboarded !== undefined) {
        dataToSend.onboarded = dataToSend.onboarded === 'true';
      }

      const response = await fetch(`/api/developer/database/${activeTable}/${selectedRecord.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        toast.success('แก้ไขข้อมูลสำเร็จ');
        setShowEditDialog(false);
        setSelectedRecord(null);
        setFormData({});
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'แก้ไขข้อมูลไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Edit error:', error);
      toast.error('เกิดข้อผิดพลาดในการแก้ไขข้อมูล');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedRecord) return;
    
    setActionLoading(true);
    try {
      const response = await fetch(`/api/developer/database/${activeTable}/${selectedRecord.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('ลบข้อมูลสำเร็จ');
        setShowDeleteDialog(false);
        setSelectedRecord(null);
        fetchData();
      } else {
        const error = await response.json();
        toast.error(error.error || 'ลบข้อมูลไม่สำเร็จ');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('เกิดข้อผิดพลาดในการลบข้อมูล');
    } finally {
      setActionLoading(false);
    }
  };

  const openAddDialog = () => {
    setFormData({});
    setShowAddDialog(true);
  };

  const openEditDialog = (record: TableData) => {
    setSelectedRecord(record);
    // Convert data for form
    const formDataForEdit = { ...record };
    
    // Handle boolean fields
    if (formDataForEdit.onboarded !== undefined) {
      formDataForEdit.onboarded = formDataForEdit.onboarded ? 'true' : 'false';
    }
    
    // Handle date fields
    if (formDataForEdit.eventDate && typeof formDataForEdit.eventDate === 'string') {
      const date = new Date(formDataForEdit.eventDate);
      formDataForEdit.eventDate = date.toISOString().slice(0, 16); // Format for datetime-local
    }
    
    setFormData(formDataForEdit);
    setShowEditDialog(true);
  };

  const openDeleteDialog = (record: TableData) => {
    setSelectedRecord(record);
    setShowDeleteDialog(true);
  };

  const openViewDialog = (record: TableData) => {
    setSelectedRecord(record);
    setShowViewDialog(true);
  };

  const renderField = (field: TableConfig['fields'][0]) => {
    const rawValue = formData[field.name];
    const value = typeof rawValue === 'string' ? rawValue : '';
    
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.label}
            required={field.required}
            className="min-h-[100px]"
          />
        );
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => setFormData({ ...formData, [field.name]: val })}>
            <SelectTrigger>
              <SelectValue placeholder={field.label} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'date':
        return (
          <Input
            type="datetime-local"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            required={field.required}
          />
        );
      case 'password':
        return (
          <Input
            type="password"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.label}
            required={field.required}
          />
        );
      case 'number':
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.label}
            required={field.required}
          />
        );
      default:
        return (
          <Input
            value={value}
            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
            placeholder={field.label}
            required={field.required}
          />
        );
    }
  };

  // สร้าง columns สำหรับ table
  const columns = currentTableConfig ? [
    ...currentTableConfig.columns.map(col => ({
      header: col.header,
      accessorKey: col.accessorKey,
      cell: ({ getValue, row }: { getValue: () => unknown; row: { original: TableData } }) => {
        const value = getValue();
        if (col.cell) {
          return col.cell(value, row.original);
        }
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="truncate max-w-[120px] block">{String(value || '')}</span>
              </TooltipTrigger>
              <TooltipContent>{String(value || '')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }
    })),
    {
      header: "จัดการ",
      id: "actions",
      cell: ({ row }: { row: { original: TableData } }) => (
        <div className="flex gap-1 justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => openViewDialog(row.original)}>
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>ดูรายละเอียด</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="ghost" onClick={() => openEditDialog(row.original)}>
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>แก้ไข</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="destructive" onClick={() => openDeleteDialog(row.original)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>ลบ</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
      enableSorting: false,
    }
  ] : [];

  const table = useReactTable({
    data,
    columns,
    state: { sorting, columnFilters, globalFilter },
    onColumnFiltersChange: setColumnFilters,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false,
    globalFilterFn: globalStringFilter,
  });

  // Pagination logic
  const filteredRows = table.getFilteredRowModel().rows;
  const paginatedData = filteredRows.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            จัดการฐานข้อมูล
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Table Selector */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Select value={activeTable} onValueChange={setActiveTable}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        {currentTableConfig && <currentTableConfig.icon className="h-4 w-4" />}
                        <span>{currentTableConfig?.displayName || 'เลือกตาราง'}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TABLE_CONFIGS.map((config) => (
                      <SelectItem key={config.name} value={config.name}>
                        <div className="flex items-center gap-2">
                          <config.icon className="h-4 w-4" />
                          <span>{config.displayName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Badge variant="outline">{filteredRows.length} รายการ</Badge>
              </div>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="ค้นหา..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full sm:w-64"
                  />
                  <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                <Button onClick={openAddDialog} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  เพิ่ม
                </Button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-white shadow">
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id} className="bg-muted/50">
                    {headerGroup.headers.map(header => (
                      <TableHead
                        key={header.id}
                        className="relative h-10 border-t select-none text-center"
                        aria-sort={
                          header.column.getIsSorted() === "asc"
                            ? "ascending"
                            : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : "none"
                        }
                      >
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <div
                            className="flex h-full cursor-pointer items-center justify-between gap-2 select-none"
                            onClick={header.column.getToggleSortingHandler()}
                            tabIndex={header.column.getCanSort() ? 0 : undefined}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {{
                              asc: <ChevronUpIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                              desc: <ChevronDownIcon className="shrink-0 opacity-60" size={16} aria-hidden="true" />,
                            }[header.column.getIsSorted() as string] ?? (
                              <span className="size-4" aria-hidden="true" />
                            )}
                          </div>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                      กำลังโหลดข้อมูล...
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length ? (
                  paginatedData.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center">
                      ไม่พบข้อมูล
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center gap-2 mt-2">
            {/* Left: Page size selector */}
            <div>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
                className="h-8 rounded-md px-3 text-xs border bg-background inline-flex items-center"
              >
                {[10, 20, 50].map(size => (
                  <option key={size} value={size}>{size} ต่อหน้า</option>
                ))}
              </select>
            </div>
            {/* Right: Pagination */}
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>ก่อนหน้า</Button>
              <span className="text-sm">หน้า {page + 1} / {Math.max(1, Math.ceil(filteredRows.length / pageSize))}</span>
              <Button size="sm" variant="outline" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * pageSize >= filteredRows.length}>ถัดไป</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setFormData({});
          setActionLoading(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>เพิ่ม {currentTableConfig?.displayName}</DialogTitle>
            <DialogDescription>
              กรอกข้อมูลเพื่อเพิ่มรายการใหม่
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentTableConfig?.fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium">{field.label}</label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setFormData({});
              setActionLoading(false);
            }} disabled={actionLoading}>
              ยกเลิก
            </Button>
            <Button onClick={handleAdd} disabled={actionLoading}>
              {actionLoading ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        if (!open) {
          setShowEditDialog(false);
          setSelectedRecord(null);
          setFormData({});
          setActionLoading(false);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>แก้ไข {currentTableConfig?.displayName}</DialogTitle>
            <DialogDescription>
              แก้ไขข้อมูลรายการที่เลือก
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {currentTableConfig?.fields.map((field) => (
              <div key={field.name}>
                <label className="text-sm font-medium">{field.label}</label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false);
              setSelectedRecord(null);
              setFormData({});
              setActionLoading(false);
            }} disabled={actionLoading}>
              ยกเลิก
            </Button>
            <Button onClick={handleEdit} disabled={actionLoading}>
              {actionLoading ? 'กำลังบันทึก...' : 'บันทึก'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={(open) => {
        if (!open) {
          setShowDeleteDialog(false);
          setSelectedRecord(null);
          setActionLoading(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-red-600">ยืนยันการลบ</DialogTitle>
            <DialogDescription>
              คุณต้องการลบรายการนี้ใช่หรือไม่? การดำเนินการนี้ไม่สามารถยกเลิกได้
            </DialogDescription>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-3">
              {currentTableConfig?.columns.map((col) => (
                <div key={col.accessorKey}>
                  <span className="font-bold text-black">{col.header}:</span>
                  <span className="text-blue-700 ml-2">
                    {col.cell ? col.cell(selectedRecord[col.accessorKey], selectedRecord) : String(selectedRecord[col.accessorKey] || '')}
                  </span>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowDeleteDialog(false);
              setSelectedRecord(null);
              setActionLoading(false);
            }} disabled={actionLoading}>
              ยกเลิก
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? 'กำลังลบ...' : 'ลบ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ดูรายละเอียด {currentTableConfig?.displayName}</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              {currentTableConfig?.fields.map((field) => (
                <div key={field.name}>
                  <label className="text-sm font-medium">{field.label}</label>
                  <p className="text-sm text-muted-foreground">
                    {field.type === 'password' ? '••••••••' : String(selectedRecord[field.name] || 'ไม่ระบุ')}
                  </p>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (!selectedRecord) return;
                const text = currentTableConfig?.fields.map(field => 
                  `${field.label}: ${field.type === 'password' ? '••••••••' : String(selectedRecord[field.name] || 'ไม่ระบุ')}`
                ).join('\n');
                if (text) {
                  navigator.clipboard.writeText(text);
                  toast.success('คัดลอกข้อมูลเรียบร้อย');
                }
              }}
              className="flex items-center gap-2"
            >
              <CopyIcon className="h-4 w-4" />
              คัดลอกข้อมูล
            </Button>
            <Button variant="outline" onClick={() => setShowViewDialog(false)}>
              ปิด
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 