'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
    Search,
    Filter,
    FileText,
    User,
    Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { auditApi } from '@/lib/api';
import type { AuditLog } from '@/types';

const ENTITY_TYPES = ['user', 'room', 'guest', 'booking', 'payment', 'housekeeping', 'kitchen'];

const ACTION_COLORS: Record<string, string> = {
    create: 'bg-emerald-500/20 text-emerald-400',
    update: 'bg-blue-500/20 text-blue-400',
    delete: 'bg-rose-500/20 text-rose-400',
    login: 'bg-amber-500/20 text-amber-400',
    logout: 'bg-slate-500/20 text-slate-400',
};

export default function AuditPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [entityFilter, setEntityFilter] = useState<string>('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const data = await auditApi.getLogs({ limit: 100 });
            setLogs(data);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
            toast.error('Failed to load audit logs');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch =
            log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.entity_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.action.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
        return matchesSearch && matchesEntity;
    });

    const getActionColor = (action: string) => {
        const lowerAction = action.toLowerCase();
        for (const [key, value] of Object.entries(ACTION_COLORS)) {
            if (lowerAction.includes(key)) {
                return value;
            }
        }
        return 'bg-slate-500/20 text-slate-400';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground">Track all system activities and changes</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Total Logs</p>
                            <p className="text-3xl font-bold">{logs.length}</p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20">
                            <FileText className="h-6 w-6 text-primary" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Today&apos;s Activity</p>
                            <p className="text-3xl font-bold">
                                {logs.filter(l => l.created_at.startsWith(new Date().toISOString().split('T')[0])).length}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                            <Calendar className="h-6 w-6 text-emerald-500" />
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center justify-between p-6">
                        <div>
                            <p className="text-sm text-muted-foreground">Unique Users</p>
                            <p className="text-3xl font-bold">
                                {new Set(logs.map(l => l.user_id).filter(Boolean)).size}
                            </p>
                        </div>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                            <User className="h-6 w-6 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="flex flex-col gap-4 p-4 md:flex-row md:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select value={entityFilter} onValueChange={setEntityFilter}>
                        <SelectTrigger className="w-[180px]">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter entity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Entities</SelectItem>
                            {ENTITY_TYPES.map((type) => (
                                <SelectItem key={type} value={type} className="capitalize">
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Logs Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Activity Log</CardTitle>
                    <CardDescription>
                        {filteredLogs.length} log entries
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="h-16 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Timestamp</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Action</TableHead>
                                    <TableHead>Entity</TableHead>
                                    <TableHead>Entity ID</TableHead>
                                    <TableHead>Details</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLogs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                            No audit logs found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-sm">
                                                {format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss')}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {log.user_id?.slice(0, 8) || 'System'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={getActionColor(log.action)}>
                                                    {log.action}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="capitalize">
                                                {log.entity_type}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                {log.entity_id?.slice(0, 8) || '-'}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate text-muted-foreground">
                                                {log.details ? JSON.stringify(log.details).slice(0, 50) : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
