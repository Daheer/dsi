"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { IconRefresh, IconSparkles, IconCheck } from "@tabler/icons-react"
import { housekeepingApi } from "@/lib/api"
import type { HousekeepingTask } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type TaskFilter = "all" | "pending" | "completed"

export default function HousekeepingPage() {
  const [tasks, setTasks] = useState<HousekeepingTask[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<TaskFilter>("pending")
  const [refreshing, setRefreshing] = useState(false)
  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setRefreshing(true)
      const statusParam = filter === "all" ? undefined : filter
      const data = await housekeepingApi.listTasks({ status: statusParam })
      setTasks(data)
    } catch (error) {
      toast.error("Failed to fetch tasks")
      console.error(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [filter])

  const handleComplete = async (taskId: string) => {
    setCompletingTaskId(taskId)

    await toast.promise(
      housekeepingApi.completeTask(taskId),
      {
        loading: 'Marking room as clean...',
        success: 'Room marked as clean!',
        error: (err) => err instanceof Error ? err.message : 'Failed to complete task',
      }
    )

    setCompletingTaskId(null)
    fetchTasks()
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === "all") return true
    if (filter === "pending") return task.status === "pending" || task.status === "in_progress"
    if (filter === "completed") return task.status === "completed"
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Housekeeping</h1>
          <p className="text-muted-foreground">
            Manage room cleaning tasks
          </p>
        </div>
        <Button
          onClick={fetchTasks}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className="hover:cursor-pointer"
        >
          <IconRefresh className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as TaskFilter)}>
        <TabsList>
          <TabsTrigger value="all">All Tasks</TabsTrigger>
          <TabsTrigger value="pending">Pending (Dirty)</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Task Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading tasks...</div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <IconSparkles className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">No tasks found</p>
          <p className="text-sm text-muted-foreground">
            {filter === "pending" ? "All rooms are clean!" : "No tasks match this filter"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      Room {task.room?.room_number || "N/A"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {task.room?.room_type?.name || "Unknown Type"}
                    </p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {task.assigned_to && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Assigned to:</span>{" "}
                    <span className="font-medium">{task.assigned_to}</span>
                  </div>
                )}
                {task.notes && (
                  <div className="text-sm text-muted-foreground">
                    {task.notes}
                  </div>
                )}
                {task.status === "pending" || task.status === "in_progress" ? (
                  <Button
                    onClick={() => handleComplete(task.id)}
                    className="w-full hover:cursor-pointer"
                    size="sm"
                    disabled={completingTaskId === task.id}
                  >
                    {completingTaskId === task.id ? (
                      <>
                        <IconRefresh className="mr-2 h-4 w-4 animate-spin" />
                        Marking Clean...
                      </>
                    ) : (
                      <>
                        <IconCheck className="mr-2 h-4 w-4" />
                        Mark Clean
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="flex items-center justify-center py-2 text-sm text-green-600 dark:text-green-400">
                    <IconCheck className="mr-2 h-4 w-4" />
                    Completed
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    in_progress: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  }

  const labels = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status as keyof typeof styles] || styles.pending
        }`}
    >
      {labels[status as keyof typeof labels] || status}
    </span>
  )
}
