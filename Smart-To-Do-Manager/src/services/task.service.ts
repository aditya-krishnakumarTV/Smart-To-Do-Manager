import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Task, Priority, TaskFilter } from '../interfaces/task.interface';

@Injectable({
    providedIn: 'root'
})
export class TaskService {
    private tasks: Task[] = [];
    private tasksSubject = new BehaviorSubject<Task[]>([]);
    public tasks$ = this.tasksSubject.asObservable();

    private readonly STORAGE_KEY = 'smart-todo-tasks';

    constructor() {
        this.loadTasksFromStorage();
    }

    private loadTasksFromStorage(): void {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.tasks = JSON.parse(stored).map((task: any) => ({
                    ...task,
                    createdAt: new Date(task.createdAt),
                    updatedAt: new Date(task.updatedAt)
                }));
                this.tasksSubject.next(this.tasks);
            }
        } catch (error) {
            console.error('Error loading tasks from storage:', error);
        }
    }

    private saveTasksToStorage(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
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
            tags,
            completed: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.tasks.unshift(newTask);
        this.saveTasksToStorage();
        this.tasksSubject.next(this.tasks);
    }

    updateTask(id: string, updates: Partial<Task>): void {
        const index = this.tasks.findIndex(task => task.id === id);
        if (index !== -1) {
            this.tasks[index] = {
                ...this.tasks[index],
                ...updates,
                updatedAt: new Date()
            };
            this.saveTasksToStorage();
            this.tasksSubject.next(this.tasks);
        }
    }

    deleteTask(id: string): void {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasksToStorage();
        this.tasksSubject.next(this.tasks);
    }

    toggleTask(id: string): void {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date();
            this.saveTasksToStorage();
            this.tasksSubject.next(this.tasks);
        }
    }

    filterTasks(filter: TaskFilter): Task[] {
        return this.tasks.filter(task => {
            // Search filter
            if (filter.search) {
                const searchLower = filter.search.toLowerCase();
                if (!task.title.toLowerCase().includes(searchLower) &&
                    !task.description?.toLowerCase().includes(searchLower)) {
                    return false;
                }
            }

            // Priority filter
            if (filter.priority && task.priority !== filter.priority) {
                return false;
            }

            // Tags filter
            if (filter.tags && filter.tags.length > 0) {
                if (!filter.tags.some(tag => task.tags.includes(tag))) {
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
        const tagSet = new Set<string>();
        this.tasks.forEach(task => {
            task.tags.forEach(tag => tagSet.add(tag));
        });
        return Array.from(tagSet).sort();
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}