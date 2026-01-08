'use client';

import { useState } from 'react';
import { format, subDays } from 'date-fns';
import {
    BarChart3,
    TrendingUp,
    Users,
    Building,
    Loader2,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { reportsApi } from '@/lib/api';

interface ReportResult {
    status: string;
    result?: Record<string, unknown>;
}

export default function ReportsPage() {
    const [isGenerating, setIsGenerating] = useState<string | null>(null);
    const [fromDate, setFromDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [revenueResult, setRevenueResult] = useState<ReportResult | null>(null);
    const [occupancyResult, setOccupancyResult] = useState<ReportResult | null>(null);
    const [staffResult, setStaffResult] = useState<ReportResult | null>(null);

    const pollForResult = async (
        taskId: string,
        getResult: (id: string) => Promise<{ status: string; result?: unknown }>,
        setResult: (result: ReportResult) => void
    ) => {
        let attempts = 0;
        const maxAttempts = 30;

        while (attempts < maxAttempts) {
            try {
                const result = await getResult(taskId);
                if (result.status === 'completed' || result.status === 'SUCCESS') {
                    setResult(result as ReportResult);
                    return;
                } else if (result.status === 'failed' || result.status === 'FAILURE') {
                    throw new Error('Report generation failed');
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
                attempts++;
            } catch (error) {
                console.error('Error polling for result:', error);
                throw error;
            }
        }
        throw new Error('Report generation timed out');
    };

    const handleGenerateRevenue = async () => {
        setIsGenerating('revenue');
        try {
            const { task_id } = await reportsApi.generateRevenue({ from_date: fromDate, to_date: toDate });
            await pollForResult(task_id, reportsApi.getRevenue, setRevenueResult);
            toast.success('Revenue report generated');
        } catch (error) {
            console.error('Failed to generate revenue report:', error);
            toast.error('Failed to generate revenue report');
        } finally {
            setIsGenerating(null);
        }
    };

    const handleGenerateOccupancy = async () => {
        setIsGenerating('occupancy');
        try {
            const { task_id } = await reportsApi.generateOccupancy({ from_date: fromDate, to_date: toDate });
            await pollForResult(task_id, reportsApi.getOccupancy, setOccupancyResult);
            toast.success('Occupancy report generated');
        } catch (error) {
            console.error('Failed to generate occupancy report:', error);
            toast.error('Failed to generate occupancy report');
        } finally {
            setIsGenerating(null);
        }
    };

    const handleGenerateStaffActivity = async () => {
        setIsGenerating('staff');
        try {
            const { task_id } = await reportsApi.generateStaffActivity({ from_date: fromDate, to_date: toDate });
            await pollForResult(task_id, reportsApi.getStaffActivity, setStaffResult);
            toast.success('Staff activity report generated');
        } catch (error) {
            console.error('Failed to generate staff report:', error);
            toast.error('Failed to generate staff activity report');
        } finally {
            setIsGenerating(null);
        }
    };

    const renderResult = (result: ReportResult | null) => {
        if (!result?.result) {
            return <p className="text-muted-foreground">No data available. Generate a report to view results.</p>;
        }

        return (
            <pre className="max-h-96 overflow-auto rounded-lg bg-muted p-4 text-sm">
                {JSON.stringify(result.result, null, 2)}
            </pre>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
                    <p className="text-muted-foreground">Generate and view hotel performance reports</p>
                </div>
            </div>

            {/* Date Range */}
            <Card>
                <CardHeader>
                    <CardTitle>Report Period</CardTitle>
                    <CardDescription>Select the date range for your reports</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
                    <div className="space-y-2">
                        <Label>From Date</Label>
                        <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>To Date</Label>
                        <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Report Tabs */}
            <Tabs defaultValue="revenue">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="revenue" className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Revenue
                    </TabsTrigger>
                    <TabsTrigger value="occupancy" className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        Occupancy
                    </TabsTrigger>
                    <TabsTrigger value="staff" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Staff Activity
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="revenue">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Revenue Report
                                </CardTitle>
                                <CardDescription>
                                    Total revenue, payment breakdown, and trends
                                </CardDescription>
                            </div>
                            <Button onClick={handleGenerateRevenue} disabled={isGenerating === 'revenue'}>
                                {isGenerating === 'revenue' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Generate Report
                                    </>
                                )}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {renderResult(revenueResult)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="occupancy">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="h-5 w-5" />
                                    Occupancy Report
                                </CardTitle>
                                <CardDescription>
                                    Room utilization rates and booking patterns
                                </CardDescription>
                            </div>
                            <Button onClick={handleGenerateOccupancy} disabled={isGenerating === 'occupancy'}>
                                {isGenerating === 'occupancy' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Generate Report
                                    </>
                                )}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {renderResult(occupancyResult)}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="staff">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Staff Activity Report
                                </CardTitle>
                                <CardDescription>
                                    Staff performance and activity metrics
                                </CardDescription>
                            </div>
                            <Button onClick={handleGenerateStaffActivity} disabled={isGenerating === 'staff'}>
                                {isGenerating === 'staff' ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="mr-2 h-4 w-4" />
                                        Generate Report
                                    </>
                                )}
                            </Button>
                        </CardHeader>
                        <CardContent>
                            {renderResult(staffResult)}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
