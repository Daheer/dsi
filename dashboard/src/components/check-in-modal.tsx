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

            // Get room type details
            const roomTypesList = await roomsApi.listTypes();
            const roomType = roomTypesList.find(rt => rt.id === bookedRoomTypeId);
            setRoomTypeName(roomType?.name || 'Unknown Room Type');

            // Filter for available rooms of the correct type
            const matchingRooms = allRooms.filter(
                room => room.room_type_id === bookedRoomTypeId && room.status === 'available'
            );

            setAvailableRooms(matchingRooms);

            if (matchingRooms.length === 0) {
                toast.error(`No available rooms of type ${roomType?.name || 'this type'}`);
            }
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
            toast.error('Failed to load available rooms');
        } finally {
            setLoadingRooms(false);
        }
    };

    const canProceedToNextStep = () => {
        if (step === 'room') {
            return selectedRoomId !== '';
        }
        if (step === 'guest') {
            // If guest ID is missing, require it to be filled
            if (isMissingGuestId) {
                return guestIdType !== '' && guestIdNumber !== '';
            }
            // Otherwise, can proceed (ID already exists)
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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Check-In Guest</DialogTitle>
                    <DialogDescription>
                        Complete the check-in process for {guest?.full_name}
                    </DialogDescription>
                </DialogHeader>

                {/* Progress Indicator */}
                <div className="flex gap-2 py-3">
                    <div className={`h-1 flex-1 rounded-full ${getStepStatus('room') === 'completed' ? 'bg-primary' : getStepStatus('room') === 'current' ? 'bg-primary/50' : 'bg-muted'}`} />
                    <div className={`h-1 flex-1 rounded-full ${getStepStatus('guest') === 'completed' ? 'bg-primary' : getStepStatus('guest') === 'current' ? 'bg-primary/50' : 'bg-muted'}`} />
                    <div className={`h-1 flex-1 rounded-full ${getStepStatus('key') === 'completed' ? 'bg-primary' : getStepStatus('key') === 'current' ? 'bg-primary/50' : 'bg-muted'}`} />
                </div>

                <Separator />

                {/* Step Content */}
                <div className="min-h-[300px] py-4">
                    {/* Step 1: Room Selection */}
                    {step === 'room' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Select Room to Assign</h3>
                                <p className="text-sm text-muted-foreground">
                                    Choose a specific room for this booking
                                    {roomTypeName && ` (${roomTypeName})`}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="room-select">Available Rooms *</Label>
                                {loadingRooms ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                    </div>
                                ) : availableRooms.length === 0 ? (
                                    <div className="rounded-lg border border-dashed p-8 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            No available rooms of type {roomTypeName}
                                        </p>
                                    </div>
                                ) : (
                                    <Select value={selectedRoomId} onValueChange={setSelectedRoomId}>
                                        <SelectTrigger id="room-select">
                                            <SelectValue placeholder="Select a room" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableRooms.map((room) => (
                                                <SelectItem key={room.id} value={room.id}>
                                                    Room {room.room_number} - {room.room_type?.name || roomTypeName}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}

                                {availableRooms.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {availableRooms.length} room{availableRooms.length !== 1 ? 's' : ''} available
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Guest Details */}
                    {step === 'guest' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Verify Guest Information</h3>
                                <p className="text-sm text-muted-foreground">
                                    {isMissingGuestId
                                        ? 'Please provide guest ID information'
                                        : 'Guest ID information on file'}
                                </p>
                            </div>

                            {isMissingGuestId ? (
                                <div className="space-y-4">
                                    <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                                        <p className="text-sm text-amber-600 dark:text-amber-400">
                                            Guest ID information is missing. Please collect this information during check-in.
                                        </p>
                                    </div>

                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="guest-id-type">ID Type *</Label>
                                            <Select value={guestIdType} onValueChange={setGuestIdType}>
                                                <SelectTrigger id="guest-id-type">
                                                    <SelectValue placeholder="Select ID type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="nin">NIN</SelectItem>
                                                    <SelectItem value="passport">Passport</SelectItem>
                                                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                                                    <SelectItem value="voters_card">Voter's Card</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="guest-id-number">ID Number *</Label>
                                            <Input
                                                id="guest-id-number"
                                                value={guestIdNumber}
                                                onChange={(e) => setGuestIdNumber(e.target.value)}
                                                placeholder="Enter ID number"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="rounded-lg border bg-muted/50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium">{guest?.full_name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {guest?.id_type} - {guest?.id_number}
                                                </p>
                                            </div>
                                            <Badge variant="secondary">Verified</Badge>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Key Card */}
                    {step === 'key' && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold">Key Card Handover</h3>
                                <p className="text-sm text-muted-foreground">
                                    Issue a key card to the guest
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="key-card-id">Key/Card ID (Optional)</Label>
                                <Input
                                    id="key-card-id"
                                    value={keyCardId}
                                    onChange={(e) => setKeyCardId(e.target.value)}
                                    placeholder="e.g., KC-201, Card-102"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Record the physical key or card number issued to the guest
                                </p>
                            </div>

                            {/* Summary */}
                            <div className="mt-6 rounded-lg border bg-muted/50 p-4 space-y-2">
                                <h4 className="font-semibold text-sm">Check-in Summary</h4>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Guest:</span>
                                        <span>{guest?.full_name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room:</span>
                                        <span>
                                            {availableRooms.find(r => r.id === selectedRoomId)?.room_number || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room Type:</span>
                                        <span>{roomTypeName}</span>
                                    </div>
                                    {keyCardId && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Key Card:</span>
                                            <span>{keyCardId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <DialogFooter>
                    <div className="flex w-full justify-between">
                        <Button variant="outline" onClick={handleBack} disabled={step === 'room' || isSubmitting}>
                            Back
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            {step === 'key' ? (
                                <Button onClick={handleSubmit} disabled={isSubmitting || !selectedRoomId}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Complete Check-In
                                </Button>
                            ) : (
                                <Button onClick={handleNext} disabled={!canProceedToNextStep()}>
                                    Next
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
