'use client';

import { useEffect, useState } from 'react';
import { IconTrendingUp } from '@tabler/icons-react';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Pencil,
    Trash2,
    Loader2,
    Users,
    UserCheck,
    UserX,
    Shield,
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
import { toast } from 'sonner';
import { usersApi } from '@/lib/api';
import type { User, UserCreate } from '@/types';

const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-rose-500/20 text-rose-400',
    manager: 'bg-purple-500/20 text-purple-400',
    receptionist: 'bg-blue-500/20 text-blue-400',
    housekeeping: 'bg-amber-500/20 text-amber-400',
    kitchen: 'bg-emerald-500/20 text-emerald-400',
    auditor: 'bg-slate-500/20 text-slate-400',
};

export default function StaffPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [showUserDialog, setShowUserDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<Partial<UserCreate>>({
        username: '',
        password: '',
        full_name: '',
        role: 'receptionist',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const data = await usersApi.list();
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error('Failed to load staff');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddNew = () => {
        setIsEditing(false);
        setSelectedUser(null);
        setFormData({
            username: '',
            password: '',
            full_name: '',
            role: 'receptionist',
        });
        setShowUserDialog(true);
    };

    const handleEdit = (user: User) => {
        setIsEditing(true);
        setSelectedUser(user);
        setFormData({
            username: user.username,
            full_name: user.full_name,
            role: user.role,
            // Password not set for edit unless changed
            password: '',
        });
        setShowUserDialog(true);
    };

    const handleSaveUser = async () => {
        if (!formData.username || !formData.full_name) {
            toast.error('Please fill in all required fields');
            return;
        }
        if (!isEditing && !formData.password) {
            toast.error('Password is required for new users');
            return;
        }

        setIsSubmitting(true);
        try {
            if (isEditing && selectedUser) {
                // For edit, only include password if it's set
                const updateData: any = { ...formData };
                if (!updateData.password) {
                    delete updateData.password;
                }
                const { id, ...dataToUpdate } = updateData; // remove id if present, though formData shouldn't have it
                await usersApi.update(selectedUser.id, updateData);
                toast.success('Staff member updated successfully');
            } else {
                await usersApi.create(formData as UserCreate);
                toast.success('Staff member created successfully');
            }
            setShowUserDialog(false);
            fetchData();
        } catch (error) {
            console.error('Failed to save user:', error);
            toast.error(isEditing ? 'Failed to update staff member' : 'Failed to create staff member');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleActive = async (user: User) => {
        try {
            await usersApi.update(user.id, { is_active: !user.is_active });
            toast.success(user.is_active ? 'Staff member deactivated' : 'Staff member activated');
            fetchData();
        } catch (error) {
            console.error('Failed to update user:', error);
            toast.error('Failed to update staff member');
        }
    };

    const handleDeleteClick = (user: User) => {
        setSelectedUser(user);
        setShowDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;

        try {
            await usersApi.delete(selectedUser.id);
            toast.success('Staff member deleted');
            setShowDeleteDialog(false);
            fetchData();
        } catch (error) {
            console.error('Failed to delete user:', error);
            toast.error('Failed to delete staff member');
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.username.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    // Calculate stats
    const totalStaff = users.length;
    const activeStaff = users.filter((u) => u.is_active).length;
    const inactiveStaff = users.filter((u) => !u.is_active).length;

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
            {/* Stats Cards */}
            <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Total Staff</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {totalStaff}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                All
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Registered staff
                        </div>
                        <div className="text-muted-foreground">
                            All departments
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Active Staff</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {activeStaff}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-emerald-400">
                                Active
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Currently active
                        </div>
                        <div className="text-muted-foreground">
                            Can access system
                        </div>
                    </CardFooter>
                </Card>

                <Card className="@container/card">
                    <CardHeader>
                        <CardDescription>Inactive Staff</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {inactiveStaff}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline" className="text-rose-400">
                                Inactive
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            Deactivated accounts
                        </div>
                        <div className="text-muted-foreground">
                            No system access
                        </div>
                    </CardFooter>
                </Card>
            </div>

            {/* Main Content Card */}
            <Card className="shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Staff Members</CardTitle>
                        <CardDescription>{filteredUsers.length} staff members found</CardDescription>
                    </div>
                    <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
                        <DialogTrigger asChild>
                            <Button onClick={handleAddNew}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Staff
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{isEditing ? 'Edit Staff Member' : 'Add Staff Member'}</DialogTitle>
                                <DialogDescription>
                                    {isEditing ? 'Update the details of the staff member.' : 'Create a new staff account.'}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Full Name</Label>
                                    <Input
                                        placeholder="John Doe"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Username</Label>
                                        <Input
                                            placeholder="johndoe"
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Password</Label>
                                        <Input
                                            type="password"
                                            placeholder={isEditing ? "(Leave blank to keep current)" : "••••••••"}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label>Role</Label>
                                    <Select
                                        value={formData.role}
                                        onValueChange={(value) => setFormData({ ...formData, role: value as any })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="receptionist">Receptionist</SelectItem>
                                            <SelectItem value="housekeeping">Housekeeping</SelectItem>
                                            <SelectItem value="kitchen">Kitchen</SelectItem>
                                            <SelectItem value="auditor">Auditor</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowUserDialog(false)}>Cancel</Button>
                                <Button onClick={handleSaveUser} disabled={isSubmitting}>
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isEditing ? 'Save Changes' : 'Create Account'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search staff..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={setRoleFilter}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Filter role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Roles</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="manager">Manager</SelectItem>
                                <SelectItem value="receptionist">Receptionist</SelectItem>
                                <SelectItem value="housekeeping">Housekeeping</SelectItem>
                                <SelectItem value="kitchen">Kitchen</SelectItem>
                                <SelectItem value="auditor">Auditor</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                            No staff members found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.full_name}</TableCell>
                                            <TableCell className="text-muted-foreground">@{user.username}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="outline"
                                                    className={user.is_active ? 'text-emerald-400' : 'text-rose-400'}
                                                >
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                            <Pencil className="mr-2 h-4 w-4" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                                                            {user.is_active ? (
                                                                <>
                                                                    <UserX className="mr-2 h-4 w-4" />
                                                                    Deactivate
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <UserCheck className="mr-2 h-4 w-4" />
                                                                    Activate
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(user)}>
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <span className="font-semibold">{selectedUser?.full_name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
