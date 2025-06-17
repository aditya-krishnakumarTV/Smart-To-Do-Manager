import { Injectable, signal, computed } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, Priority, TaskFilter } from '../interfaces/task.interface';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private tasks = signal<Task[]>([]);
    
    private tasksSubject = new BehaviorSubject<Task[]>([]);
    
    public tasks$ = this.tasksSubject.asObservable();

    private readonly STORAGE_KEY = 'smart-todo-tasks-v2';

    // Angular 18 computed signals for derived state
    public activeTasks = computed(() =>
        this.tasks().filter(task => !task.completed).length
    );

    public completedTasks = computed(() =>
        this.tasks().filter(task => task.completed).length
    );

    public totalTasks = computed(() => this.tasks().length);

    constructor() {
        this.loadTasksFromStorage();
    }

    private loadTasksFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsedTasks = JSON.parse(stored).map((task: any) => ({
                    ...task,
                    createdAt: new Date(task.createdAt),
                    updatedAt: new Date(task.updatedAt)
                }));
                this.tasks.set(parsedTasks);
                this.tasksSubject.next(parsedTasks);
            }
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
            // Fallback to empty array if storage is corrupted
            this.tasks.set([]);
            this.tasksSubject.next([]);
        }
    }

    private saveTasksToStorage(): void {
        try {
            const currentTasks = this.tasks();
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(currentTasks));
        } catch (error) {
            console.error('Error saving tasks to storage:', error);
        }
    }

    addTask(title: string, description?: string, priority: Priority = Priority.MEDIUM, tags: string[] = []): void {
        const newTask: Task = {
            id: this.generateId(),
            title: title.trim(),
            description: description?.trim(),
            priority,
            tags: [...tags], // Create a copy to avoid reference issues
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const currentTasks = this.tasks();
        const updatedTasks = [newTask, ...currentTasks];
        this.tasks.set(updatedTasks);
        this.saveTasksToStorage();
        this.tasksSubject.next(updatedTasks);
    }

    updateTask(id: string, updates: Partial<Task>): void {
        const currentTasks = this.tasks();
        const taskIndex = currentTasks.findIndex(task => task.id === id);

        if (taskIndex !== -1) {
            const updatedTask = {
                ...currentTasks[taskIndex],
                ...updates,
                updatedAt: new Date()
            };

            const updatedTasks = [...currentTasks];
            updatedTasks[taskIndex] = updatedTask;

            this.tasks.set(updatedTasks);
            this.saveTasksToStorage();
            this.tasksSubject.next(updatedTasks);
        }
    }

    deleteTask(id: string): void {
        const currentTasks = this.tasks();
        const updatedTasks = currentTasks.filter(task => task.id !== id);
        this.tasks.set(updatedTasks);
        this.saveTasksToStorage();
        this.tasksSubject.next(updatedTasks);
    }

    toggleTask(id: string): void {
        const currentTasks = this.tasks();
        const taskIndex = currentTasks.findIndex(task => task.id === id);

        if (taskIndex !== -1) {
            const updatedTasks = [...currentTasks];
            updatedTasks[taskIndex] = {
                ...updatedTasks[taskIndex],
                completed: !updatedTasks[taskIndex].completed,
                updatedAt: new Date()
            };

            this.tasks.set(updatedTasks);
            this.saveTasksToStorage();
            this.tasksSubject.next(updatedTasks);
        }
    }

    filterTasks(filter: TaskFilter): Task[] {
        const currentTasks = this.tasks();

        return currentTasks.filter(task => {
            // Search filter - improved to handle empty strings
            if (filter.search?.trim()) {
                const searchLower = filter.search.toLowerCase();
                const titleMatch = task.title.toLowerCase().includes(searchLower);
                const descriptionMatch = task.description?.toLowerCase().includes(searchLower) || false;
                const tagMatch = task.tags.some(tag => tag.toLowerCase().includes(searchLower));

                if (!titleMatch && !descriptionMatch && !tagMatch) {
                    return false;
                }
            }

            // Priority filter
            if (filter.priority && task.priority !== filter.priority) {
                return false;
            }

            // Tags filter - improved logic for multiple tag selection
            if (filter.tags && filter.tags.length > 0) {
                const hasMatchingTag = filter.tags.some(filterTag =>
                    task.tags.includes(filterTag)
                );
                if (!hasMatchingTag) {
                    return false;
                }
            }

            // Completed filter
            if (filter.completed !== undefined && task.completed !== filter.completed) {
                return false;
            }

            return true;
        });
    }

    getAllTags(): string[] {
        const currentTasks = this.tasks();
        const tagSet = new Set<string>();

        currentTasks.forEach(task => {
            task.tags.forEach(tag => {
                if (tag.trim()) { // Only add non-empty tags
                    tagSet.add(tag.trim());
                }
            });
        });

        return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
    }

    // Enhanced task statistics
    getTaskStatistics() {
        const currentTasks = this.tasks();
        const stats = {
            total: currentTasks.length,
            active: currentTasks.filter(t => !t.completed).length,
            completed: currentTasks.filter(t => t.completed).length,
            highPriority: currentTasks.filter(t => t.priority === Priority.HIGH && !t.completed).length,
            mediumPriority: currentTasks.filter(t => t.priority === Priority.MEDIUM && !t.completed).length,
            lowPriority: currentTasks.filter(t => t.priority === Priority.LOW && !t.completed).length,
            totalTags: this.getAllTags().length
        };

        return stats;
    }

    // Bulk operations for Angular 18
    bulkUpdateTasks(taskIds: string[], updates: Partial<Task>): void {
        const currentTasks = this.tasks();
        const updatedTasks = currentTasks.map(task => {
            if (taskIds.includes(task.id)) {
                return {
                    ...task,
                    ...updates,
                    updatedAt: new Date()
                };
            }
            return task;
        });

        this.tasks.set(updatedTasks);
        this.saveTasksToStorage();
        this.tasksSubject.next(updatedTasks);
    }

    bulkDeleteTasks(taskIds: string[]): void {
        const currentTasks = this.tasks();
        const updatedTasks = currentTasks.filter(task => !taskIds.includes(task.id));
        this.tasks.set(updatedTasks);
        this.saveTasksToStorage();
        this.tasksSubject.next(updatedTasks);
    }

    private generateId(): string {
        // Enhanced ID generation for better uniqueness
        return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Export/Import functionality for Angular 18
    exportTasks(): string {
        return JSON.stringify(this.tasks(), null, 2);
    }

    importTasks(tasksJson: string): boolean {
        try {
            const importedTasks = JSON.parse(tasksJson);
            if (Array.isArray(importedTasks)) {
                const validatedTasks = importedTasks.map(task => ({
                    ...task,
                    createdAt: new Date(task.createdAt),
                    updatedAt: new Date(task.updatedAt)
                }));

                this.tasks.set(validatedTasks);
                this.saveTasksToStorage();
                this.tasksSubject.next(validatedTasks);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing tasks:', error);
            return false;
        }
    }
}