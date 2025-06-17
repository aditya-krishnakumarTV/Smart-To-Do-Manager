import { CommonModule } from "@angular/common";
import { Component, computed, DestroyRef, inject, OnInit, signal } from "@angular/core";

import { TaskFormComponent } from "../task/task-form/task-form.component";
import { TaskFiltersComponent } from "../task/task-filters/task-filters.component";
import { TaskListComponent } from "../task/task-list/task-list.component";

import { Task, TaskFilter } from "../../interfaces/task.interface";

import { TaskService } from "../../services/task.service";
import { ThemeService } from "../../services/theme.service";

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrl: './main-page.component.css',
    standalone: true,
    imports: [CommonModule, TaskFormComponent, TaskFiltersComponent, TaskListComponent],
})
export class MainPageComponent implements OnInit {
    tasks = signal<Task[]>([]);
    editingTask = signal<Task | null>(null);
    isDarkMode = signal<boolean>(false);
    availableTags = signal<string[]>([]);
    currentFilter = signal<TaskFilter>({});

    filteredTasks = computed(() => {
        return this.taskService.filterTasks(this.currentFilter());
    });

    activeTasks = computed(() => {
        return this.tasks().filter(task => !task.completed).length;
    });

    completedTasks = computed(() => {
        return this.tasks().filter(task => task.completed).length;
    });

    private taskService = inject(TaskService)
    private themeService = inject(ThemeService)

    private destroyRef = inject(DestroyRef)

    ngOnInit(): void {
        const subscription1 = this.taskService.tasks$.subscribe(tasks => {
            this.tasks.set(tasks);
            this.availableTags.set(this.taskService.getAllTags());
        });

        const subscription2 = this.themeService.isDarkMode$.subscribe(isDark => {
            this.isDarkMode.set(isDark);
        });

        this.destroyRef.onDestroy(() => {
            subscription1.unsubscribe();
            subscription2.unsubscribe();
        })
    }

    onTaskSubmitted(taskData: any): void {
        const currentEditingTask = this.editingTask();

        if (currentEditingTask) {
            this.taskService.updateTask(currentEditingTask.id, taskData);
            this.editingTask.set(null);
        } else {
            this.taskService.addTask(
                taskData.title,
                taskData.description,
                taskData.priority,
                taskData.tags
            );
        }
    }

    onTaskToggled(taskId: string): void {
        this.taskService.toggleTask(taskId);
    }

    onTaskDeleted(taskId: string): void {
        this.taskService.deleteTask(taskId);

        const currentEditingTask = this.editingTask();

        if (currentEditingTask && currentEditingTask.id === taskId) {
            this.editingTask.set(null);
        }
    }

    onTaskEdited(task: Task): void {
        this.editingTask.set(task);
    }

    cancelEdit(): void {
        this.editingTask.set(null);
    }

    onFiltersChange(filter: TaskFilter): void {
        this.currentFilter.set(filter);
    }

    getEmptyMessage(): string {
        const filter = this.currentFilter();

        if (Object.keys(filter).length > 0) {
            return 'No tasks match your current filters.';
        }

        return 'Start by creating your first task above!';
    }

    toggleTheme(): void {
        this.themeService.toggleTheme();
    }
}