'use client';

import { useEffect, useState } from 'react';
import {
    ChefHat,
    Clock,
    CheckCircle,
    Flame,
    UtensilsCrossed,
    Play,
    Check,
    Truck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { kitchenApi, bookingsApi } from '@/lib/api';
import type { MealOrder, Booking } from '@/types';

const ORDER_STATUS_COLORS: Record<string, string> = {
    ordered: '',
    preparing: '',
    ready: 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30',
    delivered: '',
};

export default function KitchenPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [orders, setOrders] = useState<MealOrder[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [ordersData, bookingsData] = await Promise.all([
                kitchenApi.listOrders(),
                bookingsApi.list(),
            ]);
            setOrders(ordersData);
            setBookings(bookingsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateStatus = async (orderId: string, status: string) => {
        try {
            await kitchenApi.updateOrder(orderId, { status: status as 'ordered' | 'preparing' | 'ready' | 'delivered' });
            toast.success('Order updated');
            fetchData();
        } catch (error) {
            console.error('Failed to update order:', error);
            toast.error('Failed to update order');
        }
    };

    // Group orders by status using correct enum values
    const orderedOrders = orders.filter((o) => o.status === 'ordered');
    const preparingOrders = orders.filter((o) => o.status === 'preparing');
    const readyOrders = orders.filter((o) => o.status === 'ready');
    const deliveredOrders = orders.filter((o) => o.status === 'delivered');

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


            <div className="grid gap-6 lg:grid-cols-4">
                <Card className="shadow-xs">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                New Orders
                            </CardTitle>
                            <Badge variant="outline">{orderedOrders.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {orderedOrders.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No new orders</p>
                        ) : (
                            orderedOrders.map((order) => (
                                <Card key={order.id} className="border">
                                    <CardContent className="p-3">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">{order.meal_type}</p>
                                            {order.notes && <p className="text-xs text-muted-foreground">{order.notes}</p>}
                                            <Button size="sm" className="w-full" variant="outline" onClick={() => handleUpdateStatus(order.id, 'preparing')}>
                                                <Play className="mr-1 h-3 w-3" />
                                                Start Cooking
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-xs">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                Preparing
                            </CardTitle>
                            <Badge variant="outline">{preparingOrders.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {preparingOrders.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">Nothing cooking</p>
                        ) : (
                            preparingOrders.map((order) => (
                                <Card key={order.id} className="border border-orange-500/30">
                                    <CardContent className="p-3">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">{order.meal_type}</p>
                                            {order.notes && <p className="text-xs text-muted-foreground">{order.notes}</p>}
                                            <Button size="sm" className="w-full" onClick={() => handleUpdateStatus(order.id, 'ready')}>
                                                <Check className="mr-1 h-3 w-3" />
                                                Mark Ready
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-xs">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                Ready
                            </CardTitle>
                            <Badge variant="outline">{readyOrders.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {readyOrders.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No orders ready</p>
                        ) : (
                            readyOrders.map((order) => (
                                <Card key={order.id} className="border border-emerald-500/30">
                                    <CardContent className="p-3">
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">{order.meal_type}</p>
                                            {order.notes && <p className="text-xs text-muted-foreground">{order.notes}</p>}
                                            <Button size="sm" className="w-full" variant="outline" onClick={() => handleUpdateStatus(order.id, 'delivered')}>
                                                <Truck className="mr-1 h-3 w-3" />
                                                Delivered
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>

                <Card className="shadow-xs">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-base">
                                Delivered
                            </CardTitle>
                            <Badge variant="outline">{deliveredOrders.length}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {deliveredOrders.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">No deliveries</p>
                        ) : (
                            deliveredOrders.slice(0, 5).map((order) => (
                                <Card key={order.id} className="border border-blue-500/30">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium">{order.meal_type}</p>
                                            <Badge variant="outline">Done</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
