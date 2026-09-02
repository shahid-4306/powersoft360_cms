"use client";

import { useEffect, useRef, useCallback } from "react";
import type { TaskOrComplaint } from "@/hooks/useTaskDev";

interface UseDevStreamProps {
  user: any;
  isAdminOrManager: boolean;
  setTasks: React.Dispatch<React.SetStateAction<TaskOrComplaint[]>>;
  isComplaint: (item: TaskOrComplaint) => boolean;
}

export const useDevStream = ({ user, isAdminOrManager, setTasks, isComplaint }: UseDevStreamProps) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  // Function to check if item should be included based on user role
  const shouldIncludeItem = useCallback((item: TaskOrComplaint): boolean => {
    if (!user) return false;
    
    const assignedToUser = item.assignedTo?.username === user.username;
    
    // For complaints
    if (isComplaint(item)) {
      // Only show complaints that are not resolved
      const isResolved = item.status === "resolved";
      
      if (isAdminOrManager) {
        // Admin/Manager sees all unresolved complaints
        return !isResolved;
      } else {
        // Regular developer sees only assigned unresolved complaints
        return assignedToUser && !isResolved;
      }
    } 
    // For tasks
    else {
      const isTaskDone = item.developer_status === "done";
      const isAssignedOrInProgress = item.status === "assigned" || item.status === "in-progress";
      
      if (isAdminOrManager) {
        // Admin/Manager sees all tasks that are either:
        // 1. Assigned/in-progress and not done, OR
        // 2. Rejected
        return (isAssignedOrInProgress && !isTaskDone) || item.status === "rejected";
      } else {
        // Regular developer sees only assigned tasks that are either:
        // 1. Assigned/in-progress and not done, OR
        // 2. Rejected
        return assignedToUser && ((isAssignedOrInProgress && !isTaskDone) || item.status === "rejected");
      }
    }
  }, [user, isAdminOrManager, isComplaint]);

  // Filter function for both tasks and complaints
  const filterTasks = useCallback((items: TaskOrComplaint[]): TaskOrComplaint[] => {
    if (!user) return [];
    return items.filter(item => shouldIncludeItem(item));
  }, [user, shouldIncludeItem]);

  const updateTasksWithNewItem = useCallback((newItem: TaskOrComplaint, currentTasks: TaskOrComplaint[]) => {
    const index = currentTasks.findIndex(item => item._id === newItem._id);
    
    if (index >= 0) {
      // Item exists, update it
      const updated = [...currentTasks];
      
      // Only update if the item should be included
      if (shouldIncludeItem(newItem)) {
        updated[index] = newItem;
        return updated;
      } else {
        // Item should not be included (e.g., marked as done/resolved), remove it
        return updated.filter(item => item._id !== newItem._id);
      }
    } else {
      // Item doesn't exist, add it if it should be included
      if (shouldIncludeItem(newItem)) {
        return [...currentTasks, newItem];
      }
      return currentTasks;
    }
  }, [shouldIncludeItem]);

  useEffect(() => {
    if (!user) return;

    const connectToSSE = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      try {
        // Use separate streams for tasks and complaints
        const taskStreamUrl = `/api/tasks/stream?userId=${user._id}&timestamp=${Date.now()}`;
        const complaintStreamUrl = `/api/complaints/stream?userId=${user._id}&timestamp=${Date.now()}`;
        
        const eventSource = new EventSource(taskStreamUrl); // Start with tasks stream
        eventSourceRef.current = eventSource;

        eventSource.onmessage = (event) => {
          if (event.data === "heartbeat") return;

          try {
            const data = JSON.parse(event.data);
            
            setTasks(prev => {
              // Handle array updates (initial load)
              if (Array.isArray(data)) {
                // Merge tasks and complaints from both sources
                const taskItems = data.filter(item => !isComplaint(item));
                const complaintItems = data.filter(item => isComplaint(item));
                
                // Keep existing items that aren't in the new data
                const existingItems = prev.filter(existing => 
                  !data.some((newItem: TaskOrComplaint) => newItem._id === existing._id)
                );
                
                // Filter new items
                const filteredNewItems = data.filter((item: TaskOrComplaint) => shouldIncludeItem(item));
                
                return [...existingItems, ...filteredNewItems];
              } 
              // Handle single item updates
              else {
                return updateTasksWithNewItem(data, prev);
              }
            });

            reconnectAttemptsRef.current = 0;
          } catch (err) {
            console.error("Error parsing SSE data:", err);
          }
        };

        eventSource.onopen = () => {
          console.log("SSE connected for user:", user.username);
          reconnectAttemptsRef.current = 0;
        };

        eventSource.onerror = (err) => {
          console.error("SSE error:", err);
          if (eventSourceRef.current) {
            eventSourceRef.current.close();
            eventSourceRef.current = null;
          }

          reconnectAttemptsRef.current++;
          if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(connectToSSE, delay);
          } else {
            console.error("Max SSE reconnect attempts reached");
          }
        };
      } catch (err) {
        console.error("Failed to create SSE connection:", err);
      }
    };

    connectToSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user, isAdminOrManager, setTasks, isComplaint, shouldIncludeItem, updateTasksWithNewItem]);
};