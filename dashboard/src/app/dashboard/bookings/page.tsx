'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    LogIn,
    LogOut as LogOutIcon,
    Loader2,
    UserPlus,
    X,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { bookingsApi, guestsApi, roomsApi } from '@/lib/api';
import { BOOKING_STATUS_COLORS, BOOKING_STATUS_LABELS } from '@/lib/constants';
import type { Booking, Guest, Room, RoomType, BookingCreate, GuestCreate, BookingUpdate } from '@/types';
import { CheckInModal } from '@/components/check-in-modal';
import { useDebounce } from '@/hooks/use-debounce';

// Helper to extract error message from API errors
const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
        return error.message || fallback;
    }
    return fallback;
};

export default function BookingsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    
    // Pagination & Sorting State
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [sortBy, setSortBy] = useState('created_at');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    
    // Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebounce(searchTerm, 500);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
    const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
    
    // Data State
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [totalBookings, setTotalBookings] = useState(0);
    const [guests, setGuests] = useState<Guest[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

    // Dialogs
    const [showNewBookingDialog, setShowNewBookingDialog] = useState(false);
    const [showViewDialog, setShowViewDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showCheckInDialog, setShowCheckInDialog] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingSpecificBooking, setLoadingSpecificBooking] = useState(false);

    // New Booking State
    const [guestTab, setGuestTab] = useState<'search' | 'create'>('search');
    const [guestSearchId, setGuestSearchId] = useState('');
    const [searchedGuest, setSearchedGuest] = useState<Guest | null>(null);
    const [guestSearchLoading, setGuestSearchLoading] = useState(false);
    const [newGuest, setNewGuest] = useState<Partial<GuestCreate>>({
        full_name: '',
        email: '',
        phone: '',
        id_type: '',
        id_number: '',
        address: '',
    });
    const [newBooking, setNewBooking] = useState<Partial<BookingCreate>>({
        guest_id: '',
        room_type_id: '',  // Required for soft allocation
        room_id: '',  // Optional - specific room assignment
        check_in_date: '',
        check_out_date: '',
        total_amount: 0,
        notes: '',
    });

    // Edit Booking State
    const [editBooking, setEditBooking] = useState<Partial<BookingUpdate>>({});

    // Fetch bookings with pagination, sorting, and filters
    useEffect(() => {
        fetchBookings();
    }, [page, pageSize, sortBy, order, debouncedSearch, statusFilter, paymentStatusFilter]);

    // Fetch guests, rooms, and room types (only once)
    useEffect(() => {
        fetchStaticData();
    }, []);

    // Handle URL parameter for auto-opening booking modal (from notifications)
    useEffect(() => {
        const viewBookingId = searchParams.get('view_booking_id');

        if (viewBookingId && !isLoading) {
            loadSpecificBooking(viewBookingId);
        }
    }, [searchParams, isLoading]);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            const response = await bookingsApi.list({
                skip: (page - 1) * pageSize,
                limit: pageSize,
                sort_by: sortBy,
                order: order,
                search: debouncedSearch || undefined,
                status: statusFilter !== 'all' ? statusFilter as any : undefined,
                payment_status: paymentStatusFilter !== 'all' ? paymentStatusFilter as any : undefined,
            });
            setBookings(response.items);
            setTotalBookings(response.total);
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
            toast.error(getErrorMessage(error, 'Failed to load bookings'));
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStaticData = async () => {
        try {
            const [guestsData, roomsData, roomTypesData] = await Promise.all([
                guestsApi.list(),
                roomsApi.list(),
                roomsApi.listTypes(),
            ]);
            setGuests(guestsData);
            setRooms(roomsData);
            setRoomTypes(roomTypesData);
        } catch (error) {
            console.error('Failed to fetch static data:', error);
            toast.error(getErrorMessage(error, 'Failed to load data'));
        }
    };

    const loadSpecificBooking = async (bookingId: string) => {
        try {
            setLoadingSpecificBooking(true);
            const booking = await bookingsApi.get(bookingId);
            setSelectedBooking(booking);
            setShowViewDialog(true);
        } catch (error) {
            console.error('Failed to load booking:', error);
            toast.error(getErrorMessage(error, 'Booking not found'));
        } finally {
            setLoadingSpecificBooking(false);
        }
    };

    // Check if a room has overlapping bookings for given dates
    const hasOverlappingBooking = (roomId: string, checkIn: string, checkOut: string, excludeBookingId?: string) => {
        return bookings.some((b) => {
            if (b.room_id !== roomId) return false;
            if (excludeBookingId && b.id === excludeBookingId) return false;
            if (b.status === 'cancelled' || b.status === 'checked_out' || b.status === 'expired') return false;

            const existingStart = new Date(b.check_in_date);
            const existingEnd = new Date(b.check_out_date);
            const newStart = new Date(checkIn);
            const newEnd = new Date(checkOut);

            // Check overlap: new booking starts before existing ends AND new booking ends after existing starts
            return newStart < existingEnd && newEnd > existingStart;
        });
    };

    // Get available rooms for selected dates
    const getAvailableRooms = (checkIn: string, checkOut: string, excludeBookingId?: string) => {
        if (!checkIn || !checkOut) return rooms;
        return rooms.filter((room) => !hasOverlappingBooking(room.id, checkIn, checkOut, excludeBookingId));
    };

    const handleSearchGuest = async () => {
        if (!guestSearchId.trim()) {
            toast.error('Please enter an ID number');
            return;
        }
        setGuestSearchLoading(true);
        try {
            const searchResults = await guestsApi.list({ search: guestSearchId.trim() });
            const found = searchResults.find((g) => g.id_number === guestSearchId.trim());
            if (found) {
                setSearchedGuest(found);
                setNewBooking({ ...newBooking, guest_id: found.id });
                toast.success('Guest found!');
            } else {
                setSearchedGuest(null);
                toast.info('No guest found with this ID number');
            }
        } catch (error) {
            console.error('Guest search failed:', error);
            toast.error(getErrorMessage(error, 'Failed to search for guest'));
        } finally {
            setGuestSearchLoading(false);
        }
    };

    const handleCreateGuest = async () => {
        if (!newGuest.full_name || !newGuest.id_number) {
            toast.error('Please fill in required guest fields');
            return null;
        }
        try {
            const createdGuest = await guestsApi.create(newGuest as GuestCreate);
            setGuests([...guests, createdGuest]);
            return createdGuest;
        } catch (error) {
            console.error('Failed to create guest:', error);
            toast.error(getErrorMessage(error, 'Failed to create guest'));
            return null;
        }
    };

    const handleCreateBooking = async () => {
        let bookingPayload: BookingCreate;

        if (guestTab === 'create') {
            if (!newGuest.full_name || !newGuest.id_number) {
                toast.error('Please fill in required guest fields');
                return;
            }
            bookingPayload = {
                ...newBooking,
                guest_id: undefined,
                guest_details: newGuest as GuestCreate,
                // Ensure required fields are set
                room_type_id: newBooking.room_type_id || '',
                room_id: newBooking.room_id || undefined,  // Optional for soft allocation
                check_in_date: newBooking.check_in_date || '',
                check_out_date: newBooking.check_out_date || '',
                total_amount: newBooking.total_amount || 0,
            } as BookingCreate;
        } else {
            // Using existing guest
            bookingPayload = {
                ...newBooking,
                guest_id: newBooking.guest_id || undefined,
                room_type_id: newBooking.room_type_id || '',
                room_id: newBooking.room_id || undefined,  // Optional for soft allocation
                check_in_date: newBooking.check_in_date || '',
                check_out_date: newBooking.check_out_date || '',
                total_amount: newBooking.total_amount || 0,
            } as BookingCreate;
        }

        // Validation: room_type_id is required (soft allocation)
        if ((!bookingPayload.guest_id && !bookingPayload.guest_details) || !bookingPayload.room_type_id || !bookingPayload.check_in_date || !bookingPayload.check_out_date) {
            toast.error('Please fill in all required fields (Guest, Room Type, and Dates)');
            return;
        }

        // Validate dates: check-in cannot be in the past
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (new Date(bookingPayload.check_in_date) < today) {
            toast.error('Check-in date cannot be in the past');
            return;
        }

        // Validate dates: check-in must be before check-out
        if (new Date(bookingPayload.check_in_date) >= new Date(bookingPayload.check_out_date)) {
            toast.error('Check-in date must be before check-out date');
            return;
        }

        // Check for overlapping bookings only if specific room is assigned
        // For soft allocation (room_id not provided), backend handles availability check
        if (bookingPayload.room_id && hasOverlappingBooking(bookingPayload.room_id, bookingPayload.check_in_date, bookingPayload.check_out_date)) {
            toast.error('This room is already booked for the selected dates');
            return;
        }

        setIsSubmitting(true);
        try {
            await bookingsApi.create(bookingPayload);
            toast.success('Booking created successfully');
            resetNewBookingForm();
            setShowNewBookingDialog(false);
            fetchBookings();
        } catch (error) {
            console.error('Failed to create booking:', error);
            toast.error(getErrorMessage(error, 'Failed to create booking'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetNewBookingForm = () => {
        setNewBooking({ guest_id: '', room_type_id: '', room_id: '', check_in_date: '', check_out_date: '', total_amount: 0, notes: '' });
        setNewGuest({ full_name: '', email: '', phone: '', id_type: '', id_number: '', address: '' });
        setSearchedGuest(null);
        setGuestSearchId('');
        setGuestTab('search');
    };

    const handleViewBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setShowViewDialog(true);
    };

    const handleCloseViewDialog = () => {
        setShowViewDialog(false);
        setSelectedBooking(null);

        // Clear URL parameter if present (from notification navigation)
        if (searchParams.get('view_booking_id')) {
            router.replace('/dashboard/bookings', { scroll: false });
        }
    };

    const handleEditBooking = (booking: Booking) => {
        setSelectedBooking(booking);
        setEditBooking({
            check_in_date: booking.check_in_date,
            check_out_date: booking.check_out_date,
            room_type_id: booking.room_type_id,
            room_id: booking.room_id || undefined,
            total_amount: Number(booking.total_amount),
            notes: booking.notes,
        });
        setShowEditDialog(true);
    };

    const handleUpdateBooking = async () => {
        if (!selectedBooking) return;

        if (editBooking.check_in_date && editBooking.check_out_date) {
            // Validate dates: check-in must be before check-out
            if (new Date(editBooking.check_in_date) >= new Date(editBooking.check_out_date)) {
                toast.error('Check-in date must be before check-out date');
                return;
            }
        }

        // Check for overlapping bookings only if specific room is assigned
        // For soft allocation (room_id not provided), backend handles availability check
        if (editBooking.room_id && editBooking.check_in_date && editBooking.check_out_date) {
            if (hasOverlappingBooking(editBooking.room_id, editBooking.check_in_date, editBooking.check_out_date, selectedBooking.id)) {
                toast.error('This room is already booked for the selected dates');
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await bookingsApi.update(selectedBooking.id, editBooking);
            toast.success('Booking updated successfully');
            setShowEditDialog(false);
            setSelectedBooking(null);
            fetchBookings();
        } catch (error) {
            console.error('Failed to update booking:', error);
            toast.error(getErrorMessage(error, 'Failed to update booking'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancelBooking = async (bookingId: string) => {
        await toast.promise(
            bookingsApi.update(bookingId, { status: 'cancelled' }).then(() => fetchData()),
            {
                loading: 'Cancelling booking...',
                success: 'Booking cancelled successfully',
                error: (err) => getErrorMessage(err, 'Failed to cancel booking'),
            }
        );
    };

    const handleCheckIn = (booking: Booking) => {
        console.log('Check In clicked for booking:', booking.id, 'Status:', booking.status);
        setSelectedBooking(booking);
        setShowCheckInDialog(true);
    };

    const handleCheckOut = async (bookingId: string) => {
        await toast.promise(
            bookingsApi.checkOut(bookingId).then(() => fetchData()),
            {
                loading: 'Checking out guest...',
                success: 'Guest checked out successfully!',
                error: (err) => getErrorMessage(err, 'Failed to check out guest'),
            }
        );
    };

    // Handle sorting
    const handleSort = (field: string) => {
        if (sortBy === field) {
            setOrder(order === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setOrder('desc');
        }
        setPage(1); // Reset to first page on sort
    };

    // Calculate pagination
    const totalPages = Math.ceil(totalBookings / pageSize);
    const canGoPrevious = page > 1;
    const canGoNext = page < totalPages;

    const getGuestName = (guestId: string) => guests.find((g) => g.id === guestId)?.full_name || 'Unknown';
    const getGuest = (guestId: string) => guests.find((g) => g.id === guestId);
    const getRoomNumber = (roomId?: string) => {
        if (!roomId) return 'Not Assigned';
        return rooms.find((r) => r.id === roomId)?.room_number || 'Unknown';
    };
    const getRoom = (roomId: string) => rooms.find((r) => r.id === roomId);

    // Calculate stats (using all bookings - we'd need a separate stats endpoint for accuracy)
    // For now, using current page data as approximation
    const today = new Date().toISOString().split('T')[0];
    const todaysCheckins = bookings.filter((b) => b.check_in_date === today && (b.status === 'reserved' || b.status === 'confirmed')).length;
    const todaysCheckouts = bookings.filter((b) => b.check_out_date === today && b.status === 'checked_in').length;
    const activeBookings = bookings.filter((b) => b.status === 'checked_in').length;

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
                        <CardDescription>Total Bookings</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {bookings.length}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">All Time</Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {activeBookings} currently active
                        </div>
                        <div className="text-muted-foreground">
                            Guests in hotel
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Today&apos;s Check-ins</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {todaysCheckins}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">Arriving</Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Ready for check-in
                        </div>
                        <div className="text-muted-foreground">
                            Reserved guests
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Today&apos;s Check-outs</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {todaysCheckouts}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">Departing</Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Pending checkout
                        </div>
                        <div className="text-muted-foreground">
                            Checked-in guests
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Pending Bookings</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {bookings.filter((b) => b.status === 'reserved' || b.status === 'confirmed').length}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">Reserved</Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Upcoming arrivals
                        </div>
                        <div className="text-muted-foreground">
                            Awaiting check-in
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Bookings</CardTitle>
                        <CardDescription>{totalBookings} bookings found</CardDescription>
                    </div>
                    <Dialog open={showNewBookingDialog} onOpenChange={(open) => {
                        setShowNewBookingDialog(open);
                        if (!open) resetNewBookingForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                New Booking
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>Create New Booking</DialogTitle>
                                <DialogDescription>
                                    Search for an existing guest or create a new guest profile.
                                </DialogDescription>
                            </DialogHeader>

                            <Tabs value={guestTab} onValueChange={(v) => setGuestTab(v as 'search' | 'create')}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="search">Search Guest</TabsTrigger>
                                    <TabsTrigger value="create">New Guest</TabsTrigger>
                                </TabsList>

                                <TabsContent value="search" className="space-y-4">
                                    <div className="flex gap-2">
                                        <div className="flex-1">
                                            <Label>Search by ID Number</Label>
                                            <Input
                                                placeholder="Enter ID number (NIN, Passport, etc.)"
                                                value={guestSearchId}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuestSearchId(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSearchGuest}
                                            disabled={guestSearchLoading}
                                            className="mt-6"
                                        >
                                            {guestSearchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                        </Button>
                                    </div>

                                    {searchedGuest && (
                                        <div className="rounded-lg border bg-muted/50 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{searchedGuest.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">{searchedGuest.email} • {searchedGuest.phone}</p>
                                                    <p className="text-xs text-muted-foreground">ID: {searchedGuest.id_type} - {searchedGuest.id_number}</p>
                                                </div>
                                                <Badge variant="secondary">Selected</Badge>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="create" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Full Name *</Label>
                                            <Input
                                                value={newGuest.full_name}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, full_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={newGuest.email}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, email: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Phone</Label>
                                            <Input
                                                value={newGuest.phone}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>ID Type</Label>
                                            <Select
                                                value={newGuest.id_type}
                                                onValueChange={(value: string) => setNewGuest({ ...newGuest, id_type: value })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select ID type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="nin">NIN</SelectItem>
                                                    <SelectItem value="passport">Passport</SelectItem>
                                                    <SelectItem value="drivers_license">Driver&apos;s License</SelectItem>
                                                    <SelectItem value="voters_card">Voter&apos;s Card</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>ID Number *</Label>
                                            <Input
                                                value={newGuest.id_number}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, id_number: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Address</Label>
                                            <Input
                                                value={newGuest.address}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewGuest({ ...newGuest, address: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <Separator />

                            <div className="grid gap-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Check-in Date *</Label>
                                        <Input
                                            type="date"
                                            value={newBooking.check_in_date}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBooking({ ...newBooking, check_in_date: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Check-out Date *</Label>
                                        <Input
                                            type="date"
                                            value={newBooking.check_out_date}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBooking({ ...newBooking, check_out_date: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Room Type *</Label>
                                    <Select
                                        value={newBooking.room_type_id}
                                        onValueChange={(value: string) => {
                                            setNewBooking({ ...newBooking, room_type_id: value, room_id: '' }); // Clear room_id when type changes
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a room type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {roomTypes.map((roomType) => (
                                                <SelectItem key={roomType.id} value={roomType.id}>
                                                    {roomType.name} - ₦{Number(roomType.base_price).toLocaleString()}/night
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        Room will be assigned at check-in (soft allocation)
                                    </p>
                                </div>

                                <div className="grid gap-2">
                                    <Label>Specific Room (Optional)</Label>
                                    <Select
                                        value={newBooking.room_id || 'none'}
                                        onValueChange={(value: string) => setNewBooking({ ...newBooking, room_id: value === 'none' ? '' : value })}
                                        disabled={!newBooking.room_type_id}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Leave empty for soft allocation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">None (Assign at check-in)</SelectItem>
                                            {newBooking.room_type_id && getAvailableRooms(newBooking.check_in_date || '', newBooking.check_out_date || '')
                                                .filter((room) => room.room_type_id === newBooking.room_type_id)
                                                .map((room) => (
                                                    <SelectItem key={room.id} value={room.id}>
                                                        Room {room.room_number} - {room.room_type?.name || 'Standard'}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {newBooking.room_type_id && newBooking.check_in_date && newBooking.check_out_date && (
                                        <p className="text-xs text-muted-foreground">
                                            {getAvailableRooms(newBooking.check_in_date, newBooking.check_out_date)
                                                .filter((room) => room.room_type_id === newBooking.room_type_id).length} available {roomTypes.find(rt => rt.id === newBooking.room_type_id)?.name || 'room'}(s) for selected dates
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label>Total Amount (₦) *</Label>
                                    <Input
                                        type="number"
                                        value={newBooking.total_amount}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBooking({ ...newBooking, total_amount: Number(e.target.value) })}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Notes</Label>
                                    <Input
                                        value={newBooking.notes || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBooking({ ...newBooking, notes: e.target.value })}
                                        placeholder="Any special requests or notes..."
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowNewBookingDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateBooking} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Booking
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {/* Filters Toolbar */}
                    <div className="mb-4 space-y-4">
                        {/* Search and Quick Filters */}
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search by guest name, email, or booking ID..."
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setSearchTerm(e.target.value);
                                        setPage(1); // Reset to first page on search
                                    }}
                                    className="pl-10"
                                />
                            </div>
                            <Select 
                                value={statusFilter} 
                                onValueChange={(value) => {
                                    setStatusFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="reserved">Reserved</SelectItem>
                                    <SelectItem value="confirmed">Confirmed</SelectItem>
                                    <SelectItem value="checked_in">Checked In</SelectItem>
                                    <SelectItem value="checked_out">Checked Out</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                    <SelectItem value="expired">Expired</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select 
                                value={paymentStatusFilter} 
                                onValueChange={(value) => {
                                    setPaymentStatusFilter(value);
                                    setPage(1);
                                }}
                            >
                                <SelectTrigger className="w-[180px]">
                                    <Filter className="mr-2 h-4 w-4" />
                                    <SelectValue placeholder="Payment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payment</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                    <SelectItem value="partial">Partial</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Guest</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('check_in_date')}
                                            className="h-8 px-2 hover:bg-transparent"
                                        >
                                            Check-in
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead>Check-out</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleSort('created_at')}
                                            className="h-8 px-2 hover:bg-transparent"
                                        >
                                            Created At
                                            <ArrowUpDown className="ml-2 h-4 w-4" />
                                        </Button>
                                    </TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-12 text-center">
                                            <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                        </TableCell>
                                    </TableRow>
                                ) : bookings.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="py-12 text-center text-muted-foreground">
                                            No bookings found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    bookings.map((booking) => {
                                        const guest = booking.guest || guests.find((g) => g.id === booking.guest_id);
                                        return (
                                        <TableRow key={booking.id}>
                                            <TableCell className="font-medium">
                                                {guest?.full_name || getGuestName(booking.guest_id)}
                                            </TableCell>
                                            <TableCell>
                                                {booking.room_id ? (
                                                    <>Room {getRoomNumber(booking.room_id)}</>
                                                ) : (
                                                    <span className="text-muted-foreground italic">
                                                        {roomTypes.find(rt => rt.id === booking.room_type_id)?.name || 'Room Type'} (Not Assigned)
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>{format(new Date(booking.check_in_date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>{format(new Date(booking.check_out_date), 'MMM d, yyyy')}</TableCell>
                                            <TableCell>
                                                <Badge className={BOOKING_STATUS_COLORS[booking.status] || ''}>
                                                    {BOOKING_STATUS_LABELS[booking.status] || booking.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>₦{Number(booking.total_amount).toLocaleString()}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(new Date(booking.created_at), 'MMM d, yyyy')}
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            View Details
                                                        </DropdownMenuItem>
                                                        {(booking.status === 'reserved' || booking.status === 'confirmed') && (
                                                            <DropdownMenuItem onClick={() => handleEditBooking(booking)}>
                                                                <Pencil className="mr-2 h-4 w-4" />
                                                                Edit
                                                            </DropdownMenuItem>
                                                        )}
                                                        {(() => {
                                                            // Check-in logic: Allow RESERVED (pay at desk) and CONFIRMED (pre-paid)
                                                            // Room assignment happens in the check-in modal (soft allocation)
                                                            const isCheckInAvailable = 
                                                                (booking.status === 'reserved' || booking.status === 'confirmed') &&
                                                                booking.status !== 'checked_in' &&
                                                                booking.status !== 'cancelled' &&
                                                                booking.status !== 'expired';
                                                            
                                                            // Debug logging
                                                            console.log('Action Debug', { 
                                                                id: booking.id, 
                                                                status: booking.status, 
                                                                available: isCheckInAvailable 
                                                            });
                                                            
                                                            return isCheckInAvailable ? (
                                                                <DropdownMenuItem onClick={() => handleCheckIn(booking)}>
                                                                    <LogIn className="mr-2 h-4 w-4" />
                                                                    Check In
                                                                </DropdownMenuItem>
                                                            ) : null;
                                                        })()}
                                                        {booking.status === 'checked_in' && (
                                                            <DropdownMenuItem onClick={() => handleCheckOut(booking.id)}>
                                                                <LogOutIcon className="mr-2 h-4 w-4" />
                                                                Check Out
                                                            </DropdownMenuItem>
                                                        )}
                                                        {(booking.status === 'reserved' || booking.status === 'confirmed') && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    className="text-destructive"
                                                                    onClick={() => handleCancelBooking(booking.id)}
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Cancel Booking
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                    
                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                                Page {page} of {totalPages} ({totalBookings} total bookings)
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={!canGoPrevious}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={!canGoNext}
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* View Booking Dialog */}
            <Dialog open={showViewDialog} onOpenChange={(open) => {
                if (!open) handleCloseViewDialog();
            }}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Booking Details</DialogTitle>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Status</span>
                                <Badge className={BOOKING_STATUS_COLORS[selectedBooking.status] || ''}>
                                    {BOOKING_STATUS_LABELS[selectedBooking.status] || selectedBooking.status}
                                </Badge>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h4 className="font-medium">Guest Information</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-muted-foreground">Name</span>
                                    <span>{getGuest(selectedBooking.guest_id)?.full_name}</span>
                                    <span className="text-muted-foreground">Email</span>
                                    <span>{getGuest(selectedBooking.guest_id)?.email || 'N/A'}</span>
                                    <span className="text-muted-foreground">Phone</span>
                                    <span>{getGuest(selectedBooking.guest_id)?.phone || 'N/A'}</span>
                                    <span className="text-muted-foreground">ID</span>
                                    <span>{getGuest(selectedBooking.guest_id)?.id_type} - {getGuest(selectedBooking.guest_id)?.id_number || 'N/A'}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-2">
                                <h4 className="font-medium">Booking Information</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <span className="text-muted-foreground">Room</span>
                                    <span>
                                        {selectedBooking.room_id ? (
                                            <>Room {getRoomNumber(selectedBooking.room_id)} ({getRoom(selectedBooking.room_id)?.room_type?.name || 'Standard'})</>
                                        ) : (
                                            <span className="text-muted-foreground italic">
                                                {roomTypes.find(rt => rt.id === selectedBooking.room_type_id)?.name || 'Room Type'} (Not Assigned - Soft Allocation)
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-muted-foreground">Check-in</span>
                                    <span>{format(new Date(selectedBooking.check_in_date), 'EEEE, MMMM d, yyyy')}</span>
                                    <span className="text-muted-foreground">Check-out</span>
                                    <span>{format(new Date(selectedBooking.check_out_date), 'EEEE, MMMM d, yyyy')}</span>
                                    <span className="text-muted-foreground">Total Amount</span>
                                    <span className="font-medium">₦{Number(selectedBooking.total_amount).toLocaleString()}</span>
                                    <span className="text-muted-foreground">Created</span>
                                    <span>{format(new Date(selectedBooking.created_at), 'MMM d, yyyy h:mm a')}</span>
                                </div>
                            </div>

                            {selectedBooking.notes && (
                                <>
                                    <Separator />
                                    <div className="space-y-2">
                                        <h4 className="font-medium">Notes</h4>
                                        <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowViewDialog(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Check-In Modal */}
            <CheckInModal
                open={showCheckInDialog}
                onOpenChange={setShowCheckInDialog}
                booking={selectedBooking}
                guest={selectedBooking ? getGuest(selectedBooking.guest_id) || null : null}
                onSuccess={() => {
                    setSelectedBooking(null);
                    fetchBookings();
                }}
            />

            {/* Edit Booking Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Booking</DialogTitle>
                        <DialogDescription>
                            Update booking details for {selectedBooking && getGuestName(selectedBooking.guest_id)}
                        </DialogDescription>
                    </DialogHeader>
                    {selectedBooking && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Check-in Date</Label>
                                    <Input
                                        type="date"
                                        value={editBooking.check_in_date || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditBooking({ ...editBooking, check_in_date: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Check-out Date</Label>
                                    <Input
                                        type="date"
                                        value={editBooking.check_out_date || ''}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditBooking({ ...editBooking, check_out_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Room Type</Label>
                                <Select
                                    value={editBooking.room_type_id || selectedBooking.room_type_id || ''}
                                    onValueChange={(value: string) => {
                                        setEditBooking({ ...editBooking, room_type_id: value, room_id: undefined });
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a room type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roomTypes.map((roomType) => (
                                            <SelectItem key={roomType.id} value={roomType.id}>
                                                {roomType.name} - ₦{Number(roomType.base_price).toLocaleString()}/night
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Specific Room (Optional)</Label>
                                <Select
                                    value={editBooking.room_id || 'none'}
                                    onValueChange={(value: string) => setEditBooking({ ...editBooking, room_id: value === 'none' ? undefined : value })}
                                    disabled={!editBooking.room_type_id && !selectedBooking.room_type_id}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Leave empty for soft allocation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None (Assign at check-in)</SelectItem>
                                        {getAvailableRooms(
                                            editBooking.check_in_date || selectedBooking.check_in_date,
                                            editBooking.check_out_date || selectedBooking.check_out_date,
                                            selectedBooking.id
                                        )
                                        .filter((room) => room.room_type_id === (editBooking.room_type_id || selectedBooking.room_type_id))
                                        .map((room) => (
                                            <SelectItem key={room.id} value={room.id}>
                                                Room {room.room_number} - {room.room_type?.name || 'Standard'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label>Total Amount (₦)</Label>
                                <Input
                                    type="number"
                                    value={editBooking.total_amount || 0}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditBooking({ ...editBooking, total_amount: Number(e.target.value) })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Notes</Label>
                                <Input
                                    value={editBooking.notes || ''}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditBooking({ ...editBooking, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
                        <Button onClick={handleUpdateBooking} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
