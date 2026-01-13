'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { IconTrendingUp } from '@tabler/icons-react';
import {
    Search,
    Filter,
    CreditCard,
    Receipt,
    DollarSign,
    TrendingUp,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { paymentsApi, bookingsApi, statsApi } from '@/lib/api';
import type { Payment, Booking } from '@/types';
import type { DashboardStats } from '@/lib/api/endpoints';

const PAYMENT_STATUS_COLORS: Record<string, string> = {
    completed: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
    failed: 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30',
    pending: '',
    refunded: '',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    transfer: 'Bank Transfer',
    pos: 'POS',
};

export default function PaymentsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [paymentsData, bookingsData, statsData] = await Promise.all([
                paymentsApi.list(),
                bookingsApi.list(),
                statsApi.getDashboard(),
            ]);
            setPayments(paymentsData);
            setBookings(bookingsData.items);
            setDashboardStats(statsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load payments');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredPayments = payments.filter((payment) => {
        const matchesSearch =
            payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Use backend-calculated stats for revenue
    const todaysRevenue = dashboardStats?.revenue_today ?? 0;
    const totalRevenue = dashboardStats?.total_revenue ?? 0;
    const totalTransactions = payments.length;
    const pendingPayments = payments.filter((p) => p.status === 'pending').length;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Today&apos;s Revenue</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            ₦{todaysRevenue.toLocaleString()}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-emerald-400">
                                Today
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Collected today
                        </div>
                        <div className="text-muted-foreground">
                            All payment methods
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Revenue</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            ₦{totalRevenue.toLocaleString()}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                All Time
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Total collected
                        </div>
                        <div className="text-muted-foreground">
                            Completed payments
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Transactions</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {totalTransactions}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                All
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            All transactions
                        </div>
                        <div className="text-muted-foreground">
                            All statuses
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Pending Payments</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {pendingPayments}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                Pending
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Awaiting confirmation
                        </div>
                        <div className="text-muted-foreground">
                            Needs attention
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-xs">
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>{filteredPayments.length} transactions found</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search payments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Receipt #</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredPayments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                            No payments found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell className="font-mono text-sm">
                                                {payment.receipt_number || payment.id.slice(0, 8)}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                ₦{Number(payment.amount).toLocaleString()}
                                            </TableCell>
                                            <TableCell>
                                                {PAYMENT_METHOD_LABELS[payment.payment_method] || payment.payment_method}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={['completed', 'failed'].includes(payment.status) ? 'default' : 'outline'}
                                                    className={PAYMENT_STATUS_COLORS[payment.status] || ''}
                                                >
                                                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {payment.processed_at ? format(new Date(payment.processed_at), 'MMM d, yyyy HH:mm') : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
