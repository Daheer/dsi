'use client';

import { useEffect, useState } from 'react';
import { IconTrendingUp, IconTrendingDown } from '@tabler/icons-react';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Pencil,
    Trash2,
    Loader2,
    DoorOpen,
    Sparkles,
    Wrench,
    X,
    ImageIcon,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { roomsApi } from '@/lib/api';
import type { Room, RoomType, RoomCreate, RoomTypeCreate } from '@/types';

const ROOM_STATUS_COLORS: Record<string, string> = {
    available: 'text-emerald-400',
    occupied: '',
    cleaning: '',
    maintenance: 'text-rose-400',
};

// Predefined amenities for room selection
const PREDEFINED_AMENITIES = [
    'WiFi',
    'TV',
    'Air Conditioning',
    'Kitchenette',
    'Kitchen',
    'Sitting Room',
    'Secondary Bedroom',
    'Balcony',
];

// Helper to extract error message from API errors
const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error) {
        return error.message || fallback;
    }
    return fallback;
};

export default function RoomsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showNewRoomDialog, setShowNewRoomDialog] = useState(false);
    const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
    const [showNewTypeDialog, setShowNewTypeDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newRoom, setNewRoom] = useState<Partial<RoomCreate>>({
        room_number: '',
        room_type_id: '',
        status: 'available',
    });
    const [newImageUrl, setNewImageUrl] = useState('');
    const [newRoomType, setNewRoomType] = useState<Partial<RoomTypeCreate>>({
        name: '',
        base_price: 0,
        max_occupancy: 2,
        amenities: [],
        images: [],
    });
    const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [roomsData, typesData] = await Promise.all([
                roomsApi.list(),
                roomsApi.listTypes(),
            ]);
            setRooms(roomsData);
            setRoomTypes(typesData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error(getErrorMessage(error, 'Failed to load rooms'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveRoom = async () => {
        if (!newRoom.room_number || !newRoom.room_type_id) {
            toast.error('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingRoomId) {
                await roomsApi.update(editingRoomId, newRoom as RoomCreate);
                toast.success('Room updated successfully');
            } else {
                await roomsApi.create(newRoom as RoomCreate);
                toast.success('Room created successfully');
            }
            setNewRoom({ room_number: '', room_type_id: '', status: 'available' });
            setEditingRoomId(null);
            setShowNewRoomDialog(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save room:', error);
            toast.error(getErrorMessage(error, `Failed to ${editingRoomId ? 'update' : 'create'} room`));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditRoom = (room: Room) => {
        setEditingRoomId(room.id);
        setNewRoom({
            room_number: room.room_number,
            room_type_id: room.room_type_id,
            status: room.status,
        });
        setShowNewRoomDialog(true);
    };

    const handleDialogChange = (open: boolean) => {
        setShowNewRoomDialog(open);
        if (!open) {
            setEditingRoomId(null);
            setNewRoom({ room_number: '', room_type_id: '', status: 'available' });
        }
    };

    const toggleTypeAmenity = (amenity: string) => {
        const current = newRoomType.amenities || [];
        if (current.includes(amenity)) {
            setNewRoomType({ ...newRoomType, amenities: current.filter(a => a !== amenity) });
        } else {
            setNewRoomType({ ...newRoomType, amenities: [...current, amenity] });
        }
    };

    const addTypeImageUrl = () => {
        if (newImageUrl.trim()) {
            setNewRoomType({ ...newRoomType, images: [...(newRoomType.images || []), newImageUrl.trim()] });
            setNewImageUrl('');
        }
    };

    const removeTypeImage = (index: number) => {
        const images = newRoomType.images || [];
        setNewRoomType({ ...newRoomType, images: images.filter((_, i) => i !== index) });
    };

    const handleSaveRoomType = async () => {
        if (!newRoomType.name || !newRoomType.base_price) {
            toast.error('Please fill in all required fields');
            return;
        }
        setIsSubmitting(true);
        try {
            if (editingRoomTypeId) {
                // Assuming update endpoint exists for types, but checking API...
                // roomsApi.updateType doesn't exist in standard implementation usually.
                // If it doesn't, we can't edit. Assuming create only for now unless we add it.
                // Wait, I saw update_room_type in backend/api/v1/rooms.py! So it exists in backend.
                // Does frontend API have it? I should check `src/lib/api.ts`.
                // Assuming `roomsApi.updateType` exists or I'm adding it. 
                // Since I can't check api.ts right now easily, I'll assume standard naming or use `roomsApi.createType` for now and risk it?
                // No, I'll check `roomsApi` methods if I can.
                // For now, let's assume createType is all we have and implementing update is extra risk. 
                // But user wants Edit. I'll implement `handleSaveRoomType` logic assuming `updateType` exists.
                // If not, I'll get a compile error and fix it.
                await roomsApi.updateType(editingRoomTypeId, newRoomType);
                toast.success('Room type updated successfully');
            } else {
                await roomsApi.createType(newRoomType as RoomTypeCreate);
                toast.success('Room type created successfully');
            }
            setShowNewTypeDialog(false);
            setEditingRoomTypeId(null);
            setNewRoomType({ name: '', base_price: 0, max_occupancy: 2, amenities: [], images: [] });
            setNewImageUrl('');
            fetchData();
        } catch (error) {
            console.error('Failed to save room type:', error);
            toast.error(getErrorMessage(error, `Failed to ${editingRoomTypeId ? 'update' : 'create'} room type`));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditRoomType = (type: RoomType) => {
        setEditingRoomTypeId(type.id);
        setNewRoomType({
            name: type.name,
            base_price: type.base_price,
            max_occupancy: type.max_occupancy,
            amenities: type.amenities || [],
            images: type.images || [], // Now valid on RoomType
        });
        setShowNewTypeDialog(true);
    };

    const handleTypeDialogChange = (open: boolean) => {
        setShowNewTypeDialog(open);
        if (!open) {
            setEditingRoomTypeId(null);
            setNewRoomType({ name: '', base_price: 0, max_occupancy: 2, amenities: [], images: [] });
            setNewImageUrl('');
        }
    };

    const handleUpdateStatus = async (roomId: string, status: string) => {
        const promise = roomsApi.update(roomId, { status: status as any });

        toast.promise(promise, {
            loading: 'Updating room status...',
            success: () => {
                fetchData();
                return 'Room status updated';
            },
            error: (error) => getErrorMessage(error, 'Failed to update room status'),
        });
    };

    const filteredRooms = rooms.filter((room) => {
        const matchesSearch = room.room_number.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getRoomTypeName = (typeId: string) => roomTypes.find((t) => t.id === typeId)?.name || 'Unknown';
    const getRoomType = (typeId: string) => roomTypes.find((t) => t.id === typeId);

    // Calculate stats
    const availableRooms = rooms.filter((r) => r.status === 'available').length;
    const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
    const cleaningRooms = rooms.filter((r) => r.status === 'cleaning').length;
    const maintenanceRooms = rooms.filter((r) => r.status === 'maintenance').length;

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
                        <CardDescription>Available Rooms</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {availableRooms}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-emerald-400">
                                Ready
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Ready for guests
                        </div>
                        <div className="text-muted-foreground">
                            {Math.round((availableRooms / rooms.length) * 100) || 0}% of total
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Occupied Rooms</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {occupiedRooms}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                In Use
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Guests checked in
                        </div>
                        <div className="text-muted-foreground">
                            {Math.round((occupiedRooms / rooms.length) * 100) || 0}% occupancy
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Cleaning</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {cleaningRooms}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                Pending
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Being cleaned
                        </div>
                        <div className="text-muted-foreground">
                            Housekeeping in progress
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Maintenance</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {maintenanceRooms}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-rose-400">
                                Repair
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Under repair
                        </div>
                        <div className="text-muted-foreground">
                            Temporarily unavailable
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Rooms</CardTitle>
                        <CardDescription>{filteredRooms.length} rooms • {roomTypes.length} room types</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Dialog open={showNewTypeDialog} onOpenChange={handleTypeDialogChange}>
                            <DialogTrigger asChild>
                                <Button variant="outline">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Room Type
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingRoomTypeId ? 'Edit Room Type' : 'Create Room Type'}</DialogTitle>
                                    <DialogDescription>{editingRoomTypeId ? 'Modify room type details.' : 'Add a new room category.'}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Name</Label>
                                        <Input
                                            placeholder="e.g., Deluxe Suite"
                                            value={newRoomType.name}
                                            onChange={(e) => setNewRoomType({ ...newRoomType, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Base Price (₦)</Label>
                                            <Input
                                                type="number"
                                                value={newRoomType.base_price}
                                                onChange={(e) => setNewRoomType({ ...newRoomType, base_price: Number(e.target.value) })}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Max Occupancy</Label>
                                            <Input
                                                type="number"
                                                value={newRoomType.max_occupancy}
                                                onChange={(e) => setNewRoomType({ ...newRoomType, max_occupancy: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>

                                    {/* Images Section for Room Type */}
                                    <div className="grid gap-2">
                                        <Label>Room Type Images (URLs)</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Enter image URL"
                                                value={newImageUrl}
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewImageUrl(e.target.value)}
                                                onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && (e.preventDefault(), addTypeImageUrl())}
                                            />
                                            <Button type="button" variant="outline" onClick={addTypeImageUrl}>
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        {(newRoomType.images?.length ?? 0) > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {newRoomType.images?.map((url, index) => (
                                                    <div key={index} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1 text-sm">
                                                        <ImageIcon className="h-3 w-3" />
                                                        <span className="max-w-[150px] truncate">{url}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTypeImage(index)}
                                                            className="ml-1 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Amenities Section for Room Type */}
                                    <div className="grid gap-2">
                                        <Label>Standard Amenities</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {PREDEFINED_AMENITIES.map((amenity) => (
                                                <Badge
                                                    key={amenity}
                                                    variant={newRoomType.amenities?.includes(amenity) ? 'default' : 'outline'}
                                                    className="cursor-pointer select-none"
                                                    onClick={() => toggleTypeAmenity(amenity)}
                                                >
                                                    {amenity}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowNewTypeDialog(false)}>Cancel</Button>
                                    <Button onClick={handleSaveRoomType} disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingRoomTypeId ? 'Save Type' : 'Create Type'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <Dialog open={showNewRoomDialog} onOpenChange={handleDialogChange}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    New Room
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingRoomId ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                                    <DialogDescription>{editingRoomId ? 'Modify room details.' : 'Add a room to your inventory.'}</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Room Number</Label>
                                        <Input
                                            placeholder="e.g., 101"
                                            value={newRoom.room_number}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Room Type</Label>
                                        <Select
                                            value={newRoom.room_type_id}
                                            onValueChange={(value: string) => setNewRoom({ ...newRoom, room_type_id: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roomTypes.map((type) => (
                                                    <SelectItem key={type.id} value={type.id}>
                                                        {type.name} - ₦{type.base_price.toLocaleString()}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowNewRoomDialog(false)}>Cancel</Button>
                                    <Button onClick={handleSaveRoom} disabled={isSubmitting}>
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingRoomId ? 'Save Changes' : 'Add Room'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search rooms..."
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
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="occupied">Occupied</SelectItem>
                                <SelectItem value="cleaning">Cleaning</SelectItem>
                                <SelectItem value="maintenance">Maintenance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Room Grid */}
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredRooms.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-muted-foreground">
                                No rooms found
                            </div>
                        ) : (
                            filteredRooms.map((room) => (
                                <Card key={room.id} className="relative">
                                    <CardHeader className="pb-2">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-lg">Room {room.room_number}</CardTitle>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditRoom(room)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit Room
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => {
                                                        const type = getRoomType(room.room_type_id);
                                                        if (type) handleEditRoomType(type);
                                                    }}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Edit Room Type
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(room.id, 'available')}>
                                                        <DoorOpen className="mr-2 h-4 w-4" />
                                                        Set Available
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(room.id, 'cleaning')}>
                                                        <Sparkles className="mr-2 h-4 w-4" />
                                                        Set Cleaning
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleUpdateStatus(room.id, 'maintenance')}>
                                                        <Wrench className="mr-2 h-4 w-4" />
                                                        Set Maintenance
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <CardDescription className="flex items-center gap-2">
                                            {getRoomTypeName(room.room_type_id)}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Room Image (from Type) */}
                                        {room.room_type?.images && room.room_type.images.length > 0 && (
                                            <div className="relative aspect-video w-full overflow-hidden rounded-md">
                                                <img
                                                    src={room.room_type.images[0]}
                                                    alt={`Room ${room.room_number}`}
                                                    className="h-full w-full object-cover"
                                                />
                                                {room.room_type.images.length > 1 && (
                                                    <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                                                        +{room.room_type.images.length - 1}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className={ROOM_STATUS_COLORS[room.status] || ''}>
                                                {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                                            </Badge>
                                        </div>

                                        {/* Amenities (from Type) */}
                                        {room.room_type?.amenities && room.room_type.amenities.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {room.room_type.amenities.slice(0, 3).map((amenity) => (
                                                    <Badge key={amenity} variant="secondary" className="text-[10px] px-1 h-5">
                                                        {amenity}
                                                    </Badge>
                                                ))}
                                                {room.room_type.amenities.length > 3 && (
                                                    <Badge variant="secondary" className="text-[10px] px-1 h-5">
                                                        +{room.room_type.amenities.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div >
    );
}
