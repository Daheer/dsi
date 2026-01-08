'use client';

import { useEffect, useState } from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import {
    Plus,
    Search,
    MoreHorizontal,
    Pencil,
    Trash2,
    Loader2,
    Users,
    UserPlus,
    Mail,
    Phone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { guestsApi, bookingsApi } from '@/lib/api';
import type { Guest, GuestCreate, Booking } from '@/types';

export default function GuestsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewGuestDialog, setShowNewGuestDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newGuest, setNewGuest] = useState<Partial<GuestCreate>>({
        full_name: '',
        email: '',
        phone: '',
        id_type: 'national_id',
        id_number: '',
        address: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [guestsData, bookingsData] = await Promise.all([
                guestsApi.list(),
                bookingsApi.list(),
            ]);
            setGuests(guestsData);
            setBookings(bookingsData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to load guests');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateGuest = async () => {
        if (!newGuest.full_name || !newGuest.phone) {
            toast.error('Please fill in required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            await guestsApi.create(newGuest as GuestCreate);
            toast.success('Guest created successfully');
            setShowNewGuestDialog(false);
            setNewGuest({ full_name: '', email: '', phone: '', id_type: 'national_id', id_number: '', address: '' });
            fetchData();
        } catch (error) {
            console.error('Failed to create guest:', error);
            toast.error('Failed to create guest');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await guestsApi.delete(id);
            toast.success('Guest deleted');
            fetchData();
        } catch (error) {
            console.error('Failed to delete guest:', error);
            toast.error('Failed to delete guest');
        }
    };

    const filteredGuests = guests.filter((guest) =>
        guest.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.phone?.includes(searchTerm)
    );

    const totalGuests = guests.length;
    const activeGuests = bookings.filter((b) => b.status === 'checked_in').length;

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Guests</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {totalGuests}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                All Time
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">Registered guests</div>
                        <div className="text-muted-foreground">In guest database</div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Currently In Hotel</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {activeGuests}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-emerald-400">
                                Active
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">Checked-in guests</div>
                        <div className="text-muted-foreground">Currently staying</div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Bookings</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {bookings.length}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                All
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">Guest reservations</div>
                        <div className="text-muted-foreground">All time</div>
                    </CardFooter>
                </Card>
            </div>

            <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Guests</CardTitle>
                        <CardDescription>{filteredGuests.length} guests found</CardDescription>
                    </div>
                    <Dialog open={showNewGuestDialog} onOpenChange={setShowNewGuestDialog}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Guest
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Register New Guest</DialogTitle>
                                <DialogDescription>Add a new guest to the system.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Full Name *</Label>
                                    <Input
                                        placeholder="John Doe"
                                        value={newGuest.full_name}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Email</Label>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={newGuest.email}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, email: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Phone *</Label>
                                        <Input
                                            placeholder="+234..."
                                            value={newGuest.phone}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>ID Type</Label>
                                        <Input
                                            placeholder="National ID"
                                            value={newGuest.id_type}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, id_type: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>ID Number</Label>
                                        <Input
                                            placeholder="ID number"
                                            value={newGuest.id_number}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, id_number: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Address</Label>
                                    <Input
                                        placeholder="Address"
                                        value={newGuest.address}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, address: e.target.value })}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowNewGuestDialog(false)}>Cancel</Button>
                                <Button onClick={handleCreateGuest} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Register Guest
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="mb-4">
                        <div className="relative max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search guests..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {filteredGuests.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                No guests found
                            </div>
                        ) : (
                            filteredGuests.map((guest) => (
                                <Card key={guest.id} className="relative">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">{guest.full_name}</CardTitle>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(guest.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        {guest.email && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Mail className="h-4 w-4" />
                                                {guest.email}
                                            </div>
                                        )}
                                        {guest.phone && (
                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="h-4 w-4" />
                                                {guest.phone}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
