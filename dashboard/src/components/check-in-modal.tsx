'use client';

import { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { bookingsApi, roomsApi } from '@/lib/api';
import type { Booking, Guest, Room, BookingCheckIn } from '@/types';

interface CheckInModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    booking: Booking | null;
    guest: Guest | null;
    onSuccess: () => void;
}

export function CheckInModal({
    open,
    onOpenChange,
    booking,
    guest,
    onSuccess,
}: CheckInModalProps) {
    const [step, setStep] = useState<'room' | 'guest' | 'key'>('room');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(false);
    const [roomTypeName, setRoomTypeName] = useState<string>('');

    // Form state
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [guestIdType, setGuestIdType] = useState<string>('');
    const [guestIdNumber, setGuestIdNumber] = useState<string>('');
    const [keyCardId, setKeyCardId] = useState<string>('');

    // Check if guest ID is missing
    const isMissingGuestId = !guest?.id_number || !guest?.id_type;

    useEffect(() => {
        if (open && booking) {
            // Reset form
            setStep('room');
            setSelectedRoomId('');
            setGuestIdType(guest?.id_type || '');
            setGuestIdNumber(guest?.id_number || '');
            setKeyCardId('');

            // Fetch available rooms for this booking's room type
            fetchAvailableRooms();
        }
    }, [open, booking]);

    const fetchAvailableRooms = async () => {
        if (!booking) return;

        setLoadingRooms(true);
        try {
            // Get all rooms
            const allRooms = await roomsApi.list();

            // SOFT ALLOCATION: Get room_type_id directly from booking
            // This works even when room_id is null (pooled inventory)
            let bookedRoomTypeId: string | undefined = booking.room_type_id;
            
            // Fallback: Try to get from room object if room_type_id not in booking
            if (!bookedRoomTypeId && booking.room?.room_type_id) {
                bookedRoomTypeId = booking.room.room_type_id;
            }
            
            // Last resort: Get from specific room if room_id is populated
            if (!bookedRoomTypeId && booking.room_id) {
                const bookedRoom = allRooms.find(r => r.id === booking.room_id);
                bookedRoomTypeId = bookedRoom?.room_type_id;
            }

            if (!bookedRoomTypeId) {
                toast.error('Unable to determine room type for this booking');
                setAvailableRooms([]);
                setRoomTypeName('Unknown');
                return;
            }

            // Filter rooms by the booking's room type and status
            const filtered = allRooms.filter((room) => {
                // Must match the booking's room type
                if (room.room_type_id !== bookedRoomTypeId) return false;

                // Must be AVAILABLE
                if (room.status !== 'available') return false;

                return true;
            });

            // Store room type name for display
            const roomType = filtered[0]?.room_type?.name || booking.room?.room_type?.name || 'Selected Type';
            setRoomTypeName(roomType);
            setAvailableRooms(filtered);
        } catch (error) {
            console.error('Failed to fetch available rooms:', error);
            toast.error('Failed to load available rooms');
        } finally {
            setLoadingRooms(false);
        }
    };

    const canProceedToNextStep = () => {
        if (step === 'room') return selectedRoomId !== '';
        if (step === 'guest') {
            // Only require guest ID if it's missing
            if (isMissingGuestId) {
                return guestIdType !== '' && guestIdNumber !== '';
            }
            return true;
        }
        return true;
    };

    const handleNext = () => {
        if (!canProceedToNextStep()) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (step === 'room') {
            setStep('guest');
        } else if (step === 'guest') {
            setStep('key');
        }
    };

    const handleBack = () => {
        if (step === 'key') {
            setStep('guest');
        } else if (step === 'guest') {
            setStep('room');
        }
    };

    const handleSubmit = async () => {
        if (!booking) return;

        if (!selectedRoomId) {
            toast.error('Please select a room');
            return;
        }

        // Validate guest ID if missing
        if (isMissingGuestId && (!guestIdType || !guestIdNumber)) {
            toast.error('Please provide guest ID information');
            return;
        }

        setIsSubmitting(true);
        try {
            const checkInData: BookingCheckIn = {
                booking_id: booking.id,
                room_id: selectedRoomId,
                guest_id_type: guestIdType || undefined,
                guest_id_number: guestIdNumber || undefined,
                key_card_id: keyCardId || undefined,
            };

            await bookingsApi.checkIn(checkInData);
            toast.success('Guest checked in successfully!');
            onOpenChange(false);
            onSuccess();
        } catch (error) {
            console.error('Check-in failed:', error);
            toast.error(
                error instanceof Error ? error.message : 'Failed to check in guest'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepStatus = (stepName: 'room' | 'guest' | 'key') => {
        const steps = ['room', 'guest', 'key'];
        const currentIndex = steps.indexOf(step);
        const stepIndex = steps.indexOf(stepName);

        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'upcoming';
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Check-In Guest</DialogTitle>
                    <DialogDescription>
                        Complete the check-in process for {guest?.full_name}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Indicator */}
                <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                getStepStatus('room') === 'completed'
                                    ? 'bg-primary text-primary-foreground'
                                    : getStepStatus('room') === 'current'
                                    ? 'border-2 border-primary bg-background text-primary'
                                    : 'border-2 border-muted bg-background text-muted-foreground'
                            }`}
                        >
                            {getStepStatus('room') === 'completed' ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                '1'
                            )}
                        </div>
                        <span
                            className={`text-sm font-medium ${
                                getStepStatus('room') === 'upcoming'
                                    ? 'text-muted-foreground'
                                    : ''
                            }`}
                        >
                            Room
                        </span>
                    </div>

                    <Separator className="w-12" />

                    <div className="flex items-center gap-2">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                getStepStatus('guest') === 'completed'
                                    ? 'bg-primary text-primary-foreground'
                                    : getStepStatus('guest') === 'current'
                                    ? 'border-2 border-primary bg-background text-primary'
                                    : 'border-2 border-muted bg-background text-muted-foreground'
                            }`}
                        >
                            {getStepStatus('guest') === 'completed' ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                '2'
                            )}
                        </div>
                        <span
                            className={`text-sm font-medium ${
                                getStepStatus('guest') === 'upcoming'
                                    ? 'text-muted-foreground'
                                    : ''
                            }`}
                        >
                            Guest Details
                        </span>
                    </div>

                    <Separator className="w-12" />

                    <div className="flex items-center gap-2">
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${
                                getStepStatus('key') === 'completed'
                                    ? 'bg-primary text-primary-foreground'
                                    : getStepStatus('key') === 'current'
                                    ? 'border-2 border-primary bg-background text-primary'
                                    : 'border-2 border-muted bg-background text-muted-foreground'
                            }`}
                        >
                            {getStepStatus('key') === 'completed' ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                '3'
                            )}
                        </div>
                        <span
                            className={`text-sm font-medium ${
                                getStepStatus('key') === 'upcoming'
                                    ? 'text-muted-foreground'
                                    : ''
                            }`}
                        >
                            Key Handover
                        </span>
                    </div>
                </div>

                <Separator />

                {/* Step Content */}
                <div className="min-h-[300px] py-4">
                    {/* Step A: Room Selection */}
                    {step === 'room' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Select Room to Assign</h3>
                                <p className="text-sm text-muted-foreground">
                                    Choose a specific room for this booking
                                    {roomTypeName && ` (${roomTypeName})`}
                                </p>
                            </div>

                            {loadingRooms ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="room">
                                            Available Rooms <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={selectedRoomId}
                                            onValueChange={setSelectedRoomId}
                                        >
                                            <SelectTrigger id="room">
                                                <SelectValue placeholder="Select a room" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableRooms.length === 0 ? (
                                                    <div className="p-2 text-center text-sm text-muted-foreground">
                                                        No available rooms found
                                                    </div>
                                                ) : (
                                                    availableRooms.map((room) => (
                                                        <SelectItem key={room.id} value={room.id}>
                                                            Room {room.room_number} -{' '}
                                                            {room.room_type?.name}
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-muted-foreground">
                                            {availableRooms.length} available room(s) found
                                            {roomTypeName && ` for ${roomTypeName}`}
                                        </p>
                                    </div>

                                    {selectedRoomId && (
                                        <div className="rounded-lg border bg-muted/50 p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">
                                                        Room{' '}
                                                        {
                                                            availableRooms.find(
                                                                (r) => r.id === selectedRoomId
                                                            )?.room_number
                                                        }
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {
                                                            availableRooms.find(
                                                                (r) => r.id === selectedRoomId
                                                            )?.room_type?.name
                                                        }
                                                    </p>
                                                </div>
                                                <Badge variant="secondary">Selected</Badge>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Step B: Guest Details */}
                    {step === 'guest' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Guest Information</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isMissingGuestId
                                        ? 'Please provide guest ID information'
                                        : 'Guest ID information is complete'}
                                </p>
                            </div>

                            {isMissingGuestId ? (
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="id_type">
                                            ID Type <span className="text-destructive">*</span>
                                        </Label>
                                        <Select value={guestIdType} onValueChange={setGuestIdType}>
                                            <SelectTrigger id="id_type">
                                                <SelectValue placeholder="Select ID type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="nin">NIN</SelectItem>
                                                <SelectItem value="passport">Passport</SelectItem>
                                                <SelectItem value="drivers_license">
                                                    Driver&apos;s License
                                                </SelectItem>
                                                <SelectItem value="voters_card">
                                                    Voter&apos;s Card
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="id_number">
                                            ID Number <span className="text-destructive">*</span>
                                        </Label>
                                        <Input
                                            id="id_number"
                                            value={guestIdNumber}
                                            onChange={(e) => setGuestIdNumber(e.target.value)}
                                            placeholder="Enter ID number"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg border bg-muted/50 p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                            <Check className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-medium">ID Information Complete</p>
                                            <p className="text-sm text-muted-foreground">
                                                {guest?.id_type}: {guest?.id_number}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step C: Key Handover */}
                    {step === 'key' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Key Handover</h3>
                                <p className="text-sm text-muted-foreground">
                                    Record the key or card ID being issued to the guest
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="key_card_id">Key / Card ID (Optional)</Label>
                                <Input
                                    id="key_card_id"
                                    value={keyCardId}
                                    onChange={(e) => setKeyCardId(e.target.value)}
                                    placeholder="e.g., KEY-301, CARD-A123"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Enter the physical key number or electronic card ID
                                </p>
                            </div>

                            <Separator />

                            {/* Summary */}
                            <div className="space-y-3">
                                <h4 className="font-medium">Check-In Summary</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Guest</span>
                                        <span className="font-medium">{guest?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room</span>
                                        <span className="font-medium">
                                            Room{' '}
                                            {
                                                availableRooms.find(
                                                    (r) => r.id === selectedRoomId
                                                )?.room_number
                                            }
                                        </span>
                                    </div>
                                    {keyCardId && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Key ID</span>
                                            <span className="font-medium">{keyCardId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <div className="flex w-full justify-between">
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (step === 'room') {
                                    onOpenChange(false);
                                } else {
                                    handleBack();
                                }
                            }}
                            disabled={isSubmitting}
                        >
                            {step === 'room' ? 'Cancel' : 'Back'}
                        </Button>

                        {step !== 'key' ? (
                            <Button
                                onClick={handleNext}
                                disabled={!canProceedToNextStep() || loadingRooms}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Confirm Check-In
                            </Button>
                        )}
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
